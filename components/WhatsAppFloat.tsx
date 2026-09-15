import { whatsappLink, SITE } from '@/lib/site';
import { IconWhatsApp } from './icons';

export default function WhatsAppFloat() {
  return (
    <a
      href={whatsappLink('Olá, Thiago! Vi seu site e gostaria de mais informações sobre imóveis.')}
      className="whatsapp-float"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Falar com ${SITE.name} pelo WhatsApp`}
    >
      <span className="whatsapp-tooltip">Fale comigo agora!</span>
      <IconWhatsApp size={28} fill="#ffffff" />
    </a>
  );
}
