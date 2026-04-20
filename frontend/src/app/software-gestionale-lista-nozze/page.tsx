import Link from 'next/link';
import { Sparkles, ArrowRight, CheckCircle, Gift, Users, CreditCard, Shield, Zap, Star, TrendingUp, ChevronRight, BarChart3, Lock, Smartphone } from 'lucide-react';
import Button from '@/components/ui/Button';

export const metadata = {
  title: 'Software Gestionale Lista Nozze per Gioiellerie – ListDreams',
  description: 'Il software gestionale per liste nozze pensato per gioiellerie. Gestisci liste digitali, raccogli pagamenti online, monitora contributi in tempo reale. Nessuna installazione, funziona da browser.',
};

const FEATURES = [
  {
    icon: Gift,
    title: 'Gestione liste illimitata',
    desc: 'Crea e gestisci un numero illimitato di liste nozze e collette contemporaneamente. Ogni lista ha la sua dashboard dedicata.',
  },
  {
    icon: CreditCard,
    title: 'Pagamenti integrati',
    desc: 'Stripe Connect è già integrato. I contributori pagano online, i fondi arrivano sul tuo conto bancario automaticamente.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard analitica',
    desc: 'Monitora contributi ricevuti, importi raccolti, progressi verso l\'obiettivo e storico transazioni per ogni lista.',
  },
  {
    icon: Smartphone,
    title: 'Funziona su tutti i dispositivi',
    desc: 'Gestisci le tue liste da computer, tablet o smartphone. Nessuna app da installare — funziona direttamente dal browser.',
  },
  {
    icon: Lock,
    title: 'Link sicuri e personalizzati',
    desc: 'Ogni lista genera un link univoco e sicuro. Il cliente lo condivide, gli invitati pagano — tu monitora tutto in tempo reale.',
  },
  {
    icon: Users,
    title: 'Nessun limite di utenti',
    desc: 'Un numero illimitato di contributori può accedere a ogni lista. Nessun costo aggiuntivo per il numero di invitati.',
  },
  {
    icon: Zap,
    title: 'Setup immediato',
    desc: 'Registrazione in 2 minuti, nessuna configurazione tecnica. Puoi creare la tua prima lista subito dopo la registrazione.',
  },
  {
    icon: TrendingUp,
    title: 'Crescita del venduto',
    desc: 'Le liste digitali aumentano il valore medio degli ordini. Gli invitati contribuiscono più facilmente quando possono pagare online.',
  },
  {
    icon: Shield,
    title: 'Conforme GDPR',
    desc: 'Tutti i dati degli utenti sono gestiti in conformità con il GDPR. I pagamenti sono certificati PCI-DSS tramite Stripe.',
  },
];

const COMPARISON = [
  { feature: 'Liste nozze digitali', listdreams: true, traditional: false },
  { feature: 'Pagamenti online integrati', listdreams: true, traditional: false },
  { feature: 'Link condivisibili', listdreams: true, traditional: false },
  { feature: 'Dashboard in tempo reale', listdreams: true, traditional: false },
  { feature: 'Nessuna installazione', listdreams: true, traditional: false },
  { feature: 'Costo fisso mensile', listdreams: false, traditional: true },
  { feature: 'Formazione tecnica richiesta', listdreams: false, traditional: true },
];

