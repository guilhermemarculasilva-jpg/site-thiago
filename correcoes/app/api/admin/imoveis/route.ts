import { NextResponse } from 'next/server';
import { lerJson, gravarJson, apagarArquivo, githubConfigurado } from '@/lib/github';
import type { Imovel } from '@/lib/imoveis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ARQUIVO = 'data/imoveis.json';

function semGithub() {
  return NextResponse.json(
    {
      ok: false,
      message:
        'GitHub não configurado. Defina GITHUB_TOKEN, GITHUB_OWNER e GITHUB_REPO nas variáveis de ambiente da Vercel.',
    },
    { status: 503 }
  );
}

/** Transforma texto em slug: "Casa no Centro" -> "casa-no-centro" */
function criarSlug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

function num(v: unknown, padrao = 0): number {
  const n = typeof v === 'string' ? parseFloat(v.replace(/[^\d.,-]/g, '').replace(',', '.')) : Number(v);
  return Number.isFinite(n) ? n : padrao;
}

function texto(v: unknown, max = 5000): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

/** Extrai os nomes das fotos que vivem em public/uploads de uma lista de imóveis. */
function fotosDe(imoveis: Imovel[]): Set<string> {
  const usadas = new Set<string>();
  for (const im of imoveis) {
    for (const f of [im.imagem, ...(im.galeria || [])]) {
      if (typeof f === 'string' && f.startsWith('/uploads/')) usadas.add(f);
    }
  }
  return usadas;
}

/**
 * Remove do repositório as fotos que deixaram de ser usadas.
 *
 * Só apaga arquivos em /uploads (enviados pelo painel) — nunca toca em
 * imagens externas. Compara contra TODOS os imóveis restantes, então uma
 * foto reaproveitada em outro anúncio é preservada.
 */
async function limparFotosOrfas(antes: Imovel[], depois: Imovel[]): Promise<number> {
  const usadasAntes = fotosDe(antes);
  const usadasDepois = fotosDe(depois);

  const orfas = Array.from(usadasAntes).filter((f) => !usadasDepois.has(f));
  if (orfas.length === 0) return 0;

  let removidas = 0;
  for (const url of orfas) {
    const caminho = `public${url}`; // /uploads/foo.jpg -> public/uploads/foo.jpg
    try {
      await apagarArquivo(caminho, `remove foto não utilizada ${url.split('/').pop()}`);
      removidas++;
    } catch (e) {
      // Falhar aqui não pode quebrar a operação principal do usuário
      console.error('[limpeza] não removeu', caminho, (e as Error).message);
    }
  }
  return removidas;
}

function normalizar(bruto: Record<string, unknown>, existentes: Imovel[], slugAtual?: string): Imovel | string {
  const titulo = texto(bruto.titulo, 160);
  if (!titulo) return 'O título é obrigatório.';

  let slug = texto(bruto.slug, 60) || criarSlug(titulo);
  if (!slug) slug = `imovel-${Date.now()}`;

  // Garante slug único
  const conflito = (s: string) => existentes.some((i) => i.slug === s && i.slug !== slugAtual);
  if (conflito(slug)) {
    let n = 2;
    while (conflito(`${slug}-${n}`)) n++;
    slug = `${slug}-${n}`;
  }

  const tiposValidos = ['casa', 'apartamento', 'terreno', 'comercial'];
  const finsValidas = ['venda', 'aluguel', 'lancamento'];

  const tipo = texto(bruto.tipo) as Imovel['tipo'];
  const finalidade = texto(bruto.finalidade) as Imovel['finalidade'];

  const galeria = Array.isArray(bruto.galeria)
    ? (bruto.galeria as unknown[]).map((g) => texto(g, 500)).filter(Boolean).slice(0, 30)
    : [];

  const imagem = texto(bruto.imagem, 500) || galeria[0] || '';
  if (!imagem) return 'Adicione pelo menos uma foto.';

  return {
    slug,
    titulo,
    descricao: texto(bruto.descricao, 5000),
    valor: num(bruto.valor),
    area: num(bruto.area),
    quartos: num(bruto.quartos),
    banheiros: num(bruto.banheiros),
    vagas: num(bruto.vagas),
    endereco: texto(bruto.endereco, 200),
    cidade: texto(bruto.cidade, 100) || 'Barreiras',
    bairro: texto(bruto.bairro, 100),
    codigo: texto(bruto.codigo, 30) || `TB-${String(existentes.length + 1).padStart(3, '0')}`,
    tipo: tiposValidos.includes(tipo) ? tipo : 'casa',
    finalidade: finsValidas.includes(finalidade) ? finalidade : 'venda',
    destaque: Boolean(bruto.destaque),
    imagem,
    galeria,
  };
}

