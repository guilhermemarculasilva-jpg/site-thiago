import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getImovel, getSlugs, getImoveis } from '@/lib/imoveis';
import { formatPrice, whatsappLink, SITE } from '@/lib/site';
import PropertyCard from '@/components/PropertyCard';
import Gallery from '@/components/Gallery';
import { IconMapPin, IconBed, IconBath, IconArea, IconCar, IconWhatsApp, IconArrowRight } from '@/components/icons';

/** Gera as rotas estáticas no build — equivalente ao permalink do CPT */
export function generateStaticParams() {
  return getSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const imovel = getImovel(params.slug);
  if (!imovel) return { title: 'Imóvel não encontrado' };

  const preco = imovel.finalidade === 'aluguel' ? `${formatPrice(imovel.valor)}/mês` : formatPrice(imovel.valor);

  return {
    title: imovel.titulo,
    description: `${preco} — ${imovel.bairro}, ${imovel.cidade}. ${imovel.descricao.slice(0, 120)}`,
    openGraph: {
      title: `${imovel.titulo} — ${preco}`,
      description: imovel.descricao.slice(0, 160),
      images: [imovel.imagem],
    },
  };
}

export default function ImovelPage({ params }: { params: { slug: string } }) {
  const imovel = getImovel(params.slug);
  if (!imovel) notFound();

  const preco = imovel.finalidade === 'aluguel' ? `${formatPrice(imovel.valor)}/mês` : formatPrice(imovel.valor);

  // Capa + galeria, sem repetir a mesma foto
  const fotos = Array.from(new Set([imovel.imagem, ...(imovel.galeria || [])].filter(Boolean)));

  const relacionados = getImoveis()
    .filter((i) => i.slug !== imovel.slug && i.tipo === imovel.tipo)
    .slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: imovel.titulo,
    description: imovel.descricao,
    image: fotos,
    offers: {
      '@type': 'Offer',
      price: imovel.valor,
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: imovel.endereco,
      addressLocality: imovel.cidade,
      addressRegion: 'BA',
      addressCountry: 'BR',
    },
  };

  return (
    <main id="primary" className="site-main" role="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero do imóvel */}
      <section className="imovel-hero">
        <Image src={imovel.imagem} alt={imovel.titulo} fill priority sizes="100vw" style={{ objectFit: 'cover' }} />
        <div className="imovel-hero-overlay" />
        <div className="container imovel-hero-content">
          <Link href="/imoveis" className="imovel-back">
            ← Voltar para imóveis
          </Link>
          <span className="property-badge imovel-hero-badge">{imovel.codigo}</span>
          <h1 className="imovel-title">{imovel.titulo}</h1>
          <div className="imovel-location">
            <IconMapPin size={16} />
            {imovel.endereco} — {imovel.bairro}, {imovel.cidade}
          </div>
          <div className="imovel-price">{preco}</div>
        </div>
      </section>

      <section className="section-py">
        <div className="container">
          <div className="imovel-grid">
            {/* Conteúdo */}
            <div>
              <div className="imovel-specs">
                {imovel.quartos > 0 && (
                  <div className="imovel-spec">
                    <IconBed size={24} />
                    <div className="imovel-spec-num">{imovel.quartos}</div>
                    <div className="imovel-spec-label">Quartos</div>
                  </div>
                )}
                {imovel.banheiros > 0 && (
                  <div className="imovel-spec">
                    <IconBath size={24} />
                    <div className="imovel-spec-num">{imovel.banheiros}</div>
                    <div className="imovel-spec-label">Banheiros</div>
                  </div>
                )}
                {imovel.vagas > 0 && (
                  <div className="imovel-spec">
                    <IconCar size={24} />
                    <div className="imovel-spec-num">{imovel.vagas}</div>
                    <div className="imovel-spec-label">Vagas</div>
                  </div>
                )}
                <div className="imovel-spec">
                  <IconArea size={24} />
                  <div className="imovel-spec-num">{imovel.area}</div>
                  <div className="imovel-spec-label">m² úteis</div>
                </div>
              </div>

              {fotos.length > 1 && <Gallery fotos={fotos} titulo={imovel.titulo} />}

              <h2 className="imovel-section-title">Sobre o imóvel</h2>
              <p className="imovel-desc">{imovel.descricao}</p>

              <h2 className="imovel-section-title">Ficha técnica</h2>
              <table className="imovel-table">
                <tbody>
                  <tr>
                    <th>Código</th>
                    <td>{imovel.codigo}</td>
                  </tr>
                  <tr>
                    <th>Tipo</th>
                    <td style={{ textTransform: 'capitalize' }}>{imovel.tipo}</td>
                  </tr>
                  <tr>
                    <th>Finalidade</th>
                    <td style={{ textTransform: 'capitalize' }}>{imovel.finalidade}</td>
                  </tr>
                  <tr>
                    <th>Área</th>
                    <td>{imovel.area} m²</td>
                  </tr>
                  <tr>
                    <th>Endereço</th>
                    <td>{imovel.endereco}</td>
                  </tr>
                  <tr>
                    <th>Bairro</th>
                    <td>{imovel.bairro}</td>
                  </tr>
                  <tr>
                    <th>Cidade</th>
                    <td>{imovel.cidade}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Sidebar de contato */}
            <aside className="imovel-sidebar">
              <div className="imovel-cta-card">
                <div className="imovel-cta-price">{preco}</div>
                <div className="imovel-cta-code">Código {imovel.codigo}</div>

                <a
                  href={whatsappLink(
                    `Olá, Thiago! Tenho interesse no imóvel "${imovel.titulo}" (${imovel.codigo}), anunciado por ${preco}. Podemos conversar?`
                  )}
                  className="btn btn-whatsapp imovel-cta-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IconWhatsApp size={20} fill="currentColor" />
                  Tenho Interesse
                </a>

                <a href={`tel:+${SITE.whatsapp}`} className="btn btn-outline imovel-cta-btn">
                  Ligar: {SITE.phone}
                </a>

                <div className="imovel-cta-agent">
                  <div className="imovel-cta-agent-name">{SITE.name}</div>
                  <div className="imovel-cta-agent-creci">CRECI {SITE.creci}-BA</div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {relacionados.length > 0 && (
        <section className="section-py" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-header">
              <div>
                <span className="section-label">Talvez te interesse</span>
                <h2 className="section-title">
                  Imóveis <span>Similares</span>
                </h2>
              </div>
              <Link href="/imoveis" className="view-all">
                Ver todos
                <IconArrowRight size={16} />
              </Link>
            </div>
            <div className="properties-grid">
              {relacionados.map((i) => (
                <PropertyCard key={i.slug} imovel={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