const FAQ = [
  {
    q: 'È un software da installare o funziona online?',
    a: 'ListDreams è un\'applicazione web. Funziona direttamente dal browser, senza installazioni. Accessibile da qualsiasi dispositivo.',
  },
  {
    q: 'Come vengono gestiti i pagamenti?',
    a: 'Tramite Stripe Connect. I contributori pagano con carta, Apple Pay o Google Pay. I fondi vengono accreditati sul tuo conto bancario entro 2-3 giorni lavorativi.',
  },
  {
    q: 'Posso importare i prodotti del mio catalogo?',
    a: 'Puoi aggiungere prodotti manualmente con foto, descrizione e prezzo. L\'integrazione con cataloghi esterni è in roadmap.',
  },
  {
    q: 'C\'è un contratto di abbonamento?',
    a: 'No. ListDreams funziona con un modello pay-per-use: paghi solo una commissione del 2,5% + €0,30 sulle transazioni completate. Puoi smettere di usarlo quando vuoi.',
  },
  {
    q: 'Supportate gioiellerie con più punti vendita?',
    a: 'Sì. Puoi gestire liste per tutti i tuoi punti vendita da un unico account. Contattaci per un piano enterprise personalizzato.',
  },
];

export default function SoftwareGestionalePage() {
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
              <Link href="/prezzi" className="hover:text-gray-900 transition-colors">Prezzi</Link>
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
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50 via-white to-white pt-20 pb-20 px-4 sm:px-6 lg:px-8">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-amber-100/60 blur-3xl" />
          <div className="absolute top-40 -left-40 h-[300px] w-[300px] rounded-full bg-yellow-100/40 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-800 mb-6">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            Software gestionale per gioiellerie
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
            Il gestionale per liste nozze
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-600">
              che funziona davvero per le gioiellerie
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            ListDreams è il software pensato per le gioiellerie italiane che vogliono gestire
            liste nozze e collette in modo digitale, senza complicazioni tecniche.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register?role=jeweler">
              <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-amber-200">
                Prova gratis per 30 giorni
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contattaci">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Parla con un consulente
              </Button>
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Nessuna installazione
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Nessun costo fisso
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Attivo in 2 minuti
            </span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-amber-600 uppercase tracking-widest mb-2">Funzionalità</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Tutto quello che serve. Niente di superfluo.</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
              Progettato per gioiellieri, non per informatici.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-amber-100 transition-all duration-200"
              >
                <div className="h-11 w-11 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-amber-600 uppercase tracking-widest mb-2">Confronto</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">ListDreams vs gestione tradizionale</h2>
          </div>
          <div className="rounded-2xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-3 bg-gray-50 px-6 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200">
              <span>Funzionalità</span>
              <span className="text-center text-amber-600">ListDreams</span>
              <span className="text-center text-gray-400">Tradizionale</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-3 px-6 py-4 text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
              >
                <span className="text-gray-700">{row.feature}</span>
                <span className="text-center">
                  {row.listdreams
                    ? <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    : <span className="text-gray-300 text-lg leading-none mx-auto block text-center">✗</span>}
                </span>
                <span className="text-center">
                  {row.traditional
                    ? <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    : <span className="text-gray-300 text-lg leading-none mx-auto block text-center">✗</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Domande frequenti</h2>
        <div className="space-y-4">
          {FAQ.map((item) => (
            <div key={item.q} className="rounded-2xl border border-gray-200 p-6">
              <p className="font-semibold text-gray-900 mb-2">{item.q}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-900 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <Sparkles className="h-10 w-10 text-amber-400 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Modernizza la gestione delle tue liste nozze
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
            Oltre 500 gioiellerie italiane usano già ListDreams.
            Inizia gratis — senza carta di credito, senza contratti.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register?role=jeweler">
              <Button size="lg" className="shadow-lg shadow-amber-800/30">
                Crea il tuo account gratuito
                <ChevronRight className="ml-1.5 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/lista-nozze-gioielleria">
              <Button variant="outline" size="lg" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                Scopri le liste nozze →
              </Button>
            </Link>
          </div>
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
            <Link href="/lista-nozze-gioielleria" className="hover:text-gray-900 transition-colors">Liste nozze</Link>
            <Link href="/colletta-online-gioielleria" className="hover:text-gray-900 transition-colors">Collette online</Link>
            <Link href="/prezzi" className="hover:text-gray-900 transition-colors">Prezzi</Link>
            <Link href="/contattaci" className="hover:text-gray-900 transition-colors">Contattaci</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
