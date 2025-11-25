'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { giftListsAPI } from '@/lib/api';
import { GiftList } from '@/types';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  Gift, 
  TrendingUp, 
  Users, 
  Euro,
  Plus,
  Eye,
  Calendar
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();
  const [giftLists, setGiftLists] = useState<GiftList[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLists: 0,
    activeLists: 0,
    totalContributions: 0,
    totalContributors: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await giftListsAPI.getAll();
        setGiftLists(response.results);
        
        // Calculate stats
        const totalLists = response.results.length;
        const activeLists = response.results.filter(list => list.status === 'active').length;
        const totalContributions = response.results.reduce((sum, list) => sum + list.total_contributions, 0);
        const totalContributors = response.results.reduce((sum, list) => sum + list.contributors_count, 0);
        
        setStats({
          totalLists,
          activeLists,
          totalContributions,
          totalContributors,
        });
      } catch (error) {
        console.error('Error fetching gift lists:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'jeweler' || user?.role === 'admin') {
      fetchData();
    }
  }, [user]);

  // Redirect if not authorized
  useEffect(() => {
    if (user && user.role !== 'jeweler' && user.role !== 'admin') {
      window.location.href = '/';
    }
  }, [user]);

  if (!user || (user.role !== 'jeweler' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gold-50 to-secondary-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-secondary-600">
              Ecco una panoramica della tua attività su ListDreams
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Gift className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Liste Totali</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.totalLists}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Liste Attive</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.activeLists}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Euro className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Contributi Totali</p>
              <p className="text-2xl font-bold text-secondary-900">
                {formatCurrency(stats.totalContributions)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Contributori</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.totalContributors}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Gift Lists */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-secondary-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-secondary-900">
              Le Tue Liste Regalo
            </h2>
            <Link href="/dashboard/gift-lists">
              <Button variant="outline" size="sm">
                Visualizza Tutte
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-sm text-secondary-600">Caricamento...</p>
          </div>
        ) : giftLists.length === 0 ? (
          <div className="p-6 text-center">
            <Gift className="mx-auto h-12 w-12 text-secondary-400" />
            <h3 className="mt-2 text-sm font-medium text-secondary-900">
              Nessuna lista regalo
            </h3>
            <p className="mt-1 text-sm text-secondary-500">
              Inizia creando la tua prima lista regalo.
            </p>
            <div className="mt-6">
              <Link href="/dashboard/gift-lists/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Crea Lista Regalo
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden">
            <ul className="divide-y divide-secondary-200">
              {giftLists.slice(0, 5).map((giftList) => (
                <li key={giftList.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <h3 className="text-sm font-medium text-secondary-900 truncate">
                          {giftList.title}
                        </h3>
                        <span
                          className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            giftList.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : giftList.status === 'completed'
                              ? 'bg-blue-100 text-blue-800'
                              : giftList.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {giftList.status === 'active' && 'Attiva'}
                          {giftList.status === 'completed' && 'Completata'}
                          {giftList.status === 'draft' && 'Bozza'}
                          {giftList.status === 'cancelled' && 'Annullata'}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center text-sm text-secondary-500">
                        <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4" />
                        Creata il {formatDate(giftList.created_at)}
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center text-sm text-secondary-600">
                          <span className="mr-4">
                            Obiettivo: {formatCurrency(giftList.target_amount)}
                          </span>
                          <span className="mr-4">
                            Raccolti: {formatCurrency(giftList.total_contributions)}
                          </span>
                          <span>
                            Progresso: {Math.round(giftList.progress_percentage)}%
                          </span>
                        </div>
                        <div className="mt-2 w-full bg-secondary-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, giftList.progress_percentage)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="ml-6 flex items-center space-x-2">
                      <Link href={`/lists/${giftList.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/dashboard/gift-lists/${giftList.id}`}>
                        <Button size="sm">
                          Gestisci
                        </Button>
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
