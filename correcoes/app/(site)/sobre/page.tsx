import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { SITE, whatsappLink } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Sobre Thiago Bostock',
  description:
    'Corretor de imóveis com mais de 10 anos de experiência em Barreiras e região oeste da Bahia. CRECI ' +
    SITE.creci,
};

export default function SobrePage() {
  return (
    <main id="primary" className="site-main" role="main">
      <section className="page-hero">
        <div className="container">
          <span className="section-label">Quem Somos</span>
          <h1 className="page-hero-title">
            Thiago <span>Bostock</span>
          </h1>
          <p className="page-hero-desc">
            Corretor de imóveis com mais de 10 anos de experiência, comprometido com excelência e resultados.
          </p>
        </div>
      </section>

      <section className="section-py">
        <div className="container">
          <div className="about-inner">
            <div className="about-media">
              <div className="about-img-wrap">
                <Image
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=700&q=80"
                  alt={SITE.name}
                  width={700}
                  height={880}
                  sizes="(max-width: 968px) 100vw, 50vw"
                />
              </div>
              <div className="about-accent-box" />
            </div>

            <div className="about-content">
              <span className="section-label">O Profissional</span>
              <h2 className="section-title" style={{ fontSize: '2.5rem' }}>
                Construir com <span>Sabedoria</span>
              </h2>

              <p className="about-text">
                Formado e credenciado pelo CRECI {SITE.creci}, Thiago Bostock construiu sua carreira com base em três
                pilares fundamentais:{' '}
                <strong style={{ color: 'var(--gold)' }}>honestidade, resultado e relacionamento</strong>.
              </p>
              <p className="about-text">
                Especialista em imóveis de alto padrão, financiamento imobiliário e consultoria de investimentos,
                Thiago atende clientes em Barreiras, Luís Eduardo Magalhães e toda a região oeste da Bahia.
              </p>
              <p className="about-text">
                Com mais de 500 imóveis negociados e centenas de clientes satisfeitos, cada transação é tratada com o
                máximo cuidado, do primeiro contato à entrega das chaves.
              </p>

              <div className="about-stats">
                <div>
                  <div className="about-stat-num">+500</div>
                  <div className="about-stat-label">Imóveis Vendidos</div>
                </div>
                <div>
                  <div className="about-stat-num">+10</div>
                  <div className="about-stat-label">Anos de Mercado</div>
                </div>
                <div>
                  <div className="about-stat-num">100%</div>
                  <div className="about-stat-label">Comprometimento</div>
                </div>
                <div>
                  <div className="about-stat-num">CRECI</div>
                  <div className="about-stat-label">{SITE.creci}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, marginTop: 40, flexWrap: 'wrap' }}>
                <a href={whatsappLink()} className="btn btn-gold" target="_blank" rel="noopener noreferrer">
                  Falar com Thiago
                </a>
                <Link href="/imoveis" className="btn btn-outline">
                  Ver Imóveis
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
