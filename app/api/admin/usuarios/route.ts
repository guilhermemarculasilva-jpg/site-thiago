import { NextResponse } from 'next/server';
import { lerJson, gravarJson, githubConfigurado } from '@/lib/github';
import { hashPassword, usuarioDono, lerSessao, SESSION_COOKIE, type Usuario } from '@/lib/auth';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ARQUIVO = 'data/usuarios.json';

function semGithub() {
  return NextResponse.json({ ok: false, message: 'GitHub não configurado.' }, { status: 503 });
}

/** GET — lista os usuários (sem expor os hashes de senha) */
export async function GET() {
  const dono = usuarioDono();
  const lista: { email: string; nome: string; tipo: string }[] = [];

  if (dono) {
    lista.push({ email: dono.email, nome: dono.nome, tipo: 'dono' });
  }

  if (githubConfigurado()) {
    try {
      const { data } = await lerJson<Usuario[]>(ARQUIVO, []);
      data.forEach((u) => lista.push({ email: u.email, nome: u.nome, tipo: 'equipe' }));
    } catch {
      /* ignora */
    }
  }

  return NextResponse.json({ ok: true, usuarios: lista });
}

/** POST — cadastra um novo usuário */
export async function POST(request: Request) {
  if (!githubConfigurado()) return semGithub();

  let body: { email?: string; nome?: string; senha?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Requisição inválida.' }, { status: 400 });
  }

  const email = (body.email || '').trim().toLowerCase();
  const nome = (body.nome || '').trim().slice(0, 80);
  const senha = body.senha || '';

  if (!email || !nome || !senha) {
    return NextResponse.json({ ok: false, message: 'Preencha nome, e-mail e senha.' }, { status: 422 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, message: 'E-mail inválido.' }, { status: 422 });
  }
  if (senha.length < 8) {
    return NextResponse.json({ ok: false, message: 'A senha precisa ter pelo menos 8 caracteres.' }, { status: 422 });
  }

  const dono = usuarioDono();
  if (dono && dono.email === email) {
    return NextResponse.json({ ok: false, message: 'Este e-mail já é o do administrador principal.' }, { status: 422 });
  }

  try {
    const { data: usuarios, sha } = await lerJson<Usuario[]>(ARQUIVO, []);
    if (usuarios.some((u) => u.email.toLowerCase() === email)) {
      return NextResponse.json({ ok: false, message: 'Já existe um usuário com este e-mail.' }, { status: 422 });
    }

    const novo: Usuario = {
      email,
      nome,
      senha: await hashPassword(senha),
      criadoEm: new Date().toISOString(),
    };

    // [skip ci]: usuários não afetam o site público
    await gravarJson(ARQUIVO, [...usuarios, novo], `adiciona usuário ${email}`, sha, true);

    return NextResponse.json({ ok: true, message: 'Usuário criado.' });
  } catch (e) {
    return NextResponse.json({ ok: false, message: (e as Error).message }, { status: 500 });
  }
}

/** DELETE — remove um usuário */
export async function DELETE(request: Request) {
  if (!githubConfigurado()) return semGithub();

  const { searchParams } = new URL(request.url);
  const email = (searchParams.get('email') || '').toLowerCase();
  if (!email) {
    return NextResponse.json({ ok: false, message: 'Usuário não identificado.' }, { status: 422 });
  }

  const dono = usuarioDono();
  if (dono && dono.email === email) {
    return NextResponse.json(
      { ok: false, message: 'O administrador principal não pode ser removido pelo painel.' },
      { status: 422 }
    );
  }

  // Impede que o usuário apague a si mesmo e perca o acesso
  const sessao = await lerSessao(cookies().get(SESSION_COOKIE)?.value);
  if (sessao && sessao.email.toLowerCase() === email) {
    return NextResponse.json({ ok: false, message: 'Você não pode remover o próprio acesso.' }, { status: 422 });
  }

  try {
    const { data: usuarios, sha } = await lerJson<Usuario[]>(ARQUIVO, []);
    const novos = usuarios.filter((u) => u.email.toLowerCase() !== email);
    await gravarJson(ARQUIVO, novos, `remove usuário ${email}`, sha, true);
    return NextResponse.json({ ok: true, message: 'Usuário removido.' });
  } catch (e) {
    return NextResponse.json({ ok: false, message: (e as Error).message }, { status: 500 });
  }
}
