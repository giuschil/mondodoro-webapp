import uuid
from decimal import Decimal
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('events', '0001_initial')]
    operations = [
        migrations.CreateModel(
            name='EventSlot',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('start_time', models.TimeField()),
                ('end_time', models.TimeField(blank=True, null=True)),
                ('price', models.DecimalField(decimal_places=2, default=Decimal('0.00'), max_digits=10)),
                ('max_attendees', models.PositiveIntegerField(default=1)),
                ('notes', models.CharField(blank=True, max_length=255, null=True)),
                ('event', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='slots', to='events.event')),
            ],
            options={'ordering': ['start_time'], 'verbose_name': 'Event Slot', 'verbose_name_plural': 'Event Slots'},
        ),
        migrations.AddField(
            model_name='booking',
            name='slot',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='bookings', to='events.eventslot'),
        ),
        migrations.RemoveField(model_name='booking', name='event'),
        migrations.RemoveField(model_name='booking', name='slot_time'),
        migrations.AlterField(
            model_name='booking',
            name='slot',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bookings', to='events.eventslot'),
        ),
        migrations.AlterModelOptions(name='booking', options={'ordering': ['slot__start_time', 'created_at'], 'verbose_name': 'Booking', 'verbose_name_plural': 'Bookings'}),
        migrations.RemoveField(model_name='event', name='start_time'),
        migrations.RemoveField(model_name='event', name='end_time'),
        migrations.RemoveField(model_name='event', name='slot_duration_minutes'),
        migrations.RemoveField(model_name='event', name='price_per_slot'),
        migrations.RemoveField(model_name='event', name='max_attendees_per_slot'),
        migrations.AlterModelOptions(name='event', options={'ordering': ['date'], 'verbose_name': 'Event', 'verbose_name_plural': 'Events'}),
    ]
