import uuid
from rest_framework import serializers
from .models import Event, EventSlot, Booking


class BookingSerializer(serializers.ModelSerializer):
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    slot_time = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id', 'guest_name', 'guest_email', 'guest_phone', 'guest_message',
            'slot_time', 'payment_method', 'payment_method_display',
            'payment_status', 'payment_status_display',
            'stripe_session_id', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'stripe_session_id', 'created_at', 'updated_at']

    def get_slot_time(self, obj):
        return obj.slot.start_time.strftime('%H:%M')


class BookingCreateSerializer(serializers.Serializer):
    slot_id = serializers.UUIDField()
    guest_name = serializers.CharField(max_length=255)
    guest_email = serializers.EmailField()
    guest_phone = serializers.CharField(max_length=50, required=False, allow_blank=True)
    guest_message = serializers.CharField(required=False, allow_blank=True)
    payment_method = serializers.ChoiceField(choices=Booking.PaymentMethod.choices)

    def validate_slot_id(self, value):
        event = self.context.get('event')
        try:
            slot = event.slots.get(id=value)
        except EventSlot.DoesNotExist:
            raise serializers.ValidationError("Slot non trovato per questo evento.")
        self.context['slot'] = slot
        return value

    def validate(self, data):
        slot = self.context.get('slot')
        if slot and slot.is_free and data.get('payment_method') == Booking.PaymentMethod.ONLINE:
            raise serializers.ValidationError(
                "Lo slot è gratuito, non è richiesto il pagamento online."
            )
        return data


class EventSlotSerializer(serializers.ModelSerializer):
    booked_count = serializers.ReadOnlyField()
    available_spots = serializers.ReadOnlyField()
    is_available = serializers.ReadOnlyField()
    is_free = serializers.ReadOnlyField()
    bookings = BookingSerializer(many=True, read_only=True)

    class Meta:
        model = EventSlot
        fields = [
            'id', 'start_time', 'end_time', 'price', 'max_attendees', 'notes',
            'is_free', 'booked_count', 'available_spots', 'is_available',
            'bookings',
        ]


class EventSlotPublicSerializer(serializers.ModelSerializer):
    booked_count = serializers.ReadOnlyField()
    available_spots = serializers.ReadOnlyField()
    is_available = serializers.ReadOnlyField()
    is_free = serializers.ReadOnlyField()

    class Meta:
        model = EventSlot
        fields = [
            'id', 'start_time', 'end_time', 'price', 'max_attendees', 'notes',
            'is_free', 'booked_count', 'available_spots', 'is_available',
        ]


class EventSlotCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventSlot
        fields = ['start_time', 'end_time', 'price', 'max_attendees', 'notes']

    def validate(self, data):
        start = data.get('start_time')
        end = data.get('end_time')
        if start and end and start >= end:
            raise serializers.ValidationError(
                "L'ora di fine deve essere successiva all'ora di inizio."
            )
        return data


class EventSerializer(serializers.ModelSerializer):
    slots = EventSlotSerializer(many=True, read_only=True)
    slots_count = serializers.SerializerMethodField()
    bookings_count = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'location',
            'date', 'status', 'status_display',
            'slots', 'slots_count', 'bookings_count',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'jeweler', 'created_at', 'updated_at']

    def get_slots_count(self, obj):
        return obj.slots.count()

    def get_bookings_count(self, obj):
        return Booking.objects.filter(
            slot__event=obj,
            payment_status__in=[Booking.PaymentStatus.PAID, Booking.PaymentStatus.PENDING],
        ).count()


class EventCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['title', 'description', 'location', 'date', 'status']


class EventPublicSerializer(serializers.ModelSerializer):
    slots = EventSlotPublicSerializer(many=True, read_only=True)
    jeweler_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'location',
            'date', 'status', 'status_display',
            'slots', 'jeweler_name',
        ]

    def get_jeweler_name(self, obj):
        return obj.jeweler.business_name or obj.jeweler.get_full_name()
