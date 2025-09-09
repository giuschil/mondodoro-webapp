import uuid
from django.db import models
from django.conf import settings
from django.urls import reverse
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator
from decimal import Decimal


class GiftList(models.Model):
    """
    Gift List model for jewelers to create collections
    """
    
    class Status(models.TextChoices):
        DRAFT = 'draft', _('Bozza')
        ACTIVE = 'active', _('Attiva')
        COMPLETED = 'completed', _('Completata')
        CANCELLED = 'cancelled', _('Annullata')
    
    class ListType(models.TextChoices):
        MONEY_COLLECTION = 'money_collection', _('Raccolta Soldi')
        PRODUCT_LIST = 'product_list', _('Lista Prodotti')
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    jeweler = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='gift_lists',
        help_text=_('Jeweler who created this gift list')
    )
    
    # List type
    list_type = models.CharField(
        max_length=20,
        choices=ListType.choices,
        default=ListType.MONEY_COLLECTION,
        help_text=_('Type of gift list')
    )
    
    # Basic information
    title = models.CharField(
        max_length=255,
        help_text=_('Gift list title')
    )
    description = models.TextField(
        blank=True,
        null=True,
        help_text=_('Gift list description')
    )
    target_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text=_('Target amount to raise')
    )
    
    # Fixed contribution settings (for MONEY_COLLECTION type)
    fixed_contribution_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text=_('Fixed contribution amount (for money collection lists)')
    )
    max_contributors = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text=_('Maximum number of contributors (for money collection lists)')
    )
    
    # Settings
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
        help_text=_('Gift list status')
    )
    is_public = models.BooleanField(
        default=True,
        help_text=_('Whether the gift list is publicly accessible')
    )
    allow_anonymous_contributions = models.BooleanField(
        default=True,
        help_text=_('Allow contributions without registration')
    )
    
    # Dates
    start_date = models.DateTimeField(
        blank=True,
        null=True,
        help_text=_('When the gift list becomes active')
    )
    end_date = models.DateTimeField(
        blank=True,
        null=True,
        help_text=_('When the gift list expires')
    )
    
    # Images
    cover_image = models.ImageField(
        upload_to='gift_lists/covers/',
        blank=True,
        null=True,
        help_text=_('Cover image for the gift list')
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('Gift List')
        verbose_name_plural = _('Gift Lists')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.jeweler.business_name or self.jeweler.get_full_name()}"
    
    @property
    def public_url(self):
        """Get the public URL for this gift list"""
        return reverse('gift_lists:public_detail', kwargs={'pk': str(self.id)})
    
    @property
    def total_contributions(self):
        """Calculate total contributions received"""
        return self.contributions.filter(
            payment_status=Contribution.PaymentStatus.COMPLETED
        ).aggregate(
            total=models.Sum('amount')
        )['total'] or Decimal('0.00')
    
    @property
    def progress_percentage(self):
        """Calculate completion percentage"""
        if self.target_amount <= 0:
            return 0
        return min(100, (self.total_contributions / self.target_amount) * 100)
    
    @property
    def is_completed(self):
        """Check if target amount is reached"""
        return self.total_contributions >= self.target_amount
    
    @property
    def contributors_count(self):
        """Count unique contributors"""
        return self.contributions.filter(
            payment_status=Contribution.PaymentStatus.COMPLETED
        ).values('contributor_email').distinct().count()


