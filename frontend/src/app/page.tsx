import Link from 'next/link';
import { Heart, Gift, Users, CreditCard, Shield, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gold-50 to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Sparkles className="h-8 w-8 text-gold-600" />
              <span className="ml-2 text-2xl font-bold text-secondary-900">Mondodoro</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Accedi</Button>
              </Link>
              <Link href="/register">
                <Button>Registrati</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-secondary-900 mb-6">
            Liste Regalo per
            <span className="text-gold-600 block">Gioiellerie</span>
          </h1>
          <p className="text-xl text-secondary-600 mb-8 max-w-2xl mx-auto">
            Crea liste regalo e collette online per la tua gioielleria. 
            I tuoi clienti potranno contribuire facilmente con carta di credito.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register?role=jeweler">
              <Button size="lg" className="w-full sm:w-auto">
                <Gift className="mr-2 h-5 w-5" />
                Sono un Gioielliere
              </Button>
            </Link>
            <Link href="/lists">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <Heart className="mr-2 h-5 w-5" />
                Contribuisci a una Lista
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">
              Come Funziona
            </h2>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              Una piattaforma semplice e sicura per gestire liste regalo e collette online
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-gold-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                  <Gift className="h-8 w-8 text-gold-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                Crea Liste Regalo
              </h3>
              <p className="text-secondary-600">
                Il gioielliere crea facilmente liste regalo personalizzate con prodotti e obiettivi di raccolta.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-gold-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-gold-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                Condividi il Link
              </h3>
              <p className="text-secondary-600">
                Ottieni un link univoco da condividere con amici e familiari per raccogliere contributi.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-gold-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-gold-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                Pagamenti Sicuri
              </h3>
              <p className="text-secondary-600">
                Gli invitati contribuiscono in modo sicuro tramite Stripe. I fondi vanno direttamente al gioielliere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-secondary-900 mb-6">
                Perché Scegliere Mondodoro?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Shield className="h-6 w-6 text-gold-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-secondary-900">Sicurezza Garantita</h3>
                    <p className="text-secondary-600">Tutti i pagamenti sono processati in modo sicuro tramite Stripe.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Heart className="h-6 w-6 text-gold-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-secondary-900">Facile da Usare</h3>
                    <p className="text-secondary-600">Interfaccia intuitiva sia per gioiellieri che per contributori.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CreditCard className="h-6 w-6 text-gold-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-secondary-900">Commissioni Trasparenti</h3>
                    <p className="text-secondary-600">Fee chiare e competitive per ogni transazione.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Users className="h-6 w-6 text-gold-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-secondary-900">Dashboard Completa</h3>
                    <p className="text-secondary-600">Monitora i contributi e gestisci le tue liste in tempo reale.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold text-secondary-900 mb-4">
                Inizia Oggi
              </h3>
              <p className="text-secondary-600 mb-6">
                Registrati come gioielliere e inizia a creare le tue prime liste regalo.
              </p>
              <Link href="/register?role=jeweler">
                <Button size="lg" className="w-full">
                  Registrati Gratuitamente
                </Button>
              </Link>
              <p className="text-sm text-secondary-500 text-center mt-4">
                Nessun costo di setup. Paghi solo sulle transazioni effettuate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Sparkles className="h-6 w-6 text-gold-400" />
                <span className="ml-2 text-xl font-bold">Mondodoro</span>
              </div>
              <p className="text-secondary-300">
                La piattaforma per liste regalo dedicate alle gioiellerie.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Prodotto</h4>
              <ul className="space-y-2 text-secondary-300">
                <li><Link href="/features" className="hover:text-white">Funzionalità</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Prezzi</Link></li>
                <li><Link href="/security" className="hover:text-white">Sicurezza</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Supporto</h4>
              <ul className="space-y-2 text-secondary-300">
                <li><Link href="/help" className="hover:text-white">Centro Aiuto</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contattaci</Link></li>
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legale</h4>
              <ul className="space-y-2 text-secondary-300">
                <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Termini</Link></li>
                <li><Link href="/cookies" className="hover:text-white">Cookie</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-secondary-700 mt-8 pt-8 text-center text-secondary-300">
            <p>&copy; 2024 Mondodoro. Tutti i diritti riservati.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
