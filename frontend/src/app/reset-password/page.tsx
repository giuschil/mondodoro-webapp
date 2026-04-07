'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { authAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const uid = searchParams.get('uid') ?? '';
  const token = searchParams.get('token') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string; general?: string }>({});

  useEffect(() => {
    if (!uid || !token) {
      setErrors({ general: 'Link non valido. Richiedi un nuovo link di reset.' });
    }
  }, [uid, token]);

  const validate = () => {
    const e: typeof errors = {};
    if (!newPassword) {
      e.newPassword = 'Inserisci la nuova password';
    } else if (newPassword.length < 8) {
      e.newPassword = 'La password deve essere di almeno 8 caratteri';
    }
    if (!confirmPassword) {
      e.confirmPassword = 'Conferma la nuova password';
    } else if (newPassword !== confirmPassword) {
      e.confirmPassword = 'Le password non coincidono';
    }
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await authAPI.resetPassword({
        uid,
        token,
        new_password: newPassword,
        new_password_confirm: confirmPassword,
      });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        'Link non valido o scaduto. Richiedi un nuovo reset.';
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">

        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center">
            <Sparkles className="h-12 w-12 text-primary-600" />
            <span className="ml-2 text-3xl font-bold text-secondary-900">ListDreams</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-secondary-900">
            Reimposta password
          </h2>
          <p className="mt-2 text-sm text-secondary-600">
            Scegli una nuova password per il tuo account.
          </p>
        </div>

        {success ? (
          /* Success state */
          <div className="bg-white rounded-2xl shadow-md p-8 text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Password aggiornata!</h3>
            <p className="text-sm text-gray-600">
              La tua password è stata reimpostata con successo.
              Verrai reindirizzato al login tra pochi secondi…
            </p>
            <Link
              href="/login"
              className="inline-block mt-2 text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              Vai al login
            </Link>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">

              {errors.general && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3">
                  <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{errors.general}</p>
                </div>
              )}

              <div className="relative">
                <Input
                  label="Nuova password"
                  type={showPassword ? 'text' : 'password'}
                  name="new_password"
                  id="new_password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  error={errors.newPassword}
                  placeholder="Almeno 8 caratteri"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-secondary-400 hover:text-secondary-600"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <Input
                label="Conferma password"
                type={showPassword ? 'text' : 'password'}
                name="confirm_password"
                id="confirm_password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
                placeholder="Ripeti la nuova password"
                required
              />

              <Button
                type="submit"
                loading={loading}
                disabled={!uid || !token}
                className="w-full"
                size="lg"
              >
                Reimposta password
              </Button>
            </div>

            <div className="mt-4 text-center">
              <Link
                href="/login"
                className="text-sm font-medium text-secondary-600 hover:text-secondary-900"
              >
                Torna al login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
