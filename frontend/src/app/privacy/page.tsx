import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Informativa sulla Privacy – ListDreams',
  description: 'Informativa sul trattamento dei dati personali ai sensi del Regolamento UE 2016/679 (GDPR).',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="h-7 w-7 text-amber-500" />
              <span className="text-xl font-bold text-gray-900 tracking-tight">ListDreams</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Informativa sulla Privacy</h1>
        <p className="text-sm text-gray-400 mb-10">
          ai sensi dell&apos;art. 13 del Regolamento UE 2016/679 (GDPR) — Ultimo aggiornamento: aprile 2025
        </p>

        <div className="prose prose-gray max-w-none space-y-10 text-sm leading-relaxed text-gray-600">

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">1. Titolare del Trattamento</h2>
            <p>
              Il Titolare del trattamento è la società che gestisce la piattaforma ListDreams, con sede legale in Italia.
              Per qualsiasi questione relativa alla privacy puoi scrivere a{' '}
              <a href="mailto:privacy@listdreams.it" className="text-amber-600 hover:underline">privacy@listdreams.it</a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">2. Categorie di Interessati e Dati Trattati</h2>

            <p className="font-medium text-gray-800 mb-1">A) Gioiellerie (utenti registrati con account)</p>
            <p className="mb-4">
              Raccogliamo: ragione sociale o nome del referente, indirizzo email, numero di telefono, indirizzo, dati fiscali (P.IVA / Codice Fiscale), dati di pagamento gestiti tramite Stripe.
            </p>

            <p className="font-medium text-gray-800 mb-1">B) Clienti finali (registrazione opzionale)</p>
            <p className="mb-4">
              Raccogliamo: nome, cognome, indirizzo email. La registrazione non è obbligatoria per visualizzare o contribuire a una lista.
            </p>

            <p className="font-medium text-gray-800 mb-1">C) Contributori (accesso senza registrazione)</p>
            <p className="mb-4">
              I dati di pagamento sono gestiti direttamente da Stripe Payments Europe Ltd (responsabile del trattamento). ListDreams non accede ai dati della carta di credito. Possiamo ricevere da Stripe: nome del contributore e importo della transazione.
            </p>

            <p className="font-medium text-gray-800 mb-1">D) Utenti del form di contatto</p>
            <p>
              Raccogliamo: nome, indirizzo email e il contenuto del messaggio inviato.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">3. Finalità e Basi Giuridiche del Trattamento</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-700 text-left">
                    <th className="border border-gray-200 px-3 py-2 font-semibold">Finalità</th>
                    <th className="border border-gray-200 px-3 py-2 font-semibold">Base giuridica</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Erogazione del servizio SaaS', 'Esecuzione del contratto (art. 6.1.b)'],
                    ['Gestione pagamenti e transazioni', 'Esecuzione del contratto (art. 6.1.b)'],
                    ['Adempimenti fiscali e contabili', 'Obbligo legale (art. 6.1.c)'],
                    ['Gestione lista nozze / colletta', 'Esecuzione del contratto o legittimo interesse (art. 6.1.f)'],
                    ['Risposta a richieste di contatto', 'Legittimo interesse (art. 6.1.f)'],
                    ['Comunicazioni promozionali', 'Consenso (art. 6.1.a)'],
                    ['Analisi statistica del sito', 'Consenso (cookie)'],
                  ].map(([f, b], i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="border border-gray-200 px-3 py-2">{f}</td>
                      <td className="border border-gray-200 px-3 py-2">{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">4. Conservazione dei Dati</h2>
            <ul className="space-y-1 list-disc list-inside">
              <li>Dati fiscali e contabili: 10 anni (obbligo di legge italiano)</li>
              <li>Dati account gioiellerie: per tutta la durata del contratto + 12 mesi dalla cessazione</li>
              <li>Dati clienti finali: fino alla chiusura della lista + 6 mesi</li>
              <li>Dati contributori: 6 mesi dalla transazione</li>
              <li>Dati form di contatto: 12 mesi dalla ricezione</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">5. Comunicazione e Trasferimento dei Dati</h2>
            <p className="mb-3">I dati non vengono venduti a terzi. Possono essere condivisi con:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li><strong>Stripe Payments Europe Ltd</strong> — gestione pagamenti (responsabile del trattamento, conforme GDPR)</li>
              <li><strong>Provider hosting</strong> — archiviazione dati su server in UE</li>
              <li><strong>Brevo (ex Sendinblue)</strong> — invio email transazionali e gestione contatti</li>
              <li><strong>Autorità fiscali e giudiziarie</strong> — quando richiesto per legge</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">6. Diritti degli Interessati</h2>
            <p className="mb-3">Ai sensi degli artt. 15–22 GDPR, ogni interessato ha diritto di:</p>
            <ul className="space-y-1 list-disc list-inside mb-3">
              <li>Accedere ai propri dati personali</li>
              <li>Rettificarli o aggiornarli</li>
              <li>Cancellarli (&quot;diritto all&apos;oblio&quot;)</li>
              <li>Limitare o opporsi al trattamento</li>
              <li>Richiedere la portabilità dei dati</li>
              <li>Revocare il consenso in qualsiasi momento</li>
            </ul>
            <p>
              Per esercitare questi diritti:{' '}
              <a href="mailto:privacy@listdreams.it" className="text-amber-600 hover:underline">privacy@listdreams.it</a>.
              In caso di risposta insoddisfacente, è possibile presentare reclamo al{' '}
              <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">
                Garante per la Protezione dei Dati Personali
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">7. Sicurezza</h2>
            <p>
              I dati sono protetti con connessioni SSL/TLS. I pagamenti avvengono esclusivamente tramite Stripe,
              certificato PCI-DSS. ListDreams non conserva dati di carte di credito sui propri server.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">8. Cookie</h2>
            <p>
              Per informazioni sui cookie utilizzati da questo sito consulta la nostra{' '}
              <Link href="/cookies" className="text-amber-600 hover:underline">Cookie Policy</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">9. Modifiche alla Presente Informativa</h2>
            <p>
              Ci riserviamo il diritto di aggiornare questa informativa. Le modifiche saranno comunicate
              via email agli utenti registrati e pubblicate su questa pagina con data di aggiornamento.
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t border-gray-100 bg-gray-50 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <span className="font-semibold text-gray-700">ListDreams</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
            <Link href="/cookies" className="hover:text-gray-900 transition-colors">Cookie Policy</Link>
            <Link href="/terms" className="hover:text-gray-900 transition-colors">Termini di servizio</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
