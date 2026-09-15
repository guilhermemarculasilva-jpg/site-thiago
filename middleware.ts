/**
 * Protege todas as rotas /admin — exceto a tela de login.
 * Roda no Edge Runtime, por isso lib/auth.ts usa apenas Web Crypto.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { lerSessao, SESSION_COOKIE } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // A tela de login e a API de autenticação ficam liberadas
  if (pathname === '/admin/login' || pathname.startsWith('/api/admin/auth')) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const sessao = await lerSessao(token);

  if (!sessao) {
    // Chamadas de API respondem JSON; navegação vai para o login
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ ok: false, message: 'Sessão expirada. Faça login novamente.' }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
