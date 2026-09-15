import { NextResponse } from 'next/server';
import { lerJson, gravarJson, githubConfigurado } from '@/lib/github';
import type { SiteConfig } from '@/lib/config';
import configLocal from '@/data/config.json';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ARQUIVO = 'data/config.json';

function texto(v: unknown, max = 2000): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

/** GET — devolve as configurações atuais */
export async function GET() {
  if (!githubConfigurado()) {
    return NextResponse.json({ ok: true, config: configLocal, aviso: 'GitHub não configurado — exibindo cópia local.' });
  }
  try {
    const { data } = await lerJson<SiteConfig>(ARQUIVO, configLocal as SiteConfig);
    return NextResponse.json({ ok: true, config: data });
  } catch (e) {
    return NextResponse.json({ ok: false, message: (e as Error).message }, { status: 500 });
  }
}

/** PUT — salva as configurações */
export async function PUT(request: Request) {
  if (!githubConfigurado()) {
    return NextResponse.json(
      { ok: false, message: 'GitHub não configurado. Defina GITHUB_TOKEN, GITHUB_OWNER e GITHUB_REPO na Vercel.' },
      { status: 503 }
    );
  }

  let bruto: Partial<SiteConfig>;
  try {
    bruto = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Requisição inválida.' }, { status: 400 });
  }

  try {
    const { data: atual, sha } = await lerJson<SiteConfig>(ARQUIVO, configLocal as SiteConfig);

    // Mescla preservando a estrutura — evita que um campo faltante apague uma seção
    const novo: SiteConfig = {
      contato: {
        telefone: texto(bruto.contato?.telefone, 40) || atual.contato.telefone,
        whatsapp: texto(bruto.contato?.whatsapp, 20).replace(/\D/g, '') || atual.contato.whatsapp,
        email: texto(bruto.contato?.email, 120) || atual.contato.email,
        creci: texto(bruto.contato?.creci, 20) || atual.contato.creci,
        localizacao: texto(bruto.contato?.localizacao, 120) || atual.contato.localizacao,
        horario: texto(bruto.contato?.horario, 120) || atual.contato.horario,
      },
      hero: {
        eyebrow: texto(bruto.hero?.eyebrow, 80) || atual.hero.eyebrow,
        titulo: texto(bruto.hero?.titulo, 80) || atual.hero.titulo,
        tituloDestaque: texto(bruto.hero?.tituloDestaque, 80) || atual.hero.tituloDestaque,
        subtitulo: texto(bruto.hero?.subtitulo, 400) || atual.hero.subtitulo,
        imagemFundo: texto(bruto.hero?.imagemFundo, 500) || atual.hero.imagemFundo,
        fotoCorretor: texto(bruto.hero?.fotoCorretor, 500) || atual.hero.fotoCorretor,
        stats: Array.isArray(bruto.hero?.stats)
          ? bruto.hero!.stats.slice(0, 4).map((s) => ({
              numero: texto(s?.numero, 20),
              label: texto(s?.label, 40),
            }))
          : atual.hero.stats,
      },
      sobre: {
        foto: texto(bruto.sobre?.foto, 500) || atual.sobre.foto,
        paragrafo1: texto(bruto.sobre?.paragrafo1, 1500) || atual.sobre.paragrafo1,
        paragrafo2: texto(bruto.sobre?.paragrafo2, 1500) || atual.sobre.paragrafo2,
      },
      bancos: Array.isArray(bruto.bancos)
        ? bruto.bancos
            .slice(0, 10)
            .map((b) => ({
              nome: texto(b?.nome, 60),
              taxa: texto(b?.taxa, 40),
              sigla: texto(b?.sigla, 6),
            }))
            .filter((b) => b.nome)
        : atual.bancos,
      depoimentos: Array.isArray(bruto.depoimentos)
        ? bruto.depoimentos
            .slice(0, 12)
            .map((d) => ({
              inicial: texto(d?.inicial, 2) || texto(d?.nome, 1).toUpperCase(),
              texto: texto(d?.texto, 800),
              nome: texto(d?.nome, 80),
              cidade: texto(d?.cidade, 80),
            }))
            .filter((d) => d.nome && d.texto)
        : atual.depoimentos,
    };

    await gravarJson(ARQUIVO, novo, 'atualiza configurações do site', sha);

    return NextResponse.json({ ok: true, config: novo, message: 'Configurações salvas! O site será atualizado em ~1 minuto.' });
  } catch (e) {
    return NextResponse.json({ ok: false, message: (e as Error).message }, { status: 500 });
  }
}