class GiftListItem(models.Model):
    """
    Individual items in a gift list
    """
    
    gift_list = models.ForeignKey(
        GiftList,
        on_delete=models.CASCADE,
        related_name='items',
        help_text=_('Gift list this item belongs to')
    )
    
    name = models.CharField(
        max_length=255,
        help_text=_('Item name')
    )
    description = models.TextField(
        blank=True,
        null=True,
        help_text=_('Item description')
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text=_('Item price')
    )
    image = models.ImageField(
        upload_to='gift_lists/items/',
        blank=True,
        null=True,
        help_text=_('Item image')
    )
    
    # Inventory
    quantity_available = models.PositiveIntegerField(
        default=1,
        help_text=_('Available quantity')
    )
    quantity_contributed = models.PositiveIntegerField(
        default=0,
        help_text=_('Quantity already contributed for')
    )
    
    # Metadata
    order = models.PositiveIntegerField(
        default=0,
        help_text=_('Display order')
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('Gift List Item')
        verbose_name_plural = _('Gift List Items')
        ordering = ['order', 'created_at']
    
    def __str__(self):
        return f"{self.name} - €{self.price}"
    
    @property
    def is_available(self):
        """Check if item is still available"""
        return self.quantity_contributed < self.quantity_available


class Contribution(models.Model):
    """
    Individual contributions to gift lists
    """
    
    class PaymentStatus(models.TextChoices):
        PENDING = 'pending', _('In Attesa')
        COMPLETED = 'completed', _('Completato')
        FAILED = 'failed', _('Fallito')
        REFUNDED = 'refunded', _('Rimborsato')
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    gift_list = models.ForeignKey(
        GiftList,
        on_delete=models.CASCADE,
        related_name='contributions',
        help_text=_('Gift list this contribution is for')
    )
    product = models.ForeignKey(
        'GiftListProduct',
        on_delete=models.CASCADE,
        related_name='contributions',
        null=True,
        blank=True,
        help_text=_('Specific product being purchased (for product lists)')
    )
    
    # Contributor information
    contributor_name = models.CharField(
        max_length=255,
        help_text=_('Contributor name')
    )
    contributor_email = models.EmailField(
        help_text=_('Contributor email')
    )
    contributor_message = models.TextField(
        blank=True,
        null=True,
        help_text=_('Message from contributor')
    )
    is_anonymous = models.BooleanField(
        default=False,
        help_text=_('Whether to display contributor anonymously')
    )
    
    # Payment information
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text=_('Contribution amount')
    )
    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
        help_text=_('Payment status')
    )
    
    # Stripe information
    stripe_payment_intent_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text=_('Stripe Payment Intent ID')
    )
    stripe_session_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text=_('Stripe Checkout Session ID')
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text=_('When the payment was completed')
    )
    
    class Meta:
        verbose_name = _('Contribution')
        verbose_name_plural = _('Contributions')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"€{self.amount} by {self.contributor_name} to {self.gift_list.title}"
    
    @property
    def display_name(self):
        """Get display name (considering anonymity)"""
        if self.is_anonymous:
            return _('Anonymous')
        return self.contributor_name


class GiftListProduct(models.Model):
    """
    Product in a gift list (for PRODUCT_LIST type lists)
    """
    
    class Status(models.TextChoices):
        AVAILABLE = 'available', _('Disponibile')
        PURCHASED = 'purchased', _('Acquistato')
        RESERVED = 'reserved', _('Riservato')
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    gift_list = models.ForeignKey(
        GiftList,
        on_delete=models.CASCADE,
        related_name='products',
        help_text=_('Gift list this product belongs to')
    )
    
    # Product information
    name = models.CharField(
        max_length=255,
        help_text=_('Product name')
    )
    description = models.TextField(
        blank=True,
        null=True,
        help_text=_('Product description')
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text=_('Product price')
    )
    image_url = models.URLField(
        blank=True,
        null=True,
        help_text=_('Product image URL')
    )
    
    # Status and ordering
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.AVAILABLE,
        help_text=_('Product status')
    )
    order = models.PositiveIntegerField(
        default=0,
        help_text=_('Display order')
    )
    
    # Purchase information
    purchased_by = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text=_('Name of person who purchased this product')
    )
    purchased_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_('When this product was purchased')
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', 'created_at']
        verbose_name = _('Gift List Product')
        verbose_name_plural = _('Gift List Products')
    
    def __str__(self):
        return f"{self.name} - {self.price}€ ({self.get_status_display()})"
    
    @property
    def is_available(self):
        """Check if product is available for purchase"""
        return self.status == self.Status.AVAILABLE