'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { giftListsAPI } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { 
  ArrowLeft, 
  Save,
  Calendar,
  Euro
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function EditGiftListPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const giftListId = params.id as string;
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    list_type: 'money_collection' as 'money_collection' | 'product_list',
    target_amount: '',
    fixed_contribution_amount: '',
    max_contributors: '',
    status: 'draft',
    is_public: true,
    show_in_public_gallery: false,
    start_date: '',
    end_date: '',
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load existing gift list data
  useEffect(() => {
    const fetchGiftList = async () => {
      try {
        const data = await giftListsAPI.getById(giftListId);
        setFormData({
          title: data.title || '',
          description: data.description || '',
          list_type: data.list_type || 'money_collection',
          target_amount: data.target_amount?.toString() || '',
          fixed_contribution_amount: data.fixed_contribution_amount?.toString() || '',
          max_contributors: data.max_contributors?.toString() || '',
          status: data.status || 'draft',
          is_public: data.is_public ?? true,
          show_in_public_gallery: data.show_in_public_gallery ?? false,
          start_date: data.start_date ? data.start_date.split('T')[0] : '',
          end_date: data.end_date ? data.end_date.split('T')[0] : '',
        });
      } catch (error) {
        console.error('Error fetching gift list:', error);
        toast.error('Errore nel caricamento della lista');
        router.push('/dashboard/gift-lists');
      } finally {
        setLoading(false);
      }
    };

    if (giftListId) {
      fetchGiftList();
    }
  }, [giftListId, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Il titolo è obbligatorio';
    }
    
    if (!formData.target_amount || parseFloat(formData.target_amount) <= 0) {
      newErrors.target_amount = 'L\'importo obiettivo deve essere maggiore di 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Correggi gli errori nel form');
      return;
    }
    
    setSaving(true);
    
    try {
      const payload: Record<string, any> = {
        title: formData.title,
        description: formData.description,
        list_type: formData.list_type,
        target_amount: parseFloat(formData.target_amount),
        status: formData.status,
        is_public: formData.is_public,
        show_in_public_gallery: formData.show_in_public_gallery,
      };
      
      // Include optional fields - send null if empty to clear them
      payload.fixed_contribution_amount = formData.fixed_contribution_amount 
        ? parseFloat(formData.fixed_contribution_amount) 
        : null;
      payload.max_contributors = formData.max_contributors 
        ? parseInt(formData.max_contributors) 
        : null;
      payload.start_date = formData.start_date || null;
      payload.end_date = formData.end_date || null;

      console.log('SENDING PAYLOAD:', JSON.stringify(payload));
      alert('Payload: ' + JSON.stringify(payload));
      
      console.log('SENDING PAYLOAD:', JSON.stringify(payload));
      alert('Payload: ' + JSON.stringify(payload));
      
      await giftListsAPI.update(giftListId, payload);
      
      toast.success('Lista regalo aggiornata con successo!');
      router.push('/dashboard/gift-lists');
    } catch (error: any) {
      console.error('Error updating gift list:', error);
      toast.error(error.response?.data?.detail || 'Errore durante l\'aggiornamento');
    } finally {
      setSaving(false);
    }
  };

  if (user?.role !== 'jeweler' && user?.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-secondary-900 mb-4">
            Accesso Negato
          </h1>
          <p className="text-secondary-600">
            Solo i gioiellieri possono modificare le liste regalo.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-sm text-secondary-600">Caricamento...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard/gift-lists" className="inline-flex items-center text-sm text-secondary-600 hover:text-secondary-900 mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Torna alle liste
        </Link>
        <h1 className="text-2xl font-bold text-secondary-900">
          Modifica Lista Regalo
        </h1>
        <p className="mt-1 text-sm text-secondary-600">
          Modifica i dettagli della tua lista regalo
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-secondary-900 mb-6">
            Informazioni Base
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label="Titolo della Lista *"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                error={errors.title}
                placeholder="Es. Lista Nozze Mario e Giulia"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Descrizione
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Descrivi la tua lista regalo..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Tipo di Lista
              </label>
              <select
                name="list_type"
                value={formData.list_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="money_collection">Raccolta Soldi</option>
                <option value="product_list">Lista Prodotti</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Stato
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="draft">Bozza</option>
                <option value="active">Attiva</option>
                <option value="completed">Completata</option>
                <option value="cancelled">Annullata</option>
              </select>
            </div>
          </div>
        </div>

        {/* Money Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-secondary-900 mb-6">
            Impostazioni Importi
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Obiettivo (€) *
              </label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                <input
                  type="number"
                  name="target_amount"
                  value={formData.target_amount}
                  onChange={handleInputChange}
                  className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.target_amount ? 'border-red-500' : 'border-secondary-300'
                  }`}
                  placeholder="1000"
                  step="0.01"
                  min="0"
                />
              </div>
              {errors.target_amount && (
                <p className="mt-1 text-sm text-red-600">{errors.target_amount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Contributo Fisso (€)
              </label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                <input
                  type="number"
                  name="fixed_contribution_amount"
                  value={formData.fixed_contribution_amount}
                  onChange={handleInputChange}
                  className="pl-10 w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="50"
                  step="0.01"
                  min="0"
                />
              </div>
              <p className="mt-1 text-xs text-secondary-500">Lascia vuoto per contributi liberi</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Max Contributori
              </label>
              <input
                type="number"
                name="max_contributors"
                value={formData.max_contributors}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="20"
                min="1"
              />
              <p className="mt-1 text-xs text-secondary-500">Lascia vuoto per illimitati</p>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-secondary-900 mb-6">
            Date
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Data Inizio
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="pl-10 w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Data Fine
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className="pl-10 w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-secondary-900 mb-6">
            Impostazioni Visibilità
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_public"
                checked={formData.is_public}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
              />
              <label className="ml-2 block text-sm text-secondary-900">
                Lista pubblica (visibile a tutti tramite link)
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="show_in_public_gallery"
                checked={formData.show_in_public_gallery}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
              />
              <label className="ml-2 block text-sm text-secondary-900">
                Mostra nella bacheca pubblica (visibile nella pagina /lists)
              </label>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Link href="/dashboard/gift-lists">
            <Button type="button" variant="outline">
              Annulla
            </Button>
          </Link>
          <Button type="submit" loading={saving}>
            <Save className="h-4 w-4 mr-2" />
            Salva Modifiche
          </Button>
        </div>
      </form>
    </DashboardLayout>
  );
}
// Build 1764115005
