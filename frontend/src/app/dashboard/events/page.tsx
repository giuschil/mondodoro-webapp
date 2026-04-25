'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { eventsAPI, Event } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import {
  Plus,
  CalendarDays,
  Clock,
  MapPin,
  Euro,
  Eye,
  Trash2,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Bozza',
  active: 'Attivo',
  cancelled: 'Annullato',
  completed: 'Completato',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
};

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    eventsAPI.getAll()
      .then((data) => setEvents(data.results))
      .catch(() => toast.error('Errore nel caricamento degli eventi'))
      .finally(() => setLoading(false));
  }, [user]);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Eliminare l'evento "${title}"?`)) return;
    try {
      await eventsAPI.delete(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      toast.success('Evento eliminato');
    } catch {
      toast.error("Errore durante l'eliminazione");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">I tuoi eventi</h2>
            <p className="text-sm text-gray-500 mt-1">
              Crea eventi con slot prenotabili dai clienti
            </p>
          </div>
          <Link href="/dashboard/events/new">
            <Button variant="primary" size="sm">
              <Plus className="h-4 w-4 mr-1.5" />
              Nuovo evento
            </Button>
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin h-8 w-8 rounded-full border-2 border-amber-500 border-t-transparent" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Nessun evento ancora</h3>
            <p className="text-gray-500 text-sm mb-6">
              Crea il tuo primo evento con slot prenotabili
            </p>
            <Link href="/dashboard/events/new">
              <Button variant="primary" size="sm">
                <Plus className="h-4 w-4 mr-1.5" />
                Crea evento
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
              >
                {/* Title + status */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-900 leading-snug">{event.title}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[event.status] || 'bg-gray-100 text-gray-700'}`}>
                    {STATUS_LABELS[event.status] || event.status}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-gray-400 shrink-0" />
                    {formatDate(event.date)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                    {event.start_time.slice(0, 5)} – {event.end_time.slice(0, 5)} &middot; slot {event.slot_duration_minutes} min
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                      {event.location}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Euro className="h-4 w-4 text-gray-400 shrink-0" />
                    {event.is_free ? 'Gratuito' : `€${parseFloat(event.price_per_slot).toFixed(2)} / slot`}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400 shrink-0" />
                    {event.bookings_count} prenotazioni
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-auto pt-2 border-t border-gray-50">
                  <Link href={`/dashboard/events/${event.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-1.5" />
                      Dettagli
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(event.id, event.title)}
                    className="text-red-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
