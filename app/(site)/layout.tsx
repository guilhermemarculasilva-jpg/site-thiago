import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';

/**
 * Layout do site público.
 *
 * Cabeçalho, rodapé e botão do WhatsApp vivem aqui — não no layout raiz.
 * Isso impede que eles apareçam dentro do painel /admin.
 *
 * O grupo de rotas `(site)` não altera as URLs: app/(site)/page.tsx
 * continua sendo "/", app/(site)/imoveis/ continua "/imoveis", etc.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="tb-theme">
      <div id="page" className="site-wrapper">
        <Header />
        <div id="content" className="site-content">
          {children}
        </div>
        <Footer />
      </div>
      <WhatsAppFloat />
    </div>
  );
}
