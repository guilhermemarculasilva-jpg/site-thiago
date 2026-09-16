import { NextResponse } from 'next/server';
import { lerJson, apagarArquivo, githubConfigurado } from '@/lib/github';
import type { Imovel } from '@/lib/imoveis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Faxina de fotos órfãs.
 *
 * Varre public/uploads e compara com as fotos realmente usadas nos imóveis.
 * GET  = apenas relata o que está sobrando (não apaga nada)
 * POST = apaga de fato
 *
 * Serve para limpar o acúmulo de uploads feitos em cadastros abandonados.
 */

function env() {
  return {
    token: process.env.GITHUB_TOKEN || '',
    owner: process.env.GITHUB_OWNER || '',
    repo: process.env.GITHUB_REPO || '',
    branch: process.env.GITHUB_BRANCH || 'main',
  };
}

interface ArquivoGh {
  name: string;
  size: number;
}

async function listarUploads(): Promise<ArquivoGh[]> {
  const { token, owner, repo, branch } = env();
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/public/uploads?ref=${branch}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'bostock-admin',
    },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const json = (await res.json()) as ArquivoGh[];
  return Array.isArray(json) ? json.filter((f) => f.name !== '.gitkeep') : [];
}

async function calcular() {
  const [arquivos, { data: imoveis }] = await Promise.all([
    listarUploads(),
    lerJson<Imovel[]>('data/imoveis.json', []),
  ]);

  const usadas = new Set<string>();
  for (const im of imoveis) {
    for (const f of [im.imagem, ...(im.galeria || [])]) {
      if (typeof f === 'string' && f.startsWith('/uploads/')) {
        usadas.add(f.split('/').pop()!);
      }
    }
  }

  const orfas = arquivos.filter((a) => !usadas.has(a.name));
  const pesoOrfas = orfas.reduce((s, a) => s + a.size, 0);
  const pesoTotal = arquivos.reduce((s, a) => s + a.size, 0);

  return { arquivos, orfas, pesoOrfas, pesoTotal, usadas: usadas.size };
}

/** GET — relatório, sem apagar nada */
export async function GET() {
  if (!githubConfigurado()) {
    return NextResponse.json({ ok: false, message: 'GitHub não configurado.' }, { status: 503 });
  }
  try {
    const r = await calcular();
    return NextResponse.json({
      ok: true,
      total: r.arquivos.length,
      usadas: r.usadas,
      orfas: r.orfas.length,
      pesoOrfasMB: +(r.pesoOrfas / 1024 / 1024).toFixed(2),
      pesoTotalMB: +(r.pesoTotal / 1024 / 1024).toFixed(2),
      arquivos: r.orfas.map((o) => ({ nome: o.name, kb: Math.round(o.size / 1024) })),
    });
  } catch (e) {
    return NextResponse.json({ ok: false, message: (e as Error).message }, { status: 500 });
  }
}

/** POST — apaga as fotos órfãs */
export async function POST() {
  if (!githubConfigurado()) {
    return NextResponse.json({ ok: false, message: 'GitHub não configurado.' }, { status: 503 });
  }
  try {
    const r = await calcular();
    if (r.orfas.length === 0) {
      return NextResponse.json({ ok: true, removidas: 0, message: 'Nenhuma foto sobrando. Tudo limpo!' });
    }

    let removidas = 0;
    for (const o of r.orfas) {
      try {
        await apagarArquivo(`public/uploads/${o.name}`, `remove foto não utilizada ${o.name}`);
        removidas++;
      } catch (e) {
        console.error('[limpeza]', o.name, (e as Error).message);
      }
    }

    const mb = (r.pesoOrfas / 1024 / 1024).toFixed(2);
    return NextResponse.json({
      ok: true,
      removidas,
      message: `${removidas} foto${removidas > 1 ? 's' : ''} removida${removidas > 1 ? 's' : ''} — ${mb} MB liberados.`,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, message: (e as Error).message }, { status: 500 });
  }
}
