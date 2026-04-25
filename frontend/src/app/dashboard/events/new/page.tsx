'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { eventsAPI } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ArrowLeft, CalendarDays, Clock, MapPin, Euro, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    start_time: '',
    end_time: '',
    slot_duration_minutes: 30,
    price_per_slot: 0,
    max_attendees_per_slot: 1,
    status: 'active',
  });

  const set = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = 'Campo obbligatorio';
    if (!form.date) errs.date = 'Campo obbligatorio';
    if (!form.start_time) errs.start_time = 'Campo obbligatorio';
    if (!form.end_time) errs.end_time = 'Campo obbligatorio';
    if (form.start_time && form.end_time && form.start_time >= form.end_time)
      errs.end_time = "L'ora di fine deve essere successiva all'inizio";
    if (form.slot_duration_minutes < 5) errs.slot_duration_minutes = 'Minimo 5 minuti';
    if (form.price_per_slot < 0) errs.price_per_slot = 'Valore non valido';
    if (form.max_attendees_per_slot < 1) errs.max_attendees_per_slot = 'Minimo 1';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const event = await eventsAPI.create({
        ...form,
        price_per_slot: Number(form.price_per_slot),
        slot_duration_minutes: Number(form.slot_duration_minutes),
        max_attendees_per_slot: Number(form.max_attendees_per_slot),
      });
      toast.success('Evento creato!');
      router.push(`/dashboard/events/${event.id}`);
    } catch (err: any) {
      const data = err?.response?.data;
      if (data && typeof data === 'object') {
        const fieldErrors: Record<string, string> = {};
        Object.entries(data).forEach(([k, v]) => {
          fieldErrors[k] = Array.isArray(v) ? (v as string[]).join(' ') : String(v);
        });
        setErrors(fieldErrors);
      } else {
        toast.error("Errore durante la creazione dell'evento");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back */}
        <Link href="/dashboard/events" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" />
          Torna agli eventi
        </Link>

        <div>
          <h2 className="text-xl font-bold text-gray-900">Nuovo evento</h2>
          <p className="text-sm text-gray-500 mt-1">
            Crea un evento con slot prenotabili dai tuoi clienti
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Info base */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-amber-500" />
              Informazioni generali
            </h3>

            <Input
              label="Titolo evento *"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Es. Consulenza personalizzata, Giornata fedi..."
              error={errors.title}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={3}
                placeholder="Descrizione dell'evento per i tuoi clienti..."
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              />
            </div>

            <Input
              label="Luogo"
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
              placeholder="Es. Gioielleria Rossi — Via Roma 1, Milano"
            />
          </section>

          {/* Data e orari */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Data e orari
            </h3>

            <Input
              label="Data *"
              type="date"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              error={errors.date}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Ora inizio *"
                type="time"
                value={form.start_time}
                onChange={(e) => set('start_time', e.target.value)}
                error={errors.start_time}
              />
              <Input
                label="Ora fine *"
                type="time"
                value={form.end_time}
                onChange={(e) => set('end_time', e.target.value)}
                error={errors.end_time}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durata slot (minuti)</label>
              <select
                value={form.slot_duration_minutes}
                onChange={(e) => set('slot_duration_minutes', Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                {[15, 20, 30, 45, 60, 90, 120].map((m) => (
                  <option key={m} value={m}>{m} minuti</option>
                ))}
              </select>
              {errors.slot_duration_minutes && (
                <p className="text-xs text-red-500 mt-1">{errors.slot_duration_minutes}</p>
              )}
            </div>
          </section>

          {/* Prezzo e posti */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Euro className="h-5 w-5 text-amber-500" />
              Prezzo e disponibilità
            </h3>

            <Input
              label="Prezzo per slot (€)"
              type="number"
              min="0"
              step="0.01"
              value={form.price_per_slot}
              onChange={(e) => set('price_per_slot', e.target.value)}
              helperText="Inserisci 0 per eventi gratuiti"
              error={errors.price_per_slot}
            />

            <Input
              label="Posti per slot"
              type="number"
              min="1"
              value={form.max_attendees_per_slot}
              onChange={(e) => set('max_attendees_per_slot', e.target.value)}
              helperText="Quante persone possono prenotare lo stesso slot"
              error={errors.max_attendees_per_slot}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stato</label>
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="draft">Bozza (non prenotabile)</option>
                <option value="active">Attivo (prenotabile subito)</option>
              </select>
            </div>
          </section>

          <div className="flex gap-3 justify-end">
            <Link href="/dashboard/events">
              <Button type="button" variant="outline">Annulla</Button>
            </Link>
            <Button type="submit" variant="primary" loading={loading}>
              Crea evento
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
