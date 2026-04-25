'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { eventsAPI, EventItem } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

const MONTH_NAMES = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
];

function getCalendarDays(year: number, month: number): (Date | null)[] {
  // month is 0-indexed
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Monday-first: 0=Mon … 6=Sun
  const startDow = (firstDay.getDay() + 6) % 7;
  const days: (Date | null)[] = [];

  for (let i = 0; i < startDow; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));

  // Pad to full weeks
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function toYMD(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function EventsCalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventsAPI.getAll()
      .then((data) => setEvents(data.results))
      .catch(() => toast.error('Errore nel caricamento degli eventi'))
      .finally(() => setLoading(false));
  }, []);

  const prevMonth = () => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  };

  const days = getCalendarDays(year, month);

  // Build a map: YYYY-MM-DD -> EventItem[]
  const eventsByDay: Record<string, EventItem[]> = {};
  events.forEach((ev) => {
    const key = ev.date;
    if (!eventsByDay[key]) eventsByDay[key] = [];
    eventsByDay[key].push(ev);
  });

  const todayStr = toYMD(today);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Calendario eventi</h2>
            <p className="text-sm text-gray-500 mt-1">Visualizza tutti i tuoi eventi nel calendario</p>
          </div>
          <Link
            href="/dashboard/events/new"
            className="inline-flex items-center gap-1.5 text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-xl transition-colors"
          >
            <CalendarDays className="h-4 w-4" />
            Nuovo evento
          </Link>
        </div>

        {/* Calendar card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Month navigation */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
              aria-label="Mese precedente"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h3 className="font-semibold text-gray-900 text-lg">
              {MONTH_NAMES[month]} {year}
            </h3>
            <button
              onClick={nextMonth}
              className="p-2 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
              aria-label="Mese successivo"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin h-8 w-8 rounded-full border-2 border-amber-500 border-t-transparent" />
            </div>
          ) : (
            <div className="p-4">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 mb-2">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">
                    {d}
                  </div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, idx) => {
                  if (!day) {
                    return <div key={`empty-${idx}`} className="h-24 sm:h-28" />;
                  }
                  const dayStr = toYMD(day);
                  const dayEvents = eventsByDay[dayStr] || [];
                  const isToday = dayStr === todayStr;
                  const isCurrentMonth = day.getMonth() === month;

                  return (
                    <div
                      key={dayStr}
                      className={`h-24 sm:h-28 rounded-xl p-1.5 flex flex-col border transition-colors ${
                        isToday
                          ? 'border-amber-400 bg-amber-50'
                          : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {/* Day number */}
                      <span
                        className={`text-xs font-semibold mb-1 self-start w-6 h-6 flex items-center justify-center rounded-full ${
                          isToday
                            ? 'bg-amber-500 text-white'
                            : isCurrentMonth
                              ? 'text-gray-700'
                              : 'text-gray-300'
                        }`}
                      >
                        {day.getDate()}
                      </span>

                      {/* Event badges */}
                      <div className="flex flex-col gap-0.5 overflow-hidden">
                        {dayEvents.slice(0, 3).map((ev) => (
                          <Link
                            key={ev.id}
                            href={`/dashboard/events/${ev.id}`}
                            className="block truncate text-xs font-medium bg-amber-100 hover:bg-amber-200 text-amber-800 rounded px-1.5 py-0.5 transition-colors leading-4"
                            title={ev.title}
                          >
                            {ev.title}
                          </Link>
                        ))}
                        {dayEvents.length > 3 && (
                          <span className="text-xs text-gray-400 px-1.5">
                            +{dayEvents.length - 3} altri
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-amber-500" />
            <span>Oggi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-2 rounded bg-amber-100" />
            <span>Evento</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
