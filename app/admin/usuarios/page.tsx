import { cookies } from 'next/headers';
import { lerSessao, SESSION_COOKIE } from '@/lib/auth';
import Shell from '@/components/admin/Shell';
import GerenciarUsuarios from './Gerenciar';

export const dynamic = 'force-dynamic';

export default async function UsuariosPage() {
  const sessao = await lerSessao(cookies().get(SESSION_COOKIE)?.value);
  const usuario = { nome: sessao?.nome || 'Administrador', email: sessao?.email || '' };

  return (
    <Shell usuario={usuario}>
      <GerenciarUsuarios emailAtual={usuario.email} />
    </Shell>
  );
}
