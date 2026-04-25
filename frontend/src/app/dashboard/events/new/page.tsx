'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { eventsAPI } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ArrowLeft, CalendarDays, Clock, Plus, Trash2, LayoutList } from 'lucide-react';
import toast from 'react-hot-toast';

interface SlotDraft {
  id: string;
  start_time: string;
  end_time: string;
  price: number;
  max_attendees: number;
  notes: string;
}

function generateId() {
  return Math.random().toString(36).slice(2);
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    status: 'active',
  });

  const [slots, setSlots] = useState<SlotDraft[]>([]);

  // Single slot form
  const [showSingleForm, setShowSingleForm] = useState(false);
  const [singleSlot, setSingleSlot] = useState({
    start_time: '',
    end_time: '',
    price: 0,
    max_attendees: 1,
    notes: '',
  });

  // Series form
  const [showSeriesForm, setShowSeriesForm] = useState(false);
  const [series, setSeries] = useState({
    from_time: '',
    to_time: '',
    duration_minutes: 30,
    price: 0,
    max_attendees: 1,
  });

  const setField = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = 'Campo obbligatorio';
    if (!form.date) errs.date = 'Campo obbligatorio';
    return errs;
  };

  const addSingleSlot = () => {
    if (!singleSlot.start_time) {
      toast.error("Inserisci l'orario di inizio dello slot");
      return;
    }
    if (singleSlot.end_time && singleSlot.start_time >= singleSlot.end_time) {
      toast.error("L'orario di fine deve essere successivo all'inizio");
      return;
    }
    setSlots((prev) => [...prev, { ...singleSlot, id: generateId() }]);
    setSingleSlot({ start_time: '', end_time: '', price: 0, max_attendees: 1, notes: '' });
    setShowSingleForm(false);
    toast.success('Slot aggiunto');
  };

  const generateSeries = () => {
    if (!series.from_time || !series.to_time) {
      toast.error('Inserisci orario inizio e fine della serie');
      return;
    }
    if (series.from_time >= series.to_time) {
      toast.error("L'orario di fine deve essere successivo all'inizio");
      return;
    }
    const newSlots: SlotDraft[] = [];
    let current = series.from_time;
    while (current < series.to_time) {
      const next = addMinutes(current, series.duration_minutes);
      if (next > series.to_time) break;
      newSlots.push({
        id: generateId(),
        start_time: current,
        end_time: next,
        price: series.price,
        max_attendees: series.max_attendees,
        notes: '',
      });
      current = next;
    }
    if (newSlots.length === 0) {
      toast.error('Nessuno slot generato. Controlla gli orari.');
      return;
    }
    setSlots((prev) => [...prev, ...newSlots]);
    setSeries({ from_time: '', to_time: '', duration_minutes: 30, price: 0, max_attendees: 1 });
    setShowSeriesForm(false);
    toast.success(`${newSlots.length} slot aggiunti`);
  };

  const removeSlot = (id: string) => {
    setSlots((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const event = await eventsAPI.create({
        title: form.title,
        description: form.description || undefined,
        location: form.location || undefined,
        date: form.date,
        status: form.status,
      });

      if (slots.length > 0) {
        await eventsAPI.createSlots(event.id, slots.map((s) => ({
          start_time: s.start_time,
          end_time: s.end_time || undefined,
          price: s.price,
          max_attendees: s.max_attendees,
          notes: s.notes || undefined,
        })));
      }

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
            Crea un evento e aggiungi gli slot prenotabili
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1 — Info generali */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-amber-500" />
              Informazioni generali
            </h3>

            <Input
              label="Titolo evento *"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="Es. Consulenza personalizzata, Giornata fedi..."
              error={errors.title}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
              <textarea
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                rows={3}
                placeholder="Descrizione dell'evento per i tuoi clienti..."
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              />
            </div>

            <Input
              label="Luogo"
              value={form.location}
              onChange={(e) => setField('location', e.target.value)}
              placeholder="Es. Gioielleria Rossi — Via Roma 1, Milano"
            />

            <Input
              label="Data *"
              type="date"
              value={form.date}
              onChange={(e) => setField('date', e.target.value)}
              error={errors.date}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stato</label>
              <select
                value={form.status}
                onChange={(e) => setField('status', e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="draft">Bozza (non prenotabile)</option>
                <option value="active">Attivo (prenotabile subito)</option>
              </select>
            </div>
          </section>

          {/* Section 2 — Slot orari */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Slot orari
            </h3>

            {/* Slot list */}
            {slots.length > 0 && (
              <div className="space-y-2">
                {slots.map((s) => (
                  <div key={s.id} className="flex items-center justify-between gap-3 bg-gray-50 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-4 text-sm text-gray-700 flex-wrap">
                      <span className="font-medium">{s.start_time}{s.end_time ? ` – ${s.end_time}` : ''}</span>
                      <span className="text-gray-500">{parseFloat(String(s.price)) === 0 ? 'Gratuito' : `€${parseFloat(String(s.price)).toFixed(2)}`}</span>
                      <span className="text-gray-400">{s.max_attendees} {s.max_attendees === 1 ? 'posto' : 'posti'}</span>
                      {s.notes && <span className="text-gray-400 italic truncate max-w-xs">{s.notes}</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSlot(s.id)}
                      className="text-red-400 hover:text-red-600 shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {slots.length === 0 && !showSingleForm && !showSeriesForm && (
              <p className="text-sm text-gray-400 italic">Nessuno slot aggiunto. Puoi aggiungerli ora o dopo la creazione.</p>
            )}

            {/* Single slot inline form */}
            {showSingleForm && (
              <div className="border border-amber-200 rounded-xl p-4 space-y-3 bg-amber-50">
                <p className="text-sm font-medium text-amber-900">Aggiungi slot singolo</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Inizio *</label>
                    <input
                      type="time"
                      value={singleSlot.start_time}
                      onChange={(e) => setSingleSlot((p) => ({ ...p, start_time: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Fine (opz.)</label>
                    <input
                      type="time"
                      value={singleSlot.end_time}
                      onChange={(e) => setSingleSlot((p) => ({ ...p, end_time: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Prezzo (€)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={singleSlot.price}
                      onChange={(e) => setSingleSlot((p) => ({ ...p, price: Number(e.target.value) }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Max persone</label>
                    <input
                      type="number"
                      min="1"
                      value={singleSlot.max_attendees}
                      onChange={(e) => setSingleSlot((p) => ({ ...p, max_attendees: Number(e.target.value) }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Note (opz.)</label>
                  <input
                    type="text"
                    value={singleSlot.notes}
                    onChange={(e) => setSingleSlot((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="Es. Solo fedi nuziali"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="primary" size="sm" onClick={addSingleSlot}>
                    Aggiungi
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowSingleForm(false)}>
                    Annulla
                  </Button>
                </div>
              </div>
            )}

            {/* Series inline form */}
            {showSeriesForm && (
              <div className="border border-blue-200 rounded-xl p-4 space-y-3 bg-blue-50">
                <p className="text-sm font-medium text-blue-900">Aggiungi slot in serie</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Da</label>
                    <input
                      type="time"
                      value={series.from_time}
                      onChange={(e) => setSeries((p) => ({ ...p, from_time: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">A</label>
                    <input
                      type="time"
                      value={series.to_time}
                      onChange={(e) => setSeries((p) => ({ ...p, to_time: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Durata slot</label>
                    <select
                      value={series.duration_minutes}
                      onChange={(e) => setSeries((p) => ({ ...p, duration_minutes: Number(e.target.value) }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {[15, 30, 45, 60].map((m) => (
                        <option key={m} value={m}>{m} minuti</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Prezzo (€)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={series.price}
                      onChange={(e) => setSeries((p) => ({ ...p, price: Number(e.target.value) }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Max persone per slot</label>
                  <input
                    type="number"
                    min="1"
                    value={series.max_attendees}
                    onChange={(e) => setSeries((p) => ({ ...p, max_attendees: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="primary" size="sm" onClick={generateSeries}>
                    Genera slot
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowSeriesForm(false)}>
                    Annulla
                  </Button>
                </div>
              </div>
            )}

            {/* Action buttons */}
            {!showSingleForm && !showSeriesForm && (
              <div className="flex gap-2 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSingleForm(true)}
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Aggiungi slot
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSeriesForm(true)}
                >
                  <LayoutList className="h-4 w-4 mr-1.5" />
                  Aggiungi in serie
                </Button>
              </div>
            )}
          </section>

          <div className="flex gap-3 justify-end">
            <Link href="/dashboard/events">
              <Button type="button" variant="outline">Annulla</Button>
            </Link>
            <Button type="submit" variant="primary" loading={loading}>
              {slots.length > 0 ? `Crea evento con ${slots.length} slot` : "Crea l'evento"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
