'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { giftListsAPI } from '@/lib/api';
import { GiftList } from '@/types';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import { 
  ArrowLeft,
  Edit,
  Share2,
  Copy,
  Users,
  Euro,
  Calendar,
  Settings,
  Plus,
  Eye,
  Trash2,
  ExternalLink,
  Gift,
  Target,
  TrendingUp
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function GiftListDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const listId = params.id as string;

  const [giftList, setGiftList] = useState<GiftList | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'contributions' | 'products' | 'settings'>('overview');

  useEffect(() => {
    const fetchGiftList = async () => {
      try {
        const response = await giftListsAPI.getById(listId);
        setGiftList(response);
      } catch (error) {
        console.error('Error fetching gift list:', error);
        toast.error('Errore nel caricamento della lista regalo');
        router.push('/dashboard/gift-lists');
      } finally {
        setLoading(false);
      }
    };

    if (listId) {
      fetchGiftList();
    }
  }, [listId, router]);

  const handleCopyLink = async () => {
    if (!giftList) return;
    
    const publicUrl = `${window.location.origin}/lists/${giftList.id}`;
    
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success('Link copiato negli appunti!');
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = publicUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Link copiato negli appunti!');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      draft: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
    };

    const labels = {
      active: 'Attiva',
      completed: 'Completata',
      draft: 'Bozza',
      cancelled: 'Annullata',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getListTypeBadge = (listType: string) => {
    const badges = {
      money_collection: 'bg-gold-100 text-gold-800',
      product_list: 'bg-purple-100 text-purple-800',
    };

    const labels = {
      money_collection: 'Raccolta Soldi',
      product_list: 'Lista Prodotti',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[listType as keyof typeof badges]}`}>
        {labels[listType as keyof typeof labels]}
      </span>
    );
  };

  if (user?.role !== 'jeweler') {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-secondary-900 mb-4">
            Accesso Negato
          </h1>
          <p className="text-secondary-600">
            Questa sezione è riservata ai gioiellieri.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!giftList) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-secondary-900 mb-4">
            Lista Regalo Non Trovata
          </h1>
          <p className="text-secondary-600 mb-6">
            La lista regalo che stai cercando non esiste o non hai i permessi per visualizzarla.
          </p>
          <Link href="/dashboard/gift-lists">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna alle Liste
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/gift-lists">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Indietro
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">
                {giftList.title}
              </h1>
              <div className="flex items-center space-x-2 mt-1">
                {getListTypeBadge(giftList.list_type)}
                {getStatusBadge(giftList.status)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link href={`/lists/${giftList.id}`} target="_blank">
              <Button variant="ghost" size="sm" title="Visualizza pubblicamente">
                <ExternalLink className="h-4 w-4 mr-2" />
                Anteprima
              </Button>
            </Link>
            <Button onClick={handleCopyLink} variant="ghost" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Copia Link
            </Button>
            <Button onClick={handleCopyLink} variant="ghost" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Condividi
            </Button>
            <Link href={`/dashboard/gift-lists/${giftList.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Modifica
              </Button>
            </Link>
          </div>
        </div>

        {giftList.description && (
          <p className="text-secondary-600 max-w-3xl">
            {giftList.description}
          </p>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Target className="h-8 w-8 text-gold-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Obiettivo</p>
              <p className="text-2xl font-bold text-secondary-900">
                {formatCurrency(giftList.target_amount)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Euro className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Raccolto</p>
              <p className="text-2xl font-bold text-secondary-900">
                {formatCurrency(giftList.total_contributions)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Contributori</p>
              <p className="text-2xl font-bold text-secondary-900">
                {giftList.contributors_count}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Progresso</p>
              <p className="text-2xl font-bold text-secondary-900">
                {Math.round(giftList.progress_percentage)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-secondary-900">Progresso Raccolta</h3>
          <span className="text-sm text-secondary-600">
            {Math.round(giftList.progress_percentage)}% completato
          </span>
        </div>
        <div className="w-full bg-secondary-200 rounded-full h-3 mb-4">
          <div
            className="bg-gold-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, giftList.progress_percentage)}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-secondary-600">
          <span>{formatCurrency(giftList.total_contributions)} raccolti</span>
          <span>{formatCurrency(giftList.target_amount)} obiettivo</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-secondary-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-gold-500 text-gold-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              }`}
            >
              Panoramica
            </button>
            <button
              onClick={() => setActiveTab('contributions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'contributions'
                  ? 'border-gold-500 text-gold-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              }`}
            >
              Contributi ({giftList.contributions.length})
            </button>
            {giftList.list_type === 'product_list' && (
              <button
                onClick={() => setActiveTab('products')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'products'
                    ? 'border-gold-500 text-gold-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                }`}
              >
                Prodotti ({giftList.products?.length || 0})
              </button>
            )}
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-gold-500 text-gold-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              }`}
            >
              Impostazioni
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-secondary-900 mb-4">
                    Informazioni Lista
                  </h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-secondary-600">Tipo Lista</dt>
                      <dd className="mt-1">
                        {giftList.list_type === 'money_collection' ? 'Raccolta Soldi' : 'Lista Prodotti'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-secondary-600">Stato</dt>
                      <dd className="mt-1">{getStatusBadge(giftList.status)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-secondary-600">Data Creazione</dt>
                      <dd className="mt-1 text-sm text-secondary-900">
                        {formatDate(giftList.created_at)}
                      </dd>
                    </div>
                    {giftList.end_date && (
                      <div>
                        <dt className="text-sm font-medium text-secondary-600">Data Scadenza</dt>
                        <dd className="mt-1 text-sm text-secondary-900">
                          {formatDate(giftList.end_date)}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-secondary-900 mb-4">
                    Link Pubblico
                  </h3>
                  <div className="bg-secondary-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <code className="text-sm text-secondary-600 truncate mr-4">
                        {`${window.location.origin}/lists/${giftList.id}`}
                      </code>
                      <Button onClick={handleCopyLink} size="sm" variant="ghost">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-secondary-600 mt-2">
                    Condividi questo link con i tuoi clienti per permettere loro di contribuire alla lista regalo.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contributions' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-secondary-900">
                  Contributi Ricevuti
                </h3>
              </div>

              {giftList.contributions.length === 0 ? (
                <div className="text-center py-8">
                  <Gift className="mx-auto h-12 w-12 text-secondary-400" />
                  <h3 className="mt-2 text-sm font-medium text-secondary-900">
                    Nessun contributo ancora
                  </h3>
                  <p className="mt-1 text-sm text-secondary-500">
                    Condividi il link della lista per iniziare a ricevere contributi.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-secondary-200">
                    <thead className="bg-secondary-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Contributore
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Importo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Stato
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Data
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Messaggio
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-secondary-200">
                      {giftList.contributions.map((contribution) => (
                        <tr key={contribution.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-secondary-900">
                              {contribution.display_name}
                            </div>
                            <div className="text-sm text-secondary-500">
                              {contribution.contributor_email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-secondary-900">
                              {formatCurrency(contribution.amount)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              contribution.payment_status === 'completed' 
                                ? 'bg-green-100 text-green-800'
                                : contribution.payment_status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {contribution.payment_status === 'completed' ? 'Completato' :
                               contribution.payment_status === 'pending' ? 'In Attesa' : 'Fallito'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                            {formatDate(contribution.created_at)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-secondary-500 max-w-xs truncate">
                              {contribution.contributor_message || '-'}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'products' && giftList.list_type === 'product_list' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-secondary-900">
                  Prodotti nella Lista
                </h3>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi Prodotto
                </Button>
              </div>

              {(!giftList.products || giftList.products.length === 0) ? (
                <div className="text-center py-8">
                  <Gift className="mx-auto h-12 w-12 text-secondary-400" />
                  <h3 className="mt-2 text-sm font-medium text-secondary-900">
                    Nessun prodotto aggiunto
                  </h3>
                  <p className="mt-1 text-sm text-secondary-500">
                    Aggiungi prodotti alla tua lista regalo.
                  </p>
                  <div className="mt-6">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Aggiungi Primo Prodotto
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {giftList.products.map((product) => (
                    <div key={product.id} className="border border-secondary-200 rounded-lg p-4">
                      {product.image_url && (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                      )}
                      <h4 className="text-lg font-medium text-secondary-900 mb-2">
                        {product.name}
                      </h4>
                      {product.description && (
                        <p className="text-sm text-secondary-600 mb-3">
                          {product.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-secondary-900">
                          {formatCurrency(product.price)}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.status === 'available' 
                            ? 'bg-green-100 text-green-800'
                            : product.status === 'purchased'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {product.status === 'available' ? 'Disponibile' :
                           product.status === 'purchased' ? 'Acquistato' : 'Riservato'}
                        </span>
                      </div>
                      {product.purchased_by && (
                        <p className="text-sm text-secondary-600 mb-3">
                          Acquistato da: <span className="font-medium">{product.purchased_by}</span>
                        </p>
                      )}
                      <div className="flex space-x-2">
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h3 className="text-lg font-medium text-secondary-900 mb-6">
                Impostazioni Lista
              </h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-secondary-900 mb-4">Azioni</h4>
                  <div className="flex space-x-4">
                    <Link href={`/dashboard/gift-lists/${giftList.id}/edit`}>
                      <Button variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Modifica Lista
                      </Button>
                    </Link>
                    <Button variant="outline" className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Elimina Lista
                    </Button>
                  </div>
                </div>

                <div className="border-t border-secondary-200 pt-6">
                  <h4 className="text-sm font-medium text-secondary-900 mb-4">Condivisione</h4>
                  <div className="bg-secondary-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-secondary-900">Link Pubblico</span>
                      <Button onClick={handleCopyLink} size="sm" variant="ghost">
                        <Copy className="h-4 w-4 mr-2" />
                        Copia
                      </Button>
                    </div>
                    <code className="text-sm text-secondary-600 break-all">
                      {`${window.location.origin}/lists/${giftList.id}`}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

