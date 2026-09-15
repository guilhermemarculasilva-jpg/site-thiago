import Link from 'next/link';
import Image from 'next/image';
import { SITE, whatsappLink, NAV_LINKS } from '@/lib/site';

const SERVICOS_LINKS = [
  { href: '/#servicos', label: 'Compra e Venda' },
  { href: '/#servicos', label: 'Avaliação de Imóveis' },
  { href: '/#financiamento', label: 'Financiamento' },
  { href: '/#servicos', label: 'Imposto de Renda' },
  { href: '/#servicos', label: 'Consultoria' },
];

const SOCIALS = [
  { href: 'https://instagram.com/', label: 'Instagram', text: 'IG' },
  { href: 'https://facebook.com/', label: 'Facebook', text: 'FB' },
  { href: 'https://linkedin.com/', label: 'LinkedIn', text: 'IN' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="colophon" className="site-footer" role="contentinfo">
      <div className="container">
        <div className="footer-top">
          <div className="footer-col">
            <Link href="/" className="site-logo footer-logo" aria-label={SITE.name}>
              <Image src="/assets/images/logo.png" alt={SITE.name} width={52} height={52} className="logo-img" />
              <div className="logo-text-wrapper">
                <span className="logo-name">{SITE.name}</span>
                <span className="logo-creci">CRECI {SITE.creci}</span>
              </div>
            </Link>
            <p className="footer-brand-desc">
              Consultoria imobiliária de alto padrão em Barreiras e região. Comprometido com resultados sólidos e
              atendimento exclusivo.
            </p>
            <div className="footer-socials">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social"
                  aria-label={s.label}
                >
                  {s.text}
                </a>
              ))}
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social"
                aria-label="WhatsApp"
              >
                WA
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Navegação</h4>
            <ul className="footer-menu">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Serviços</h4>
            <ul className="footer-menu">
              {SERVICOS_LINKS.map((s, i) => (
                <li key={i}>
                  <Link href={s.href}>{s.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Contato Exclusivo</h4>
            <ul className="footer-menu">
              <li style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
                <strong className="footer-contact-label">WhatsApp</strong>
                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                  {SITE.phone}
                </a>
              </li>
              <li style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
                <strong className="footer-contact-label">E-mail</strong>
                <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
              </li>
              <li style={{ color: 'rgba(255,255,255,0.6)' }}>
                <strong className="footer-contact-label">Localização</strong>
                {SITE.location}
              </li>
            </ul>
            <a
              href={whatsappLink('Olá! Vi seu site e quero tirar uma dúvida.')}
              className="btn btn-whatsapp"
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginTop: 24, borderRadius: 8, padding: '12px 24px', fontSize: 10 }}
            >
              Falar pelo WhatsApp
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">
            &copy; {year}{' '}
            <Link href="/" style={{ color: 'var(--white-40)' }}>
              {SITE.fullName}
            </Link>
            . Todos os direitos reservados.
          </p>
          <span className="footer-creci">CRECI {SITE.creci}-BA &bull; COFECI</span>
        </div>
      </div>
    </footer>
  );
}
