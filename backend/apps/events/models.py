import uuid
from datetime import datetime, timedelta
from decimal import Decimal

from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator


class Event(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'draft', _('Bozza')
        ACTIVE = 'active', _('Attivo')
        CANCELLED = 'cancelled', _('Annullato')
        COMPLETED = 'completed', _('Completato')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    jeweler = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='events',
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)

    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    slot_duration_minutes = models.PositiveIntegerField(default=30)

    price_per_slot = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
    )
    max_attendees_per_slot = models.PositiveIntegerField(default=1)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['date', 'start_time']
        verbose_name = _('Event')
        verbose_name_plural = _('Events')

    def __str__(self):
        return f"{self.title} - {self.date}"

    @property
    def slot_times(self):
        slots = []
        current = datetime.combine(self.date, self.start_time)
        end = datetime.combine(self.date, self.end_time)
        delta = timedelta(minutes=self.slot_duration_minutes)
        while current + delta <= end:
            slots.append(current.time())
            current += delta
        return slots

    @property
    def is_free(self):
        return self.price_per_slot == Decimal('0.00')


class Booking(models.Model):
    class PaymentMethod(models.TextChoices):
        ONLINE = 'online', _('Online (Carta)')
        IN_PERSON = 'in_person', _('In Negozio')

    class PaymentStatus(models.TextChoices):
        PENDING = 'pending', _('In Attesa')
        PAID = 'paid', _('Pagato')
        CANCELLED = 'cancelled', _('Annullato')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='bookings')

    guest_name = models.CharField(max_length=255)
    guest_email = models.EmailField()
    guest_phone = models.CharField(max_length=50, blank=True, null=True)
    guest_message = models.TextField(blank=True, null=True)

    slot_time = models.TimeField()

    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices)
    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
    )

    stripe_session_id = models.CharField(max_length=255, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['slot_time', 'created_at']
        verbose_name = _('Booking')
        verbose_name_plural = _('Bookings')

    def __str__(self):
        return f"{self.guest_name} @ {self.slot_time} — {self.event.title}"
