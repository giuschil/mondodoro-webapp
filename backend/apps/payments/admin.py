from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from .models import StripeAccount, PaymentIntent, WebhookEvent, PlatformSettings


@admin.register(StripeAccount)
class StripeAccountAdmin(admin.ModelAdmin):
    """
    Admin interface for Stripe Accounts
    """
    
    list_display = (
        'jeweler', 'stripe_account_id', 'account_status',
        'onboarding_completed', 'charges_enabled', 'payouts_enabled',
        'country', 'created_at'
    )
    list_filter = (
        'account_status', 'onboarding_completed', 'charges_enabled',
        'payouts_enabled', 'country', 'created_at'
    )
    search_fields = (
        'jeweler__email', 'jeweler__business_name', 'stripe_account_id'
    )
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        (None, {
            'fields': ('jeweler', 'stripe_account_id', 'account_status'),
        }),
        (_('Status'), {
            'fields': (
                'onboarding_completed', 'charges_enabled', 'payouts_enabled'
            ),
        }),
        (_('Details'), {
            'fields': ('country', 'currency'),
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )


@admin.register(PaymentIntent)
class PaymentIntentAdmin(admin.ModelAdmin):
    """
    Admin interface for Payment Intents
    """
    
    list_display = (
        'stripe_payment_intent_id', 'contribution', 'amount',
        'currency', 'status', 'application_fee_amount', 'created_at'
    )
    list_filter = ('status', 'currency', 'created_at')
    search_fields = (
        'stripe_payment_intent_id', 'contribution__contributor_email',
        'contribution__gift_list__title'
    )
    readonly_fields = ('id', 'client_secret', 'created_at', 'updated_at')
    
    fieldsets = (
        (None, {
            'fields': (
                'id', 'contribution', 'stripe_payment_intent_id',
                'amount', 'currency', 'status'
            ),
        }),
        (_('Stripe Details'), {
            'fields': ('client_secret', 'application_fee_amount'),
        }),
        (_('Metadata'), {
            'fields': ('metadata',),
            'classes': ('collapse',),
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    def has_add_permission(self, request):
        # Payment Intents are created programmatically
        return False


@admin.register(WebhookEvent)
class WebhookEventAdmin(admin.ModelAdmin):
    """
    Admin interface for Webhook Events
    """
    
    list_display = (
        'stripe_event_id', 'event_type', 'processed',
        'error_status', 'created_at'
    )
    list_filter = ('event_type', 'processed', 'created_at')
    search_fields = ('stripe_event_id', 'event_type')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        (None, {
            'fields': ('stripe_event_id', 'event_type', 'processed'),
        }),
        (_('Error Information'), {
            'fields': ('error_message',),
            'classes': ('collapse',),
        }),
        (_('Event Data'), {
            'fields': ('data',),
            'classes': ('collapse',),
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    def error_status(self, obj):
        """Display error status with color"""
        if obj.error_message:
            return format_html(
                '<span style="color: red;">Error</span>'
            )
        elif obj.processed:
            return format_html(
                '<span style="color: green;">Success</span>'
            )
        else:
            return format_html(
                '<span style="color: orange;">Pending</span>'
            )
    error_status.short_description = _('Status')
    
    def has_add_permission(self, request):
        # Webhook events are created by Stripe
        return False


@admin.register(PlatformSettings)
class PlatformSettingsAdmin(admin.ModelAdmin):
    """
    Admin interface for Platform Settings
    """
    
    list_display = (
        'platform_fee_percentage', 'platform_fee_fixed',
        'minimum_contribution', 'maximum_contribution', 'updated_at'
    )
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        (_('Platform Fees'), {
            'fields': ('platform_fee_percentage', 'platform_fee_fixed'),
        }),
        (_('Contribution Limits'), {
            'fields': ('minimum_contribution', 'maximum_contribution'),
        }),
        (_('Stripe Configuration'), {
            'fields': ('stripe_webhook_endpoint_secret',),
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    def has_add_permission(self, request):
        # Only one instance should exist
        return not PlatformSettings.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        # Prevent deletion
        return False