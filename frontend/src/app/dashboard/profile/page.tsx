'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { authAPI, paymentsAPI } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { User, Save, Edit3, Key, Building2, CreditCard, CheckCircle, XCircle, RefreshCw, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeStatus, setStripeStatus] = useState<{
    onboarding_completed: boolean;
    charges_enabled: boolean;
    payouts_enabled: boolean;
    account_id: string | null;
    account_status: string;
    country?: string;
    currency?: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    business_name: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    country: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        business_name: user.business_name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        postal_code: user.postal_code || '',
        country: user.country || '',
      });
    }
    
    // Load Stripe status
    if (user?.role === 'jeweler') {
      loadStripeStatus();
    }
    
    // Check if returning from Stripe onboarding
    const urlParams = new URLSearchParams(window.location.search);
    const stripeParam = urlParams.get('stripe');
    if (stripeParam === 'success') {
      // First, update Stripe account status from backend
      paymentsAPI.checkStripeOnboardingStatus()
        .then((result) => {
          if (result.success) {
            setStripeStatus(result);
            toast.success('Configurazione Stripe completata con successo!');
            // Then refresh user data
            return authAPI.me();
          } else {
            toast.error('Errore durante la verifica dello stato Stripe');
            return null;
          }
        })
        .then((updatedUser) => {
          if (updatedUser) {
            updateUser(updatedUser);
          }
        })
        .catch((error) => {
          console.error('Error checking Stripe status:', error);
          toast.error('Errore durante l\'aggiornamento dello stato Stripe');
        });
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [user, updateUser]);
  
  const loadStripeStatus = async () => {
    try {
      const result = await paymentsAPI.checkStripeOnboardingStatus();
      setStripeStatus(result);
    } catch (error) {
      console.error('Error loading Stripe status:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Il nome è obbligatorio';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Il cognome è obbligatorio';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email è obbligatoria';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'email non è valida';
    }

    if (user?.role === 'jeweler' && !formData.business_name.trim()) {
      newErrors.business_name = 'Il nome dell\'attività è obbligatorio per i gioiellieri';
    }

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
      const updatedUser = await authAPI.updateProfile(formData);
      updateUser(updatedUser);
      toast.success('Profilo aggiornato con successo!');
      setEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Errore durante l\'aggiornamento del profilo');
    } finally {
      setLoading(false);
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
            Questa pagina è riservata ai gioiellieri e agli amministratori.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">
              Profilo
            </h1>
            <p className="mt-1 text-sm text-secondary-600">
              Gestisci le tue informazioni personali e le impostazioni dell'attività
            </p>
          </div>
          <Button
            variant={editing ? "outline" : "default"}
            onClick={() => setEditing(!editing)}
          >
            {editing ? (
              <>
                <Edit3 className="h-4 w-4 mr-2" />
                Annulla
              </>
            ) : (
              <>
                <Edit3 className="h-4 w-4 mr-2" />
                Modifica
              </>
            )}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <User className="h-5 w-5 text-primary-600 mr-2" />
            <h2 className="text-lg font-medium text-secondary-900">
              Informazioni Personali
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nome"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              error={errors.first_name}
              disabled={!editing}
              required
            />

            <Input
              label="Cognome"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              error={errors.last_name}
              disabled={!editing}
              required
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              disabled={!editing}
              required
            />

            <Input
              label="Telefono"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={!editing}
            />
          </div>
        </div>

        {/* Business Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <Building2 className="h-5 w-5 text-primary-600 mr-2" />
            <h2 className="text-lg font-medium text-secondary-900">
              Informazioni Attività
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nome Attività"
              name="business_name"
              value={formData.business_name}
              onChange={handleInputChange}
              error={errors.business_name}
              disabled={!editing}
              required={user?.role === 'jeweler'}
            />

            <Input
              label="Indirizzo"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              disabled={!editing}
            />

            <Input
              label="Città"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              disabled={!editing}
            />

            <Input
              label="CAP"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleInputChange}
              disabled={!editing}
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Paese
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                disabled={!editing}
                className="h-10 w-full rounded-md border border-secondary-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
              >
                <option value="">Seleziona paese</option>
                <option value="IT">Italia</option>
                <option value="CH">Svizzera</option>
                <option value="FR">Francia</option>
                <option value="DE">Germania</option>
                <option value="ES">Spagna</option>
                <option value="US">Stati Uniti</option>
                <option value="GB">Regno Unito</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stripe Connect Configuration */}
        {user?.role === 'jeweler' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-6">
              <CreditCard className="h-5 w-5 text-primary-600 mr-2" />
              <h2 className="text-lg font-medium text-secondary-900">
                Configurazione Pagamenti Stripe
              </h2>
            </div>
            
            {(user.stripe_onboarding_completed || stripeStatus?.onboarding_completed) ? (
              <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-green-800">
                      Account Stripe Configurato
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>
                        Il tuo account Stripe è stato configurato con successo. 
                        I pagamenti per le tue liste regalo verranno accreditati direttamente sul tuo conto.
                      </p>
                    </div>
                    {stripeStatus && (
                      <div className="mt-4 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-green-600">Account ID:</span>
                          <span className="font-mono text-green-800">{stripeStatus.account_id?.substring(0, 20)}...</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-green-600">Stato:</span>
                          <span className={`font-medium ${
                            stripeStatus.charges_enabled && stripeStatus.payouts_enabled 
                              ? 'text-green-700' 
                              : 'text-yellow-600'
                          }`}>
                            {stripeStatus.charges_enabled && stripeStatus.payouts_enabled 
                              ? 'Attivo' 
                              : 'In attesa di verifica'}
                          </span>
                        </div>
                        {stripeStatus.country && (
                          <div className="flex items-center justify-between">
                            <span className="text-green-600">Paese:</span>
                            <span className="text-green-800">{stripeStatus.country}</span>
                          </div>
                        )}
                        {stripeStatus.currency && (
                          <div className="flex items-center justify-between">
                            <span className="text-green-600">Valuta:</span>
                            <span className="text-green-800">{stripeStatus.currency}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                <div className="flex items-start">
                  <Key className="h-5 w-5 text-yellow-400 mt-0.5" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Configurazione Pagamenti Richiesta
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Per ricevere i pagamenti delle liste regalo, devi completare la configurazione del tuo account Stripe.
                        Il processo richiede solo pochi minuti e ti permetterà di ricevere i pagamenti direttamente sul tuo conto.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-6 space-y-4">
              <p className="text-sm text-secondary-600">
                {(user.stripe_onboarding_completed || stripeStatus?.onboarding_completed)
                  ? 'Il tuo account Stripe è attivo e pronto a ricevere pagamenti.'
                  : 'Completa la configurazione per iniziare a ricevere pagamenti.'}
              </p>
              
              {/* Pulsanti Stripe */}
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                <button
                  onClick={async () => {
                    setStripeLoading(true);
                    try {
                      const { onboarding_url } = await paymentsAPI.createStripeOnboarding();
                      window.location.href = onboarding_url;
                    } catch (error: any) {
                      console.error('Error creating Stripe onboarding:', error);
                      toast.error(error.response?.data?.error || 'Errore durante la creazione del link di onboarding');
                      setStripeLoading(false);
                    }
                  }}
                  disabled={stripeLoading}
                  className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gold-600 hover:bg-gold-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {stripeLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Caricamento...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 mr-2" />
                      {(user.stripe_onboarding_completed || stripeStatus?.onboarding_completed) 
                        ? 'Rivedi Configurazione Stripe' 
                        : 'Configura Stripe - Inizia Ora'}
                    </>
                  )}
                </button>
                
                {(user.stripe_onboarding_completed || stripeStatus?.onboarding_completed) && (
                  <div className="flex gap-3">
                    <button
                      onClick={loadStripeStatus}
                      className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 transition-colors"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Aggiorna Stato
                    </button>
                    {stripeStatus?.account_id && (
                      <a
                        href={`https://dashboard.stripe.com/connect/accounts/${stripeStatus.account_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Dashboard Stripe
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        {editing && (
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditing(false)}
            >
              Annulla
            </Button>
            <Button type="submit" loading={loading}>
              <Save className="h-4 w-4 mr-2" />
              Salva Modifiche
            </Button>
          </div>
        )}
      </form>
    </DashboardLayout>
  );
}
