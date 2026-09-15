/**
 * Constantes do site.
 *
 * Os valores agora vêm de `data/config.json`, editável pelo painel em /admin.
 * A interface SITE foi mantida idêntica para não quebrar os componentes.
 */
import { CONFIG } from './config';

export const SITE = {
  name: 'Thiago Bostock',
  fullName: 'Thiago Bostock Consultoria Imobiliária',
  phone: CONFIG.contato.telefone,
  whatsapp: CONFIG.contato.whatsapp,
  creci: CONFIG.contato.creci,
  email: CONFIG.contato.email,
  location: CONFIG.contato.localizacao,
  horario: CONFIG.contato.horario,
  url: 'https://bostockimoveis.com.br',
} as const;

/** Equivalente a tb_whatsapp_link() */
export function whatsappLink(message = 'Olá! Vim pelo site e gostaria de mais informações.') {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
}

/** Equivalente a tb_get_price() — formata em BRL */
export function formatPrice(value: number): string {
  if (!value) return 'Sob consulta';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}

export const NAV_LINKS = [
  { href: '/', label: 'Início' },
  { href: '/#imoveis', label: 'Imóveis' },
  { href: '/#sobre', label: 'Sobre' },
  { href: '/#servicos', label: 'Serviços' },
  { href: '/#financiamento', label: 'Financiamento' },
  { href: '/#contato', label: 'Contato' },
];
