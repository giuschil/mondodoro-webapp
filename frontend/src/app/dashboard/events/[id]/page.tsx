'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { eventsAPI, EventItem, EventSlot, Booking } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  ExternalLink,
  Copy,
  CheckCircle,
  XCircle,
  Clock3,
  Plus,
  Trash2,
  LayoutList,
  Euro,
  Users,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
};

const BOOKING_STATUS_CONFIG = {
  paid: { label: 'Pagato', icon: CheckCircle, color: 'text-green-600' },
  pending: { label: 'In attesa', icon: Clock3, color: 'text-yellow-600' },
  cancelled: { label: 'Annullato', icon: XCircle, color: 'text-red-500' },
};

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('it-IT', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function generateId() {
  return Math.random().toString(36).slice(2);
}

interface SlotDraft {
  id: string;
  start_time: string;
  end_time: string;
  price: number;
  max_attendees: number;
  notes: string;
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [togglingStatus, setTogglingStatus] = useState(false);

  // New slot state
  const [showSingleForm, setShowSingleForm] = useState(false);
  const [showSeriesForm, setShowSeriesForm] = useState(false);
  const [addingSlots, setAddingSlots] = useState(false);

  const [singleSlot, setSingleSlot] = useState({
    start_time: '', end_time: '', price: 0, max_attendees: 1, notes: '',
  });

  const [series, setSeries] = useState({
    from_time: '', to_time: '', duration_minutes: 30, price: 0, max_attendees: 1,
  });

  const [draftSlots, setDraftSlots] = useState<SlotDraft[]>([]);

  useEffect(() => {
    if (!id) return;
    eventsAPI.getById(id)
      .then(setEvent)
      .catch(() => toast.error('Errore nel caricamento'))
      .finally(() => setLoading(false));
  }, [id]);

  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/events/${id}/book`
    : '';

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success('Link copiato!');
  };

  const toggleStatus = async () => {
    if (!event) return;
    const newStatus = event.status === 'active' ? 'draft' : 'active';
    setTogglingStatus(true);
    try {
      const updated = await eventsAPI.update(id, { status: newStatus });
      setEvent(updated);
      toast.success(newStatus === 'active' ? 'Evento attivato' : 'Evento impostato come bozza');
    } catch {
      toast.error('Errore aggiornamento stato');
    } finally {
      setTogglingStatus(false);
    }
  };

  const markAsPaid = async (bookingId: string) => {
    setUpdatingId(bookingId);
    try {
      await eventsAPI.updateBookingStatus(id, bookingId, 'paid');
      const updated = await eventsAPI.getById(id);
      setEvent(updated);
      toast.success('Prenotazione confermata');
    } catch {
      toast.error('Errore');
    } finally {
      setUpdatingId(null);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    if (!window.confirm('Annullare questa prenotazione?')) return;
    setUpdatingId(bookingId);
    try {
      await eventsAPI.updateBookingStatus(id, bookingId, 'cancelled');
      const updated = await eventsAPI.getById(id);
      setEvent(updated);
      toast.success('Prenotazione annullata');
    } catch {
      toast.error('Errore');
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteSlot = async (slotId: string) => {
    if (!window.confirm('Eliminare questo slot?')) return;
    try {
      await eventsAPI.deleteSlot(id, slotId);
      const updated = await eventsAPI.getById(id);
      setEvent(updated);
      toast.success('Slot eliminato');
    } catch {
      toast.error('Errore eliminazione slot');
    }
  };

  const addDraftSingleSlot = () => {
    if (!singleSlot.start_time) {
      toast.error("Inserisci l'orario di inizio");
      return;
    }
    if (singleSlot.end_time && singleSlot.start_time >= singleSlot.end_time) {
      toast.error("L'orario di fine deve essere successivo all'inizio");
      return;
    }
    setDraftSlots((prev) => [...prev, { ...singleSlot, id: generateId() }]);
    setSingleSlot({ start_time: '', end_time: '', price: 0, max_attendees: 1, notes: '' });
    setShowSingleForm(false);
  };

  const generateSeriesSlots = () => {
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
      toast.error('Nessuno slot generato');
      return;
    }
    setDraftSlots((prev) => [...prev, ...newSlots]);
    setSeries({ from_time: '', to_time: '', duration_minutes: 30, price: 0, max_attendees: 1 });
    setShowSeriesForm(false);
    toast.success(`${newSlots.length} slot pronti`);
  };

  const saveSlots = async () => {
    if (draftSlots.length === 0) return;
    setAddingSlots(true);
    try {
      await eventsAPI.createSlots(id, draftSlots.map((s) => ({
        start_time: s.start_time,
        end_time: s.end_time || undefined,
        price: s.price,
        max_attendees: s.max_attendees,
        notes: s.notes || undefined,
      })));
      setDraftSlots([]);
      const updated = await eventsAPI.getById(id);
      setEvent(updated);
      toast.success('Slot salvati');
    } catch {
      toast.error('Errore salvataggio slot');
    } finally {
      setAddingSlots(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 rounded-full border-2 border-amber-500 border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  if (!event) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-gray-500">Evento non trovato</p>
          <Link href="/dashboard/events" className="mt-4 inline-block text-amber-600 hover:underline text-sm">
            Torna agli eventi
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Back */}
        <Link href="/dashboard/events" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" />
          Torna agli eventi
        </Link>

        {/* Header card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold text-gray-900">{event.title}</h2>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[event.status] || 'bg-gray-100 text-gray-700'}`}>
                  {event.status_display}
                </span>
              </div>
              {event.description && (
                <p className="text-gray-600 text-sm mt-2">{event.description}</p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleStatus}
              loading={togglingStatus}
              className={event.status === 'active' ? 'border-yellow-300 text-yellow-700 hover:bg-yellow-50' : 'border-green-300 text-green-700 hover:bg-green-50'}
            >
              {event.status === 'active' ? 'Imposta bozza' : 'Attiva evento'}
            </Button>
          </div>

          <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-gray-50 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-amber-500 shrink-0" />
              <span>{formatDate(event.date)}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-amber-500 shrink-0" />
                <span>{event.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500 shrink-0" />
              <span>{event.slots_count} slot</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-500 shrink-0" />
              <span>{event.bookings_count} prenotazioni</span>
            </div>
          </div>
        </div>

        {/* Share link */}
        {event.status === 'active' && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm font-semibold text-amber-900">Link prenotazione pubblica</p>
              <p className="text-xs text-amber-700 mt-0.5 break-all">{publicUrl}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyLink}>
                <Copy className="h-4 w-4 mr-1.5" />
                Copia link
              </Button>
              <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="primary" size="sm">
                  <ExternalLink className="h-4 w-4 mr-1.5" />
                  Apri
                </Button>
              </a>
            </div>
          </div>
        )}

        {/* Slots section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-5">
            <Clock className="h-5 w-5 text-amber-500" />
            Slot e prenotazioni
          </h3>

          {event.slots.length === 0 ? (
            <p className="text-sm text-gray-400 italic text-center py-6">
              Nessuno slot aggiunto ancora.
            </p>
          ) : (
            <div className="space-y-4">
              {event.slots.map((slot: EventSlot) => {
                const slotBookings: Booking[] = slot.bookings || [];
                const activeBookings = slotBookings.filter((b) => b.payment_status !== 'cancelled');
                return (
                  <div key={slot.id} className="border border-gray-100 rounded-xl overflow-hidden">
                    {/* Slot header */}
                    <div className={`flex items-center justify-between px-4 py-3 ${slot.is_available ? 'bg-gray-50' : 'bg-red-50'}`}>
                      <div className="flex items-center gap-3 flex-wrap">
                        <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                        <span className="font-medium text-gray-900 text-sm">
                          {slot.start_time.slice(0, 5)}{slot.end_time ? ` – ${slot.end_time.slice(0, 5)}` : ''}
                        </span>
                        <span className="text-sm text-gray-500">
                          {slot.is_free ? 'Gratuito' : `€${parseFloat(slot.price).toFixed(2)}`}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${slot.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {slot.is_available ? 'Disponibile' : 'Completo'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-gray-500">
                          {activeBookings.length}/{slot.max_attendees}
                        </span>
                        <button
                          onClick={() => deleteSlot(slot.id)}
                          className="text-red-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Bookings for this slot */}
                    {slotBookings.length > 0 ? (
                      <div className="divide-y divide-gray-50">
                        {slotBookings.map((booking: Booking) => {
                          const cfg = BOOKING_STATUS_CONFIG[booking.payment_status] || BOOKING_STATUS_CONFIG.pending;
                          const StatusIcon = cfg.icon;
                          return (
                            <div key={booking.id} className="px-4 py-3 flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{booking.guest_name}</p>
                                <p className="text-xs text-gray-500 truncate">{booking.guest_email}</p>
                                {booking.guest_phone && (
                                  <p className="text-xs text-gray-500">{booking.guest_phone}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <div className="flex items-center gap-1.5">
                                  <StatusIcon className={`h-4 w-4 ${cfg.color}`} />
                                  <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                                </div>
                                <span className="text-xs text-gray-400 hidden sm:block">
                                  {booking.payment_method_display}
                                </span>
                                {booking.payment_status === 'pending' && (
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => markAsPaid(booking.id)}
                                      disabled={updatingId === booking.id}
                                      className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-2 py-1 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                      Conferma
                                    </button>
                                    <button
                                      onClick={() => cancelBooking(booking.id)}
                                      disabled={updatingId === booking.id}
                                      className="text-xs bg-red-100 text-red-600 hover:bg-red-200 px-2 py-1 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                      Annulla
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="px-4 py-3 text-xs text-gray-400 italic">Nessuna prenotazione</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Draft slots (pending save) */}
          {draftSlots.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Slot da aggiungere</p>
              {draftSlots.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-4 text-sm text-gray-700 flex-wrap">
                    <span className="font-medium">{s.start_time}{s.end_time ? ` – ${s.end_time}` : ''}</span>
                    <span className="text-gray-500">{parseFloat(String(s.price)) === 0 ? 'Gratuito' : `€${parseFloat(String(s.price)).toFixed(2)}`}</span>
                    <span className="text-gray-400">{s.max_attendees} {s.max_attendees === 1 ? 'posto' : 'posti'}</span>
                  </div>
                  <button type="button" onClick={() => setDraftSlots((prev) => prev.filter((x) => x.id !== s.id))} className="text-red-400 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <Button variant="primary" size="sm" onClick={saveSlots} loading={addingSlots}>
                Salva {draftSlots.length} slot
              </Button>
            </div>
          )}

          {/* Add slot forms */}
          {showSingleForm && (
            <div className="mt-4 border border-amber-200 rounded-xl p-4 space-y-3 bg-amber-50">
              <p className="text-sm font-medium text-amber-900">Nuovo slot singolo</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Inizio *</label>
                  <input type="time" value={singleSlot.start_time} onChange={(e) => setSingleSlot((p) => ({ ...p, start_time: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Fine (opz.)</label>
                  <input type="time" value={singleSlot.end_time} onChange={(e) => setSingleSlot((p) => ({ ...p, end_time: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Prezzo (€)</label>
                  <input type="number" min="0" step="0.01" value={singleSlot.price} onChange={(e) => setSingleSlot((p) => ({ ...p, price: Number(e.target.value) }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Max persone</label>
                  <input type="number" min="1" value={singleSlot.max_attendees} onChange={(e) => setSingleSlot((p) => ({ ...p, max_attendees: Number(e.target.value) }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Note (opz.)</label>
                <input type="text" value={singleSlot.notes} onChange={(e) => setSingleSlot((p) => ({ ...p, notes: e.target.value }))} placeholder="Es. Solo fedi nuziali" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="primary" size="sm" onClick={addDraftSingleSlot}>Aggiungi</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowSingleForm(false)}>Annulla</Button>
              </div>
            </div>
          )}

          {showSeriesForm && (
            <div className="mt-4 border border-blue-200 rounded-xl p-4 space-y-3 bg-blue-50">
              <p className="text-sm font-medium text-blue-900">Aggiungi in serie</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Da</label>
                  <input type="time" value={series.from_time} onChange={(e) => setSeries((p) => ({ ...p, from_time: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">A</label>
                  <input type="time" value={series.to_time} onChange={(e) => setSeries((p) => ({ ...p, to_time: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Durata slot</label>
                  <select value={series.duration_minutes} onChange={(e) => setSeries((p) => ({ ...p, duration_minutes: Number(e.target.value) }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                    {[15, 30, 45, 60].map((m) => <option key={m} value={m}>{m} minuti</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Prezzo (€)</label>
                  <input type="number" min="0" step="0.01" value={series.price} onChange={(e) => setSeries((p) => ({ ...p, price: Number(e.target.value) }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Max persone per slot</label>
                <input type="number" min="1" value={series.max_attendees} onChange={(e) => setSeries((p) => ({ ...p, max_attendees: Number(e.target.value) }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="primary" size="sm" onClick={generateSeriesSlots}>Genera slot</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowSeriesForm(false)}>Annulla</Button>
              </div>
            </div>
          )}

          {!showSingleForm && !showSeriesForm && (
            <div className="flex gap-2 mt-4 flex-wrap">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowSingleForm(true)}>
                <Plus className="h-4 w-4 mr-1.5" />
                Aggiungi slot
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowSeriesForm(true)}>
                <LayoutList className="h-4 w-4 mr-1.5" />
                Aggiungi in serie
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
