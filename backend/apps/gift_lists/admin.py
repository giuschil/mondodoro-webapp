from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from .models import GiftList, GiftListItem, Contribution


class GiftListItemInline(admin.TabularInline):
    """
    Inline admin for gift list items
    """
    model = GiftListItem
    extra = 0
    fields = ('name', 'price', 'quantity_available', 'quantity_contributed', 'order')
    readonly_fields = ('quantity_contributed',)


class ContributionInline(admin.TabularInline):
    """
    Inline admin for contributions
    """
    model = Contribution
    extra = 0
    fields = ('contributor_name', 'amount', 'payment_status', 'created_at')
    readonly_fields = ('contributor_name', 'amount', 'payment_status', 'created_at')
    
    def has_add_permission(self, request, obj=None):
        return False


@admin.register(GiftList)
class GiftListAdmin(admin.ModelAdmin):
    """
    Admin interface for Gift Lists
    """
    
    list_display = (
        'title', 'jeweler', 'status', 'target_amount', 'total_contributions_display',
        'progress_display', 'contributors_count', 'created_at'
    )
    list_filter = ('status', 'is_public', 'allow_anonymous_contributions', 'created_at')
    search_fields = ('title', 'description', 'jeweler__email', 'jeweler__business_name')
    readonly_fields = ('id', 'total_contributions_display', 'progress_display', 'created_at', 'updated_at')
    
    fieldsets = (
        (None, {
            'fields': ('id', 'jeweler', 'title', 'description', 'target_amount'),
        }),
        (_('Settings'), {
            'fields': ('status', 'is_public', 'allow_anonymous_contributions'),
        }),
        (_('Dates'), {
            'fields': ('start_date', 'end_date'),
        }),
        (_('Media'), {
            'fields': ('cover_image',),
        }),
        (_('Statistics'), {
            'fields': ('total_contributions_display', 'progress_display'),
            'classes': ('collapse',),
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    inlines = [GiftListItemInline, ContributionInline]
    
    def total_contributions_display(self, obj):
        """Display total contributions with formatting"""
        return f"€{obj.total_contributions:.2f}"
    total_contributions_display.short_description = _('Total Contributions')
    
    def progress_display(self, obj):
        """Display progress with visual indicator"""
        percentage = obj.progress_percentage
        color = 'green' if percentage >= 100 else 'orange' if percentage >= 50 else 'red'
        return format_html(
            '<div style="width: 100px; background-color: #f0f0f0; border-radius: 3px;">'
            '<div style="width: {}px; background-color: {}; height: 20px; border-radius: 3px; text-align: center; color: white; font-size: 12px; line-height: 20px;">'
            '{}%'
            '</div></div>',
            min(100, int(percentage)),
            color,
            int(percentage)
        )
    progress_display.short_description = _('Progress')
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        
        # Non-superadmin users can only see their own gift lists
        if not request.user.is_superuser and hasattr(request.user, 'role'):
            if request.user.is_jeweler:
                queryset = queryset.filter(jeweler=request.user)
            elif request.user.is_guest:
                queryset = queryset.none()  # Guests can't see any gift lists in admin
        
        return queryset


@admin.register(GiftListItem)
class GiftListItemAdmin(admin.ModelAdmin):
    """
    Admin interface for Gift List Items
    """
    
    list_display = ('name', 'gift_list', 'price', 'quantity_available', 'quantity_contributed', 'is_available')
    list_filter = ('gift_list__status', 'created_at')
    search_fields = ('name', 'description', 'gift_list__title')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        (None, {
            'fields': ('gift_list', 'name', 'description', 'price', 'image'),
        }),
        (_('Inventory'), {
            'fields': ('quantity_available', 'quantity_contributed'),
        }),
        (_('Display'), {
            'fields': ('order',),
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    def is_available(self, obj):
        """Display availability status"""
        return obj.is_available
    is_available.boolean = True
    is_available.short_description = _('Available')


@admin.register(Contribution)
class ContributionAdmin(admin.ModelAdmin):
    """
    Admin interface for Contributions
    """
    
    list_display = (
        'contributor_name', 'gift_list', 'amount', 'payment_status',
        'is_anonymous', 'created_at', 'completed_at'
    )
    list_filter = ('payment_status', 'is_anonymous', 'created_at', 'completed_at')
    search_fields = (
        'contributor_name', 'contributor_email', 'gift_list__title',
        'stripe_payment_intent_id', 'stripe_session_id'
    )
    readonly_fields = (
        'id', 'stripe_payment_intent_id', 'stripe_session_id',
        'created_at', 'updated_at', 'completed_at'
    )
    
    fieldsets = (
        (None, {
            'fields': ('id', 'gift_list', 'amount', 'payment_status'),
        }),
        (_('Contributor Information'), {
            'fields': ('contributor_name', 'contributor_email', 'contributor_message', 'is_anonymous'),
        }),
        (_('Stripe Information'), {
            'fields': ('stripe_payment_intent_id', 'stripe_session_id'),
            'classes': ('collapse',),
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at', 'completed_at'),
            'classes': ('collapse',),
        }),
    )
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        
        # Non-superadmin users can only see contributions to their gift lists
        if not request.user.is_superuser and hasattr(request.user, 'role'):
            if request.user.is_jeweler:
                queryset = queryset.filter(gift_list__jeweler=request.user)
            elif request.user.is_guest:
                queryset = queryset.none()  # Guests can't see contributions in admin
        
        return queryset