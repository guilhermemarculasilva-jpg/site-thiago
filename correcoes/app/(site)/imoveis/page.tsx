import type { Metadata } from 'next';
import Link from 'next/link';
import { filtrarImoveis, TIPOS, FINALIDADES } from '@/lib/imoveis';
import PropertyCard from '@/components/PropertyCard';
import { whatsappLink } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Imóveis à Venda em Barreiras e Região',
  description:
    'Confira o portfólio completo de imóveis de alto padrão em Barreiras e região: casas, apartamentos, terrenos e salas comerciais.',
};

export default function ImoveisPage({
  searchParams,
}: {
  searchParams: { s?: string; tipo?: string; finalidade?: string };
}) {
  const imoveis = filtrarImoveis(searchParams);
  const temFiltro = Boolean(searchParams.s || searchParams.tipo || searchParams.finalidade);

  return (
    <main id="primary" className="site-main" role="main">
      <section className="page-hero">
        <div className="container">
          <span className="section-label">Portfólio Completo</span>
          <h1 className="page-hero-title">
            Nossos <span>Imóveis</span>
          </h1>
          <p className="page-hero-desc">
            {imoveis.length} {imoveis.length === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}
            {temFiltro && ' com os filtros aplicados'}
          </p>
        </div>
      </section>

      <section className="section-py">
        <div className="container">
          {/* Filtros rápidos */}
          <div className="filters-bar">
            <Link href="/imoveis" className={`filter-chip${!temFiltro ? ' active' : ''}`}>
              Todos
            </Link>
            {FINALIDADES.map((f) => (
              <Link
                key={f.value}
                href={`/imoveis?finalidade=${f.value}`}
                className={`filter-chip${searchParams.finalidade === f.value ? ' active' : ''}`}
              >
                {f.label}
              </Link>
            ))}
            {TIPOS.map((t) => (
              <Link
                key={t.value}
                href={`/imoveis?tipo=${t.value}`}
                className={`filter-chip${searchParams.tipo === t.value ? ' active' : ''}`}
              >
                {t.label}
              </Link>
            ))}
          </div>

          {imoveis.length > 0 ? (
            <div className="properties-grid">
              {imoveis.map((imovel, i) => (
                <PropertyCard key={imovel.slug} imovel={imovel} priority={i < 3} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h2>Nenhum imóvel encontrado</h2>
              <p>
                Não encontramos imóveis com esses critérios. Que tal falar diretamente comigo? Tenho opções que ainda
                não estão no site.
              </p>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 }}>
                <a
                  href={whatsappLink('Olá! Procuro um imóvel com características específicas. Pode me ajudar?')}
                  className="btn btn-gold"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Falar com Thiago
                </a>
                <Link href="/imoveis" className="btn btn-outline">
                  Ver todos os imóveis
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
