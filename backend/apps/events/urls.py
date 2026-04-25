from django.urls import path
from . import views

app_name = 'events'

urlpatterns = [
    # Jeweler dashboard endpoints
    path('', views.EventListCreateView.as_view(), name='event-list-create'),
    path('<uuid:pk>/', views.EventDetailView.as_view(), name='event-detail'),
    path('<uuid:pk>/bookings/', views.EventBookingsView.as_view(), name='event-bookings'),
    path('<uuid:pk>/bookings/<uuid:booking_pk>/status/', views.update_booking_status_view, name='booking-status'),

    # Public endpoints
    path('<uuid:pk>/public/', views.public_event_view, name='event-public'),
    path('<uuid:pk>/book/', views.create_booking_view, name='event-book'),

    # Stripe webhook for events
    path('webhook/', views.event_stripe_webhook, name='event-webhook'),
]
