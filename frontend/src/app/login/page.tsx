'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Sparkles, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validation
    const newErrors: { identifier?: string; password?: string } = {};
    if (!identifier) newErrors.identifier = 'Email o username richiesto';
    if (!password) newErrors.password = 'Password richiesta';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    // Pass identifier as email (backend accepts both)
    const success = await login({ email: identifier, password });
    if (success) {
      router.push('/dashboard');
    }
    setLoading(false);
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
            Accedi al tuo account
          </h2>
          <p className="mt-2 text-sm text-secondary-600">
            Non hai un account?{' '}
            <Link href="/register" className="font-medium text-primary-600 hover:text-primary-500">
              Registrati qui
            </Link>
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} autoComplete="on">
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <Input
              label="Email o Username"
              type="text"
              name="identifier"
              id="identifier"
              autoComplete="username email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              error={errors.identifier}
              placeholder="Inserisci email o username"
              required
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                placeholder="Inserisci la tua password"
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

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-secondary-900">
                  Ricordami
                </label>
              </div>

              <div className="text-sm">
                <Link href="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                  Password dimenticata?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              Accedi
            </Button>
          </div>
        </form>

        {/* Demo accounts */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Account Demo:</h3>
          <div className="text-xs text-blue-700 space-y-1">
            <p><strong>Gioielliere:</strong> jeweler@demo.com / password123</p>
            <p><strong>Invitato:</strong> guest@demo.com / password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
