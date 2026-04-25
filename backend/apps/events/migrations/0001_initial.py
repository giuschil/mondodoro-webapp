from django.conf import settings
from django.db import migrations, models
import django.core.validators
import django.db.models.deletion
import uuid
from decimal import Decimal


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Event',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True, null=True)),
                ('location', models.CharField(blank=True, max_length=255, null=True)),
                ('date', models.DateField()),
                ('start_time', models.TimeField()),
                ('end_time', models.TimeField()),
                ('slot_duration_minutes', models.PositiveIntegerField(default=30)),
                ('price_per_slot', models.DecimalField(
                    decimal_places=2,
                    default=Decimal('0.00'),
                    max_digits=10,
                    validators=[django.core.validators.MinValueValidator(Decimal('0.00'))],
                )),
                ('max_attendees_per_slot', models.PositiveIntegerField(default=1)),
                ('status', models.CharField(
                    choices=[('draft', 'Bozza'), ('active', 'Attivo'), ('cancelled', 'Annullato'), ('completed', 'Completato')],
                    default='draft',
                    max_length=20,
                )),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('jeweler', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='events',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'verbose_name': 'Event',
                'verbose_name_plural': 'Events',
                'ordering': ['date', 'start_time'],
            },
        ),
        migrations.CreateModel(
            name='Booking',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('guest_name', models.CharField(max_length=255)),
                ('guest_email', models.EmailField()),
                ('guest_phone', models.CharField(blank=True, max_length=50, null=True)),
                ('guest_message', models.TextField(blank=True, null=True)),
                ('slot_time', models.TimeField()),
                ('payment_method', models.CharField(
                    choices=[('online', 'Online (Carta)'), ('in_person', 'In Negozio')],
                    max_length=20,
                )),
                ('payment_status', models.CharField(
                    choices=[('pending', 'In Attesa'), ('paid', 'Pagato'), ('cancelled', 'Annullato')],
                    default='pending',
                    max_length=20,
                )),
                ('stripe_session_id', models.CharField(blank=True, max_length=255, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('event', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='bookings',
                    to='events.event',
                )),
            ],
            options={
                'verbose_name': 'Booking',
                'verbose_name_plural': 'Bookings',
                'ordering': ['slot_time', 'created_at'],
            },
        ),
    ]
