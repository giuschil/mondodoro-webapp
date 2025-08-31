'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Sparkles, Share2, Heart } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const contributionId = searchParams.get('contribution_id');
  
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Hide confetti after 3 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleShare = async () => {
    const shareText = "Ho appena contribuito a una lista regalo su Mondodoro! 🎁";
    const shareUrl = window.location.origin;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mondodoro - Lista Regalo',
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        toast.success('Messaggio copiato negli appunti!');
      } catch (error) {
        toast.error('Errore nel copiare il messaggio');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-primary-50 relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="confetti-container">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][Math.floor(Math.random() * 5)],
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <Sparkles className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-2xl font-bold text-secondary-900">Mondodoro</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto py-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-8">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>

          {/* Success Message */}
          <h1 className="text-4xl font-bold text-secondary-900 mb-4">
            Pagamento Completato! 🎉
          </h1>
          <p className="text-xl text-secondary-600 mb-8">
            Grazie per il tuo contributo! Il tuo gesto renderà felici i destinatari della lista regalo.
          </p>

          {/* Success Details */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center justify-center mb-6">
              <Heart className="h-8 w-8 text-red-500 mr-3" />
              <h2 className="text-2xl font-semibold text-secondary-900">
                Il Tuo Contributo è Stato Ricevuto
              </h2>
            </div>
            
            <div className="space-y-4 text-left max-w-md mx-auto">
              <div className="flex justify-between items-center py-2 border-b border-secondary-100">
                <span className="text-secondary-600">Stato Pagamento:</span>
                <span className="font-semibold text-green-600 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Completato
                </span>
              </div>
              {contributionId && (
                <div className="flex justify-between items-center py-2 border-b border-secondary-100">
                  <span className="text-secondary-600">ID Contributo:</span>
                  <span className="font-mono text-sm text-secondary-900">
                    {contributionId.slice(0, 8)}...
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center py-2">
                <span className="text-secondary-600">Data:</span>
                <span className="font-semibold text-secondary-900">
                  {new Date().toLocaleDateString('it-IT', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              Cosa Succede Ora?
            </h3>
            <div className="text-blue-800 space-y-2">
              <p>✅ Il gioielliere è stato notificato del tuo contributo</p>
              <p>✅ Riceverai una conferma via email</p>
              <p>✅ Il tuo contributo è visibile nella lista regalo</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleShare} className="flex-1 max-w-xs">
              <Share2 className="mr-2 h-4 w-4" />
              Condividi la Gioia
            </Button>
            <Link href="/" className="flex-1 max-w-xs">
              <Button variant="outline" className="w-full">
                Torna alla Home
              </Button>
            </Link>
          </div>

          {/* Thank You Message */}
          <div className="mt-12 p-6 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-lg">
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              Grazie per aver scelto Mondodoro! 💎
            </h3>
            <p className="text-secondary-700">
              Il tuo contributo aiuta a rendere speciali i momenti più importanti. 
              Insieme rendiamo ogni regalo indimenticabile.
            </p>
          </div>
        </div>
      </div>

      {/* Confetti CSS */}
      <style jsx>{`
        .confetti-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }
        
        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          animation: confetti-fall 3s linear infinite;
        }
        
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-secondary-600">Caricamento...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
