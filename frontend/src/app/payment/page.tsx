'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import StripeProvider from '@/components/payments/StripeProvider';
import CheckoutForm from '@/components/payments/CheckoutForm';
import { paymentsAPI } from '@/lib/api';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const clientSecret = searchParams.get('client_secret');
  const contributionId = searchParams.get('contribution_id');
  const contributorName = searchParams.get('contributor_name');
  const amount = searchParams.get('amount');
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!clientSecret || !contributionId || !contributorName || !amount) {
      toast.error('Parametri di pagamento mancanti');
      router.push('/');
    }
  }, [clientSecret, contributionId, contributorName, amount, router]);

  const handlePaymentSuccess = async () => {
    setLoading(true);
    try {
      // Get payment intent ID from client secret
      const paymentIntentId = clientSecret?.split('_secret_')[0];
      
      if (paymentIntentId) {
        await paymentsAPI.confirmPayment({
          payment_intent_id: paymentIntentId,
        });
      }
      
      // Redirect to success page
      router.push(`/payment/success?contribution_id=${contributionId}`);
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('Errore nella conferma del pagamento');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentError = (error: string) => {
    toast.error(error);
  };

  if (!clientSecret || !contributionId || !contributorName || !amount) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-secondary-900 mb-4">
            Errore nei Parametri di Pagamento
          </h1>
          <p className="text-secondary-600 mb-6">
            I parametri necessari per il pagamento sono mancanti.
          </p>
          <Link href="/">
            <Button>Torna alla Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <Sparkles className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-2xl font-bold text-secondary-900">Mondodoro</span>
            </Link>
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Indietro
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Completa il Tuo Contributo
          </h1>
          <p className="text-lg text-secondary-600">
            Stai per contribuire alla lista regalo con {amount}€
          </p>
        </div>

        <StripeProvider clientSecret={clientSecret}>
          <CheckoutForm
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            amount={parseFloat(amount)}
            contributorName={decodeURIComponent(contributorName)}
          />
        </StripeProvider>

        <div className="mt-8 text-center">
          <p className="text-sm text-secondary-500">
            Hai problemi con il pagamento?{' '}
            <Link href="/support" className="text-primary-600 hover:text-primary-500">
              Contatta il supporto
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-secondary-600">Caricamento pagamento...</p>
        </div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
