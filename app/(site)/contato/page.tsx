import type { Metadata } from 'next';
import { SITE, whatsappLink } from '@/lib/site';
import ContactForm from '@/components/ContactForm';
import { IconWhatsApp, IconPhone, IconMail, IconMapPin, IconClock } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Contato',
  description: `Fale com ${SITE.name}. Atendimento exclusivo em Barreiras e região. WhatsApp ${SITE.phone}.`,
};

export default function ContatoPage() {
  return (
    <main id="primary" className="site-main" role="main">
      <section className="page-hero">
        <div className="container">
          <span className="section-label">Fale com Thiago</span>
          <h1 className="page-hero-title">
            Entre em <span>Contato</span>
          </h1>
          <p className="page-hero-desc">
            Atendimento exclusivo e personalizado. Respondo pessoalmente cada mensagem.
          </p>
        </div>
      </section>

      <section className="contact-section section-py">
        <div className="container">
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
