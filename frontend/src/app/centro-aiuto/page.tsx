import Link from 'next/link';
import {
  Sparkles, ArrowRight, BookOpen, CreditCard, Settings,
  Users, Gift, ShieldCheck, ChevronRight, LifeBuoy, Star
} from 'lucide-react';
import Button from '@/components/ui/Button';

export const metadata = {
  title: 'Centro Aiuto – ListDreams',
  description: 'Guide, tutorial e risorse per usare al meglio ListDreams.',
};

const CATEGORIES = [
  {
    icon: BookOpen,
    color: 'bg-blue-100 text-blue-600',
    title: 'Guida introduttiva',
    desc: 'Come registrarti, configurare il profilo e creare la tua prima lista.',
    articles: ['Come registrarsi', 'Completare il profilo gioielleria', 'Creare la prima lista regalo', 'Collegare Stripe al tuo account'],
    href: '#guida-introduttiva',
  },
  {
    icon: Gift,
    color: 'bg-amber-100 text-amber-600',
    title: 'Liste e Collette',
    desc: 'Tutto su come creare, gestire e condividere le tue liste.',
    articles: ['Creare una Lista Regalo', 'Creare una Colletta', 'Aggiungere prodotti alla lista', 'Condividere il link con i clienti'],
    href: '#liste-collette',
  },
  {
    icon: CreditCard,
    color: 'bg-green-100 text-green-600',
    title: 'Pagamenti & Stripe',
    desc: 'Come funzionano i pagamenti, le commissioni e i trasferimenti.',
    articles: ['Collegare Stripe Connect', 'Come vengono accreditati i fondi', 'Commissioni e tariffe', 'Gestire i rimborsi'],
    href: '#pagamenti-stripe',
  },
  {
    icon: Users,
    color: 'bg-purple-100 text-purple-600',
    title: 'Gestione clienti',
    desc: 'Come i tuoi clienti interagiscono con le liste e come supportarli.',
    articles: ['Come i clienti vedono la lista', 'Contributi anonimi', 'Notifiche ai contributori', 'Problemi durante il pagamento'],
    href: '#gestione-clienti',
  },
  {
    icon: Settings,
    color: 'bg-gray-100 text-gray-600',
    title: 'Account e impostazioni',
    desc: 'Profilo, password, notifiche e gestione dell\'account.',
    articles: ['Modificare le informazioni profilo', 'Cambiare la password', 'Gestire le notifiche email', 'Eliminare l\'account'],
    href: '#account-impostazioni',
  },
  {
    icon: ShieldCheck,
    color: 'bg-red-100 text-red-600',
    title: 'Sicurezza e privacy',
    desc: 'Come proteggiamo i tuoi dati e quelli dei tuoi clienti.',
    articles: ['Sicurezza dei pagamenti', 'Privacy e GDPR', 'Come gestiamo i dati', 'Segnalare un problema di sicurezza'],
    href: '#sicurezza-privacy',
  },
];

const POPULAR_ARTICLES = [
  { title: 'Come creare la prima lista regalo', time: '2 min', href: '#' },
  { title: 'Collegare Stripe al proprio account', time: '3 min', href: '#' },
  { title: 'Come condividere il link della lista', time: '1 min', href: '#' },
  { title: 'Capire le commissioni', time: '2 min', href: '#' },
  { title: 'Impostare la data di scadenza della lista', time: '1 min', href: '#' },
];

export default function CentroAiutoPage() {
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
              <Link href="/faq" className="hover:text-gray-900 transition-colors">FAQ</Link>
              <Link href="/centro-aiuto" className="text-amber-600 font-medium">Centro Aiuto</Link>
              <Link href="/contattaci" className="hover:text-gray-900 transition-colors">Contattaci</Link>
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
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50 via-white to-white pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-amber-100/60 blur-3xl" />
          <div className="absolute top-40 -left-40 h-[300px] w-[300px] rounded-full bg-yellow-100/40 blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-800 mb-6">
            <LifeBuoy className="h-4 w-4" />
            Centro Aiuto
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Come possiamo aiutarti?
          </h1>
          <p className="text-lg text-gray-600">
            Guide e tutorial per usare ListDreams al meglio, passo dopo passo.
          </p>
        </div>
      </section>

      {/* Articoli popolari */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-2 mb-5">
          <Star className="h-4 w-4 text-amber-500 fill-amber-400" />
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Articoli più letti</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {POPULAR_ARTICLES.map((article, i) => (
            <Link
              key={i}
              href={article.href}
              className="group flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 hover:border-amber-300 hover:shadow-md transition-all"
            >
              <p className="text-sm font-medium text-gray-800 group-hover:text-amber-700 transition-colors leading-snug">
                {article.title}
              </p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-400">{article.time} lettura</span>
                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-amber-500 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Categorie */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Esplora per categoria</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <div
                key={i}
                className="group rounded-2xl border border-gray-200 bg-white p-6 hover:border-amber-200 hover:shadow-lg transition-all"
              >
                <div className={`w-11 h-11 rounded-xl ${cat.color} flex items-center justify-center mb-4`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1 group-hover:text-amber-700 transition-colors">
                  {cat.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">{cat.desc}</p>
                <ul className="space-y-2 mb-5">
                  {cat.articles.map((article, j) => (
                    <li key={j}>
                      <Link
                        href={cat.href}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-amber-700 transition-colors"
                      >
                        <ChevronRight className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
                        {article}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href={cat.href}
                  className="text-xs font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors"
                >
                  Tutti gli articoli
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA supporto */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <LifeBuoy className="h-10 w-10 text-amber-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">Non hai trovato quello che cerchi?</h2>
          <p className="text-gray-400 mb-8">
            Il nostro team di supporto è disponibile dal lunedì al venerdì, 9:00–18:00.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contattaci">
              <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-amber-900/30">
                Contattaci
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/faq">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500">
                Consulta le FAQ
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
            <span>© {new Date().getFullYear()}</span>
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
