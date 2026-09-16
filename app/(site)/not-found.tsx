import Link from 'next/link';
import { whatsappLink } from '@/lib/site';

export default function NotFound() {
  return (
    <main id="primary" className="site-main" role="main">
      <section className="error-404">
        <div className="container">
          <div className="error-404-num">404</div>
          <h1 className="section-title">
            Página não <span>encontrada</span>
          </h1>
          <p className="section-desc">
            O endereço que você acessou não existe ou o imóvel já foi vendido. Que tal ver o portfólio completo?
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginTop: 32 }}>
            <Link href="/imoveis" className="btn btn-gold">
              Ver Imóveis
            </Link>
            <a
              href={whatsappLink('Olá! Não encontrei o que procurava no site. Pode me ajudar?')}
              className="btn btn-outline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Falar com Thiago
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
