import { cookies } from 'next/headers';
import Link from 'next/link';
import { lerSessao, SESSION_COOKIE } from '@/lib/auth';
import { lerJson, githubConfigurado } from '@/lib/github';
import Shell from '@/components/admin/Shell';
import EditorImovel from '@/components/admin/EditorImovel';
import type { Imovel } from '@/lib/imoveis';

export const dynamic = 'force-dynamic';

export default async function EditarImovelPage({ params }: { params: { slug: string } }) {
  const sessao = await lerSessao(cookies().get(SESSION_COOKIE)?.value);
  const usuario = { nome: sessao?.nome || 'Administrador', email: sessao?.email || '' };

  let imovel: Imovel | undefined;
  let erro = '';

  if (githubConfigurado()) {
    try {
      const { data } = await lerJson<Imovel[]>('data/imoveis.json', []);
      imovel = data.find((i) => i.slug === params.slug);
    } catch (e) {
      erro = (e as Error).message;
    }
  } else {
    erro = 'GitHub não configurado — não é possível editar.';
  }

  return (
    <Shell usuario={usuario}>
      <div className="adm-topo">
        <div>
          <Link href="/admin/imoveis" style={{ color: '#9a9aa6', fontSize: 14, textDecoration: 'none' }}>
            ← Voltar para imóveis
          </Link>
          <h1 className="adm-titulo" style={{ marginTop: 8 }}>
            {imovel ? 'Editar imóvel' : 'Imóvel não encontrado'}
          </h1>
          {imovel && <p className="adm-sub">{imovel.titulo}</p>}
        </div>
        {imovel && (
          <a href={`/imoveis/${imovel.slug}`} target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn-linha">
            Ver no site
          </a>
        )}
      </div>

      {erro && <div className="adm-aviso adm-aviso-erro">{erro}</div>}

      {imovel ? (
        <EditorImovel imovel={imovel} />
      ) : (
        !erro && (
          <div className="adm-vazio">
            <p>Este imóvel não existe mais ou o endereço está errado.</p>
            <Link href="/admin/imoveis" className="adm-btn adm-btn-ouro">
              Ver todos os imóveis
            </Link>
          </div>
        )
      )}
    </Shell>
  );
}