/** GET — lista todos os imóveis */
export async function GET() {
  if (!githubConfigurado()) return semGithub();
  try {
    const { data } = await lerJson<Imovel[]>(ARQUIVO, []);
    return NextResponse.json({ ok: true, imoveis: data });
  } catch (e) {
    return NextResponse.json({ ok: false, message: (e as Error).message }, { status: 500 });
  }
}

/** POST — cria um imóvel */
export async function POST(request: Request) {
  if (!githubConfigurado()) return semGithub();

  let bruto: Record<string, unknown>;
  try {
    bruto = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Requisição inválida.' }, { status: 400 });
  }

  try {
    const { data: imoveis, sha } = await lerJson<Imovel[]>(ARQUIVO, []);
    const resultado = normalizar(bruto, imoveis);
    if (typeof resultado === 'string') {
      return NextResponse.json({ ok: false, message: resultado }, { status: 422 });
    }

    const novos = [resultado, ...imoveis];
    await gravarJson(ARQUIVO, novos, `adiciona imóvel: ${resultado.titulo}`, sha);

    return NextResponse.json({ ok: true, imovel: resultado, message: 'Imóvel criado! O site será atualizado em ~1 minuto.' });
  } catch (e) {
    return NextResponse.json({ ok: false, message: (e as Error).message }, { status: 500 });
  }
}

/** PUT — atualiza um imóvel existente */
export async function PUT(request: Request) {
  if (!githubConfigurado()) return semGithub();

  let bruto: Record<string, unknown>;
  try {
    bruto = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Requisição inválida.' }, { status: 400 });
  }

  const slugOriginal = texto(bruto.slugOriginal, 60);
  if (!slugOriginal) {
    return NextResponse.json({ ok: false, message: 'Imóvel não identificado.' }, { status: 422 });
  }

  try {
    const { data: imoveis, sha } = await lerJson<Imovel[]>(ARQUIVO, []);
    const idx = imoveis.findIndex((i) => i.slug === slugOriginal);
    if (idx === -1) {
      return NextResponse.json({ ok: false, message: 'Imóvel não encontrado.' }, { status: 404 });
    }

    const resultado = normalizar(bruto, imoveis, slugOriginal);
    if (typeof resultado === 'string') {
      return NextResponse.json({ ok: false, message: resultado }, { status: 422 });
    }

    const novos = [...imoveis];
    novos[idx] = resultado;
    await gravarJson(ARQUIVO, novos, `atualiza imóvel: ${resultado.titulo}`, sha);

    // Fotos que foram retiradas deste imóvel e não são usadas por nenhum outro
    const removidas = await limparFotosOrfas(imoveis, novos);

    return NextResponse.json({
      ok: true,
      imovel: resultado,
      message:
        'Alterações salvas! O site será atualizado em ~1 minuto.' +
        (removidas ? ` (${removidas} foto${removidas > 1 ? 's' : ''} sem uso removida${removidas > 1 ? 's' : ''})` : ''),
    });
  } catch (e) {
    return NextResponse.json({ ok: false, message: (e as Error).message }, { status: 500 });
  }
}

/** DELETE — remove um imóvel */
export async function DELETE(request: Request) {
  if (!githubConfigurado()) return semGithub();

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  if (!slug) {
    return NextResponse.json({ ok: false, message: 'Imóvel não identificado.' }, { status: 422 });
  }

  try {
    const { data: imoveis, sha } = await lerJson<Imovel[]>(ARQUIVO, []);
    const alvo = imoveis.find((i) => i.slug === slug);
    if (!alvo) {
      return NextResponse.json({ ok: false, message: 'Imóvel não encontrado.' }, { status: 404 });
    }

    const novos = imoveis.filter((i) => i.slug !== slug);
    await gravarJson(ARQUIVO, novos, `remove imóvel: ${alvo.titulo}`, sha);

    // Apaga as fotos que pertenciam só a este imóvel
    const removidas = await limparFotosOrfas(imoveis, novos);

    return NextResponse.json({
      ok: true,
      message:
        'Imóvel excluído.' +
        (removidas ? ` ${removidas} foto${removidas > 1 ? 's' : ''} também removida${removidas > 1 ? 's' : ''}.` : ''),
    });
  } catch (e) {
    return NextResponse.json({ ok: false, message: (e as Error).message }, { status: 500 });
  }
}
