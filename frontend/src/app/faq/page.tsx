'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ChevronDown, HelpCircle, Search } from 'lucide-react';
import Button from '@/components/ui/Button';

const FAQ_CATEGORIES = [
  {
    id: 'iniziare',
    label: 'Iniziare',
    items: [
      {
        q: 'Come mi registro su ListDreams?',
        a: 'Clicca su "Inizia gratis" nella homepage, inserisci email e password e scegli se sei un gioielliere. La registrazione richiede meno di 2 minuti, nessuna carta di credito necessaria.',
      },
      {
        q: 'ListDreams è gratuito?',
        a: 'La registrazione è completamente gratuita. Applichiamo solo una piccola commissione sulle transazioni reali: non paghi nulla finché non incassi.',
      },
      {
        q: 'Devo installare qualcosa?',
        a: 'No. ListDreams funziona interamente dal browser — desktop e mobile. Nessuna app da installare.',
      },
    ],
  },
  {
    id: 'liste',
    label: 'Liste e Collette',
    items: [
      {
        q: 'Qual è la differenza tra Lista Regalo e Colletta?',
        a: 'La Lista Regalo permette ai contributori di selezionare e "riservare" prodotti specifici. La Colletta raccoglie contributi liberi verso un importo obiettivo, senza prodotti selezionabili.',
      },
      {
        q: 'Quante liste posso creare?',
        a: 'Nessun limite. Puoi creare tutte le liste che vuoi per i tuoi clienti.',
      },
      {
        q: 'La lista ha una scadenza?',
        a: 'Sì, durante la creazione puoi impostare una data di scadenza. Dopo quella data la lista viene chiusa automaticamente ai nuovi contributi.',
      },
      {
        q: 'Posso modificare una lista dopo averla pubblicata?',
        a: 'Sì, puoi modificare titolo, descrizione, prodotti e importo obiettivo in qualsiasi momento dalla tua dashboard.',
      },
    ],
  },
  {
    id: 'pagamenti',
    label: 'Pagamenti',
    items: [
      {
        q: 'Come vengono gestiti i pagamenti?',
        a: 'Tutti i pagamenti sono processati da Stripe, il circuito di pagamento più sicuro al mondo. I fondi vengono accreditati direttamente sul tuo conto Stripe Connect entro 2-3 giorni lavorativi.',
      },
      {
        q: 'Quali metodi di pagamento sono accettati?',
        a: 'Carte di credito e debito (Visa, Mastercard, American Express), Apple Pay e Google Pay dove disponibili.',
      },
      {
        q: 'Quanto è la commissione per transazione?',
        a: 'La commissione di ListDreams è una percentuale ridotta applicata solo sulle transazioni completate. A questa si aggiunge la commissione standard di Stripe (circa 1,4% + 0,25€ per carte europee).',
      },
      {
        q: 'I contributori possono pagare in modo anonimo?',
        a: 'Sì. Durante il checkout il contributore può scegliere di non mostrare il proprio nome nella lista.',
      },
      {
        q: 'Cosa succede se la raccolta non raggiunge l\'obiettivo?',
        a: 'I fondi già raccolti vengono comunque accreditati al gioielliere. Non esiste un meccanismo di rimborso automatico legato al mancato raggiungimento dell\'obiettivo.',
      },
    ],
  },
  {
    id: 'account',
    label: 'Account e Sicurezza',
    items: [
      {
        q: 'Come cambio la mia password?',
        a: 'Vai su Dashboard → Profilo → Cambia Password. Puoi anche usare "Hai dimenticato la password?" nella pagina di login per ricevere un link di reset via email.',
      },
      {
        q: 'Come elimino il mio account?',
        a: 'Contattaci via email a info@listdreams.it con la richiesta di cancellazione. Elaboriamo le richieste entro 5 giorni lavorativi.',
      },
      {
        q: 'I dati dei miei clienti sono al sicuro?',
        a: 'Sì. I dati sono crittografati in transito (SSL/TLS) e a riposo. Non vendiamo mai i dati a terzi. Per i dettagli consulta la nostra Privacy Policy.',
      },
    ],
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left gap-4 group"
      >
        <span className="text-sm font-medium text-gray-900 group-hover:text-amber-700 transition-colors">
          {q}
        </span>
        <ChevronDown
          className={`flex-shrink-0 h-4 w-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180 text-amber-500' : ''}`}
        />
      </button>
      {open && (
        <p className="pb-4 text-sm text-gray-600 leading-relaxed pr-8">{a}</p>
      )}
    </div>
  );
}

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState('iniziare');
  const [search, setSearch] = useState('');

  const filtered = FAQ_CATEGORIES.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  const displayed = search ? filtered : FAQ_CATEGORIES.filter((c) => c.id === activeCategory);

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
              <Link href="/faq" className="text-amber-600 font-medium">FAQ</Link>
              <Link href="/centro-aiuto" className="hover:text-gray-900 transition-colors">Centro Aiuto</Link>
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
            <HelpCircle className="h-4 w-4" />
            Domande frequenti
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Come possiamo aiutarti?
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Trova subito le risposte alle domande più comuni su ListDreams.
          </p>

          {/* Search */}
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca una domanda..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
            />
          </div>
        </div>
      </section>

      {/* FAQ content */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!search && (
          <div className="flex flex-wrap gap-2 mb-8">
            {FAQ_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-amber-500 text-white shadow-sm shadow-amber-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {displayed.length === 0 ? (
          <div className="text-center py-16">
            <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nessun risultato per &quot;{search}&quot;</p>
            <button
              onClick={() => setSearch('')}
              className="mt-4 text-sm text-amber-600 hover:underline"
            >
              Cancella ricerca
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {displayed.map((cat) => (
              <div key={cat.id}>
                {search && (
                  <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    {cat.label}
                  </h2>
                )}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100 px-6">
                  {cat.items.map((item, i) => (
                    <FaqItem key={i} q={item.q} a={item.a} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 p-8 text-center text-white">
          <h3 className="text-xl font-bold mb-2">Non hai trovato la risposta?</h3>
          <p className="text-amber-100 text-sm mb-6">Il nostro team è pronto ad aiutarti — ti rispondiamo entro 24 ore.</p>
          <Link href="/contattaci">
            <Button size="lg" className="bg-white text-amber-700 hover:bg-amber-50 shadow-none">
              Contattaci
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50 mt-8">
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
