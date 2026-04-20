import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Cookie Policy – ListDreams',
  description: 'Informativa sull\'utilizzo dei cookie su ListDreams, ai sensi del Provvedimento del Garante Privacy e del GDPR.',
};

export default function CookiesPage() {
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
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Cookie Policy</h1>
        <p className="text-sm text-gray-400 mb-10">
          ai sensi del Provvedimento del Garante Privacy del 10 giugno 2021 e del Regolamento UE 2016/679 (GDPR) — Ultimo aggiornamento: aprile 2025
        </p>

        <div className="space-y-10 text-sm leading-relaxed text-gray-600">

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">1. Cosa sono i cookie</h2>
            <p>
              I cookie sono piccoli file di testo salvati nel browser durante la navigazione.
              Servono a far funzionare il sito, ricordare le preferenze dell&apos;utente,
              o raccogliere informazioni statistiche sull&apos;utilizzo.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">2. Titolare del Trattamento</h2>
            <p>
              Il Titolare del trattamento è la società che gestisce la piattaforma ListDreams.
              Per qualsiasi richiesta:{' '}
              <a href="mailto:privacy@listdreams.it" className="text-amber-600 hover:underline">privacy@listdreams.it</a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">3. Gestione del consenso</h2>
            <p>
              Il sito utilizza <strong>CookieYes</strong> per la gestione del consenso ai cookie.
              Al primo accesso viene mostrato un banner che consente di accettare, rifiutare
              o personalizzare le proprie preferenze. Puoi modificarle in qualsiasi momento
              cliccando sul banner &quot;Gestisci preferenze cookie&quot; presente in fondo al sito.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">4. Tipologie di cookie utilizzati</h2>

            <p className="font-medium text-gray-800 mb-2">Cookie tecnici / strettamente necessari</p>
            <p className="mb-3 text-gray-500">
              Indispensabili per il funzionamento del sito. Non richiedono consenso.
            </p>
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-700 text-left">
                    <th className="border border-gray-200 px-3 py-2 font-semibold">Nome</th>
                    <th className="border border-gray-200 px-3 py-2 font-semibold">Finalità</th>
                    <th className="border border-gray-200 px-3 py-2 font-semibold">Durata</th>
                    <th className="border border-gray-200 px-3 py-2 font-semibold">Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['session_token / auth_token', 'Mantiene la sessione di login', 'Fine sessione / 7 gg', 'Proprio'],
                    ['csrf_token', 'Protezione CSRF', 'Fine sessione', 'Proprio'],
                    ['cookieyes-consent', 'Salva le preferenze cookie dell\'utente', '1 anno', 'CookieYes'],
                    ['__stripe_mid', 'Identificazione sessione Stripe (antifrode)', '1 anno', 'Stripe'],
                    ['__stripe_sid', 'Sessione sicura Stripe durante il pagamento', '30 minuti', 'Stripe'],
                  ].map(([name, desc, dur, type], i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="border border-gray-200 px-3 py-2 font-mono">{name}</td>
                      <td className="border border-gray-200 px-3 py-2">{desc}</td>
                      <td className="border border-gray-200 px-3 py-2">{dur}</td>
                      <td className="border border-gray-200 px-3 py-2">{type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="font-medium text-gray-800 mb-2">Cookie analitici (con consenso)</p>
            <p className="mb-3 text-gray-500">
              Ci aiutano a capire come gli utenti usano il sito. Vengono attivati solo previo consenso.
            </p>
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-700 text-left">
                    <th className="border border-gray-200 px-3 py-2 font-semibold">Nome</th>
                    <th className="border border-gray-200 px-3 py-2 font-semibold">Fornitore</th>
                    <th className="border border-gray-200 px-3 py-2 font-semibold">Finalità</th>
                    <th className="border border-gray-200 px-3 py-2 font-semibold">Durata</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['_ga, _ga_XXXX', 'Google Analytics', 'Analisi statistica del traffico', '2 anni'],
                    ['_gid', 'Google Analytics', 'Distinzione degli utenti', '24 ore'],
                  ].map(([name, provider, desc, dur], i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="border border-gray-200 px-3 py-2 font-mono">{name}</td>
                      <td className="border border-gray-200 px-3 py-2">{provider}</td>
                      <td className="border border-gray-200 px-3 py-2">{desc}</td>
                      <td className="border border-gray-200 px-3 py-2">{dur}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">5. Cookie di terze parti</h2>
            <p className="mb-3">
              Alcuni cookie sono impostati da fornitori terzi. ListDreams non controlla questi cookie direttamente.
              Ti invitiamo a consultare le loro informative:
            </p>
            <ul className="space-y-1 list-disc list-inside">
              <li>
                <a href="https://stripe.com/it/privacy" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">
                  Stripe — Privacy Policy
                </a>
              </li>
              <li>
                <a href="https://www.cookieyes.com/privacy-policy/" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">
                  CookieYes — Privacy Policy
                </a>
              </li>
              <li>
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">
                  Google — Privacy Policy
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">6. Come gestire i cookie dal browser</h2>
            <p className="mb-3">
              Oltre al banner CookieYes, puoi gestire o disabilitare i cookie direttamente dal tuo browser:
            </p>
            <ul className="space-y-1 list-disc list-inside">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/it/kb/Attivare%20e%20disattivare%20i%20cookie" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">Safari</a></li>
              <li><a href="https://support.microsoft.com/it-it/microsoft-edge/eliminare-i-cookie-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">Microsoft Edge</a></li>
            </ul>
            <p className="mt-3 text-gray-500">
              Disabilitare i cookie tecnici potrebbe compromettere il funzionamento della piattaforma
              (ad esempio impedire il login o completare un pagamento).
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">7. Modifiche alla Cookie Policy</h2>
            <p>
              Ci riserviamo il diritto di aggiornare questa Cookie Policy in qualsiasi momento.
              La versione aggiornata sarà pubblicata su questa pagina con la relativa data.
            </p>
          </section>

          <section>
            <p>
              Per approfondire consulta anche la nostra{' '}
              <Link href="/privacy" className="text-amber-600 hover:underline">Informativa sulla Privacy</Link>.
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
