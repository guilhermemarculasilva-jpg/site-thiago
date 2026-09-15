import { NextResponse } from 'next/server';

/**
 * Substitui tb_contact_form() + wp_mail() do WordPress.
 * Roda como Serverless Function na Vercel.
 *
 * Para efetivamente ENVIAR o e-mail, configure um provedor. Exemplo com Resend:
 *   1. npm install resend
 *   2. Defina RESEND_API_KEY e CONTACT_TO nas Environment Variables da Vercel
 *   3. Descomente o bloco marcado abaixo
 *
 * Sem provedor configurado, a rota valida os dados e registra no log —
 * o site continua funcional e o lead não se perde pelo WhatsApp.
 */

export const runtime = 'nodejs';

interface ContatoPayload {
  name?: string;
  email?: string;
  phone?: string;
  interest?: string;
  message?: string;
}

function sanitize(v: unknown): string {
  return typeof v === 'string' ? v.trim().slice(0, 2000) : '';
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: ContatoPayload;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Requisição inválida.' }, { status: 400 });
  }

  const name = sanitize(body.name);
  const email = sanitize(body.email);
  const phone = sanitize(body.phone);
  const interest = sanitize(body.interest);
  const message = sanitize(body.message);

  if (!name || !email || !message) {
    return NextResponse.json(
      { ok: false, message: 'Preencha nome, e-mail e mensagem.' },
      { status: 422 }
    );
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, message: 'E-mail inválido.' }, { status: 422 });
  }

  // ---------------------------------------------------------------
  // ENVIO DE E-MAIL — descomente após configurar o provedor
  // ---------------------------------------------------------------
  // import { Resend } from 'resend';
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: 'Site Thiago Bostock <site@thiagobostock.com.br>',
  //   to: process.env.CONTACT_TO!,
  //   replyTo: email,
  //   subject: `Novo contato pelo site — ${name}`,
  //   text: [
  //     `Nome: ${name}`,
  //     `E-mail: ${email}`,
  //     `Telefone: ${phone || '—'}`,
  //     `Interesse: ${interest || '—'}`,
  //     '',
  //     message,
  //   ].join('\n'),
  // });
  // ---------------------------------------------------------------

  console.log('[contato]', { name, email, phone, interest, message });

  return NextResponse.json({
    ok: true,
    message: 'Mensagem recebida! Entrarei em contato em breve.',
  });
}
