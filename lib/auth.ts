/**
 * Autenticação do painel administrativo.
 *
 * Usa Web Crypto (disponível no Node 18+ e no Edge Runtime), então o mesmo
 * código funciona tanto no middleware quanto nas rotas de API.
 *
 * - Senhas: PBKDF2-SHA256, 150.000 iterações, salt aleatório por usuário.
 * - Sessão: cookie httpOnly assinado com HMAC-SHA256 (sem dependência externa).
 */

export const SESSION_COOKIE = 'tb_session';
export const SESSION_DAYS = 7;

export interface Usuario {
  email: string;
  nome: string;
  senha: string; // formato: pbkdf2$<iter>$<salt>$<hash>
  criadoEm?: string;
}

export interface Sessao {
  email: string;
  nome: string;
  exp: number; // timestamp em segundos
}

const ITERATIONS = 150_000;

function secret(): string {
  return process.env.SESSION_SECRET || 'tb-dev-secret-troque-em-producao';
}

/* ---------------------------------------------------------------- helpers */

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function b64urlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(str: string): string {
  const pad = str.length % 4 ? '='.repeat(4 - (str.length % 4)) : '';
  const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/') + pad);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function b64urlFromBuffer(buf: ArrayBuffer): string {
  let bin = '';
  new Uint8Array(buf).forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Comparação em tempo constante — evita timing attacks. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/* --------------------------------------------------------------- password */

async function pbkdf2(password: string, salt: string, iterations: number): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode(salt), iterations, hash: 'SHA-256' },
    key,
    256
  );
  return toHex(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const salt = Array.from(saltBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const hash = await pbkdf2(password, salt, ITERATIONS);
  return `pbkdf2$${ITERATIONS}$${salt}$${hash}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (!stored) return false;
  const parts = stored.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;
  const iterations = parseInt(parts[1], 10);
  if (!Number.isFinite(iterations) || iterations < 1000) return false;
  const hash = await pbkdf2(password, parts[2], iterations);
  return safeEqual(hash, parts[3]);
}

/* ---------------------------------------------------------------- session */

async function hmac(data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return b64urlFromBuffer(sig);
}

export async function criarSessao(email: string, nome: string): Promise<string> {
  const payload: Sessao = {
    email,
    nome,
    exp: Math.floor(Date.now() / 1000) + SESSION_DAYS * 86400,
  };
  const body = b64urlEncode(JSON.stringify(payload));
  const sig = await hmac(body);
  return `${body}.${sig}`;
}

export async function lerSessao(token: string | undefined): Promise<Sessao | null> {
  if (!token || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;

  const esperado = await hmac(body);
  if (!safeEqual(sig, esperado)) return null;

  try {
    const payload = JSON.parse(b64urlDecode(body)) as Sessao;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ users */

/**
 * Usuário "dono", definido por variáveis de ambiente.
 * Sempre funciona, mesmo que o arquivo de usuários esteja vazio ou corrompido —
 * é a porta de entrada que não trava.
 */
export function usuarioDono(): { email: string; senha: string; nome: string } | null {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const senha = process.env.ADMIN_PASSWORD || '';
  if (!email || !senha) return null;
  return { email, senha, nome: process.env.ADMIN_NOME || 'Administrador' };
}
