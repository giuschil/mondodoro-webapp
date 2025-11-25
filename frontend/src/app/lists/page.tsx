'use client';

import { useState, useEffect } from 'react';
import { giftListsAPI } from '@/lib/api';
import { GiftList } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Heart, Users, Euro, Calendar, ExternalLink, Sparkles } from 'lucide-react';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gold-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600 mx-auto"></div>
            <p className="mt-4 text-secondary-600">Caricamento liste regalo...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gold-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Riprova
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gold-50 to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <Sparkles className="h-8 w-8 text-gold-600 mr-2" />
              <span className="text-2xl font-bold text-secondary-900">ListDreams</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Accedi</Button>
              </Link>
              <Link href="/register">
                <Button>Registrati</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-secondary-900 mb-4">
            Liste Regalo Attive
          </h1>
          <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
            Contribuisci alle liste regalo create dai nostri gioiellieri partner
          </p>
        </div>

        {giftLists.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">
              Nessuna lista regalo disponibile
            </h3>
            <p className="text-secondary-600">
              Al momento non ci sono liste regalo pubbliche. Torna presto!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {giftLists.map((giftList) => (
              <div key={giftList.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {giftList.cover_image && (
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    <img
                      src={giftList.cover_image}
                      alt={giftList.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold text-secondary-900 line-clamp-2">
                      {giftList.title}
                    </h3>
                    <Link href={`/lists/${giftList.id}`}>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>

                  {giftList.description && (
                    <p className="text-secondary-600 text-sm mb-4 line-clamp-3">
                      {giftList.description}
                    </p>
                  )}

                  <div className="space-y-3">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm text-secondary-600 mb-1">
                        <span>Progresso</span>
                        <span>{giftList.progress_percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-secondary-200 rounded-full h-2">
                        <div
                          className="bg-gold-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(giftList.progress_percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Amount Info */}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-secondary-600">
                        Raccogli: {formatCurrency(giftList.target_amount)}
                      </span>
                      <span className="font-semibold text-gold-600">
                        {formatCurrency(giftList.total_contributions)}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-between text-sm text-secondary-500">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {giftList.contributors_count} contributori
                      </div>
                      {giftList.end_date && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(giftList.end_date)}
                        </div>
                      )}
                    </div>

                    {/* Business Info */}
                    <div className="pt-3 border-t border-secondary-200">
                      <p className="text-sm text-secondary-600">
                        <span className="font-medium">Gioielleria:</span> {giftList.business_name}
                      </p>
                      <p className="text-sm text-secondary-500">
                        di {giftList.jeweler_name}
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-6">
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
    </div>
  );
}

