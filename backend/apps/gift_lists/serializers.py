from rest_framework import serializers
from django.utils import timezone
from .models import GiftList, GiftListItem, GiftListProduct, Contribution


class GiftListItemSerializer(serializers.ModelSerializer):
    """
    Serializer for Gift List Items
    """
    is_available = serializers.ReadOnlyField()
    
    class Meta:
        model = GiftListItem
        fields = [
            'id', 'name', 'description', 'price', 'image',
            'quantity_available', 'quantity_contributed',
            'is_available', 'order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'quantity_contributed', 'created_at', 'updated_at']


class GiftListProductSerializer(serializers.ModelSerializer):
    """
    Serializer for Gift List Products
    """
    is_available = serializers.ReadOnlyField()
    
    class Meta:
        model = GiftListProduct
        fields = [
            'id', 'name', 'description', 'price', 'image_url',
            'status', 'order', 'purchased_by', 'purchased_at',
            'is_available', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'purchased_by', 'purchased_at', 'created_at', 'updated_at']


class ContributionSerializer(serializers.ModelSerializer):
    """
    Serializer for Contributions
    """
    display_name = serializers.ReadOnlyField()
    product = GiftListProductSerializer(read_only=True)
    
    class Meta:
        model = Contribution
        fields = [
            'id', 'contributor_name', 'contributor_email', 'contributor_message',
            'is_anonymous', 'amount', 'product', 'payment_status', 'display_name',
            'created_at', 'completed_at'
        ]
        read_only_fields = [
            'id', 'payment_status', 'stripe_payment_intent_id', 
            'stripe_session_id', 'created_at', 'updated_at', 'completed_at'
        ]


class GiftListSerializer(serializers.ModelSerializer):
    """
    Serializer for Gift Lists
    """
    items = GiftListItemSerializer(many=True, read_only=True)
    products = GiftListProductSerializer(many=True, read_only=True)
    contributions = ContributionSerializer(many=True, read_only=True)
    jeweler_name = serializers.CharField(source='jeweler.get_full_name', read_only=True)
    business_name = serializers.CharField(source='jeweler.business_name', read_only=True)
    total_contributions = serializers.ReadOnlyField()
    progress_percentage = serializers.ReadOnlyField()
    contributors_count = serializers.ReadOnlyField()
    is_completed = serializers.ReadOnlyField()
    public_url = serializers.ReadOnlyField()
    
    class Meta:
        model = GiftList
        fields = [
            'id', 'title', 'description', 'list_type', 'target_amount', 
            'fixed_contribution_amount', 'max_contributors', 'status',
            'is_public', 'allow_anonymous_contributions', 'start_date', 'end_date',
            'cover_image', 'jeweler_name', 'business_name', 'items', 'products', 'contributions',
            'total_contributions', 'progress_percentage', 'contributors_count',
            'is_completed', 'public_url', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'jeweler', 'total_contributions', 'progress_percentage',
            'contributors_count', 'is_completed', 'public_url',
            'created_at', 'updated_at'
        ]
    
    def validate(self, attrs):
        """Validate gift list data"""
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')
        
        if start_date and end_date and start_date >= end_date:
            raise serializers.ValidationError("End date must be after start date.")
        
        if start_date and start_date < timezone.now():
            raise serializers.ValidationError("Start date cannot be in the past.")
        
        return attrs


class GiftListCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating Gift Lists
    """
    items = GiftListItemSerializer(many=True, required=False)
    products = GiftListProductSerializer(many=True, required=False)
    
    class Meta:
        model = GiftList
        fields = [
            'title', 'description', 'list_type', 'target_amount', 
            'fixed_contribution_amount', 'max_contributors', 'status',
            'is_public', 'allow_anonymous_contributions', 'start_date', 'end_date',
            'cover_image', 'items', 'products'
        ]
    
    def create(self, validated_data):
        """Create gift list with items and products"""
        items_data = validated_data.pop('items', [])
        products_data = validated_data.pop('products', [])
        gift_list = GiftList.objects.create(**validated_data)
        
        # Create items (legacy support)
        for item_data in items_data:
            GiftListItem.objects.create(gift_list=gift_list, **item_data)
        
        # Create products
        for product_data in products_data:
            GiftListProduct.objects.create(gift_list=gift_list, **product_data)
        
        return gift_list
    
    def validate(self, attrs):
        """Validate gift list creation data"""
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')
        
        if start_date and end_date and start_date >= end_date:
            raise serializers.ValidationError("End date must be after start date.")
        
        if start_date and start_date < timezone.now():
            raise serializers.ValidationError("Start date cannot be in the past.")
        
        return attrs


class GiftListPublicSerializer(serializers.ModelSerializer):
    """
    Serializer for public gift list view (limited information)
    """
    items = GiftListItemSerializer(many=True, read_only=True)
    products = GiftListProductSerializer(many=True, read_only=True)
    recent_contributions = serializers.SerializerMethodField()
    jeweler_name = serializers.CharField(source='jeweler.get_full_name', read_only=True)
    business_name = serializers.CharField(source='jeweler.business_name', read_only=True)
    total_contributions = serializers.ReadOnlyField()
    progress_percentage = serializers.ReadOnlyField()
    contributors_count = serializers.ReadOnlyField()
    is_completed = serializers.ReadOnlyField()
    
    class Meta:
        model = GiftList
        fields = [
            'id', 'title', 'description', 'list_type', 'target_amount',
            'fixed_contribution_amount', 'max_contributors',
            'cover_image', 'jeweler_name', 'business_name', 'items', 'products',
            'recent_contributions', 'total_contributions', 'progress_percentage',
            'contributors_count', 'is_completed', 'end_date'
        ]
    
    def get_recent_contributions(self, obj):
        """Get recent contributions for public display"""
        recent = obj.contributions.filter(
            payment_status=Contribution.PaymentStatus.COMPLETED
        ).order_by('-completed_at')[:10]
        
        return [{
            'display_name': contrib.display_name,
            'amount': contrib.amount,
            'message': contrib.contributor_message,
            'created_at': contrib.created_at
        } for contrib in recent]


class ContributionCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating contributions
    """
    
    class Meta:
        model = Contribution
        fields = [
            'contributor_name', 'contributor_email', 'contributor_message',
            'is_anonymous', 'amount'
        ]
    
    def validate_amount(self, value):
        """Validate contribution amount"""
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        
        if value > 10000:  # Max contribution limit
            raise serializers.ValidationError("Maximum contribution amount is €10,000.")
        
        return value
