import Link from 'next/link';
import { Sparkles, ArrowRight, CheckCircle, Gift, Users, CreditCard, Shield, Zap, Star, TrendingUp, ChevronRight } from 'lucide-react';
import Button from '@/components/ui/Button';

export const metadata = {
  title: 'Lista Nozze Gioielleria Digitale – ListDreams',
  description: 'Crea liste nozze digitali per la tua gioielleria. I clienti condividono un link, gli invitati pagano online — i fondi arrivano direttamente sul tuo conto. Gratis, senza abbonamento.',
};

const BENEFITS = [
  { icon: Zap, title: 'Attiva in 2 minuti', desc: 'Crei la lista nozze del cliente in pochi click. Nessun software da installare, nessun tecnico.' },
  { icon: CreditCard, title: 'Pagamenti online diretti', desc: 'Gli invitati pagano con carta, Apple Pay o Google Pay. I fondi atterrano sul tuo conto via Stripe.' },
  { icon: TrendingUp, title: 'Dashboard in tempo reale', desc: 'Sai sempre chi ha contribuito, quanto manca all\'obiettivo, quali prodotti sono già coperti.' },
  { icon: Shield, title: 'Zero costi fissi', desc: 'Nessun abbonamento mensile. Paghi solo una piccola commissione sulle transazioni completate.' },
  { icon: Users, title: 'Link univoco sicuro', desc: 'Ogni lista nozze ha il suo link dedicato, che il cliente condivide via WhatsApp o email.' },
  { icon: Gift, title: 'Lista prodotti reali', desc: 'Aggiungi i gioielli del tuo catalogo con foto, descrizione e prezzo. Gli invitati vedono cosa stanno regalando.' },
];

const STEPS = [
  {
    step: '01',
    title: 'Crei la lista nozze',
    desc: 'Inserisci i dati degli sposi, aggiungi i gioielli dal tuo catalogo, imposta l\'importo obiettivo. In meno di 5 minuti.',
  },
  {
    step: '02',
    title: 'Il cliente condivide',
    desc: 'Gli sposi ricevono un link univoco da condividere con familiari e amici via WhatsApp, email o social.',
  },
  {
    step: '03',
    title: 'I fondi arrivano a te',
    desc: 'Ogni contributo viene accreditato direttamente sul tuo conto bancario via Stripe. Nessun intermediario.',
  },
];

const FAQ = [
  {
    q: 'Posso gestire più liste nozze contemporaneamente?',
    a: 'Sì, non c\'è limite al numero di liste attive. Ogni lista ha il suo link e la sua dashboard indipendente.',
  },
  {
    q: 'Come vengono accreditati i fondi?',
    a: 'Tramite Stripe Connect: i pagamenti vengono accreditati direttamente sul tuo conto bancario entro 2-3 giorni lavorativi.',
  },
  {
    q: 'Gli invitati devono registrarsi?',
    a: 'No. Gli invitati aprono il link, scelgono quanto contribuire e pagano con carta in pochi secondi. Nessuna registrazione richiesta.',
  },
  {
    q: 'Cosa succede se la lista non raggiunge l\'obiettivo?',
    a: 'I fondi raccolti vengono comunque accreditati. Puoi decidere insieme agli sposi come gestire eventuali differenze.',
  },
];

export default function ListaNozzeGioielleriaPage() {
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
            Lista nozze digitale per gioiellerie
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
            La lista nozze digitale
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-600">
              che i tuoi clienti aspettavano
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Offri ai tuoi clienti una lista nozze moderna e sicura. Gli sposi condividono un link,
            gli invitati contribuiscono online — i fondi arrivano direttamente sul tuo conto.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register?role=jeweler">
              <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-amber-200">
                Crea la tua prima lista gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/prezzi">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Vedi i prezzi
              </Button>
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Nessun costo fisso
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Pagamenti Stripe certificati
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Attivo in 2 minuti
            </span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-amber-600 uppercase tracking-widest mb-2">Come funziona</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Semplice per te, perfetto per i tuoi clienti</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
              Nessuna configurazione tecnica. Nessuna integrazione complicata.
            </p>
          </div>
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10">
            <div aria-hidden className="hidden md:block absolute top-10 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent" />
            {STEPS.map((item) => (
              <div key={item.step} className="relative flex flex-col items-center text-center p-6">
                <div className="relative mb-6">
                  <div className="h-20 w-20 rounded-2xl bg-amber-50 flex items-center justify-center shadow-sm border border-amber-100">
                    <span className="text-3xl font-extrabold text-amber-500">{item.step}</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-amber-600 uppercase tracking-widest mb-2">Vantaggi</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Perché scegliere ListDreams per le tue liste nozze</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-amber-100 transition-all duration-200"
              >
                <div className="h-11 w-11 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
                  <b.icon className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">{b.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
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
            Inizia a offrire liste nozze digitali oggi
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Gratis. Senza carta di credito. Attivo in 2 minuti.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register?role=jeweler">
              <Button size="lg" className="shadow-lg shadow-amber-800/30">
                Crea il tuo account gratuito
                <ChevronRight className="ml-1.5 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/colletta-online-gioielleria">
              <Button variant="outline" size="lg" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                Scopri le collette online →
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
            <Link href="/colletta-online-gioielleria" className="hover:text-gray-900 transition-colors">Collette online</Link>
            <Link href="/software-gestionale-lista-nozze" className="hover:text-gray-900 transition-colors">Software gestionale</Link>
            <Link href="/prezzi" className="hover:text-gray-900 transition-colors">Prezzi</Link>
            <Link href="/contattaci" className="hover:text-gray-900 transition-colors">Contattaci</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
