from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Custom User admin interface
    """
    
    list_display = (
        'email', 'username', 'first_name', 'last_name', 
        'role', 'is_active', 'stripe_onboarding_completed', 'created_at'
    )
    list_filter = (
        'role', 'is_active', 'is_staff', 'is_superuser', 
        'stripe_onboarding_completed', 'created_at'
    )
    search_fields = ('email', 'username', 'first_name', 'last_name', 'business_name')
    ordering = ('-created_at',)
    
    fieldsets = BaseUserAdmin.fieldsets + (
        (_('Profile Information'), {
            'fields': ('role', 'phone', 'avatar'),
        }),
        (_('Business Information'), {
            'fields': ('business_name', 'business_address'),
            'classes': ('collapse',),
        }),
        (_('Stripe Information'), {
            'fields': ('stripe_account_id', 'stripe_onboarding_completed'),
            'classes': ('collapse',),
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')
    
    def get_readonly_fields(self, request, obj=None):
        readonly_fields = list(self.readonly_fields)
        
        # Only superadmins can change user roles
        if not request.user.is_superuser:
            readonly_fields.extend(['role', 'is_staff', 'is_superuser'])
        
        return readonly_fields