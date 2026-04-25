'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { eventsAPI, Event, Booking } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Euro,
  Users,
  ExternalLink,
  Copy,
  CheckCircle,
  XCircle,
  Clock3,
  Pencil,
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

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [event, setEvent] = useState<Event | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([eventsAPI.getById(id), eventsAPI.getBookings(id)])
      .then(([ev, bk]) => {
        setEvent(ev);
        setBookings(bk.results);
      })
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

  const markAsPaid = async (bookingId: string) => {
    setUpdatingId(bookingId);
    try {
      const updated = await eventsAPI.updateBookingStatus(id, bookingId, 'paid');
      setBookings((prev) => prev.map((b) => b.id === bookingId ? updated : b));
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
      const updated = await eventsAPI.updateBookingStatus(id, bookingId, 'cancelled');
      setBookings((prev) => prev.map((b) => b.id === bookingId ? updated : b));
      toast.success('Prenotazione annullata');
    } catch {
      toast.error('Errore');
    } finally {
      setUpdatingId(null);
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

  // Group bookings by slot
  const bookingsBySlot: Record<string, Booking[]> = {};
  bookings.forEach((b) => {
    if (!bookingsBySlot[b.slot_time]) bookingsBySlot[b.slot_time] = [];
    bookingsBySlot[b.slot_time].push(b);
  });

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
          </div>

          {/* Details row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-50">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <CalendarDays className="h-4 w-4 text-amber-500 shrink-0" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Clock className="h-4 w-4 text-amber-500 shrink-0" />
              <span>{event.start_time.slice(0, 5)} – {event.end_time.slice(0, 5)}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <MapPin className="h-4 w-4 text-amber-500 shrink-0" />
                <span>{event.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Euro className="h-4 w-4 text-amber-500 shrink-0" />
              <span>{event.is_free ? 'Gratuito' : `€${parseFloat(event.price_per_slot).toFixed(2)} / slot`}</span>
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

        {/* Slot grid */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-500" />
              Prenotazioni per slot
            </h3>
            <span className="text-sm text-gray-500">
              {bookings.filter(b => b.payment_status !== 'cancelled').length} prenotazioni totali
            </span>
          </div>

          {event.slots_info.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">
              Nessuno slot generato. Controlla gli orari dell'evento.
            </p>
          ) : (
            <div className="space-y-4">
              {event.slots_info.map((slot) => {
                const slotBookings = bookingsBySlot[slot.time + ':00'] || bookingsBySlot[slot.time] || [];
                const activeBookings = slotBookings.filter(b => b.payment_status !== 'cancelled');
                return (
                  <div key={slot.time} className="border border-gray-100 rounded-xl overflow-hidden">
                    {/* Slot header */}
                    <div className={`flex items-center justify-between px-4 py-3 ${slot.available ? 'bg-gray-50' : 'bg-red-50'}`}>
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900 text-sm">{slot.time}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${slot.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {slot.available ? 'Disponibile' : 'Completo'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {activeBookings.length} / {slot.max_attendees}
                      </span>
                    </div>

                    {/* Bookings for this slot */}
                    {slotBookings.length > 0 && (
                      <div className="divide-y divide-gray-50">
                        {slotBookings.map((booking) => {
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
                    )}

                    {slotBookings.length === 0 && (
                      <div className="px-4 py-3 text-xs text-gray-400 italic">Nessuna prenotazione</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
