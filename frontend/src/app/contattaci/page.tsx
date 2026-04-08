import Link from 'next/link';
import { Sparkles, ArrowRight, Mail, Phone, MapPin, Clock, Send, MessageCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

export const metadata = {
  title: 'Contattaci – ListDreams',
  description: 'Hai domande o bisogno di assistenza? Il team ListDreams è a tua disposizione.',
};

export default function ContattaciPage() {
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
              <Link href="/centro-aiuto" className="hover:text-gray-900 transition-colors">Centro Aiuto</Link>
              <Link href="/contattaci" className="text-amber-600 font-medium">Contattaci</Link>
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
            <MessageCircle className="h-4 w-4" />
            Siamo qui per aiutarti
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Contattaci
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Hai una domanda, un problema o vuoi semplicemente saperne di più? Scrivici — ti rispondiamo entro 24 ore.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Contact info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Come raggiungerci</h2>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600 mt-0.5">info@listdreams.it</p>
                    <p className="text-xs text-gray-400 mt-0.5">Risposta entro 24 ore</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Telefono</p>
                    <p className="text-sm text-gray-600 mt-0.5">+39 02 1234 5678</p>
                    <p className="text-xs text-gray-400 mt-0.5">Lun–Ven, 9:00–18:00</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Sede</p>
                    <p className="text-sm text-gray-600 mt-0.5">Milano, Italia</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Orari supporto</p>
                    <p className="text-sm text-gray-600 mt-0.5">Lunedì – Venerdì</p>
                    <p className="text-sm text-gray-600">9:00 – 18:00 CET</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-amber-50 border border-amber-100 p-6">
              <p className="text-sm font-medium text-amber-900 mb-1">Hai bisogno di aiuto rapido?</p>
              <p className="text-sm text-amber-700 mb-4">Consulta il nostro Centro Aiuto con guide e risposte alle domande più frequenti.</p>
              <Link href="/centro-aiuto">
                <Button size="sm" variant="outline" className="w-full">
                  Vai al Centro Aiuto
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Inviaci un messaggio</h2>
              <form className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome</label>
                    <input
                      type="text"
                      placeholder="Il tuo nome"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Cognome</label>
                    <input
                      type="text"
                      placeholder="Il tuo cognome"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    placeholder="tua@email.it"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Oggetto</label>
                  <select className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition bg-white">
                    <option value="">Seleziona un argomento</option>
                    <option value="supporto">Supporto tecnico</option>
                    <option value="fatturazione">Fatturazione e pagamenti</option>
                    <option value="account">Gestione account</option>
                    <option value="partnership">Partnership e collaborazioni</option>
                    <option value="altro">Altro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Messaggio</label>
                  <textarea
                    rows={5}
                    placeholder="Descrivi la tua richiesta..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition resize-none"
                  />
                </div>

                <Button type="submit" size="lg" className="w-full shadow-md shadow-amber-100">
                  <Send className="mr-2 h-4 w-4" />
                  Invia messaggio
                </Button>

                <p className="text-xs text-center text-gray-400">
                  Inviando il modulo accetti la nostra{' '}
                  <Link href="#" className="underline hover:text-gray-600">Privacy Policy</Link>.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50 mt-12">
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
