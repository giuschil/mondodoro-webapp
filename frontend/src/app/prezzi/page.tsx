import Link from 'next/link';
import { Sparkles, ArrowRight, CheckCircle, Shield, Zap, Users, CreditCard, Lock } from 'lucide-react';
import Button from '@/components/ui/Button';

export const metadata = {
  title: 'Prezzi – ListDreams',
  description: 'Nessun abbonamento, nessun costo fisso. Paghi solo una piccola commissione sulle transazioni completate.',
};

const INCLUDED = [
  { icon: Zap, text: 'Creazione liste e collette illimitata' },
  { icon: Users, text: 'Nessun limite di contributori' },
  { icon: CreditCard, text: 'Pagamenti con carta, Apple Pay, Google Pay' },
  { icon: Shield, text: 'Stripe Connect certificato' },
  { icon: CheckCircle, text: 'Dashboard in tempo reale' },
  { icon: Lock, text: 'Link univoco e sicuro per ogni lista' },
];

const FAQ = [
  {
    q: 'Quando viene applicata la commissione?',
    a: 'Solo quando un contributore completa un pagamento. Se nessuno paga, non paghi nulla.',
  },
  {
    q: 'Come ricevo i fondi?',
    a: 'Tramite Stripe Connect: i fondi vengono accreditati direttamente sul tuo conto bancario entro 2-3 giorni lavorativi.',
  },
  {
    q: 'Ci sono costi di setup o mensili?',
    a: 'No. La registrazione è gratuita e non ci sono canoni fissi. Paghi solo sulle transazioni reali.',
  },
  {
    q: 'Cosa include la commissione di Stripe?',
    a: 'Stripe applica la sua tariffa standard (circa 1,4% + €0,25 per carte europee) separatamente. La commissione ListDreams del 2,5% + €0,30 è aggiuntiva.',
  },
];

export default function PrezziPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="h-7 w-7 text-amber-500" />
              <span className="text-xl font-bold text-gray-900 tracking-tight">ListDreams</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
              <Link href="/#come-funziona" className="hover:text-gray-900 transition-colors">Come funziona</Link>
              <Link href="/prezzi" className="text-amber-600 font-medium">Prezzi</Link>
              <Link href="/centro-aiuto" className="hover:text-gray-900 transition-colors">Aiuto</Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Accedi</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">
                  Inizia gratis
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50 via-white to-white pt-20 pb-16 px-4 sm:px-6 lg:px-8 text-center">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-amber-100/60 blur-3xl" />
          <div className="absolute top-40 -left-40 h-[300px] w-[300px] rounded-full bg-yellow-100/40 blur-3xl" />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <p className="text-sm font-semibold text-amber-600 uppercase tracking-widest mb-4">Prezzi</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Paghi solo sulle transazioni
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Nessun abbonamento, nessun costo fisso mensile.
            Una piccola commissione solo quando i tuoi clienti contribuiscono.
          </p>
        </div>
      </section>

      {/* Pricing card */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="rounded-3xl bg-gradient-to-br from-amber-500 to-yellow-400 p-px shadow-xl shadow-amber-200">
          <div className="rounded-3xl bg-white p-10 text-center">
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="text-7xl font-extrabold text-gray-900">2.5%</span>
              <span className="text-2xl text-gray-500">+ €0.30</span>
            </div>
            <p className="text-gray-400 mb-10">per ogni transazione completata</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-lg mx-auto mb-10">
              {INCLUDED.map((item) => (
                <div key={item.text} className="flex items-center gap-2.5 text-sm text-gray-600">
                  <item.icon className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  {item.text}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register?role=jeweler">
                <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-amber-200">
                  Inizia gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contattaci">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Contattaci per un piano enterprise
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stripe note */}
        <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-green-500" />
          Pagamenti gestiti da Stripe — si aggiunge la tariffa standard Stripe (~1,4% + €0,25 per carte UE)
        </p>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Domande sui prezzi</h2>
        <div className="space-y-4">
          {FAQ.map((item) => (
            <div key={item.q} className="rounded-2xl border border-gray-200 p-6">
              <p className="font-semibold text-gray-900 mb-2">{item.q}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <p className="text-gray-500 text-sm mb-3">Hai altre domande sui prezzi?</p>
          <Link href="/contattaci">
            <Button variant="outline">Contattaci</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <span className="font-semibold text-gray-700">ListDreams</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6">
            <Link href="/contattaci" className="hover:text-gray-900 transition-colors">Contattaci</Link>
            <Link href="/faq" className="hover:text-gray-900 transition-colors">FAQ</Link>
            <Link href="/centro-aiuto" className="hover:text-gray-900 transition-colors">Centro Aiuto</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
