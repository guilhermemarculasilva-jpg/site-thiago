import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import './reset.css';
import './theme.css';
import './main-extra.css';
import { SITE } from '@/lib/site';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

/**
 * Cinzel — fonte dos títulos.
 *
 * Desenhada por Natanael Gama a partir de inscrições romanas em
 * pedra. É uma fonte só de caixa alta, que é exatamente como o
 * site usa os títulos (text-transform: uppercase).
 *
 * Substitui a Playfair Display, que é uma "didone" de revista:
 * no peso 900 e em caixa alta ela fechava demais e ficava com
 * cara de manchete de jornal, não de marca de alto padrão.
 *
 * Servida do nosso próprio servidor (next/font/local), não do
 * Google. Vantagens: carrega junto com o site, não depende de
 * terceiros no ar, e não envia o IP do visitante ao Google —
 * ponto relevante para a LGPD.
 *
 * Licença SIL Open Font License 1.1 (uso comercial livre).
 * Texto completo em app/fonts/OFL-Cinzel.txt
 */
const cinzel = localFont({
  src: [
    { path: './fonts/Cinzel-400.woff2', weight: '400', style: 'normal' },
    { path: './fonts/Cinzel-600.woff2', weight: '600', style: 'normal' },
    { path: './fonts/Cinzel-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-display',
  display: 'swap',
  // Ajusta o espaço que o texto ocupa antes da fonte carregar,
  // evitando o "pulo" de layout que prejudica a nota do Google.
  adjustFontFallback: 'Times New Roman',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Consultoria Imobiliária de Alto Padrão em Barreiras`,
    template: `%s | ${SITE.name}`,
  },
  description:
    'Consultoria imobiliária exclusiva em Barreiras e região. Imóveis de alto padrão, financiamento com as melhores taxas e atendimento personalizado. CRECI ' +
    SITE.creci,
  keywords: ['imóveis Barreiras', 'casas alto padrão Bahia', 'corretor Barreiras', 'financiamento imobiliário'],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: SITE.fullName,
    title: `${SITE.name} — Consultoria Imobiliária de Alto Padrão`,
    description: 'Construir com sabedoria é investir com sucesso. Imóveis exclusivos em Barreiras e região.',
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: ['/favicon.ico'],
  },
};

export const viewport = {
  themeColor: '#080808',
  width: 'device-width',
  initialScale: 1,
};

/**
 * Layout raiz — apenas <html> e <body>.
 *
 * O cabeçalho e o rodapé do site NÃO ficam aqui: eles pertencem só ao site
 * público e são aplicados em app/(site)/layout.tsx. Assim o painel /admin
 * renderiza limpo, sem o menu dourado por cima.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${cinzel.variable}`}>
      <body>{children}</body>
    </html>
  );
}
