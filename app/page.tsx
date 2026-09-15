import Link from 'next/link';
import Image from 'next/image';
import { SITE, whatsappLink } from '@/lib/site';
import { getImoveisDestaque } from '@/lib/imoveis';
import PropertyCard from '@/components/PropertyCard';
import SearchForm from '@/components/SearchForm';
import Simulator from '@/components/Simulator';
import ContactForm from '@/components/ContactForm';
import Newsletter from '@/components/Newsletter';
import { ServiceIcon, IconArrowRight, IconWhatsApp, IconPhone, IconMail, IconMapPin, IconClock } from '@/components/icons';

const SERVICES = [
  {
    icon: 'home' as const,
    title: 'Compra e Venda',
    desc: 'Intermediação profissional com análise de mercado, documentação e negociação para o melhor negócio.',
  },
  {
    icon: 'dollar' as const,
    title: 'Financiamento',
    desc: 'Trabalhamos com os principais bancos para conseguir a menor taxa de juros e as melhores condições para você.',
  },
  {
    icon: 'file' as const,
    title: 'Imposto de Renda',
    desc: 'Orientação especializada sobre ganho de capital, declaração de bens imóveis e regularização perante a Receita Federal.',
  },
  {
    icon: 'chart' as const,
    title: 'Investimentos',
    desc: 'Identificamos oportunidades com alto potencial de valorização. Análise criteriosa de rentabilidade e liquidez.',
  },
  {
    icon: 'appraisal' as const,
    title: 'Avaliação de Imóveis',
    desc: 'Laudo técnico preciso com base em dados reais de mercado para compra, venda, locação ou inventário.',
  },
  {
    icon: 'phone' as const,
    title: 'Consultoria Exclusiva',
    desc: 'Atendimento personalizado do início ao fim: do primeiro contato à assinatura do contrato e muito além.',
  },
];

const BANCOS = [
  { nome: 'Caixa Econômica', taxa: '11,19% a.a + TR', sigla: 'CEF' },
  { nome: 'Itaú Unibanco', taxa: '12,47% a.a + TR', sigla: 'ITÁ' },
  { nome: 'Santander', taxa: '12,99% a.a + TR', sigla: 'SAN' },
  { nome: 'Bradesco', taxa: '13,13% a.a + TR', sigla: 'BRA' },
  { nome: 'Banco do Brasil', taxa: '13,76% a.a + TR', sigla: 'BB' },
];

const TESTIMONIALS = [
  {
    inicial: 'M',
    texto:
      'Melhor corretor que já trabalhei! Super profissional e honesto. Me ajudou a encontrar o imóvel perfeito dentro do meu orçamento sem stress.',
    nome: 'Marcos Oliveira',
    cidade: 'Barreiras, BA',
  },
  {
    inicial: 'A',
    texto:
      'O Thiago cuidou de tudo, da avaliação ao financiamento. Conseguiu uma taxa incrível no banco que eu nem sabia que existia. Recomendo muito!',
    nome: 'Ana Carolina Lima',
    cidade: 'Luís Eduardo, BA',
  },
  {
    inicial: 'R',
    texto:
      'Atendimento exclusivo de verdade. Ele me atendeu até nos fins de semana. Vendeu minha casa em tempo recorde pelo valor pedido.',
    nome: 'Roberto Santos',
    cidade: 'Barreiras, BA',
  },
];

