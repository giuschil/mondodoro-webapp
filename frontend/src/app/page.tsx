import Link from 'next/link';
import {
  Gift, Users, CreditCard, Shield, Sparkles,
  ArrowRight, CheckCircle, Star, TrendingUp, Lock, Zap,
  ChevronRight
} from 'lucide-react';
import Button from '@/components/ui/Button';

const STATS = [
  { value: '500+', label: 'Gioiellerie attive' },
  { value: '€2M+', label: 'Raccolti in totale' },
  { value: '12k+', label: 'Liste create' },
  { value: '98%', label: 'Clienti soddisfatti' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: Gift,
    title: 'Crea la tua lista',
    desc: 'Il gioielliere configura una lista regalo o una raccolta fondi in pochi minuti, con importo obiettivo e prodotti.',
  },
  {
    step: '02',
    icon: Users,
    title: 'Condividi il link',
    desc: 'Un link univoco e sicuro viene condiviso con amici e familiari via WhatsApp, email o social.',
  },
  {
    step: '03',
    icon: CreditCard,
    title: 'Pagamenti automatici',
    desc: 'I contributori pagano online con carta. I fondi arrivano direttamente sul conto del gioielliere via Stripe.',
  },
];

const FEATURES = [
  {
    icon: Zap,
    title: 'Setup in 2 minuti',
    desc: 'Registrazione veloce, nessuna configurazione tecnica richiesta.',
  },
  {
    icon: Shield,
    title: 'Pagamenti sicuri SSL',
    desc: 'Tutti i pagamenti transitano su Stripe, il circuito più sicuro al mondo.',
  },
  {
    icon: TrendingUp,
    title: 'Dashboard in tempo reale',
    desc: 'Monitora contributi, importi raccolti e progressi da qualsiasi dispositivo.',
  },
  {
    icon: Lock,
    title: 'Commissioni trasparenti',
    desc: 'Nessun costo fisso. Paghi solo una piccola percentuale sulle transazioni reali.',
  },
  {
    icon: Users,
    title: 'Link anonimi',
    desc: 'I contributori possono donare in modo anonimo se preferiscono.',
  },
  {
    icon: Gift,
    title: 'Liste & Collette',
    desc: 'Supporta sia liste prodotti che raccolta fondi con importo fisso per contribuente.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Sparkles className="h-7 w-7 text-amber-500" />
              <span className="text-xl font-bold text-gray-900 tracking-tight">ListDreams</span>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
              <a href="#come-funziona" className="hover:text-gray-900 transition-colors">Come funziona</a>
              <a href="#funzionalita" className="hover:text-gray-900 transition-colors">Funzionalità</a>
              <a href="#prezzi" className="hover:text-gray-900 transition-colors">Prezzi</a>
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

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50 via-white to-white pt-20 pb-28 px-4 sm:px-6 lg:px-8">
        {/* Background decoration */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-amber-100/60 blur-3xl" />
          <div className="absolute top-60 -left-40 h-[400px] w-[400px] rounded-full bg-yellow-100/40 blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-800 mb-6">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            La piattaforma #1 per gioiellerie italiane
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
            Liste regalo digitali
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-600">
              per gioiellerie
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Crea liste regalo e collette online in pochi minuti.
            I tuoi clienti condividono il link, gli invitati pagano con carta —
            i fondi arrivano direttamente a te.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register?role=jeweler">
              <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-amber-200">
                <Gift className="mr-2 h-5 w-5" />
                Sono un Gioielliere
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/lists">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Visualizza una lista demo
              </Button>
            </Link>
          </div>

          {/* Trust badges */}
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

      {/* ── Stats ── */}
      <section className="border-y border-gray-100 bg-gray-50/60 py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-4xl font-extrabold text-gray-900">{s.value}</p>
                <p className="mt-1 text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Come funziona ── */}
      <section id="come-funziona" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-amber-600 uppercase tracking-widest mb-2">Come funziona</p>
            <h2 className="text-4xl font-bold text-gray-900">Semplice come 1, 2, 3</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
              Nessuna configurazione tecnica. Nessuna integrazione complicata.
            </p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Connector line (desktop only) */}
            <div aria-hidden className="hidden md:block absolute top-10 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent" />

            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="relative flex flex-col items-center text-center p-6">
                <div className="relative mb-6">
                  <div className="h-20 w-20 rounded-2xl bg-amber-50 flex items-center justify-center shadow-sm border border-amber-100">
                    <item.icon className="h-9 w-9 text-amber-600" />
                  </div>
                  <span className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center shadow">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features grid ── */}
      <section id="funzionalita" className="py-24 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-amber-600 uppercase tracking-widest mb-2">Funzionalità</p>
            <h2 className="text-4xl font-bold text-gray-900">Tutto ciò di cui hai bisogno</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm
                  hover:shadow-md hover:border-amber-100 transition-all duration-200"
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

      {/* ── Pricing teaser ── */}
      <section id="prezzi" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-br from-amber-500 to-yellow-400 p-px shadow-xl shadow-amber-200">
            <div className="rounded-3xl bg-white p-10 text-center">
              <p className="text-sm font-semibold text-amber-600 uppercase tracking-widest mb-2">Prezzi</p>
              <h2 className="text-4xl font-bold text-gray-900 mb-3">Paghi solo sulle transazioni</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Nessun abbonamento, nessun costo fisso mensile.
                Una piccola commissione solo quando i tuoi clienti contribuiscono.
              </p>

              <div className="flex items-baseline justify-center gap-1 mb-4">
                <span className="text-6xl font-extrabold text-gray-900">2.5%</span>
                <span className="text-xl text-gray-500">+ €0.30</span>
              </div>
              <p className="text-sm text-gray-400 mb-10">per ogni transazione completata</p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/register?role=jeweler">
                  <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-amber-200">
                    Inizia gratis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Contattaci per un piano enterprise
                  </Button>
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-5 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Stripe Connect certificato
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Bonifico diretto al tuo conto
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Annulla in qualsiasi momento
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-gray-900 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <Sparkles className="h-10 w-10 text-amber-400 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-white mb-4">
            Pronto a digitalizare le tue liste regalo?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Unisciti a centinaia di gioiellerie italiane che usano ListDreams ogni giorno.
          </p>
          <Link href="/register?role=jeweler">
            <Button size="lg" className="shadow-lg shadow-amber-800/30">
              Crea il tuo account gratuito
              <ChevronRight className="ml-1.5 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-950 text-gray-400 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10 border-b border-gray-800">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-6 w-6 text-amber-400" />
                <span className="text-lg font-bold text-white">ListDreams</span>
              </div>
              <p className="text-sm leading-relaxed">
                La piattaforma per liste regalo e collette digitali dedicata alle gioiellerie italiane.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Prodotto</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="#come-funziona" className="hover:text-white transition-colors">Come funziona</Link></li>
                <li><Link href="#funzionalita" className="hover:text-white transition-colors">Funzionalità</Link></li>
                <li><Link href="#prezzi" className="hover:text-white transition-colors">Prezzi</Link></li>
                <li><Link href="/lists" className="hover:text-white transition-colors">Galleria liste</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Supporto</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/contact" className="hover:text-white transition-colors">Contattaci</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="/help" className="hover:text-white transition-colors">Centro aiuto</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Legale</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Termini di servizio</Link></li>
                <li><Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
            <p>&copy; {new Date().getFullYear()} ListDreams. Tutti i diritti riservati.</p>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span>Pagamenti sicuri con</span>
              <span className="font-semibold text-white">Stripe</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
