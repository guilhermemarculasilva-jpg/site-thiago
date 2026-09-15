import { NextResponse } from 'next/server';
import { lerJson, gravarJson, githubConfigurado } from '@/lib/github';

/**
 * Recebe o formulário de contato do site.
 *
 * Faz duas coisas, de forma independente:
 *   1. Grava o lead em data/leads.json (aparece no painel /admin/leads)
 *   2. Envia um e-mail de aviso, se RESEND_API_KEY estiver configurada
 *
 * Se uma falhar, a outra ainda acontece — o lead nunca se perde silenciosamente.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ARQUIVO_LEADS = 'data/leads.json';

interface ContatoPayload {
  name?: string;
  email?: string;
  phone?: string;
  interest?: string;
  message?: string;
  origem?: string;
}

interface Lead {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  interesse: string;
  mensagem: string;
  recebidoEm: string;
  lido: boolean;
  origem?: string;
}

function sanitize(v: unknown): string {
  return typeof v === 'string' ? v.trim().slice(0, 2000) : '';
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function salvarLead(lead: Lead): Promise<boolean> {
  if (!githubConfigurado()) return false;
  try {
    const { data: leads, sha } = await lerJson<Lead[]>(ARQUIVO_LEADS, []);
    // Mantém no máximo 500 mensagens, das mais novas para as mais antigas
    const novos = [lead, ...leads].slice(0, 500);
    // [skip ci]: receber um lead não deve republicar o site
    await gravarJson(ARQUIVO_LEADS, novos, `novo contato de ${lead.nome}`, sha, true);
    return true;
  } catch (e) {
    console.error('[contato] falha ao gravar lead:', (e as Error).message);
    return false;
  }
}

async function enviarEmail(lead: Lead): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const destino = process.env.CONTACT_TO;
  if (!apiKey || !destino) return false;

  const remetente = process.env.CONTACT_FROM || 'Site Bostock Imóveis <onboarding@resend.dev>';

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: remetente,
        to: [destino],
        reply_to: lead.email,
        subject: `Novo contato pelo site — ${lead.nome}`,
        html: `
          <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:600px">
            <h2 style="color:#D4AF37;border-bottom:2px solid #D4AF37;padding-bottom:8px">
              Novo contato pelo site
            </h2>
            <table style="width:100%;border-collapse:collapse;margin:16px 0">
              <tr><td style="padding:8px 0;color:#666;width:110px">Nome</td><td style="padding:8px 0"><strong>${lead.nome}</strong></td></tr>
              <tr><td style="padding:8px 0;color:#666">E-mail</td><td style="padding:8px 0"><a href="mailto:${lead.email}">${lead.email}</a></td></tr>
              <tr><td style="padding:8px 0;color:#666">Telefone</td><td style="padding:8px 0">${lead.telefone || '—'}</td></tr>
              <tr><td style="padding:8px 0;color:#666">Interesse</td><td style="padding:8px 0">${lead.interesse || '—'}</td></tr>
            </table>
            <div style="background:#f6f6f6;padding:16px;border-radius:8px;white-space:pre-wrap">${lead.mensagem}</div>
            <p style="color:#888;font-size:13px;margin-top:20px">
              Recebido em ${new Date(lead.recebidoEm).toLocaleString('pt-BR')}
            </p>
          </div>
        `,
      }),
    });
    if (!res.ok) {
      console.error('[contato] Resend respondeu', res.status, (await res.text()).slice(0, 200));
      return false;
    }
    return true;
  } catch (e) {
    console.error('[contato] falha ao enviar e-mail:', (e as Error).message);
    return false;
  }
}

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
    return NextResponse.json({ ok: false, message: 'Preencha nome, e-mail e mensagem.' }, { status: 422 });
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, message: 'E-mail inválido.' }, { status: 422 });
  }

  const lead: Lead = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    nome: name,
    email,
    telefone: phone,
    interesse: interest,
    mensagem: message,
    recebidoEm: new Date().toISOString(),
    lido: false,
    origem: sanitize(body.origem) || 'site',
  };

  // As duas tarefas rodam juntas; nenhuma bloqueia a outra
  const [salvou, enviou] = await Promise.all([salvarLead(lead), enviarEmail(lead)]);

  if (!salvou && !enviou) {
    // Nada funcionou — registra no log da Vercel para não perder o contato
    console.log('[contato][NAO-PERSISTIDO]', JSON.stringify(lead));
  }

  return NextResponse.json({
    ok: true,
    message: 'Mensagem recebida! Entrarei em contato em breve.',
  });
}
