import { cookies } from 'next/headers';
import Link from 'next/link';
import { lerSessao, SESSION_COOKIE } from '@/lib/auth';
import Shell from '@/components/admin/Shell';
import EditorImovel from '@/components/admin/EditorImovel';

export const dynamic = 'force-dynamic';

export default async function NovoImovelPage() {
  const sessao = await lerSessao(cookies().get(SESSION_COOKIE)?.value);
  const usuario = { nome: sessao?.nome || 'Administrador', email: sessao?.email || '' };

  return (
    <Shell usuario={usuario}>
      <div className="adm-topo">
        <div>
          <Link href="/admin/imoveis" style={{ color: '#9a9aa6', fontSize: 14, textDecoration: 'none' }}>
            ← Voltar para imóveis
          </Link>
          <h1 className="adm-titulo" style={{ marginTop: 8 }}>Novo imóvel</h1>
          <p className="adm-sub">Preencha os dados e adicione as fotos.</p>
        </div>
      </div>

      <EditorImovel />
    </Shell>
  );
}
