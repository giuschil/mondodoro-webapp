import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Termini e Condizioni di Servizio – ListDreams',
  description: 'Termini e Condizioni di utilizzo della piattaforma ListDreams per gioiellerie, clienti finali e contributori.',
};

const SECTIONS = [
  {
    id: '1',
    title: '1. Informazioni sul Fornitore',
    content: (
      <>
        <p>
          Il servizio ListDreams è fornito da <strong>[RAGIONE SOCIALE]</strong>, con sede legale in{' '}
          <strong>[INDIRIZZO COMPLETO]</strong>, P.IVA <strong>[PARTITA IVA]</strong>, iscritta al Registro
          delle Imprese di <strong>[CITTÀ]</strong> al n. <strong>[NUMERO REA]</strong>{' '}
          (di seguito &quot;ListDreams&quot; o &quot;Fornitore&quot;).
        </p>
        <p className="mt-3">
          Per qualsiasi comunicazione:{' '}
          <a href="mailto:info@listdreams.it" className="text-amber-600 hover:underline">info@listdreams.it</a>
        </p>
      </>
    ),
  },
  {
    id: '2',
    title: '2. Oggetto e Accettazione',
    content: (
      <>
        <p>
          ListDreams è una piattaforma SaaS (Software as a Service) che permette alle gioiellerie di creare e gestire
          liste regalo digitali e collette online, e ai loro clienti di contribuire tramite pagamenti elettronici.
        </p>
        <p className="mt-3">
          L&apos;utilizzo della piattaforma implica l&apos;accettazione integrale dei presenti Termini. Chi non accetta
          i Termini è pregato di non utilizzare il servizio.
        </p>
        <p className="mt-3">I presenti Termini si applicano a tre categorie di utenti:</p>
        <ul className="mt-2 space-y-1 list-disc list-inside">
          <li><strong>Gioiellerie</strong> — soggetti business che accedono tramite account registrato</li>
          <li><strong>Clienti finali (coppie)</strong> — utenti che aprono una lista regalo, con registrazione facoltativa</li>
          <li><strong>Contributori</strong> — chi effettua un contributo su una lista, anche senza registrazione</li>
        </ul>
      </>
    ),
  },
  {
    id: '3',
    title: '3. Accesso al Servizio e Account',
    content: (
      <>
        <p className="font-medium text-gray-800 mb-1">3.1 Registrazione gioiellerie</p>
        <p className="mb-4">
          Le gioiellerie devono registrarsi fornendo dati veritieri e aggiornati. Ogni account è personale e non cedibile.
          Il titolare dell&apos;account è responsabile di tutte le attività effettuate con le proprie credenziali.
        </p>
        <p className="font-medium text-gray-800 mb-1">3.2 Registrazione clienti finali</p>
        <p className="mb-4">
          I clienti finali possono registrarsi facoltativamente. L&apos;utilizzo del servizio (es. visualizzare una lista
          e contribuire) è possibile anche senza account.
        </p>
        <p className="font-medium text-gray-800 mb-1">3.3 Contributori senza registrazione</p>
        <p className="mb-4">
          I contributori possono accedere a una lista tramite link diretto e completare un pagamento senza creare un account.
          Il pagamento è gestito da Stripe.
        </p>
        <p className="font-medium text-gray-800 mb-1">3.4 Requisiti</p>
        <p>
          Per registrarsi è necessario essere maggiorenni (18 anni) e, per le gioiellerie, essere titolari di
          un&apos;attività commerciale legalmente costituita in Italia.
        </p>
      </>
    ),
  },
  {
    id: '4',
    title: '4. Descrizione del Servizio',
    content: (
      <>
        <p className="mb-3">ListDreams consente alle gioiellerie di:</p>
        <ul className="space-y-1 list-disc list-inside mb-4">
          <li>Creare liste regalo digitali con prodotti e importi obiettivo</li>
          <li>Creare collette online con importo fisso per contributore</li>
          <li>Condividere un link univoco con clienti e invitati</li>
          <li>Monitorare contributi e progressi in tempo reale dalla dashboard</li>
          <li>Ricevere i fondi raccolti direttamente sul proprio conto tramite Stripe</li>
        </ul>
        <p>
          ListDreams non detiene fondi per conto delle gioiellerie. I pagamenti transitano e vengono liquidati
          direttamente tramite Stripe Payments Europe Ltd, soggetto a propri termini e condizioni.
        </p>
      </>
    ),
  },
  {
    id: '5',
    title: '5. Commissioni e Pagamenti',
    content: (
      <>
        <p className="font-medium text-gray-800 mb-1">5.1 Struttura commissioni</p>
        <p className="mb-4">
          ListDreams non applica costi fissi. Viene trattenuta una commissione percentuale sulle transazioni
          effettivamente completate. La percentuale aggiornata è consultabile nella pagina{' '}
          <Link href="/prezzi" className="text-amber-600 hover:underline">Prezzi</Link>.
        </p>
        <p className="font-medium text-gray-800 mb-1">5.2 Gestione pagamenti</p>
        <p className="mb-4">
          Tutti i pagamenti sono gestiti da Stripe. ListDreams non accede ai dati della carta di credito dei
          contributori. Accettando i presenti Termini, le gioiellerie accettano anche i{' '}
          <a href="https://stripe.com/it/legal" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">
            Termini di Servizio di Stripe
          </a>.
        </p>
        <p className="font-medium text-gray-800 mb-1">5.3 Rimborsi e contestazioni</p>
        <p className="mb-4">
          I rimborsi ai contributori sono gestiti dalle gioiellerie tramite la dashboard. ListDreams non è responsabile
          per rimborsi non eseguiti dalla gioielleria. In caso di chargeback, si applica la policy di Stripe.
          Le gioiellerie si impegnano a gestire i rimborsi legittimi in tempi ragionevoli.
        </p>
        <p className="font-medium text-gray-800 mb-1">5.4 Responsabilità fiscale</p>
        <p>
          Ogni gioielleria è responsabile della corretta gestione fiscale degli importi ricevuti (fatturazione, IVA,
          dichiarazioni). ListDreams non è un sostituto d&apos;imposta e non assume responsabilità fiscali per conto
          delle gioiellerie.
        </p>
      </>
    ),
  },
  {
    id: '6',
    title: '6. Obblighi degli Utenti',
    content: (
      <>
        <p className="mb-3">Tutte le categorie di utenti si impegnano a:</p>
        <ul className="space-y-1 list-disc list-inside mb-4">
          <li>Fornire informazioni veritiere e non fraudolente</li>
          <li>Non utilizzare la piattaforma per attività illegali, ingannevoli o contrarie all&apos;ordine pubblico</li>
          <li>Non tentare di accedere in modo non autorizzato ai sistemi di ListDreams</li>
          <li>Non caricare contenuti offensivi, diffamatori o che violino diritti di terzi</li>
        </ul>
        <p className="mb-3">Le gioiellerie si impegnano inoltre a:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Utilizzare la piattaforma esclusivamente per la propria attività commerciale legittima</li>
          <li>Non creare liste fittizie o collette fraudolente</li>
          <li>Gestire i dati dei propri clienti (coppie e contributori) nel rispetto del GDPR</li>
          <li>Onorare gli impegni presi verso i propri clienti in merito ai prodotti e servizi offerti nelle liste</li>
        </ul>
      </>
    ),
  },
  {
    id: '7',
    title: '7. Proprietà Intellettuale',
    content: (
      <>
        <p className="mb-3">
          Il marchio, il logo, il codice sorgente, il design e i contenuti della piattaforma ListDreams sono di
          proprietà esclusiva di [RAGIONE SOCIALE] e protetti dalle leggi sul diritto d&apos;autore e sui marchi.
          È vietato copiare, riprodurre, decompilare o distribuire qualsiasi elemento della piattaforma senza
          autorizzazione scritta.
        </p>
        <p>
          I contenuti caricati dalle gioiellerie (es. nomi prodotti, immagini, descrizioni liste) restano di proprietà
          della gioielleria. Caricando tali contenuti, la gioielleria concede a ListDreams una licenza limitata,
          non esclusiva e gratuita per visualizzarli nell&apos;ambito del servizio.
        </p>
      </>
    ),
  },
  {
    id: '8',
    title: '8. Limitazione di Responsabilità',
    content: (
      <>
        <p className="mb-3">
          8.1 ListDreams mette a disposizione la piattaforma &quot;così com&apos;è&quot; e non garantisce
          l&apos;assenza di interruzioni, errori o malfunzionamenti.
        </p>
        <p className="mb-2">8.2 ListDreams non è responsabile per:</p>
        <ul className="space-y-1 list-disc list-inside mb-4">
          <li>Mancati pagamenti o ritardi imputabili a Stripe o a istituti bancari</li>
          <li>Controversie tra gioiellerie e loro clienti (coppie o contributori)</li>
          <li>Danni indiretti, perdita di profitto o danni consequenziali derivanti dall&apos;uso della piattaforma</li>
          <li>Contenuti inseriti dalle gioiellerie nelle liste</li>
        </ul>
        <p className="mb-3">
          8.3 La responsabilità massima di ListDreams nei confronti di una gioielleria non potrà in nessun caso
          superare l&apos;importo delle commissioni pagate dalla stessa negli ultimi 3 mesi di utilizzo del servizio.
        </p>
        <p>
          8.4 ListDreams non risponde di interruzioni del servizio causate da forza maggiore, attacchi informatici,
          guasti di infrastrutture terze (es. hosting, Stripe) o cause fuori dal proprio controllo ragionevole.
        </p>
      </>
    ),
  },
  {
    id: '9',
    title: '9. Sospensione e Cancellazione dell\'Account',
    content: (
      <>
        <p className="mb-3">ListDreams si riserva il diritto di sospendere o cancellare un account in caso di:</p>
        <ul className="space-y-1 list-disc list-inside mb-4">
          <li>Violazione dei presenti Termini</li>
          <li>Utilizzo fraudolento o sospetto della piattaforma</li>
          <li>Richiesta dell&apos;autorità giudiziaria o amministrativa competente</li>
          <li>Mancato pagamento delle commissioni dovute</li>
        </ul>
        <p className="mb-3">
          In caso di cancellazione, i dati dell&apos;account saranno conservati per i termini previsti dalla legge
          (vedi{' '}
          <Link href="/privacy" className="text-amber-600 hover:underline">Privacy Policy</Link>).
          Le gioiellerie potranno richiedere l&apos;esportazione dei dati prima della cancellazione.
        </p>
        <p>
          La gioielleria può cancellare autonomamente il proprio account in qualsiasi momento dalla dashboard o
          scrivendo a{' '}
          <a href="mailto:info@listdreams.it" className="text-amber-600 hover:underline">info@listdreams.it</a>.
        </p>
      </>
    ),
  },
  {
    id: '10',
    title: '10. Modifiche al Servizio e ai Termini',
    content: (
      <p>
        ListDreams si riserva il diritto di modificare la piattaforma, le funzionalità, le commissioni e i presenti
        Termini in qualsiasi momento. Le modifiche sostanziali saranno comunicate via email agli utenti registrati
        con un preavviso di almeno 15 giorni. L&apos;utilizzo continuato del servizio dopo tale periodo costituisce
        accettazione delle modifiche.
      </p>
    ),
  },
  {
    id: '11',
    title: '11. Legge Applicabile e Foro Competente',
    content: (
      <>
        <p className="mb-3">I presenti Termini sono regolati dalla legge italiana.</p>
        <p className="mb-3">
          Per le controversie con le gioiellerie (rapporto B2B), il foro competente esclusivo è quello di{' '}
          <strong>[CITTÀ SEDE LEGALE LISTDREAMS]</strong>.
        </p>
        <p>
          Per le controversie con consumatori (clienti finali), si applica la normativa italiana a tutela del
          consumatore (D.Lgs. 206/2005). Il consumatore può altresì ricorrere alla piattaforma europea di risoluzione
          online delle controversie:{' '}
          <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">
            ec.europa.eu/consumers/odr
          </a>.
        </p>
      </>
    ),
  },
  {
    id: '12',
    title: '12. Contatti',
    content: (
      <>
        <p className="mb-2">Per qualsiasi questione relativa ai presenti Termini:</p>
        <p>
          [RAGIONE SOCIALE] — [INDIRIZZO]<br />
          Email:{' '}
          <a href="mailto:info@listdreams.it" className="text-amber-600 hover:underline">info@listdreams.it</a>
        </p>
      </>
    ),
  },
];

export default function TermsPage() {
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
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Termini e Condizioni di Servizio</h1>
        <p className="text-sm text-gray-400 mb-10">Versione 1.0 — Ultimo aggiornamento: aprile 2025</p>

        <nav className="mb-12 rounded-2xl bg-gray-50 border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Indice</p>
          <ol className="space-y-1 text-sm text-amber-600">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#art-${s.id}`} className="hover:underline">{s.title}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-10 text-sm leading-relaxed text-gray-600">
          {SECTIONS.map((s) => (
            <section key={s.id} id={`art-${s.id}`}>
              <h2 className="text-base font-semibold text-gray-900 mb-3">{s.title}</h2>
              {s.content}
            </section>
          ))}
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
