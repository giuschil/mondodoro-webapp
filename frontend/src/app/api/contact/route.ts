import { NextRequest, NextResponse } from 'next/server';

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const NOTIFY_EMAIL = 'info@listdreams.it';
const NOTIFY_NAME = 'ListDreams';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { nome, cognome, email, oggetto, messaggio, website } = body;

  // Honeypot check — bots fill the hidden "website" field
  if (website) {
    return NextResponse.json({ ok: true });
  }

  // Basic validation
  if (!nome || !email || !messaggio) {
    return NextResponse.json({ error: 'Campi obbligatori mancanti.' }, { status: 400 });
  }

  if (!BREVO_API_KEY) {
    console.error('BREVO_API_KEY not configured');
    return NextResponse.json({ error: 'Servizio email non configurato.' }, { status: 500 });
  }

  const oggettoLabel: Record<string, string> = {
    supporto: 'Supporto tecnico',
    fatturazione: 'Fatturazione e pagamenti',
    account: 'Gestione account',
    partnership: 'Partnership e collaborazioni',
    altro: 'Altro',
  };
  const oggettoText = oggettoLabel[oggetto] || oggetto || 'Non specificato';
  const mittente = `${nome} ${cognome || ''}`.trim();

  try {
    // 1. Send notification email to team via Brevo transactional API
    const emailRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'ListDreams Form', email: 'noreply@listdreams.it' },
        to: [{ email: NOTIFY_EMAIL, name: NOTIFY_NAME }],
        replyTo: { email, name: mittente },
        subject: `[Contatto] ${oggettoText} — ${mittente}`,
        htmlContent: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #d97706;">Nuovo messaggio da ListDreams</h2>
            <table style="width:100%; border-collapse: collapse; margin-top: 16px;">
              <tr><td style="padding: 8px; font-weight: bold; color: #374151;">Nome</td><td style="padding: 8px; color: #6b7280;">${mittente}</td></tr>
              <tr style="background:#f9fafb"><td style="padding: 8px; font-weight: bold; color: #374151;">Email</td><td style="padding: 8px; color: #6b7280;"><a href="mailto:${email}">${email}</a></td></tr>
              <tr><td style="padding: 8px; font-weight: bold; color: #374151;">Argomento</td><td style="padding: 8px; color: #6b7280;">${oggettoText}</td></tr>
              <tr style="background:#f9fafb"><td style="padding: 8px; font-weight: bold; color: #374151; vertical-align:top">Messaggio</td><td style="padding: 8px; color: #6b7280; white-space: pre-wrap;">${messaggio}</td></tr>
            </table>
          </div>
        `,
      }),
    });

    if (!emailRes.ok) {
      const err = await emailRes.text();
      console.error('Brevo email error:', err);
      return NextResponse.json({ error: 'Errore invio email.' }, { status: 500 });
    }

    // 2. Add/update contact in Brevo (non-blocking — don't fail if this errors)
    fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        attributes: { FIRSTNAME: nome, LASTNAME: cognome || '' },
        updateEnabled: true,
      }),
    }).catch((e) => console.error('Brevo contact upsert error:', e));

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Contact form error:', e);
    return NextResponse.json({ error: 'Errore interno.' }, { status: 500 });
  }
}
