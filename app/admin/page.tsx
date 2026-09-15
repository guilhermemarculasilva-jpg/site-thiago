import { cookies } from 'next/headers';
import Link from 'next/link';
import { lerSessao, SESSION_COOKIE } from '@/lib/auth';
import Shell from '@/components/admin/Shell';
import Painel from './Painel';

export const dynamic = 'force-dynamic';

export default async function AdminHome() {
  const sessao = await lerSessao(cookies().get(SESSION_COOKIE)?.value);
  const usuario = { nome: sessao?.nome || 'Administrador', email: sessao?.email || '' };

  return (
    <Shell usuario={usuario}>
      <Painel nome={usuario.nome} />
    </Shell>
  );
}
