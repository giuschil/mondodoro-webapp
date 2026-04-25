from django.contrib import admin
from .models import Event, EventSlot, Booking


class EventSlotInline(admin.TabularInline):
    model = EventSlot
    extra = 0
    fields = ['start_time', 'end_time', 'price', 'max_attendees', 'notes']


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'jeweler', 'date', 'status']
    list_filter = ['status', 'date']
    search_fields = ['title', 'jeweler__email', 'jeweler__business_name']
    ordering = ['-date']
    inlines = [EventSlotInline]


@admin.register(EventSlot)
class EventSlotAdmin(admin.ModelAdmin):
    list_display = ['event', 'start_time', 'end_time', 'price', 'max_attendees']
    list_filter = ['event__date']
    search_fields = ['event__title']
    ordering = ['event__date', 'start_time']


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['guest_name', 'guest_email', 'slot', 'payment_method', 'payment_status']
    list_filter = ['payment_status', 'payment_method']
    search_fields = ['guest_name', 'guest_email', 'slot__event__title']
