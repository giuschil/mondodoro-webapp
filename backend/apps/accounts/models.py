from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    """
    Custom User model for Mondodoro platform
    """
    
    class UserRole(models.TextChoices):
        SUPERADMIN = 'superadmin', _('SuperAdmin')
        JEWELER = 'jeweler', _('Gioielliere')
        GUEST = 'guest', _('Invitato')
    
    email = models.EmailField(_('email address'), unique=True)
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.GUEST,
        help_text=_('User role in the platform')
    )
    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text=_('Phone number')
    )
    
    # Jeweler specific fields
    business_name = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text=_('Business name for jewelers')
    )
    business_address = models.TextField(
        blank=True,
        null=True,
        help_text=_('Business address for jewelers')
    )
    stripe_account_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text=_('Stripe Connect account ID for jewelers')
    )
    stripe_onboarding_completed = models.BooleanField(
        default=False,
        help_text=_('Whether Stripe onboarding is completed')
    )
    
    # Profile fields
    avatar = models.ImageField(
        upload_to='avatars/',
        blank=True,
        null=True,
        help_text=_('User avatar')
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        verbose_name = _('User')
        verbose_name_plural = _('Users')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"
    
    @property
    def is_superadmin(self):
        return self.role == self.UserRole.SUPERADMIN
    
    @property
    def is_jeweler(self):
        return self.role == self.UserRole.JEWELER
    
    @property
    def is_guest(self):
        return self.role == self.UserRole.GUEST
    
    def can_create_gift_lists(self):
        """Check if user can create gift lists"""
        return self.is_jeweler and self.is_active
    
    def can_manage_platform(self):
        """Check if user can manage platform settings"""
        return self.is_superadmin and self.is_active