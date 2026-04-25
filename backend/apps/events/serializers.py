from rest_framework import serializers
from .models import Event, Booking


class BookingSerializer(serializers.ModelSerializer):
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'guest_name', 'guest_email', 'guest_phone', 'guest_message',
            'slot_time', 'payment_method', 'payment_method_display',
            'payment_status', 'payment_status_display',
            'stripe_session_id', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'stripe_session_id', 'created_at', 'updated_at']


class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['guest_name', 'guest_email', 'guest_phone', 'guest_message', 'slot_time', 'payment_method']

    def validate_slot_time(self, value):
        event = self.context.get('event')
        if event and value not in event.slot_times:
            raise serializers.ValidationError("Orario non valido per questo evento.")
        return value

    def validate_payment_method(self, value):
        event = self.context.get('event')
        if event and event.is_free and value == Booking.PaymentMethod.ONLINE:
            raise serializers.ValidationError("L'evento è gratuito, non è richiesto il pagamento online.")
        return value


class SlotInfoSerializer(serializers.Serializer):
    time = serializers.CharField()
    available = serializers.BooleanField()
    bookings_count = serializers.IntegerField()
    max_attendees = serializers.IntegerField()


class EventSerializer(serializers.ModelSerializer):
    slots_info = serializers.SerializerMethodField()
    bookings_count = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_free = serializers.ReadOnlyField()

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'location',
            'date', 'start_time', 'end_time', 'slot_duration_minutes',
            'price_per_slot', 'max_attendees_per_slot',
            'status', 'status_display', 'is_free',
            'slots_info', 'bookings_count',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'jeweler', 'created_at', 'updated_at']

    def get_slots_info(self, obj):
        result = []
        for slot_time in obj.slot_times:
            count = obj.bookings.filter(
                slot_time=slot_time,
                payment_status__in=[Booking.PaymentStatus.PAID, Booking.PaymentStatus.PENDING],
            ).count()
            result.append({
                'time': slot_time.strftime('%H:%M'),
                'available': count < obj.max_attendees_per_slot,
                'bookings_count': count,
                'max_attendees': obj.max_attendees_per_slot,
            })
        return result

    def get_bookings_count(self, obj):
        return obj.bookings.filter(
            payment_status__in=[Booking.PaymentStatus.PAID, Booking.PaymentStatus.PENDING]
        ).count()


class EventCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            'title', 'description', 'location',
            'date', 'start_time', 'end_time', 'slot_duration_minutes',
            'price_per_slot', 'max_attendees_per_slot', 'status',
        ]

    def validate(self, data):
        if data.get('start_time') and data.get('end_time'):
            if data['start_time'] >= data['end_time']:
                raise serializers.ValidationError(
                    "L'ora di fine deve essere successiva all'ora di inizio."
                )
        return data


class EventPublicSerializer(serializers.ModelSerializer):
    slots_info = serializers.SerializerMethodField()
    jeweler_name = serializers.SerializerMethodField()
    is_free = serializers.ReadOnlyField()

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'location',
            'date', 'start_time', 'end_time', 'slot_duration_minutes',
            'price_per_slot', 'max_attendees_per_slot', 'is_free',
            'slots_info', 'jeweler_name',
        ]

    def get_slots_info(self, obj):
        result = []
        for slot_time in obj.slot_times:
            count = obj.bookings.filter(
                slot_time=slot_time,
                payment_status__in=[Booking.PaymentStatus.PAID, Booking.PaymentStatus.PENDING],
            ).count()
            result.append({
                'time': slot_time.strftime('%H:%M'),
                'available': count < obj.max_attendees_per_slot,
                'bookings_count': count,
                'max_attendees': obj.max_attendees_per_slot,
            })
        return result

    def get_jeweler_name(self, obj):
        return obj.jeweler.business_name or obj.jeweler.get_full_name()
