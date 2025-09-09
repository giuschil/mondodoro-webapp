from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from drf_spectacular.utils import extend_schema, extend_schema_view
from .models import GiftList, GiftListItem, Contribution
from .serializers import (
    GiftListSerializer, GiftListCreateSerializer, GiftListPublicSerializer,
    GiftListItemSerializer, ContributionSerializer, ContributionCreateSerializer
)
from apps.accounts.models import User


class IsJewelerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow jewelers to create/edit gift lists
    """
    
    def has_permission(self, request, view):
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        
        return (
            request.user.is_authenticated and 
            request.user.role == User.UserRole.JEWELER and
            request.user.is_active
        )
    
    def has_object_permission(self, request, view, obj):
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        
        return obj.jeweler == request.user


@extend_schema_view(
    get=extend_schema(
        summary="List gift lists",
        description="Get list of gift lists (jewelers see their own, public lists for others)",
        tags=["Gift Lists"]
    ),
    post=extend_schema(
        summary="Create gift list",
        description="Create a new gift list (jewelers only)",
        tags=["Gift Lists"]
    )
)
class GiftListListCreateView(generics.ListCreateAPIView):
    """
    List and create gift lists
    """
    permission_classes = [IsJewelerOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'is_public']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'title', 'target_amount']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return GiftListCreateSerializer
        return GiftListSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        if user.is_authenticated and user.role == User.UserRole.JEWELER:
            # Jewelers see their own gift lists
            return GiftList.objects.filter(jeweler=user)
        else:
            # Others see only public, active gift lists
            return GiftList.objects.filter(
                is_public=True,
                status=GiftList.Status.ACTIVE
            )
    
    def perform_create(self, serializer):
        serializer.save(jeweler=self.request.user)
    
    def create(self, request, *args, **kwargs):
        """Create gift list and return full serialized data"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Return the full gift list data with ID
        instance = serializer.instance
        output_serializer = GiftListSerializer(instance)
        headers = self.get_success_headers(serializer.data)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED, headers=headers)


@extend_schema_view(
    get=extend_schema(
        summary="Get gift list details",
        description="Get detailed information about a specific gift list",
        tags=["Gift Lists"]
    ),
    put=extend_schema(
        summary="Update gift list",
        description="Update a gift list (owner only)",
        tags=["Gift Lists"]
    ),
    patch=extend_schema(
        summary="Partially update gift list",
        description="Partially update a gift list (owner only)",
        tags=["Gift Lists"]
    ),
    delete=extend_schema(
        summary="Delete gift list",
        description="Delete a gift list (owner only)",
        tags=["Gift Lists"]
    )
)
class GiftListDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a gift list
    """
    serializer_class = GiftListSerializer
    permission_classes = [IsJewelerOrReadOnly]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.is_authenticated and user.role == User.UserRole.JEWELER:
            return GiftList.objects.filter(jeweler=user)
        else:
            return GiftList.objects.filter(
                is_public=True,
                status=GiftList.Status.ACTIVE
            )


@extend_schema(
    summary="Get public gift list",
    description="Get public view of a gift list (accessible by anyone)",
    tags=["Public"]
)
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def public_gift_list_view(request, pk):
    """
    Public view of a gift list
    """
    gift_list = get_object_or_404(
        GiftList,
        pk=pk,
        is_public=True,
        status=GiftList.Status.ACTIVE
    )
    
    serializer = GiftListPublicSerializer(gift_list)
    return Response(serializer.data)


@extend_schema_view(
    get=extend_schema(
        summary="List gift list items",
        description="Get items for a specific gift list",
        tags=["Gift List Items"]
    ),
    post=extend_schema(
        summary="Add gift list item",
        description="Add a new item to a gift list (owner only)",
        tags=["Gift List Items"]
    )
)
class GiftListItemListCreateView(generics.ListCreateAPIView):
    """
    List and create gift list items
    """
    serializer_class = GiftListItemSerializer
    permission_classes = [IsJewelerOrReadOnly]
    
    def get_queryset(self):
        gift_list_id = self.kwargs['gift_list_id']
        return GiftListItem.objects.filter(gift_list_id=gift_list_id)
    
    def perform_create(self, serializer):
        gift_list_id = self.kwargs['gift_list_id']
        gift_list = get_object_or_404(GiftList, pk=gift_list_id, jeweler=self.request.user)
        serializer.save(gift_list=gift_list)


@extend_schema_view(
    get=extend_schema(
        summary="Get gift list item details",
        description="Get detailed information about a specific gift list item",
        tags=["Gift List Items"]
    ),
    put=extend_schema(
        summary="Update gift list item",
        description="Update a gift list item (owner only)",
        tags=["Gift List Items"]
    ),
    patch=extend_schema(
        summary="Partially update gift list item",
        description="Partially update a gift list item (owner only)",
        tags=["Gift List Items"]
    ),
    delete=extend_schema(
        summary="Delete gift list item",
        description="Delete a gift list item (owner only)",
        tags=["Gift List Items"]
    )
)
class GiftListItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a gift list item
    """
    serializer_class = GiftListItemSerializer
    permission_classes = [IsJewelerOrReadOnly]
    
    def get_queryset(self):
        gift_list_id = self.kwargs['gift_list_id']
        return GiftListItem.objects.filter(gift_list_id=gift_list_id)
    
    def get_object(self):
        obj = super().get_object()
        # Ensure the user owns the gift list
        if (self.request.method not in permissions.READONLY_METHODS and 
            obj.gift_list.jeweler != self.request.user):
            self.permission_denied(self.request, "You don't have permission to modify this item.")
        return obj


@extend_schema_view(
    get=extend_schema(
        summary="List contributions",
        description="Get contributions for a specific gift list",
        tags=["Contributions"]
    ),
    post=extend_schema(
        summary="Create contribution",
        description="Create a new contribution to a gift list",
        tags=["Contributions"]
    )
)
class ContributionListCreateView(generics.ListCreateAPIView):
    """
    List and create contributions
    """
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['payment_status', 'is_anonymous']
    ordering_fields = ['created_at', 'amount']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ContributionCreateSerializer
        return ContributionSerializer
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        gift_list_id = self.kwargs['gift_list_id']
        user = self.request.user
        
        queryset = Contribution.objects.filter(gift_list_id=gift_list_id)
        
        # Only gift list owner can see all contributions
        if not (user.is_authenticated and 
                queryset.first() and 
                queryset.first().gift_list.jeweler == user):
            # Others can only see completed, non-anonymous contributions
            queryset = queryset.filter(
                payment_status=Contribution.PaymentStatus.COMPLETED,
                is_anonymous=False
            )
        
        return queryset
    
    def perform_create(self, serializer):
        gift_list_id = self.kwargs['gift_list_id']
        gift_list = get_object_or_404(
            GiftList, 
            pk=gift_list_id,
            is_public=True,
            status=GiftList.Status.ACTIVE
        )
        serializer.save(gift_list=gift_list)
    
    def create(self, request, *args, **kwargs):
        """Create contribution and return full serialized data"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Return the full contribution data with ID
        instance = serializer.instance
        output_serializer = ContributionSerializer(instance)
        headers = self.get_success_headers(serializer.data)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED, headers=headers)


@extend_schema(
    summary="Get contribution details",
    description="Get detailed information about a specific contribution",
    tags=["Contributions"]
)
class ContributionDetailView(generics.RetrieveAPIView):
    """
    Retrieve a contribution
    """
    serializer_class = ContributionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        gift_list_id = self.kwargs['gift_list_id']
        return Contribution.objects.filter(gift_list_id=gift_list_id)