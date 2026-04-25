import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CalendarDays,
  Clock,
  Users,
  Euro,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Star,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Gestione eventi e appuntamenti per gioiellerie — ListDreams',
  description:
    'Crea eventi con slot prenotabili online. I tuoi clienti prenotano il loro appuntamento in autonomia, tu ricevi le prenotazioni direttamente in dashboard.',
  openGraph: {
    title: 'Gestione eventi per gioiellerie — ListDreams',
    description:
      'Crea eventi con slot prenotabili online. Zero telefonate, zero agende cartacee.',
  },
};

const features = [
  {
    icon: CalendarDays,
    title: "Crea l'evento in 2 minuti",
    description:
      "Inserisci titolo, data, orario di apertura e chiusura. ListDreams genera automaticamente tutti gli slot prenotabili.",
  },
  {
    icon: Clock,
    title: 'Slot su misura',
    description:
      'Scegli la durata di ogni appuntamento: 15, 30, 45 o 60 minuti. Il sistema calcola il numero di slot disponibili.',
  },
  {
    icon: Users,
    title: 'Prenotazione online senza telefonate',
    description:
      "Condividi il link dell'evento via WhatsApp o email. I clienti scelgono il loro slot e prenotano in autonomia, anche fuori orario.",
  },
  {
    icon: Euro,
    title: 'Pagamento opzionale',
    description:
      'Puoi offrire eventi gratuiti o richiedere un deposito online con carta. I fondi arrivano direttamente sul tuo conto tramite Stripe.',
  },
];

const useCases = [
  {
    title: 'Giornata fedi',
    description: 'Consulenze individuali con la coppia per la scelta degli anelli. Ogni coppia ha il suo slot da 45 minuti.',
    tag: 'Matrimoni',
  },
  {
    title: 'Private shopping natalizio',
    description: 'Sessioni esclusive durante le feste. Slot da 30 minuti, accesso su prenotazione, nessun affollamento.',
    tag: 'Stagionale',
  },
  {
    title: 'Consulenza personalizzata',
    description: "Appuntamenti per clienti che vogliono un'esperienza di acquisto dedicata, senza fretta.",
    tag: 'Premium',
  },
  {
    title: 'Presentazione nuova collezione',
    description: 'Evento aperto a invitati selezionati. Prenotazione del posto con anticipo online, nessuna lista cartacea.',
    tag: 'Lancio',
  },
];

const steps = [
  { number: '01', title: "Crea l'evento", description: "Inserisci data, orari e durata degli slot. Scegli se è gratuito o a pagamento." },
  { number: '02', title: 'Condividi il link', description: 'Copia il link di prenotazione e invialo ai tuoi clienti su WhatsApp, email o Instagram.' },
  { number: '03', title: 'I clienti prenotano', description: "Scelgono lo slot disponibile, inseriscono i dati e — se hai attivato il pagamento — pagano con carta." },
  { number: '04', title: 'Tu gestisci dalla dashboard', description: "Vedi tutte le prenotazioni slot per slot, conferma o annulla, ed esci con l'agenda già organizzata." },
];

export default function EventiGioielleriaPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav minimal */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-amber-500" />
          <span className="font-bold text-gray-900 text-lg">ListDreams</span>
        </Link>
        <Link
          href="/register?role=jeweler"
          className="text-sm font-medium text-amber-600 hover:text-amber-700"
        >
          Prova gratis →
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-sm font-medium px-4 py-2 rounded-full mb-6">
          <CalendarDays className="h-4 w-4" />
          Nuova funzionalità — Gestione eventi
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6">
          I tuoi clienti prenotano{' '}
          <span className="text-amber-500">da soli</span>.{' '}
          Tu trovi l&apos;agenda già piena.
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
          Crea eventi con slot prenotabili online — giornate fedi, private shopping, consulenze.
          Condividi un link, i clienti scelgono l&apos;orario, tu gestisci tutto da un&apos;unica dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register?role=jeweler"
            className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-sm"
          >
            Inizia gratis
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/prezzi"
            className="inline-flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-300 text-gray-700 font-medium px-8 py-3.5 rounded-xl transition-colors text-sm"
          >
            Vedi i prezzi
          </Link>
        </div>
      </section>

      {/* Features grid */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
            Come funziona la gestione eventi
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-xl mx-auto">
            Nessun software da installare, nessuna integrazione complicata. Funziona subito.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="h-10 w-10 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works — steps */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
          Dall&apos;idea all&apos;appuntamento in 4 passi
        </h2>
        <p className="text-gray-600 text-center mb-14 max-w-xl mx-auto">
          Niente agende cartacee. Niente telefonate per fissare gli orari. Tutto online, in automatico.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col">
              <div className="text-4xl font-black text-amber-100 mb-2">{step.number}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
            Per quali eventi è pensato
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-xl mx-auto">
            Dal private shopping alla giornata fedi: ogni evento in gioielleria merita un&apos;esperienza professionale.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {useCases.map((uc) => (
              <div key={uc.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                  {uc.tag}
                </span>
                <h3 className="font-semibold text-gray-900 mt-3 mb-2">{uc.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{uc.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits summary */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <div className="bg-amber-50 rounded-3xl p-10 sm:p-14">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Perché le gioiellerie scelgono ListDreams per gli eventi
              </h2>
              <ul className="space-y-4">
                {[
                  "I clienti prenotano da soli, anche di notte — tu trovi l'agenda piena al mattino",
                  'Nessuna telefonata persa per fissare appuntamenti',
                  'Pagamento online opzionale: incassi prima ancora che il cliente arrivi',
                  "Dashboard con tutti gli slot in un colpo d'occhio — chi ha prenotato, quando, con quale metodo di pagamento",
                  "Funziona insieme alle liste nozze: un'unica piattaforma per tutti i servizi digitali",
                  'Nessun costo fisso mensile — paghi solo sulla transazione quando attivi il pagamento online',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-amber-100">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <blockquote className="text-gray-700 text-sm leading-relaxed mb-4">
                &ldquo;Ho creato la mia prima giornata fedi in 10 minuti. Ho condiviso il link nel gruppo WhatsApp degli sposi e il giorno dopo avevo già 8 appuntamenti confermati — senza rispondere a nessuna email.&rdquo;
              </blockquote>
              <div className="text-sm font-semibold text-gray-900">Gioielleria Ferretti</div>
              <div className="text-xs text-gray-400">Verona</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA finale */}
      <section className="bg-gray-900 py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pronto a riempire l&apos;agenda senza telefonare?
          </h2>
          <p className="text-gray-400 mb-8">
            Attiva la gestione eventi in pochi minuti. Nessun costo fisso, nessuna carta di credito richiesta per iniziare.
          </p>
          <Link
            href="/register?role=jeweler"
            className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold px-10 py-4 rounded-xl transition-colors text-sm"
          >
            Crea il tuo primo evento gratis
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-gray-500 text-xs mt-4">
            Già su ListDreams?{' '}
            <Link href="/login" className="text-amber-400 hover:underline">
              Accedi alla dashboard →
            </Link>
          </p>
        </div>
      </section>

      {/* Footer minimal */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <span className="font-semibold text-gray-700">ListDreams</span>
          </div>
          <div className="flex gap-6">
            <Link href="/lista-nozze-gioielleria" className="hover:text-gray-600">Liste Nozze</Link>
            <Link href="/colletta-online-gioielleria" className="hover:text-gray-600">Collette Online</Link>
            <Link href="/prezzi" className="hover:text-gray-600">Prezzi</Link>
            <Link href="/blog" className="hover:text-gray-600">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
