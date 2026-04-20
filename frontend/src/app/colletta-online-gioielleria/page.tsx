import Link from 'next/link';
import { Sparkles, ArrowRight, CheckCircle, Gift, Users, CreditCard, Shield, Zap, Star, TrendingUp, ChevronRight } from 'lucide-react';
import Button from '@/components/ui/Button';

export const metadata = {
  title: 'Colletta Online Gioielleria – ListDreams',
  description: 'Gestisci collette online per la tua gioielleria. Ogni contributore paga una quota fissa, i fondi arrivano sul tuo conto via Stripe. Senza abbonamento, solo commissioni sulle transazioni.',
};

const BENEFITS = [
  { icon: CreditCard, title: 'Quota fissa per contributore', desc: 'Imposti l\'importo che ogni invitato deve contribuire. Semplice da capire, semplice da pagare.' },
  { icon: Zap, title: 'Pagamento in 30 secondi', desc: 'L\'invitato apre il link, paga con carta o Apple Pay. Nessuna registrazione, nessuna app da scaricare.' },
  { icon: TrendingUp, title: 'Monitoraggio in tempo reale', desc: 'Vedi chi ha pagato, chi deve ancora farlo, quanto è stato raccolto — tutto in un\'unica dashboard.' },
  { icon: Shield, title: 'Fondi diretti sul tuo conto', desc: 'I pagamenti transitano su Stripe e vengono accreditati direttamente sul tuo conto bancario. Nessun intermediario.' },
  { icon: Users, title: 'Qualsiasi occasione', desc: 'Perfetta per anniversari, compleanni importanti, pensionamenti, lauree — non solo matrimoni.' },
  { icon: Gift, title: 'Lista prodotti integrata', desc: 'Puoi collegare la colletta a un prodotto specifico del tuo catalogo, così i contributori sanno esattamente cosa stanno regalando.' },
];

const USECASES = [
  {
    title: 'Anniversario di matrimonio',
    desc: 'La famiglia si organizza per regalare un gioiello importante. Ogni membro contribuisce una quota, la gioielleria raccoglie tutto.',
  },
  {
    title: 'Compleanno importante',
    desc: 'Amici e colleghi vogliono fare un regalo collettivo. Il link viene condiviso via WhatsApp e ognuno paga la propria quota.',
  },
  {
    title: 'Regalo di laurea o pensionamento',
    desc: 'Un gruppo vuole fare un gesto significativo. La colletta permette di raggiungere importi più alti con contributi individuali accessibili.',
  },
];

const FAQ = [
  {
    q: 'Posso impostare una quota minima invece di una fissa?',
    a: 'Sì, puoi configurare sia importi fissi che importi liberi. I contributori vedono l\'obiettivo totale e decidono quanto versare.',
  },
  {
    q: 'Cosa succede se non vengono raggiunti tutti i contributi?',
    a: 'I fondi raccolti vengono comunque accreditati sul tuo conto. Puoi decidere con il cliente come gestire eventuali differenze.',
  },
  {
    q: 'Posso inviare promemoria ai contributori che non hanno ancora pagato?',
    a: 'Il titolare della lista può condividere nuovamente il link con chi non ha ancora contribuito. Funziona benissimo via WhatsApp.',
  },
  {
    q: 'Quanto costa ogni transazione?',
    a: 'ListDreams applica una commissione del 2,5% + €0,30 per ogni pagamento completato. Nessun costo fisso, nessun abbonamento.',
  },
];

export default function CollettaOnlineGioielleriaPage() {
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
            Colletta online per gioiellerie
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
            Collette online per la tua gioielleria.
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-600">
              Fondi diretti, zero burocrazia.
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Organizza collette per qualsiasi occasione — anniversari, compleanni, lauree.
            Ogni invitato paga la propria quota online, i fondi arrivano direttamente sul tuo conto.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register?role=jeweler">
              <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-amber-200">
                Crea la tua prima colletta gratis
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

      {/* Use cases */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-amber-600 uppercase tracking-widest mb-2">Casi d&apos;uso</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Ogni occasione speciale merita un gioiello speciale</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {USECASES.map((u) => (
              <div key={u.title} className="rounded-2xl bg-amber-50 border border-amber-100 p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-2">{u.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-amber-600 uppercase tracking-widest mb-2">Funzionalità</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Tutto quello che serve per una colletta perfetta</h2>
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
            Inizia a gestire collette online oggi
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
            <Link href="/software-gestionale-lista-nozze" className="hover:text-gray-900 transition-colors">Software gestionale</Link>
            <Link href="/prezzi" className="hover:text-gray-900 transition-colors">Prezzi</Link>
            <Link href="/contattaci" className="hover:text-gray-900 transition-colors">Contattaci</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
