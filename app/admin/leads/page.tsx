import { cookies } from 'next/headers';
import { lerSessao, SESSION_COOKIE } from '@/lib/auth';
import Shell from '@/components/admin/Shell';
import ListaLeads from './Lista';

export const dynamic = 'force-dynamic';

export default async function LeadsPage() {
  const sessao = await lerSessao(cookies().get(SESSION_COOKIE)?.value);
  const usuario = { nome: sessao?.nome || 'Administrador', email: sessao?.email || '' };

  return (
    <Shell usuario={usuario}>
      <ListaLeads />
    </Shell>
  );
}
