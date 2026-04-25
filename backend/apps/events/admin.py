from django.contrib import admin
from .models import Event, Booking


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'jeweler', 'date', 'start_time', 'end_time', 'status', 'price_per_slot']
    list_filter = ['status', 'date']
    search_fields = ['title', 'jeweler__email', 'jeweler__business_name']
    ordering = ['-date']


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['guest_name', 'guest_email', 'event', 'slot_time', 'payment_method', 'payment_status']
    list_filter = ['payment_status', 'payment_method']
    search_fields = ['guest_name', 'guest_email', 'event__title']
