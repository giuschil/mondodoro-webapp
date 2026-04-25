import uuid
from decimal import Decimal

from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


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

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['date']
        verbose_name = _('Event')
        verbose_name_plural = _('Events')

    def __str__(self):
        return f"{self.title} - {self.date}"


class EventSlot(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='slots')

    start_time = models.TimeField()
    end_time = models.TimeField(null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    max_attendees = models.PositiveIntegerField(default=1)
    notes = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        ordering = ['start_time']
        verbose_name = _('Event Slot')
        verbose_name_plural = _('Event Slots')

    def __str__(self):
        return f"{self.event.title} — {self.start_time}"

    @property
    def is_free(self):
        return self.price == Decimal('0.00')

    @property
    def booked_count(self):
        return self.bookings.filter(
            payment_status__in=[Booking.PaymentStatus.PAID, Booking.PaymentStatus.PENDING]
        ).count()

    @property
    def available_spots(self):
        return max(0, self.max_attendees - self.booked_count)

    @property
    def is_available(self):
        return self.available_spots > 0


class Booking(models.Model):
    class PaymentMethod(models.TextChoices):
        ONLINE = 'online', _('Online (Carta)')
        IN_PERSON = 'in_person', _('In Negozio')

    class PaymentStatus(models.TextChoices):
        PENDING = 'pending', _('In Attesa')
        PAID = 'paid', _('Pagato')
        CANCELLED = 'cancelled', _('Annullato')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    slot = models.ForeignKey(EventSlot, on_delete=models.CASCADE, related_name='bookings')

    guest_name = models.CharField(max_length=255)
    guest_email = models.EmailField()
    guest_phone = models.CharField(max_length=50, blank=True, null=True)
    guest_message = models.TextField(blank=True, null=True)

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
        ordering = ['slot__start_time', 'created_at']
        verbose_name = _('Booking')
        verbose_name_plural = _('Bookings')

    def __str__(self):
        return f"{self.guest_name} @ {self.slot.start_time} — {self.slot.event.title}"
