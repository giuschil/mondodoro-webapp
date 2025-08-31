from django.urls import path
from . import views

app_name = 'gift_lists'

urlpatterns = [
    # Gift Lists
    path('', views.GiftListListCreateView.as_view(), name='gift_list_list_create'),
    path('<uuid:pk>/', views.GiftListDetailView.as_view(), name='gift_list_detail'),
    
    # Public gift list view
    path('public/<uuid:pk>/', views.public_gift_list_view, name='public_detail'),
    
    # Gift List Items
    path('<uuid:gift_list_id>/items/', views.GiftListItemListCreateView.as_view(), name='item_list_create'),
    path('<uuid:gift_list_id>/items/<int:pk>/', views.GiftListItemDetailView.as_view(), name='item_detail'),
    
    # Contributions
    path('<uuid:gift_list_id>/contributions/', views.ContributionListCreateView.as_view(), name='contribution_list_create'),
    path('<uuid:gift_list_id>/contributions/<uuid:pk>/', views.ContributionDetailView.as_view(), name='contribution_detail'),
]