export default function HomePage() {
  const destaques = getImoveisDestaque(6);

  return (
    <main id="primary" className="site-main" role="main">
      {/* 1. HERO */}
      <section className="hero-section" id="hero" aria-label="Seção principal">
        <div className="hero-bg">
          <Image
            src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1920&q=80"
            alt="Imóvel de luxo"
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover' }}
          />
          <div className="hero-bg-overlay" />
        </div>

        <div className="hero-content-wrap">
          <div className="container">
            <div className="hero-inner">
              <div className="hero-text">
                <span className="hero-eyebrow">Construir com Sabedoria</span>
                <h1 className="hero-title">
                  É Investir com
                  <br />
                  <span className="accent">Sucesso!</span>
                </h1>
                <p className="hero-subtitle">
                  Consultoria imobiliária exclusiva em Barreiras e região. Encontre o imóvel ideal com o corretor
                  mais preparado do mercado.
                </p>

                <div className="hero-buttons">
                  <a
                    href={whatsappLink('Olá! Gostaria de atendimento exclusivo.')}
                    className="btn btn-gold"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Atendimento Exclusivo
                  </a>
                  <Link href="#imoveis" className="btn btn-outline">
                    Ver Portfólio
                  </Link>
                </div>

                <div className="hero-stats">
                  <div className="hero-stat">
                    <div className="hero-stat-num">+500</div>
                    <div className="hero-stat-label">Imóveis Vendidos</div>
                  </div>
                  <div className="hero-stat">
                    <div className="hero-stat-num">+10</div>
                    <div className="hero-stat-label">Anos de Mercado</div>
                  </div>
                  <div className="hero-stat">
                    <div className="hero-stat-num">100%</div>
                    <div className="hero-stat-label">Satisfação</div>
                  </div>
                </div>
              </div>

              <div className="hero-profile">
                <div className="hero-profile-frame" />
                <Image
                  src="https://i.imgur.com/NouCHp8.png"
                  alt={`${SITE.name} - Corretor de Imóveis`}
                  width={520}
                  height={640}
                  priority
                />
                <div className="hero-badge">
                  <div className="hero-badge-num">CRECI</div>
                  <div className="hero-badge-text">{SITE.creci} — BA</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-scroll" aria-hidden="true">
          <span>Explore</span>
          <div className="hero-scroll-line" />
        </div>
      </section>

      {/* 2. BUSCA */}
      <SearchForm />

      {/* 3. IMÓVEIS EM DESTAQUE */}
      <section className="section-py" id="imoveis" aria-label="Imóveis em destaque">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-label">Portfólio Exclusivo</span>
              <h2 className="section-title">
                Imóveis em <span>Destaque</span>
              </h2>
            </div>
            <Link href="/imoveis" className="view-all">
              Ver todos os imóveis
              <IconArrowRight size={16} />
            </Link>
          </div>

          <div className="properties-grid" id="properties-grid">
            {destaques.map((imovel, i) => (
              <PropertyCard key={imovel.slug} imovel={imovel} priority={i < 3} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. SOBRE */}
      <section className="about-section section-py" id="sobre" aria-label={`Sobre ${SITE.name}`}>
        <div className="container">
          <div className="about-inner">
            <div className="about-media">
              <div className="about-img-wrap">
                <Image
                  src="https://i.imgur.com/r93bu5p.jpeg"
                  alt={`${SITE.name} - Corretor de Imóveis`}
                  width={640}
                  height={800}
                  sizes="(max-width: 968px) 100vw, 50vw"
                />
              </div>
              <div className="about-accent-box" />
            </div>

            <div className="about-content">
              <span className="section-label">O Profissional</span>
              <h2 className="section-title">
                Thiago <span>Bostock</span>
              </h2>

              <p className="about-text">
                Com mais de uma década de experiência no mercado imobiliário da Bahia, Thiago Bostock tornou-se
                sinônimo de credibilidade, resultado e atendimento de excelência. Credenciado pelo CRECI{' '}
                {SITE.creci}, atua com total transparência em cada negociação.
              </p>
              <p className="about-text">
                Sua missão é simples:{' '}
                <strong style={{ color: '#D4AF37' }}>construir com sabedoria é investir com sucesso</strong>. Cada
                imóvel apresentado é analisado criteriosamente para garantir o melhor retorno e segurança jurídica
                para seus clientes.
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
                <Link href="#servicos" className="btn btn-outline">
                  Nossos Serviços
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SERVIÇOS */}
      <section className="services-section section-py" id="servicos" aria-label="Serviços">
        <div className="services-glow" aria-hidden="true" />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="section-header-center">
            <span className="section-label">O que fazemos</span>
            <h2 className="section-title">
              Consultoria <span>Estratégica</span>
            </h2>
            <p className="section-desc">
              Muito além da intermediação imobiliária. Oferecemos assessoria completa para seu patrimônio crescer
              com segurança.
            </p>
          </div>

          <div className="services-grid">
            {SERVICES.map((s) => (
              <div className="service-card" key={s.title}>
                <div className="service-icon">
                  <ServiceIcon name={s.icon} />
                </div>
                <h3 className="service-title">{s.title}</h3>
                <p className="service-desc">{s.desc}</p>
                <a
                  href={whatsappLink(`Olá! Quero saber mais sobre o serviço de ${s.title}`)}
                  className="service-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Saber mais
                  <IconArrowRight size={14} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FINANCIAMENTO */}
      <section className="financing-section section-py" id="financiamento" aria-label="Taxas de financiamento">
        <div className="container">
          <div className="financing-inner">
            <div>
              <span className="section-label">Planejamento Financeiro</span>
              <h2 className="section-title">
                Taxas de <span>Financiamento</span>
              </h2>
              <p className="section-desc" style={{ marginBottom: 0 }}>
                Compare as taxas dos principais bancos e escolha a melhor condição para o seu perfil.
              </p>

              <div className="rates-list">
                {BANCOS.map((b) => (
                  <div className="rate-row" key={b.nome}>
                    <div className="rate-bank">
                      <div className="rate-logo">{b.sigla}</div>
                      <span className="rate-bank-name">{b.nome}</span>
                    </div>
                    <span className="rate-value">{b.taxa}</span>
                  </div>
                ))}
              </div>

              <p className="rate-note">
                * Taxas sujeitas à análise de crédito, renda e relacionamento bancário. Consulte condições vigentes.
              </p>
            </div>

            <Simulator />
          </div>
        </div>
      </section>

      {/* 7. NEWSLETTER */}
      <Newsletter />

      {/* 8. DEPOIMENTOS */}
      <section className="testimonials-section section-py" aria-label="Depoimentos de clientes">
        <div className="container">
          <div className="section-header-center">
            <span className="section-label">Clientes Satisfeitos</span>
            <h2 className="section-title">
              O que dizem sobre <span>Thiago</span>
            </h2>
          </div>

          <div className="testimonials-grid">
            {TESTIMONIALS.map((t) => (
              <div className="testimonial-card" key={t.nome}>
                <div className="testimonial-stars" aria-label="5 estrelas">
                  ★★★★★
                </div>
                <p className="testimonial-text">{t.texto}</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar" aria-hidden="true">
                    {t.inicial}
                  </div>
                  <div>
                    <div className="testimonial-name">{t.nome}</div>
                    <div className="testimonial-city">{t.cidade}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. CONTATO */}
      <section className="contact-section section-py" id="contato" aria-label="Formulário de contato">
        <div className="container">
          <div className="section-header-center">
            <span className="section-label">Fale com Thiago</span>
            <h2 className="section-title">
              Entre em <span>Contato</span>
            </h2>
            <p className="section-desc">
              Atendimento exclusivo e personalizado. Respondo pessoalmente cada mensagem.
            </p>
          </div>

          <div className="contact-inner">
            <div className="contact-info">
              <div className="contact-info-item">
                <div className="contact-icon">
                  <IconPhone size={22} />
                </div>
                <div>
                  <div className="contact-label">WhatsApp / Telefone</div>
                  <div className="contact-value">
                    <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)' }}>
                      {SITE.phone}
                    </a>
                  </div>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-icon">
                  <IconMail size={22} />
                </div>
                <div>
                  <div className="contact-label">E-mail</div>
                  <div className="contact-value">
                    <a href={`mailto:${SITE.email}`} style={{ color: 'var(--gold)' }}>
                      {SITE.email}
                    </a>
                  </div>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-icon">
                  <IconMapPin size={22} />
                </div>
                <div>
                  <div className="contact-label">Localização</div>
                  <div className="contact-value">{SITE.location}</div>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-icon">
                  <IconClock size={22} />
                </div>
                <div>
                  <div className="contact-label">Horário de Atendimento</div>
                  <div className="contact-value">Seg–Sex: 8h–18h | Sáb: 8h–12h</div>
                </div>
              </div>

              <a
                href={whatsappLink('Olá Thiago! Vim pelo site e quero mais informações.')}
                className="btn btn-whatsapp"
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginTop: 20, borderRadius: 12 }}
              >
                <IconWhatsApp size={20} fill="currentColor" />
                Iniciar Conversa no WhatsApp
              </a>
            </div>

            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}
