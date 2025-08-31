'use client';

import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import Button from '@/components/ui/Button';
import { CreditCard, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface CheckoutFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  amount: number;
  contributorName: string;
}

export default function CheckoutForm({ 
  onSuccess, 
  onError, 
  amount, 
  contributorName 
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
          payment_method_data: {
            billing_details: {
              name: contributorName,
            },
          },
        },
        redirect: 'if_required',
      });

      if (error) {
        console.error('Payment failed:', error);
        toast.error(error.message || 'Errore durante il pagamento');
        onError?.(error.message || 'Errore durante il pagamento');
      } else {
        toast.success('Pagamento completato con successo!');
        onSuccess?.();
      }
    } catch (err) {
      console.error('Payment error:', err);
      const errorMessage = 'Si è verificato un errore imprevisto';
      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <CreditCard className="h-6 w-6 text-primary-600 mr-2" />
          <h2 className="text-xl font-semibold text-secondary-900">
            Completa il Pagamento
          </h2>
        </div>

        <div className="mb-6 p-4 bg-secondary-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-secondary-600">Importo da pagare:</span>
            <span className="text-lg font-bold text-secondary-900">
              €{amount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-secondary-600">Contributore:</span>
            <span className="text-sm font-medium text-secondary-900">
              {contributorName}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border border-secondary-200 rounded-lg p-4">
            <PaymentElement 
              options={{
                layout: 'tabs',
              }}
            />
          </div>

          <Button
            type="submit"
            disabled={!stripe || loading}
            loading={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Elaborazione...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Paga €{amount.toFixed(2)}
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <div className="flex items-center justify-center space-x-4 text-xs text-secondary-500">
            <span>Pagamento sicuro con</span>
            <img 
              src="https://js.stripe.com/v3/fingerprinted/img/stripe_logo-4e5c05e785.svg" 
              alt="Stripe" 
              className="h-4"
            />
          </div>
          <p className="mt-2 text-xs text-secondary-400">
            I tuoi dati di pagamento sono protetti con crittografia SSL
          </p>
        </div>
      </div>
    </div>
  );
}
