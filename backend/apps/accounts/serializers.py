from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model
    """
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'phone', 'business_name', 'business_address',
            'stripe_account_id', 'stripe_onboarding_completed',
            'avatar', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'stripe_account_id', 'stripe_onboarding_completed',
            'created_at', 'updated_at'
        ]
    
    def validate_email(self, value):
        """Validate email uniqueness"""
        user = self.instance
        if User.objects.exclude(pk=user.pk if user else None).filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration
    """
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'role', 'phone',
            'business_name', 'business_address'
        ]
    
    def validate(self, attrs):
        """Validate password confirmation"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match.")
        return attrs
    
    def validate_email(self, value):
        """Validate email uniqueness"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def validate_role(self, value):
        """Validate role assignment"""
        # Only allow jeweler or guest registration via API
        if value not in [User.UserRole.JEWELER, User.UserRole.GUEST]:
            raise serializers.ValidationError("Invalid role selection.")
        return value
    
    def create(self, validated_data):
        """Create new user"""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        return user


class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login - accepts email or username
    """
    email = serializers.CharField(
        required=False,
        help_text="Email or username for login"
    )
    username = serializers.CharField(
        required=False,
        help_text="Username or email for login (alternative to email field)"
    )
    password = serializers.CharField()
    
    def validate(self, attrs):
        """Validate login credentials - accepts email or username"""
        # Accept either 'email' or 'username' field for login identifier
        login_identifier = attrs.get('email') or attrs.get('username')
        password = attrs.get('password')
        
        if not login_identifier:
            raise serializers.ValidationError('Must include email or username.')
        
        if not password:
            raise serializers.ValidationError('Must include password.')
        
        # The custom backend handles both email and username
        user = authenticate(
            request=self.context.get('request'),
            username=login_identifier,
            password=password
        )
        
        if not user:
            raise serializers.ValidationError('Invalid email/username or password.')
        
        if not user.is_active:
            raise serializers.ValidationError('User account is disabled.')
        
        attrs['user'] = user
        return attrs


class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for password change
    """
    old_password = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])
    new_password_confirm = serializers.CharField()
    
    def validate(self, attrs):
        """Validate password change"""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match.")
        return attrs
    
    def validate_old_password(self, value):
        """Validate old password"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value


class JewelerProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for jeweler profile management
    """
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone', 'business_name', 'business_address',
            'stripe_account_id', 'stripe_onboarding_completed',
            'avatar', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'username', 'email', 'stripe_account_id', 
            'stripe_onboarding_completed', 'created_at', 'updated_at'
        ]
    
    def validate(self, attrs):
        """Validate jeweler profile data"""
        user = self.instance
        if user and user.role != User.UserRole.JEWELER:
            raise serializers.ValidationError("This endpoint is only for jewelers.")
        return attrs
