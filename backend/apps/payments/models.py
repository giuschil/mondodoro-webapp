from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
import uuid


class StripeAccount(models.Model):
    """
    Model to track Stripe Connect accounts for jewelers
    """
    
    class AccountStatus(models.TextChoices):
        PENDING = 'pending', _('Pending')
        ACTIVE = 'active', _('Active')
        RESTRICTED = 'restricted', _('Restricted')
        INACTIVE = 'inactive', _('Inactive')
    
    jeweler = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='stripe_account',
        help_text=_('Jeweler associated with this Stripe account')
    )
    
    stripe_account_id = models.CharField(
        max_length=255,
        unique=True,
        help_text=_('Stripe Connect account ID')
    )
    
    account_status = models.CharField(
        max_length=20,
        choices=AccountStatus.choices,
        default=AccountStatus.PENDING,
        help_text=_('Stripe account status')
    )
    
    onboarding_completed = models.BooleanField(
        default=False,
        help_text=_('Whether onboarding process is completed')
    )
    
    charges_enabled = models.BooleanField(
        default=False,
        help_text=_('Whether the account can receive charges')
    )
    
    payouts_enabled = models.BooleanField(
        default=False,
        help_text=_('Whether the account can receive payouts')
    )
    
    # Account details
    country = models.CharField(
        max_length=2,
        blank=True,
        null=True,
        help_text=_('Account country code')
    )
    
    currency = models.CharField(
        max_length=3,
        default='EUR',
        help_text=_('Account currency')
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('Stripe Account')
        verbose_name_plural = _('Stripe Accounts')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Stripe Account - {self.jeweler.get_full_name()} ({self.stripe_account_id})"


class PaymentIntent(models.Model):
    """
    Model to track Stripe Payment Intents
    """
    
    class Status(models.TextChoices):
        REQUIRES_PAYMENT_METHOD = 'requires_payment_method', _('Requires Payment Method')
        REQUIRES_CONFIRMATION = 'requires_confirmation', _('Requires Confirmation')
        REQUIRES_ACTION = 'requires_action', _('Requires Action')
        PROCESSING = 'processing', _('Processing')
        REQUIRES_CAPTURE = 'requires_capture', _('Requires Capture')
        CANCELED = 'canceled', _('Canceled')
        SUCCEEDED = 'succeeded', _('Succeeded')
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    contribution = models.OneToOneField(
        'gift_lists.Contribution',
        on_delete=models.CASCADE,
        related_name='payment_intent',
        help_text=_('Associated contribution')
    )
    
    stripe_payment_intent_id = models.CharField(
        max_length=255,
        unique=True,
        help_text=_('Stripe Payment Intent ID')
    )
    
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text=_('Payment amount')
    )
    
    currency = models.CharField(
        max_length=3,
        default='EUR',
        help_text=_('Payment currency')
    )
    
    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        help_text=_('Payment Intent status')
    )
    
    client_secret = models.CharField(
        max_length=255,
        help_text=_('Client secret for frontend')
    )
    
    # Platform fee (Mondodoro commission)
    application_fee_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        help_text=_('Platform fee amount')
    )
    
    # Metadata
    metadata = models.JSONField(
        default=dict,
        blank=True,
        help_text=_('Additional metadata')
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('Payment Intent')
        verbose_name_plural = _('Payment Intents')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Payment Intent - €{self.amount} ({self.status})"


class WebhookEvent(models.Model):
    """
    Model to track processed Stripe webhook events
    """
    
    stripe_event_id = models.CharField(
        max_length=255,
        unique=True,
        help_text=_('Stripe event ID')
    )
    
    event_type = models.CharField(
        max_length=100,
        help_text=_('Stripe event type')
    )
    
    processed = models.BooleanField(
        default=False,
        help_text=_('Whether the event has been processed')
    )
    
    data = models.JSONField(
        help_text=_('Event data')
    )
    
    error_message = models.TextField(
        blank=True,
        null=True,
        help_text=_('Error message if processing failed')
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('Webhook Event')
        verbose_name_plural = _('Webhook Events')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Webhook - {self.event_type} ({self.stripe_event_id})"


class PlatformSettings(models.Model):
    """
    Model to store platform-wide payment settings
    """
    
    # Platform fee settings
    platform_fee_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=2.5,
        help_text=_('Platform fee percentage (e.g., 2.5 for 2.5%)')
    )
    
    platform_fee_fixed = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.30,
        help_text=_('Fixed platform fee amount')
    )
    
    # Payment settings
    minimum_contribution = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=1.00,
        help_text=_('Minimum contribution amount')
    )
    
    maximum_contribution = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=10000.00,
        help_text=_('Maximum contribution amount')
    )
    
    # Stripe settings
    stripe_webhook_endpoint_secret = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text=_('Stripe webhook endpoint secret')
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('Platform Settings')
        verbose_name_plural = _('Platform Settings')
    
    def __str__(self):
        return f"Platform Settings - {self.platform_fee_percentage}% + €{self.platform_fee_fixed}"
    
    def save(self, *args, **kwargs):
        # Ensure only one instance exists
        self.pk = 1
        super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        # Prevent deletion
        pass
    
    @classmethod
    def load(cls):
        """Load or create platform settings"""
        obj, created = cls.objects.get_or_create(pk=1)
        return obj