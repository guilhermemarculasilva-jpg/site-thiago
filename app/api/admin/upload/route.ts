import { NextResponse } from 'next/server';
import { gravarBinario, githubConfigurado } from '@/lib/github';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const TIPOS_OK = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const TAMANHO_MAX = 4 * 1024 * 1024; // 4 MB

function extensao(mime: string): string {
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  if (mime === 'image/avif') return 'avif';
  return 'jpg';
}

function slugify(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

/** POST — recebe uma foto e grava em public/uploads/ no repositório */
export async function POST(request: Request) {
  if (!githubConfigurado()) {
    return NextResponse.json(
      { ok: false, message: 'GitHub não configurado. Defina GITHUB_TOKEN, GITHUB_OWNER e GITHUB_REPO na Vercel.' },
      { status: 503 }
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, message: 'Envio inválido.' }, { status: 400 });
  }

  const arquivo = form.get('arquivo');
  const prefixo = String(form.get('prefixo') || 'foto');

  if (!(arquivo instanceof File)) {
    return NextResponse.json({ ok: false, message: 'Nenhum arquivo enviado.' }, { status: 422 });
  }

  if (!TIPOS_OK.includes(arquivo.type)) {
    return NextResponse.json(
      { ok: false, message: 'Formato não aceito. Use JPG, PNG ou WebP.' },
      { status: 422 }
    );
  }

  if (arquivo.size > TAMANHO_MAX) {
    return NextResponse.json(
      { ok: false, message: `Foto muito grande (${(arquivo.size / 1024 / 1024).toFixed(1)} MB). O limite é 4 MB.` },
      { status: 422 }
    );
  }

  try {
    const buffer = Buffer.from(await arquivo.arrayBuffer());
    const base64 = buffer.toString('base64');

    const nome = `${slugify(prefixo)}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${extensao(arquivo.type)}`;
    const caminho = `public/uploads/${nome}`;

    const url = await gravarBinario(caminho, base64, `adiciona foto ${nome}`);

    return NextResponse.json({ ok: true, url, message: 'Foto enviada.' });
  } catch (e) {
    return NextResponse.json({ ok: false, message: (e as Error).message }, { status: 500 });
  }
}
