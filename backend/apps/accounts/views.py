from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.middleware.csrf import get_token
from drf_spectacular.utils import extend_schema, extend_schema_view
from .models import User
from .serializers import (
    UserSerializer, UserRegistrationSerializer, LoginSerializer,
    PasswordChangeSerializer, JewelerProfileSerializer
)


@extend_schema_view(
    post=extend_schema(
        summary="Register new user",
        description="Register a new user account (jeweler or guest)",
        tags=["Authentication"]
    )
)
@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(generics.CreateAPIView):
    """
    User registration endpoint
    """
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Create token for the user
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key,
            'message': 'Registration successful'
        }, status=status.HTTP_201_CREATED)


@extend_schema(
    summary="Login user",
    description="Authenticate user and return token",
    tags=["Authentication"]
)
@csrf_exempt
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """
    User login endpoint
    """
    serializer = LoginSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    
    user = serializer.validated_data['user']
    login(request, user)
    
    # Get or create token
    token, created = Token.objects.get_or_create(user=user)
    
    return Response({
        'user': UserSerializer(user).data,
        'token': token.key,
        'message': 'Login successful'
    })


@extend_schema(
    summary="Logout user",
    description="Logout current user and invalidate token",
    tags=["Authentication"]
)
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """
    User logout endpoint
    """
    try:
        # Delete the user's token
        request.user.auth_token.delete()
    except:
        pass
    
    logout(request)
    return Response({'message': 'Logout successful'})


@extend_schema_view(
    get=extend_schema(
        summary="Get current user profile",
        description="Get the current authenticated user's profile",
        tags=["User Profile"]
    ),
    put=extend_schema(
        summary="Update user profile",
        description="Update the current authenticated user's profile",
        tags=["User Profile"]
    ),
    patch=extend_schema(
        summary="Partially update user profile",
        description="Partially update the current authenticated user's profile",
        tags=["User Profile"]
    )
)
class ProfileView(generics.RetrieveUpdateAPIView):
    """
    User profile management endpoint
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


@extend_schema(
    summary="Change password",
    description="Change the current user's password",
    tags=["User Profile"]
)
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password_view(request):
    """
    Password change endpoint
    """
    serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    
    user = request.user
    user.set_password(serializer.validated_data['new_password'])
    user.save()
    
    # Invalidate current token and create new one
    try:
        request.user.auth_token.delete()
    except:
        pass
    
    token = Token.objects.create(user=user)
    
    return Response({
        'token': token.key,
        'message': 'Password changed successfully'
    })


@extend_schema_view(
    get=extend_schema(
        summary="Get jeweler profile",
        description="Get jeweler-specific profile information",
        tags=["Jeweler"]
    ),
    put=extend_schema(
        summary="Update jeweler profile",
        description="Update jeweler-specific profile information",
        tags=["Jeweler"]
    ),
    patch=extend_schema(
        summary="Partially update jeweler profile",
        description="Partially update jeweler-specific profile information",
        tags=["Jeweler"]
    )
)
class JewelerProfileView(generics.RetrieveUpdateAPIView):
    """
    Jeweler profile management endpoint
    """
    serializer_class = JewelerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        user = self.request.user
        if user.role != User.UserRole.JEWELER:
            raise permissions.PermissionDenied("Only jewelers can access this endpoint")
        return user


@extend_schema(
    summary="Get current user info",
    description="Get basic information about the current authenticated user",
    tags=["Authentication"]
)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def me_view(request):
    """
    Get current user information
    """
    return Response(UserSerializer(request.user).data)

@extend_schema(
    summary="Get CSRF Token", 
    description="Get CSRF token for subsequent requests",
    tags=["Authentication"]
)
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
@ensure_csrf_cookie
def csrf_token_view(request):
    """
    Get CSRF token
    """
    return Response({'csrfToken': get_token(request)})
