'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft, CheckCircle } from 'lucide-react';
import { authAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Inserisci la tua email');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch {
      setError('Si è verificato un errore. Riprova più tardi.');
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
            Password dimenticata?
          </h2>
          <p className="mt-2 text-sm text-secondary-600">
            Inserisci la tua email e ti invieremo le istruzioni per reimpostare la password.
          </p>
        </div>

        {sent ? (
          /* Success state */
          <div className="bg-white rounded-2xl shadow-md p-8 text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Email inviata!</h3>
            <p className="text-sm text-gray-600">
              Se esiste un account con l&apos;indirizzo <strong>{email}</strong>, riceverai
              un&apos;email con le istruzioni per reimpostare la password.
            </p>
            <p className="text-xs text-gray-500">
              Controlla anche la cartella spam se non trovi l&apos;email.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              <ArrowLeft className="h-4 w-4" />
              Torna al login
            </Link>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
              <Input
                label="Email"
                type="email"
                name="email"
                id="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error}
                placeholder="La tua email"
                required
              />

              <Button type="submit" loading={loading} className="w-full" size="lg">
                Invia istruzioni
              </Button>
            </div>

            <div className="mt-4 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-secondary-600 hover:text-secondary-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Torna al login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
