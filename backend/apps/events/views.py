import stripe
import logging
from decimal import Decimal

from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse

from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from .models import Event, Booking
from .serializers import (
    EventSerializer, EventCreateSerializer, EventPublicSerializer,
    BookingSerializer, BookingCreateSerializer,
)
from apps.accounts.models import User
from apps.payments.models import StripeAccount, PlatformSettings

logger = logging.getLogger(__name__)


class IsJewelerOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == User.UserRole.JEWELER
            and request.user.is_active
        )

    def has_object_permission(self, request, view, obj):
        return obj.jeweler == request.user


class EventListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsJewelerOwner]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return EventCreateSerializer
        return EventSerializer

    def get_queryset(self):
        return Event.objects.filter(jeweler=self.request.user)

    def perform_create(self, serializer):
        serializer.save(jeweler=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        output = EventSerializer(serializer.instance)
        return Response(output.data, status=status.HTTP_201_CREATED)


class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsJewelerOwner]
    serializer_class = EventSerializer

    def get_queryset(self):
        return Event.objects.filter(jeweler=self.request.user)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = EventCreateSerializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(EventSerializer(instance).data)


@extend_schema(summary="Public event detail", tags=["Events Public"])
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def public_event_view(request, pk):
    event = get_object_or_404(Event, pk=pk, status=Event.Status.ACTIVE)
    serializer = EventPublicSerializer(event)
    return Response(serializer.data)


class EventBookingsView(generics.ListAPIView):
    """Jeweler-only: list all bookings for an event"""
    serializer_class = BookingSerializer
    permission_classes = [IsJewelerOwner]

    def get_queryset(self):
        event = get_object_or_404(Event, pk=self.kwargs['pk'], jeweler=self.request.user)
        return event.bookings.all()

    def get_object(self):
        return get_object_or_404(Event, pk=self.kwargs['pk'], jeweler=self.request.user)


@extend_schema(summary="Create booking", tags=["Events Public"])
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def create_booking_view(request, pk):
    """Create a booking for a slot. Returns checkout_url for online payments."""
    event = get_object_or_404(Event, pk=pk, status=Event.Status.ACTIVE)

    serializer = BookingCreateSerializer(data=request.data, context={'event': event})
    serializer.is_valid(raise_exception=True)

    slot_time = serializer.validated_data['slot_time']
    payment_method = serializer.validated_data['payment_method']

    # Check slot availability
    booked_count = event.bookings.filter(
        slot_time=slot_time,
        payment_status__in=[Booking.PaymentStatus.PAID, Booking.PaymentStatus.PENDING],
    ).count()
    if booked_count >= event.max_attendees_per_slot:
        return Response({'error': 'Questo slot non è più disponibile.'}, status=status.HTTP_409_CONFLICT)

    # Create booking
    booking = serializer.save(event=event)

    # Free event or in-person payment → mark as paid/pending and return
    if event.is_free:
        booking.payment_status = Booking.PaymentStatus.PAID
        booking.save()
        return Response(
            {'booking': BookingSerializer(booking).data, 'checkout_url': None},
            status=status.HTTP_201_CREATED,
        )

    if payment_method == Booking.PaymentMethod.IN_PERSON:
        return Response(
            {'booking': BookingSerializer(booking).data, 'checkout_url': None},
            status=status.HTTP_201_CREATED,
        )

    # Online payment → create Stripe Checkout session
    try:
        checkout_url = _create_event_checkout_session(event, booking)
        booking.stripe_session_id = checkout_url['session_id']
        booking.save()
        return Response(
            {'booking': BookingSerializer(booking).data, 'checkout_url': checkout_url['url']},
            status=status.HTTP_201_CREATED,
        )
    except Exception as e:
        logger.error(f"Stripe error for booking {booking.id}: {e}")
        booking.delete()
        return Response({'error': 'Errore nel pagamento. Riprova.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def _create_event_checkout_session(event, booking):
    stripe.api_key = settings.STRIPE_SECRET_KEY
    amount_cents = int(event.price_per_slot * 100)

    platform_settings = PlatformSettings.load()
    fee_pct = platform_settings.platform_fee_percentage
    fee_fixed = platform_settings.platform_fee_fixed
    fee_amount = (Decimal(str(event.price_per_slot)) * fee_pct / 100) + fee_fixed
    fee_cents = int(fee_amount * 100)

    base_url = getattr(settings, 'BASE_URL', 'https://www.listdreams.it')

    # Check if jeweler has Stripe Connect
    stripe_account_id = None
    application_fee = None
    try:
        sa = StripeAccount.objects.get(jeweler=event.jeweler)
        if sa.stripe_account_id and sa.charges_enabled:
            stripe_account_id = sa.stripe_account_id
            application_fee = fee_cents
    except StripeAccount.DoesNotExist:
        pass

    params = {
        'payment_method_types': ['card'],
        'line_items': [{
            'price_data': {
                'currency': 'eur',
                'product_data': {
                    'name': f'Prenotazione: {event.title}',
                    'description': f'Slot ore {booking.slot_time.strftime("%H:%M")} — {event.date.strftime("%d/%m/%Y")}',
                },
                'unit_amount': amount_cents,
            },
            'quantity': 1,
        }],
        'mode': 'payment',
        'success_url': f'{base_url}/events/{event.id}/book?payment=success&session_id={{CHECKOUT_SESSION_ID}}',
        'cancel_url': f'{base_url}/events/{event.id}/book?payment=cancelled',
        'metadata': {
            'booking_id': str(booking.id),
            'event_id': str(event.id),
            'slot_time': str(booking.slot_time),
        },
        'customer_email': booking.guest_email,
    }

    if stripe_account_id:
        params['stripe_account'] = stripe_account_id
        params['payment_intent_data'] = {'application_fee_amount': application_fee}

    session = stripe.checkout.Session.create(**params)
    return {'url': session.url, 'session_id': session.id}


@csrf_exempt
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def event_stripe_webhook(request):
    """Handle Stripe webhook for event bookings."""
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')
    webhook_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', '')

    try:
        event_obj = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
    except (ValueError, stripe.error.SignatureVerificationError):
        return HttpResponse(status=400)

    if event_obj['type'] == 'checkout.session.completed':
        session = event_obj['data']['object']
        booking_id = session.get('metadata', {}).get('booking_id')
        if booking_id:
            try:
                booking = Booking.objects.get(id=booking_id)
                booking.payment_status = Booking.PaymentStatus.PAID
                booking.save()
            except Booking.DoesNotExist:
                pass

    return HttpResponse(status=200)


@extend_schema(summary="Update booking status", tags=["Events"])
@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_booking_status_view(request, pk, booking_pk):
    """Jeweler can update booking payment_status (e.g., mark in-person as paid)."""
    event = get_object_or_404(Event, pk=pk, jeweler=request.user)
    booking = get_object_or_404(Booking, pk=booking_pk, event=event)

    new_status = request.data.get('payment_status')
    if new_status not in [s.value for s in Booking.PaymentStatus]:
        return Response({'error': 'Stato non valido.'}, status=status.HTTP_400_BAD_REQUEST)

    booking.payment_status = new_status
    booking.save()
    return Response(BookingSerializer(booking).data)
