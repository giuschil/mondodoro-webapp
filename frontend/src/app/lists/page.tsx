'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { giftListsAPI } from '@/lib/api';
import { GiftList } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Heart, Users, Euro, Calendar, ExternalLink, Sparkles, ArrowRight, Shield } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function PublicListsPage() {
  const [giftLists, setGiftLists] = useState<GiftList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGiftLists = async () => {
      try {
        const response = await giftListsAPI.getAll({ is_public: true });
        setGiftLists(response.results || []);
      } catch (err) {
        console.error('Error fetching gift lists:', err);
        setError('Errore nel caricamento delle liste regalo');
      } finally {
        setLoading(false);
      }
    };

    fetchGiftLists();
  }, []);

  return (
    <div className="min-h-screen bg-white">

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="h-7 w-7 text-amber-500" />
              <span className="text-xl font-bold text-gray-900 tracking-tight">ListDreams</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
              <Link href="/#come-funziona" className="hover:text-gray-900 transition-colors">Come funziona</Link>
              <Link href="/#prezzi" className="hover:text-gray-900 transition-colors">Prezzi</Link>
              <Link href="/centro-aiuto" className="hover:text-gray-900 transition-colors">Aiuto</Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Accedi</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">
                  Inizia gratis
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Liste Regalo Attive
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Contribuisci alle liste regalo create dai nostri gioiellieri partner
          </p>
        </div>

        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
            <p className="mt-4 text-gray-500">Caricamento liste regalo...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Riprova</Button>
          </div>
        )}

        {!loading && !error && giftLists.length === 0 && (
          <div className="text-center py-20">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nessuna lista regalo disponibile
            </h3>
            <p className="text-gray-500">
              Al momento non ci sono liste regalo pubbliche. Torna presto!
            </p>
          </div>
        )}

        {!loading && !error && giftLists.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {giftLists.map((giftList) => (
              <div key={giftList.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md hover:border-amber-100 transition-all duration-200">
                {giftList.cover_image && (
                  <div className="h-48 bg-gray-100 overflow-hidden relative">
                    <Image
                      src={giftList.cover_image}
                      alt={giftList.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {giftList.title}
                    </h3>
                    <Link href={`/lists/${giftList.id}`}>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>

                  {giftList.description && (
                    <p className="text-gray-500 text-sm mb-4 line-clamp-3">
                      {giftList.description}
                    </p>
                  )}

                  <div className="space-y-3">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm text-gray-500 mb-1">
                        <span>Progresso</span>
                        <span className="font-medium text-amber-600">{giftList.progress_percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(giftList.progress_percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Amount Info */}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">
                        Obiettivo: {formatCurrency(giftList.target_amount)}
                      </span>
                      <span className="font-semibold text-amber-600">
                        {formatCurrency(giftList.total_contributions)}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-between text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {giftList.contributors_count} contributori
                      </div>
                      {giftList.end_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(giftList.end_date)}
                        </div>
                      )}
                    </div>

                    {/* Business Info */}
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Gioielleria:</span> {giftList.business_name}
                      </p>
                      <p className="text-sm text-gray-400">
                        di {giftList.jeweler_name}
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-5">
                    <Link href={`/lists/${giftList.id}`} className="block">
                      <Button className="w-full">
                        <Heart className="h-4 w-4 mr-2" />
                        Contribuisci Ora
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-12 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 pb-8 border-b border-gray-800">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-6 w-6 text-amber-400" />
                <span className="text-lg font-bold text-white">ListDreams</span>
              </div>
              <p className="text-sm leading-relaxed max-w-xs">
                La piattaforma per liste regalo e collette digitali dedicata alle gioiellerie italiane.
              </p>
            </div>
            <div className="flex gap-12 text-sm">
              <div>
                <h4 className="font-semibold text-white mb-3">Prodotto</h4>
                <ul className="space-y-2">
                  <li><Link href="/" className="hover:text-white transition-colors">Homepage</Link></li>
                  <li><Link href="/lists" className="hover:text-white transition-colors">Galleria liste</Link></li>
                  <li><Link href="/register" className="hover:text-white transition-colors">Registrati</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-3">Supporto</h4>
                <ul className="space-y-2">
                  <li><Link href="/contattaci" className="hover:text-white transition-colors">Contattaci</Link></li>
                  <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                  <li><Link href="/centro-aiuto" className="hover:text-white transition-colors">Centro aiuto</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
            <p>&copy; {new Date().getFullYear()} ListDreams. Tutti i diritti riservati.</p>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span>Pagamenti sicuri con</span>
              <span className="font-semibold text-white">Stripe</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
