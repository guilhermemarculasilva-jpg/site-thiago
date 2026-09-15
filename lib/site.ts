/**
 * Constantes do site — equivalente às `define()` do functions.php
 */
export const SITE = {
  name: 'Thiago Bostock',
  fullName: 'Thiago Bostock Consultoria Imobiliária',
  phone: '(77) 99155-5610',
  whatsapp: '5577991555610',
  creci: '36.772',
  email: 'contato@thiagobostock.com.br',
  location: 'Bom Jesus da Lapa, Bahia — Brasil',
  url: 'https://thiagobostock.com.br',
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
