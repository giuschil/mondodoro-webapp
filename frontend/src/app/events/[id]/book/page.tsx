'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { eventsAPI, EventItem, EventSlot } from '@/lib/api';
import {
  CalendarDays,
  Clock,
  MapPin,
  Euro,
  CheckCircle,
  Sparkles,
  Users,
} from 'lucide-react';
import { useDialog } from '@/lib/dialog-context';

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('it-IT', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });
}

export default function PublicBookingPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { showError } = useDialog();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<EventSlot | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    guest_message: '',
    payment_method: 'online' as 'online' | 'in_person',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id) return;
    eventsAPI.getPublic(id)
      .then(setEvent)
      .catch(() => showError('Evento non trovato o non disponibile'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const payment = searchParams.get('payment');
    if (payment === 'success') {
      setSuccess(true);
    } else if (payment === 'cancelled') {
      showError('Pagamento annullato. Riprova quando vuoi.');
    }
  }, [searchParams]);

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!selectedSlot) errs.slot = 'Seleziona uno slot';
    if (!form.guest_name.trim()) errs.guest_name = 'Campo obbligatorio';
    if (!form.guest_email.trim()) errs.guest_email = 'Campo obbligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.guest_email)) errs.guest_email = 'Email non valida';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const result = await eventsAPI.createBooking(id, {
        ...form,
        slot_id: selectedSlot!.id,
      });

      if (result.checkout_url) {
        window.location.href = result.checkout_url;
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      const data = err?.response?.data;
      if (err?.response?.status === 409) {
        showError('Slot non più disponibile. Scegli un altro orario.');
        eventsAPI.getPublic(id).then(setEvent).catch(() => {});
        setSelectedSlot(null);
      } else if (data?.error) {
        showError(data.error);
      } else {
        showError('Errore durante la prenotazione. Riprova.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-2">Evento non disponibile</p>
          <p className="text-gray-400 text-sm">{"L'evento potrebbe essere terminato o non essere attivo."}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Prenotazione confermata!</h2>
          <p className="text-gray-600 mb-1">
            La tua prenotazione per <strong>{event.title}</strong> è registrata.
          </p>
          {selectedSlot && (
            <p className="text-gray-600 text-sm">
              Slot: ore <strong>{selectedSlot.start_time.slice(0, 5)}</strong> del <strong>{formatDate(event.date)}</strong>
            </p>
          )}
          <p className="text-gray-400 text-sm mt-4">
            Riceverai una conferma via email.
          </p>
        </div>
      </div>
    );
  }

  const availableSlots = event.slots.filter((s) => s.is_available);
  const slotIsSelected = selectedSlot !== null;
  const selectedSlotIsFree = selectedSlot?.is_free ?? true;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-amber-500" />
          <span className="font-bold text-gray-900">ListDreams</span>
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Event info card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{event.title}</h1>
          {event.description && (
            <p className="text-gray-600 text-sm mb-4">{event.description}</p>
          )}
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-amber-500 shrink-0" />
              {formatDate(event.date)}
            </div>
            {event.location && (
              <div className="flex items-center gap-2 col-span-2">
                <MapPin className="h-4 w-4 text-amber-500 shrink-0" />
                {event.location}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-500 shrink-0" />
              {availableSlots.length} slot disponibili
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Slot selection */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Scegli il tuo orario
            </h2>

            {event.slots.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="font-medium">Nessuno slot disponibile</p>
                <p className="text-sm mt-1">Non ci sono slot configurati per questo evento.</p>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="font-medium">Tutti gli slot sono al completo</p>
                <p className="text-sm mt-1">Non ci sono più posti disponibili per questo evento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {event.slots.map((slot: EventSlot) => {
                  const isSelected = selectedSlot?.id === slot.id;
                  const disabled = !slot.is_available;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        setSelectedSlot(slot);
                        setErrors((prev) => ({ ...prev, slot: '' }));
                        // Reset payment method if slot is free
                        if (slot.is_free) {
                          set('payment_method', 'in_person');
                        }
                      }}
                      className={`
                        flex flex-col items-start p-3 rounded-xl border transition-all text-left
                        ${disabled
                          ? 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed'
                          : isSelected
                            ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-amber-300 hover:bg-amber-50'
                        }
                      `}
                    >
                      <span className="font-semibold text-sm">
                        {slot.start_time.slice(0, 5)}
                        {slot.end_time ? ` – ${slot.end_time.slice(0, 5)}` : ''}
                      </span>
                      <span className={`text-xs mt-0.5 ${isSelected ? 'text-amber-100' : disabled ? 'text-gray-300' : 'text-gray-500'}`}>
                        {slot.is_free ? 'Gratuito' : `€${parseFloat(slot.price).toFixed(2)}`}
                      </span>
                      <span className={`text-xs mt-0.5 ${isSelected ? 'text-amber-100' : disabled ? 'text-gray-300' : 'text-gray-400'}`}>
                        {disabled ? 'Completo' : `${slot.available_spots} ${slot.available_spots === 1 ? 'posto' : 'posti'}`}
                      </span>
                      {slot.notes && (
                        <span className={`text-xs mt-0.5 italic truncate w-full ${isSelected ? 'text-amber-100' : 'text-gray-400'}`}>
                          {slot.notes}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            {errors.slot && <p className="text-xs text-red-500 mt-2">{errors.slot}</p>}
          </div>

          {/* Guest info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">I tuoi dati</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome e cognome *</label>
              <input
                type="text"
                value={form.guest_name}
                onChange={(e) => set('guest_name', e.target.value)}
                placeholder="Mario Rossi"
                className={`w-full rounded-xl border px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent ${errors.guest_name ? 'border-red-400' : 'border-gray-200'}`}
              />
              {errors.guest_name && <p className="text-xs text-red-500 mt-1">{errors.guest_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={form.guest_email}
                onChange={(e) => set('guest_email', e.target.value)}
                placeholder="mario@esempio.it"
                className={`w-full rounded-xl border px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent ${errors.guest_email ? 'border-red-400' : 'border-gray-200'}`}
              />
              {errors.guest_email && <p className="text-xs text-red-500 mt-1">{errors.guest_email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
              <input
                type="tel"
                value={form.guest_phone}
                onChange={(e) => set('guest_phone', e.target.value)}
                placeholder="+39 347 123 4567"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Messaggio (opzionale)</label>
              <textarea
                value={form.guest_message}
                onChange={(e) => set('guest_message', e.target.value)}
                rows={2}
                placeholder="Vuoi dirci qualcosa in anticipo?"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Payment method (only if slot is not free) */}
          {slotIsSelected && !selectedSlotIsFree && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Euro className="h-5 w-5 text-amber-500" />
                {`Pagamento — €${parseFloat(selectedSlot!.price).toFixed(2)}`}
              </h2>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'online', label: 'Carta di credito', sub: 'Paga subito online in modo sicuro' },
                  { value: 'in_person', label: 'In negozio', sub: "Paghi direttamente all'appuntamento" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set('payment_method', opt.value)}
                    className={`
                      text-left p-4 rounded-xl border transition-all
                      ${form.payment_method === opt.value
                        ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500'
                        : 'border-gray-200 hover:border-amber-200'
                      }
                    `}
                  >
                    <p className="text-sm font-medium text-gray-900">{opt.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{opt.sub}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || availableSlots.length === 0}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
          >
            {submitting ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Elaborazione...
              </>
            ) : !slotIsSelected ? (
              'Seleziona uno slot per continuare'
            ) : selectedSlotIsFree ? (
              'Conferma prenotazione gratuita'
            ) : form.payment_method === 'online' ? (
              `Prenota e paga €${parseFloat(selectedSlot!.price).toFixed(2)}`
            ) : (
              'Prenota — pagherai in negozio'
            )}
          </button>

          <p className="text-center text-xs text-gray-400">
            Prenotando accetti i termini del servizio. I pagamenti online sono sicuri e gestiti da Stripe.
          </p>
        </form>
      </main>
    </div>
  );
}
