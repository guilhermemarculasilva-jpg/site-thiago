import { NextResponse } from 'next/server';
import {
  SESSION_COOKIE,
  SESSION_DAYS,
  criarSessao,
  verifyPassword,
  usuarioDono,
  type Usuario,
} from '@/lib/auth';
import { lerJson, githubConfigurado } from '@/lib/github';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ARQUIVO_USUARIOS = 'data/usuarios.json';

/** POST /api/admin/auth — login */
export async function POST(request: Request) {
  let body: { email?: string; senha?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Requisição inválida.' }, { status: 400 });
  }

  const email = (body.email || '').trim().toLowerCase();
  const senha = body.senha || '';

  if (!email || !senha) {
    return NextResponse.json({ ok: false, message: 'Informe e-mail e senha.' }, { status: 422 });
  }

  let nome = '';
  let autenticado = false;

  // 1) Usuário dono (variáveis de ambiente) — senha em texto puro, comparação direta
  const dono = usuarioDono();
  if (dono && dono.email === email) {
    if (senha === dono.senha) {
      autenticado = true;
      nome = dono.nome;
    }
  }

  // 2) Usuários cadastrados no painel (senha com hash PBKDF2)
  if (!autenticado && githubConfigurado()) {
    try {
      const { data: usuarios } = await lerJson<Usuario[]>(ARQUIVO_USUARIOS, []);
      const u = usuarios.find((x) => x.email.toLowerCase() === email);
      if (u && (await verifyPassword(senha, u.senha))) {
        autenticado = true;
        nome = u.nome;
      }
    } catch {
      // Se o GitHub falhar, o login do dono ainda funciona
    }
  }

  if (!autenticado) {
    // Atraso pequeno desencoraja força bruta
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ ok: false, message: 'E-mail ou senha incorretos.' }, { status: 401 });
  }

  const token = await criarSessao(email, nome);
  const res = NextResponse.json({ ok: true, nome });

  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 86400,
  });

  return res;
}

/** DELETE /api/admin/auth — logout */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
