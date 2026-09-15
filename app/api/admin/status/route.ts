import { NextResponse } from 'next/server';
import { testarConexao, githubInfo } from '@/lib/github';
import { usuarioDono } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Diagnóstico do painel — mostra o que está configurado e o que falta.
 * Serve de guia visual para terminar a instalação sem adivinhação.
 */
export async function GET() {
  const info = githubInfo();
  const conexao = info.configurado ? await testarConexao() : { ok: false, erro: 'Não configurado' };

  const checks = [
    {
      nome: 'GITHUB_TOKEN',
      ok: Boolean(process.env.GITHUB_TOKEN),
      detalhe: process.env.GITHUB_TOKEN ? 'definido' : 'faltando — o painel não consegue salvar',
    },
    {
      nome: 'GITHUB_OWNER',
      ok: Boolean(process.env.GITHUB_OWNER),
      detalhe: process.env.GITHUB_OWNER || 'faltando',
    },
    {
      nome: 'GITHUB_REPO',
      ok: Boolean(process.env.GITHUB_REPO),
      detalhe: process.env.GITHUB_REPO || 'faltando',
    },
    {
      nome: 'Conexão com o GitHub',
      ok: conexao.ok,
      detalhe: conexao.ok ? 'gravação liberada' : conexao.erro || 'falhou',
    },
    {
      nome: 'ADMIN_EMAIL / ADMIN_PASSWORD',
      ok: Boolean(usuarioDono()),
      detalhe: usuarioDono() ? 'login principal ativo' : 'faltando',
    },
    {
      nome: 'SESSION_SECRET',
      ok: Boolean(process.env.SESSION_SECRET),
      detalhe: process.env.SESSION_SECRET ? 'definido' : 'usando valor padrão — defina um segredo próprio',
    },
    {
      nome: 'RESEND_API_KEY (e-mail dos leads)',
      ok: Boolean(process.env.RESEND_API_KEY),
      detalhe: process.env.RESEND_API_KEY ? 'ativo' : 'opcional — sem isso os leads só ficam no painel',
    },
  ];

  return NextResponse.json({
    ok: true,
    pronto: checks.slice(0, 5).every((c) => c.ok),
    repositorio: `${info.owner}/${info.repo}`,
    branch: info.branch,
    checks,
  });
}
