'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { giftListsAPI } from '@/lib/api';
import { GiftList } from '@/types';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  Users,
  Euro,
  Filter,
  ExternalLink
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function GiftListsPage() {
  const { user } = useAuth();
  const [giftLists, setGiftLists] = useState<GiftList[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchGiftLists = async () => {
      try {
        const response = await giftListsAPI.getAll({
          search: searchTerm || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        });
        setGiftLists(response.results);
      } catch (error) {
        console.error('Error fetching gift lists:', error);
        toast.error('Errore nel caricamento delle liste regalo');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'jeweler') {
      fetchGiftLists();
    }
  }, [user, searchTerm, statusFilter]);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Sei sicuro di voler eliminare la lista "${title}"?`)) {
      return;
    }

    try {
      await giftListsAPI.delete(id);
      setGiftLists(prev => prev.filter(list => list.id !== id));
      toast.success('Lista regalo eliminata con successo');
    } catch (error) {
      console.error('Error deleting gift list:', error);
      toast.error('Errore durante l\'eliminazione della lista');
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

  if (user?.role !== 'jeweler' && user?.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-secondary-900 mb-4">
            Accesso Negato
          </h1>
          <p className="text-secondary-600">
            Questa sezione è riservata ai gioiellieri e agli amministratori.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">
              Le Tue Liste Regalo
            </h1>
            <p className="mt-1 text-sm text-secondary-600">
              Gestisci le tue liste regalo e monitora i contributi
            </p>
          </div>
          <Link href="/dashboard/gift-lists/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuova Lista Regalo
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
            <Input
              placeholder="Cerca liste regalo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 h-10 w-full rounded-md border border-secondary-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Tutti gli stati</option>
              <option value="draft">Bozza</option>
              <option value="active">Attiva</option>
              <option value="completed">Completata</option>
              <option value="cancelled">Annullata</option>
            </select>
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
            >
              Azzera Filtri
            </Button>
          </div>
        </div>
      </div>

      {/* Gift Lists */}
      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-sm text-secondary-600">Caricamento...</p>
        </div>
      ) : giftLists.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Plus className="mx-auto h-12 w-12 text-secondary-400" />
          <h3 className="mt-2 text-lg font-medium text-secondary-900">
            {searchTerm || statusFilter !== 'all' ? 'Nessun risultato' : 'Nessuna lista regalo'}
          </h3>
          <p className="mt-1 text-sm text-secondary-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'Prova a modificare i filtri di ricerca.'
              : 'Inizia creando la tua prima lista regalo per i tuoi clienti.'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <div className="mt-6">
              <Link href="/dashboard/gift-lists/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Crea Prima Lista
                </Button>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Lista Regalo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Stato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Progresso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Contributori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Data Creazione
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Azioni</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {giftLists.map((giftList) => (
                  <tr key={giftList.id} className="hover:bg-secondary-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-secondary-900">
                          {giftList.title}
                        </div>
                        <div className="text-sm text-secondary-500 truncate max-w-xs">
                          {giftList.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(giftList.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-secondary-900">
                          {formatCurrency(giftList.total_contributions)} / {formatCurrency(giftList.target_amount)}
                        </div>
                        <div className="mt-1 w-full bg-secondary-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, giftList.progress_percentage)}%` }}
                          />
                        </div>
                        <div className="text-xs text-secondary-500 mt-1">
                          {Math.round(giftList.progress_percentage)}% completato
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-secondary-900">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-secondary-400" />
                        {giftList.contributors_count}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-secondary-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(giftList.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                      <Link href={`/lists/${giftList.id}`}>
                        <Button variant="ghost" size="sm" title="Visualizza pubblicamente">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/dashboard/gift-lists/${giftList.id}`}>
                        <Button variant="ghost" size="sm" title="Visualizza dettagli">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/dashboard/gift-lists/${giftList.id}/edit`}>
                        <Button variant="ghost" size="sm" title="Modifica">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(giftList.id, giftList.title)}
                        title="Elimina"
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
