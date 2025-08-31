'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Sparkles, Eye, EyeOff, User, Store } from 'lucide-react';

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') as 'jeweler' | 'guest' || 'guest';

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    role: initialRole,
    phone: '',
    business_name: '',
    business_address: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username) newErrors.username = 'Username richiesto';
    if (!formData.email) newErrors.email = 'Email richiesta';
    if (!formData.password) newErrors.password = 'Password richiesta';
    if (!formData.password_confirm) newErrors.password_confirm = 'Conferma password richiesta';
    if (!formData.first_name) newErrors.first_name = 'Nome richiesto';
    if (!formData.last_name) newErrors.last_name = 'Cognome richiesto';

    if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = 'Le password non coincidono';
    }

    if (formData.role === 'jeweler') {
      if (!formData.business_name) newErrors.business_name = 'Nome attività richiesto per i gioiellieri';
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

    const success = await register(formData);
    if (success) {
      router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center">
            <Sparkles className="h-12 w-12 text-primary-600" />
            <span className="ml-2 text-3xl font-bold text-secondary-900">Mondodoro</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-secondary-900">
            Crea il tuo account
          </h2>
          <p className="mt-2 text-sm text-secondary-600">
            Hai già un account?{' '}
            <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Accedi qui
            </Link>
          </p>
        </div>

        {/* Role Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Seleziona il tipo di account</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, role: 'jeweler' }))}
              className={`p-4 rounded-lg border-2 transition-colors ${
                formData.role === 'jeweler'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-secondary-200 hover:border-secondary-300'
              }`}
            >
              <Store className="h-8 w-8 mx-auto mb-2 text-primary-600" />
              <h4 className="font-medium text-secondary-900">Gioielliere</h4>
              <p className="text-sm text-secondary-600">Crea e gestisci liste regalo</p>
            </button>
            
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, role: 'guest' }))}
              className={`p-4 rounded-lg border-2 transition-colors ${
                formData.role === 'guest'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-secondary-200 hover:border-secondary-300'
              }`}
            >
              <User className="h-8 w-8 mx-auto mb-2 text-primary-600" />
              <h4 className="font-medium text-secondary-900">Invitato</h4>
              <p className="text-sm text-secondary-600">Contribuisci alle liste regalo</p>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            {/* Account Info */}
            <div>
              <h3 className="text-lg font-medium text-secondary-900 mb-4">Informazioni Account</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  error={errors.username}
                  placeholder="Il tuo username"
                  required
                />
                
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="La tua email"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="relative">
                  <Input
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    placeholder="Crea una password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-8 text-secondary-400 hover:text-secondary-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    label="Conferma Password"
                    name="password_confirm"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.password_confirm}
                    onChange={handleChange}
                    error={errors.password_confirm}
                    placeholder="Conferma la password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-8 text-secondary-400 hover:text-secondary-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div>
              <h3 className="text-lg font-medium text-secondary-900 mb-4">Informazioni Personali</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nome"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  error={errors.first_name}
                  placeholder="Il tuo nome"
                  required
                />
                
                <Input
                  label="Cognome"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  error={errors.last_name}
                  placeholder="Il tuo cognome"
                  required
                />
              </div>

              <div className="mt-4">
                <Input
                  label="Telefono"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  placeholder="Il tuo numero di telefono"
                />
              </div>
            </div>

            {/* Business Info (only for jewelers) */}
            {formData.role === 'jeweler' && (
              <div>
                <h3 className="text-lg font-medium text-secondary-900 mb-4">Informazioni Attività</h3>
                <div className="space-y-4">
                  <Input
                    label="Nome Attività"
                    name="business_name"
                    value={formData.business_name}
                    onChange={handleChange}
                    error={errors.business_name}
                    placeholder="Nome della tua gioielleria"
                    required
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Indirizzo Attività
                    </label>
                    <textarea
                      name="business_address"
                      value={formData.business_address}
                      onChange={handleChange}
                      rows={3}
                      className="w-full rounded-md border border-secondary-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Indirizzo completo della tua gioielleria"
                    />
                    {errors.business_address && (
                      <p className="mt-1 text-sm text-red-600">{errors.business_address}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                loading={loading}
                className="w-full"
                size="lg"
              >
                Crea Account
              </Button>
            </div>

            {/* Terms */}
            <p className="text-xs text-secondary-500 text-center">
              Registrandoti accetti i nostri{' '}
              <Link href="/terms" className="text-primary-600 hover:text-primary-500">
                Termini di Servizio
              </Link>{' '}
              e la{' '}
              <Link href="/privacy" className="text-primary-600 hover:text-primary-500">
                Privacy Policy
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
