import { NextResponse } from 'next/server';
import { lerJson, gravarJson, githubConfigurado } from '@/lib/github';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ARQUIVO = 'data/leads.json';

export interface Lead {
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

/** GET — lista as mensagens recebidas */
export async function GET() {
  if (!githubConfigurado()) {
    return NextResponse.json({ ok: true, leads: [], aviso: 'GitHub não configurado.' });
  }
  try {
    const { data } = await lerJson<Lead[]>(ARQUIVO, []);
    return NextResponse.json({ ok: true, leads: data });
  } catch (e) {
    return NextResponse.json({ ok: false, message: (e as Error).message }, { status: 500 });
  }
}

/** PATCH — marca como lido / não lido */
export async function PATCH(request: Request) {
  if (!githubConfigurado()) {
    return NextResponse.json({ ok: false, message: 'GitHub não configurado.' }, { status: 503 });
  }

  let body: { id?: string; lido?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Requisição inválida.' }, { status: 400 });
  }

  try {
    const { data: leads, sha } = await lerJson<Lead[]>(ARQUIVO, []);
    const idx = leads.findIndex((l) => l.id === body.id);
    if (idx === -1) {
      return NextResponse.json({ ok: false, message: 'Mensagem não encontrada.' }, { status: 404 });
    }

    leads[idx].lido = Boolean(body.lido);
    // [skip ci]: mudar o status de leitura não precisa republicar o site
    await gravarJson(ARQUIVO, leads, 'atualiza status de mensagem', sha, true);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, message: (e as Error).message }, { status: 500 });
  }
}

/** DELETE — apaga uma mensagem */
export async function DELETE(request: Request) {
  if (!githubConfigurado()) {
    return NextResponse.json({ ok: false, message: 'GitHub não configurado.' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ ok: false, message: 'Mensagem não identificada.' }, { status: 422 });
  }

  try {
    const { data: leads, sha } = await lerJson<Lead[]>(ARQUIVO, []);
    const novos = leads.filter((l) => l.id !== id);
    await gravarJson(ARQUIVO, novos, 'remove mensagem', sha, true);
    return NextResponse.json({ ok: true, message: 'Mensagem excluída.' });
  } catch (e) {
    return NextResponse.json({ ok: false, message: (e as Error).message }, { status: 500 });
  }
}
