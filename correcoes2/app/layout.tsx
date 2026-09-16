import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './theme.css';
import './main-extra.css';
import { SITE } from '@/lib/site';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '900'],
  variable: '--font-playfair',
  display: 'swap',
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
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}
