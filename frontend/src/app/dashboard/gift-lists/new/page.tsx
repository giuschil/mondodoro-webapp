'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { giftListsAPI } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { 
  ArrowLeft, 
  Plus, 
  X, 
  Upload,
  Calendar,
  Euro
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface GiftListItem {
  name: string;
  description: string;
  price: number;
  quantity_available: number;
  order: number;
}

interface GiftListProduct {
  name: string;
  description: string;
  price: number;
  image_url: string;
  order: number;
}

export default function NewGiftListPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    list_type: 'money_collection' as 'money_collection' | 'product_list',
    target_amount: '',
    fixed_contribution_amount: '',
    max_contributors: '',
    status: 'draft',
    is_public: true,
    allow_anonymous_contributions: true,
    start_date: '',
    end_date: '',
  });
  
  const [items, setItems] = useState<GiftListItem[]>([]);
  const [products, setProducts] = useState<GiftListProduct[]>([]);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('L\'immagine deve essere inferiore a 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Il file deve essere un\'immagine');
        return;
      }
      
      setCoverImage(file);
    }
  };

  const addItem = () => {
    setItems(prev => [...prev, {
      name: '',
      description: '',
      price: 0,
      quantity_available: 1,
      order: prev.length
    }]);
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof GiftListItem, value: string | number) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Il titolo è obbligatorio';
    }

    if (!formData.target_amount || parseFloat(formData.target_amount) <= 0) {
      newErrors.target_amount = 'L\'obiettivo deve essere maggiore di zero';
    }

    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      
      if (startDate >= endDate) {
        newErrors.end_date = 'La data di fine deve essere successiva alla data di inizio';
      }
    }

    // Validate items
    items.forEach((item, index) => {
      if (!item.name.trim()) {
        newErrors[`item_${index}_name`] = 'Il nome del prodotto è obbligatorio';
      }
      if (item.price <= 0) {
        newErrors[`item_${index}_price`] = 'Il prezzo deve essere maggiore di zero';
      }
      if (item.quantity_available <= 0) {
        newErrors[`item_${index}_quantity`] = 'La quantità deve essere maggiore di zero';
      }
    });

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      const giftListData = {
        ...formData,
        target_amount: parseFloat(formData.target_amount),
        cover_image: coverImage,
        items: items.length > 0 ? items : undefined,
      };

      const newGiftList = await giftListsAPI.create(giftListData);
      toast.success('Lista regalo creata con successo!');
      router.push(`/dashboard/gift-lists/${newGiftList.id}`);
    } catch (error: any) {
      console.error('Error creating gift list:', error);
      toast.error('Errore durante la creazione della lista regalo');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'jeweler') {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-secondary-900 mb-4">
            Accesso Negato
          </h1>
          <p className="text-secondary-600">
            Solo i gioiellieri possono creare liste regalo.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center">
          <Link href="/dashboard/gift-lists">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Torna alle Liste
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">
              Crea Nuova Lista Regalo
            </h1>
            <p className="mt-1 text-sm text-secondary-600">
              Compila i dettagli per creare una nuova lista regalo per i tuoi clienti
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-secondary-900 mb-6">
            Informazioni di Base
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label="Titolo Lista Regalo"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                error={errors.title}
                placeholder="Es: Lista Matrimonio Mario e Giulia"
                required
              />
            </div>

            {/* List Type Selection */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-secondary-700 mb-4">
                Tipo di Lista Regalo
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  className={`relative rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                    formData.list_type === 'money_collection' 
                      ? 'border-gold-500 bg-gold-50' 
                      : 'border-secondary-200 hover:border-secondary-300'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, list_type: 'money_collection' }))}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="list_type"
                      value="money_collection"
                      checked={formData.list_type === 'money_collection'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-gold-600 focus:ring-gold-500 border-secondary-300"
                    />
                    <div className="ml-3">
                      <label className="text-sm font-medium text-secondary-900 cursor-pointer">
                        Raccolta Soldi
                      </label>
                      <p className="text-xs text-secondary-600">
                        I contributori inviano un importo fisso per raggiungere un obiettivo comune
                      </p>
                    </div>
                  </div>
                </div>

                <div 
                  className={`relative rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                    formData.list_type === 'product_list' 
                      ? 'border-gold-500 bg-gold-50' 
                      : 'border-secondary-200 hover:border-secondary-300'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, list_type: 'product_list' }))}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="list_type"
                      value="product_list"
                      checked={formData.list_type === 'product_list'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-gold-600 focus:ring-gold-500 border-secondary-300"
                    />
                    <div className="ml-3">
                      <label className="text-sm font-medium text-secondary-900 cursor-pointer">
                        Lista Prodotti
                      </label>
                      <p className="text-xs text-secondary-600">
                        I contributori scelgono e pagano prodotti specifici dalla lista
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Descrizione
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full rounded-md border border-secondary-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Descrizione della lista regalo..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            <Input
              label="Obiettivo di Raccolta"
              name="target_amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.target_amount}
              onChange={handleInputChange}
              error={errors.target_amount}
              placeholder="0.00"
              required
            />

            {/* Money Collection Specific Fields */}
            {formData.list_type === 'money_collection' && (
              <>
                <Input
                  label="Importo Fisso per Contributore"
                  name="fixed_contribution_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.fixed_contribution_amount}
                  onChange={handleInputChange}
                  error={errors.fixed_contribution_amount}
                  placeholder="10.00"
                  helpText="Importo che ogni contributore dovrà pagare (opzionale)"
                />

                <Input
                  label="Numero Massimo Contributori"
                  name="max_contributors"
                  type="number"
                  min="1"
                  value={formData.max_contributors}
                  onChange={handleInputChange}
                  error={errors.max_contributors}
                  placeholder="10"
                  helpText="Limite massimo di persone che possono contribuire (opzionale)"
                />
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Stato
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="h-10 w-full rounded-md border border-secondary-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="draft">Bozza</option>
                <option value="active">Attiva</option>
              </select>
            </div>

            <Input
              label="Data Inizio (opzionale)"
              name="start_date"
              type="datetime-local"
              value={formData.start_date}
              onChange={handleInputChange}
              error={errors.start_date}
            />

            <Input
              label="Data Fine (opzionale)"
              name="end_date"
              type="datetime-local"
              value={formData.end_date}
              onChange={handleInputChange}
              error={errors.end_date}
            />
          </div>

          {/* Settings */}
          <div className="mt-6 space-y-4">
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
                name="allow_anonymous_contributions"
                checked={formData.allow_anonymous_contributions}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
              />
              <label className="ml-2 block text-sm text-secondary-900">
                Permetti contributi anonimi
              </label>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-secondary-900 mb-6">
            Immagine di Copertina
          </h2>
          
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-secondary-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-secondary-400" />
              <div className="flex text-sm text-secondary-600">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                  <span>Carica un file</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                </label>
                <p className="pl-1">o trascina qui</p>
              </div>
              <p className="text-xs text-secondary-500">
                PNG, JPG, GIF fino a 5MB
              </p>
              {coverImage && (
                <p className="text-sm text-green-600 mt-2">
                  File selezionato: {coverImage.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-secondary-900">
              Prodotti nella Lista (opzionale)
            </h2>
            <Button type="button" variant="outline" onClick={addItem}>
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Prodotto
            </Button>
          </div>

          {items.length === 0 ? (
            <p className="text-sm text-secondary-500 text-center py-8">
              Nessun prodotto aggiunto. Clicca "Aggiungi Prodotto" per iniziare.
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="border border-secondary-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-sm font-medium text-secondary-900">
                      Prodotto #{index + 1}
                    </h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Input
                      label="Nome Prodotto"
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      error={errors[`item_${index}_name`]}
                      placeholder="Nome del prodotto"
                      required
                    />

                    <Input
                      label="Prezzo (€)"
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.price}
                      onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                      error={errors[`item_${index}_price`]}
                      placeholder="0.00"
                      required
                    />

                    <Input
                      label="Quantità"
                      type="number"
                      min="1"
                      value={item.quantity_available}
                      onChange={(e) => updateItem(index, 'quantity_available', parseInt(e.target.value) || 1)}
                      error={errors[`item_${index}_quantity`]}
                      placeholder="1"
                      required
                    />

                    <div className="md:col-span-2 lg:col-span-1">
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Descrizione
                      </label>
                      <textarea
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        rows={2}
                        className="w-full rounded-md border border-secondary-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Descrizione prodotto..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Link href="/dashboard/gift-lists">
            <Button type="button" variant="outline">
              Annulla
            </Button>
          </Link>
          <Button type="submit" loading={loading}>
            Crea Lista Regalo
          </Button>
        </div>
      </form>
    </DashboardLayout>
  );
}
