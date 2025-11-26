'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { giftListsAPI, paymentsAPI } from '@/lib/api';
import { GiftListPublic } from '@/types';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { Heart, Users, Euro, Calendar, ArrowLeft, Gift, MessageCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function PublicGiftListPage() {
  const params = useParams();
  const giftListId = params.id as string;
  
  const [giftList, setGiftList] = useState<GiftListPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contributing, setContributing] = useState(false);
  const [showContributionForm, setShowContributionForm] = useState(false);
  const [contributionData, setContributionData] = useState({
    contributor_name: '',
    contributor_email: '',
    contributor_message: '',
    amount: 0,
    is_anonymous: false,
  });

  useEffect(() => {
    const fetchGiftList = async () => {
      try {
        const response = await giftListsAPI.getPublic(giftListId);
        setGiftList(response);
      } catch (err) {
        console.error('Error fetching gift list:', err);
        setError('Lista regalo non trovata o non disponibile');
      } finally {
        setLoading(false);
      }
    };

    if (giftListId) {
      fetchGiftList();
    }

    // Handle Stripe Checkout return
    const urlParams = new URLSearchParams(window.location.search);
    const payment = urlParams.get('payment');
    const sessionId = urlParams.get('session_id');

    if (payment === 'success' && sessionId) {
      toast.success('Pagamento completato con successo! Grazie per il tuo contributo.');
      // Remove URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (payment === 'cancelled') {
      toast.error('Pagamento annullato. Puoi riprovare quando vuoi.');
      // Remove URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [giftListId]);

  const handleContribute = () => {
    setShowContributionForm(true);
  };

  const handleContributionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContributing(true);
    
    try {
      // Create contribution
      const contribution = await giftListsAPI.createContribution(giftListId, contributionData);
      
      // Create Stripe Checkout session
      const paymentData = await paymentsAPI.createPaymentIntent({
        contribution_id: contribution.id,
        amount: contributionData.amount,
      });
      
      // Redirect directly to Stripe Checkout
      window.location.href = paymentData.checkout_url;
    } catch (error) {
      console.error('Error creating contribution:', error);
      toast.error('Errore durante la creazione del contributo');
    } finally {
      setContributing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setContributionData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gold-50 to-secondary-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600 mx-auto"></div>
          <p className="mt-4 text-secondary-600">Caricamento lista regalo...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !giftList) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gold-50 to-secondary-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
            <Heart className="h-16 w-16 text-secondary-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-secondary-900 mb-4">
            Lista Regalo Non Trovata
          </h1>
            <p className="text-secondary-600 mb-8">
              {error || 'La lista regalo che stai cercando non esiste o non è più disponibile.'}
          </p>
            <Link href="/lists">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Torna alle Liste
              </Button>
          </Link>
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
              <Link href="/lists">
                <Button variant="ghost">Tutte le Liste</Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost">Accedi</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/lists">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Torna alle Liste
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Cover Image */}
          {giftList.cover_image && (
            <div className="h-64 bg-gray-200 overflow-hidden">
              <img
                src={giftList.cover_image}
                alt={giftList.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-secondary-900 mb-4">
                  {giftList.title}
                </h1>
              
              {giftList.description && (
                <p className="text-lg text-secondary-600 mb-6">
                  {giftList.description}
                </p>
              )}

              {/* Business Info */}
              <div className="bg-gold-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-secondary-600 mb-1">
                  <span className="font-medium">Gioielleria:</span> {giftList.business_name}
                </p>
                <p className="text-sm text-secondary-500">
                  di {giftList.jeweler_name}
                </p>
              </div>
            </div>

            {/* Progress Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-secondary-900">
                  Progresso Raccolta
                </h2>
                <span className="text-2xl font-bold text-gold-600">
                  {giftList.progress_percentage.toFixed(1)}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-secondary-200 rounded-full h-4 mb-4">
                <div
                  className="bg-gold-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(giftList.progress_percentage, 100)}%` }}
                ></div>
              </div>

              {/* Amount Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-secondary-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gold-600">
                    {formatCurrency(giftList.total_contributions)}
              </div>
                  <div className="text-sm text-secondary-600">Raccolto</div>
                </div>
                <div className="bg-secondary-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-secondary-900">
                    {formatCurrency(giftList.target_amount)}
                </div>
                  <div className="text-sm text-secondary-600">Obiettivo</div>
                </div>
                <div className="bg-secondary-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gold-600">
                    {giftList.contributors_count}
              </div>
                  <div className="text-sm text-secondary-600">Contributori</div>
            </div>
          </div>
        </div>

            {/* Products Section */}
            {giftList.products && giftList.products.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-secondary-900 mb-6">
              Prodotti nella Lista
            </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {giftList.products.map((product, index) => (
                    <div key={index} className="border border-secondary-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-secondary-900">
                          {product.name}
                        </h3>
                        <span className="font-semibold text-gold-600">
                          {formatCurrency(product.price)}
                        </span>
                    </div>
                      {product.description && (
                        <p className="text-sm text-secondary-600 mb-2">
                          {product.description}
                    </p>
                  )}
                      <div className="flex items-center text-sm text-secondary-500">
                        <Gift className="h-4 w-4 mr-1" />
                        {product.status === 'available' ? 'Disponibile' : 'Acquistato'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Contributions */}
        {giftList.recent_contributions && giftList.recent_contributions.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-secondary-900 mb-6">
              Contributi Recenti
            </h2>
                <div className="space-y-3">
              {giftList.recent_contributions.map((contribution, index) => (
                    <div key={index} className="flex justify-between items-center bg-secondary-50 rounded-lg p-3">
                      <div className="flex items-center">
                        <MessageCircle className="h-4 w-4 text-gold-600 mr-2" />
                        <div>
                          <p className="font-medium text-secondary-900">
                        {contribution.display_name}
                      </p>
                    {contribution.message && (
                        <p className="text-sm text-secondary-600">
                              "{contribution.message}"
                        </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gold-600">
                          {formatCurrency(contribution.amount)}
                        </div>
                        <div className="text-xs text-secondary-500">
                      {formatDateTime(contribution.created_at)}
                        </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

            {/* Action Section */}
            <div className="text-center">
              {!showContributionForm ? (
                <Button
                  size="lg"
                  onClick={handleContribute}
                  className="px-8 py-4 text-lg"
                >
                  <Heart className="h-5 w-5 mr-2" />
                  Contribuisci Ora
                </Button>
              ) : (
                <div className="max-w-md mx-auto">
              <form onSubmit={handleContributionSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Nome *
                      </label>
                      <input
                        type="text"
                        name="contributor_name"
                        value={contributionData.contributor_name}
                        onChange={handleInputChange}
                  required
                        className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
                        placeholder="Il tuo nome"
                />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Email *
                      </label>
                      <input
                  type="email"
                        name="contributor_email"
                        value={contributionData.contributor_email}
                        onChange={handleInputChange}
                  required
                        className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
                        placeholder="la.tua@email.com"
                />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Importo (€) *
                      </label>
                      <input
                  type="number"
                        name="amount"
                        value={contributionData.amount || ''}
                        onChange={handleInputChange}
                        required
                        min="1"
                  step="0.01"
                        className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
                        placeholder="0.00"
                />
                    </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Messaggio (opzionale)
                  </label>
                  <textarea
                        name="contributor_message"
                        value={contributionData.contributor_message}
                        onChange={handleInputChange}
                    rows={3}
                        className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 placeholder-gray-400 bg-white"
                        placeholder="Lascia un messaggio per il festeggiato..."
                        style={{ color: '#111827 !important', backgroundColor: '#ffffff' }}
                  />
                </div>

                    <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                        onClick={() => setShowContributionForm(false)}
                    className="flex-1"
                  >
                    Annulla
                  </Button>
                  <Button
                    type="submit"
                        loading={contributing}
                    className="flex-1"
                  >
                        <Heart className="h-4 w-4 mr-2" />
                    Paga Ora
                  </Button>
                </div>
              </form>
                </div>
              )}
              <p className="text-sm text-secondary-500 mt-4">
                Pagamento sicuro tramite Stripe
              </p>
            </div>
          </div>
      </div>
      </main>
    </div>
  );
}