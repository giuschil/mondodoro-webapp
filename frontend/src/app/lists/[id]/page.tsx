'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { giftListsAPI, paymentsAPI } from '@/lib/api';
import { GiftListPublic } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { 
  Heart, 
  Users, 
  Calendar, 
  Euro,
  Gift,
  Share2,
  MessageCircle,
  Sparkles,
  Clock,
  CheckCircle
} from 'lucide-react';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function PublicGiftListPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [giftList, setGiftList] = useState<GiftListPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContributeForm, setShowContributeForm] = useState(false);
  const [contributionForm, setContributionForm] = useState({
    contributor_name: '',
    contributor_email: '',
    contributor_message: '',
    amount: '',
    is_anonymous: false,
  });
  const [contributionLoading, setContributionLoading] = useState(false);

  useEffect(() => {
    const fetchGiftList = async () => {
      try {
        const data = await giftListsAPI.getPublic(id);
        setGiftList(data);
      } catch (error) {
        console.error('Error fetching gift list:', error);
        toast.error('Lista regalo non trovata');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchGiftList();
    }
  }, [id]);

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: giftList?.title,
          text: `Contribuisci alla lista regalo: ${giftList?.title}`,
          url: url,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Link copiato negli appunti!');
      } catch (error) {
        toast.error('Errore nel copiare il link');
      }
    }
  };

  const handleContributionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!giftList) return;
    
    setContributionLoading(true);
    
    try {
      const contribution = await giftListsAPI.createContribution(giftList.id, {
        contributor_name: contributionForm.contributor_name,
        contributor_email: contributionForm.contributor_email,
        contributor_message: contributionForm.contributor_message,
        amount: parseFloat(contributionForm.amount),
        is_anonymous: contributionForm.is_anonymous,
      });
      
      // Create payment intent
      const paymentIntent = await paymentsAPI.createPaymentIntent({
        contribution_id: contribution.id,
        amount: parseFloat(contributionForm.amount),
      });
      
      // Redirect to payment page with client secret
      const paymentUrl = `/payment?client_secret=${paymentIntent.client_secret}&contribution_id=${contribution.id}&contributor_name=${encodeURIComponent(contributionForm.contributor_name)}&amount=${contributionForm.amount}`;
      window.location.href = paymentUrl;
      
    } catch (error) {
      console.error('Error creating contribution:', error);
      toast.error('Errore durante la registrazione del contributo');
      setContributionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-secondary-600">Caricamento lista regalo...</p>
        </div>
      </div>
    );
  }

  if (!giftList) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <Gift className="mx-auto h-16 w-16 text-secondary-400 mb-4" />
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">
            Lista Regalo Non Trovata
          </h1>
          <p className="text-secondary-600 mb-6">
            La lista regalo che stai cercando non esiste o non è più disponibile.
          </p>
          <Link href="/">
            <Button>Torna alla Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <Sparkles className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-2xl font-bold text-secondary-900">Mondodoro</span>
            </Link>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Condividi
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Gift List Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          {giftList.cover_image && (
            <div className="h-64 bg-secondary-200">
              <img
                src={giftList.cover_image}
                alt={giftList.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-secondary-900 mb-2">
                  {giftList.title}
                </h1>
                <p className="text-lg text-secondary-600 mb-4">
                  {giftList.description}
                </p>
                <div className="flex items-center text-sm text-secondary-500 space-x-4">
                  <div className="flex items-center">
                    <Gift className="h-4 w-4 mr-1" />
                    {giftList.business_name || giftList.jeweler_name}
                  </div>
                  {giftList.end_date && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Scade il {formatDate(giftList.end_date)}
                    </div>
                  )}
                </div>
              </div>
              
              {giftList.is_completed ? (
                <div className="flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Obiettivo Raggiunto!
                </div>
              ) : (
                <Button 
                  size="lg"
                  onClick={() => setShowContributeForm(true)}
                  className="flex-shrink-0"
                >
                  <Heart className="h-5 w-5 mr-2" />
                  Contribuisci
                </Button>
              )}
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-secondary-700">
                  Progresso
                </span>
                <span className="text-sm text-secondary-600">
                  {Math.round(giftList.progress_percentage)}%
                </span>
              </div>
              <div className="w-full bg-secondary-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, giftList.progress_percentage)}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-2 text-sm text-secondary-600">
                <span>
                  Raccolti: {formatCurrency(giftList.total_contributions)}
                </span>
                <span>
                  Obiettivo: {formatCurrency(giftList.target_amount)}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-secondary-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-5 w-5 text-primary-600 mr-1" />
                </div>
                <div className="text-2xl font-bold text-secondary-900">
                  {giftList.contributors_count}
                </div>
                <div className="text-sm text-secondary-600">
                  Contributori
                </div>
              </div>
              
              <div className="text-center p-4 bg-secondary-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Euro className="h-5 w-5 text-primary-600 mr-1" />
                </div>
                <div className="text-2xl font-bold text-secondary-900">
                  {formatCurrency(giftList.total_contributions)}
                </div>
                <div className="text-sm text-secondary-600">
                  Raccolti
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products */}
        {giftList.items && giftList.items.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-secondary-900 mb-6">
              Prodotti nella Lista
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {giftList.items.map((item) => (
                <div key={item.id} className="border border-secondary-200 rounded-lg p-4">
                  {item.image && (
                    <div className="h-48 bg-secondary-100 rounded-lg mb-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <h3 className="font-semibold text-secondary-900 mb-2">
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-secondary-600 mb-3">
                      {item.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-primary-600">
                      {formatCurrency(item.price)}
                    </span>
                    <span className="text-sm text-secondary-500">
                      Disponibili: {item.quantity_available - item.quantity_contributed}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Contributions */}
        {giftList.recent_contributions && giftList.recent_contributions.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-secondary-900 mb-6">
              Contributi Recenti
            </h2>
            <div className="space-y-4">
              {giftList.recent_contributions.map((contribution, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-secondary-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <Heart className="h-5 w-5 text-primary-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-secondary-900">
                        {contribution.display_name}
                      </p>
                      <p className="text-sm font-semibold text-primary-600">
                        {formatCurrency(contribution.amount)}
                      </p>
                    </div>
                    {contribution.message && (
                      <div className="mt-1 flex items-start">
                        <MessageCircle className="h-4 w-4 text-secondary-400 mr-1 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-secondary-600">
                          {contribution.message}
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-secondary-500 mt-1">
                      {formatDateTime(contribution.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contribution Form Modal */}
        {showContributeForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-secondary-900 mb-4">
                Contribuisci alla Lista Regalo
              </h3>
              
              <form onSubmit={handleContributionSubmit} className="space-y-4">
                <Input
                  label="Il tuo Nome"
                  value={contributionForm.contributor_name}
                  onChange={(e) => setContributionForm(prev => ({
                    ...prev,
                    contributor_name: e.target.value
                  }))}
                  required
                  placeholder="Mario Rossi"
                />

                <Input
                  label="La tua Email"
                  type="email"
                  value={contributionForm.contributor_email}
                  onChange={(e) => setContributionForm(prev => ({
                    ...prev,
                    contributor_email: e.target.value
                  }))}
                  required
                  placeholder="mario@example.com"
                />

                <Input
                  label="Importo Contributo (€)"
                  type="number"
                  step="0.01"
                  min="1"
                  value={contributionForm.amount}
                  onChange={(e) => setContributionForm(prev => ({
                    ...prev,
                    amount: e.target.value
                  }))}
                  required
                  placeholder="50.00"
                />

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Messaggio (opzionale)
                  </label>
                  <textarea
                    value={contributionForm.contributor_message}
                    onChange={(e) => setContributionForm(prev => ({
                      ...prev,
                      contributor_message: e.target.value
                    }))}
                    rows={3}
                    className="w-full rounded-md border border-secondary-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Auguri per il vostro matrimonio!"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={contributionForm.is_anonymous}
                    onChange={(e) => setContributionForm(prev => ({
                      ...prev,
                      is_anonymous: e.target.checked
                    }))}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-secondary-900">
                    Contributo anonimo
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowContributeForm(false)}
                    className="flex-1"
                  >
                    Annulla
                  </Button>
                  <Button
                    type="submit"
                    loading={contributionLoading}
                    className="flex-1"
                  >
                    Procedi al Pagamento
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
