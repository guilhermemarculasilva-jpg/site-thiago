import type { Metadata } from 'next';
import Simulator from '@/components/Simulator';

export const metadata: Metadata = {
  title: 'Financiamento Imobiliário',
  description:
    'Compare as taxas de financiamento imobiliário dos principais bancos e simule sua parcela. Análise de crédito gratuita.',
};

const BANCOS = [
  { nome: 'Caixa Econômica Federal', taxa: '11,19% a.a + TR', sigla: 'CEF' },
  { nome: 'Itaú Unibanco', taxa: '12,47% a.a + TR', sigla: 'ITÁ' },
  { nome: 'Banco Santander', taxa: '12,99% a.a + TR', sigla: 'SAN' },
  { nome: 'Banco Bradesco', taxa: '13,13% a.a + TR', sigla: 'BRA' },
  { nome: 'Banco do Brasil', taxa: '13,76% a.a + TR', sigla: 'BB' },
];

const PASSOS = [
  'Análise gratuita do seu perfil de crédito',
  'Simulação com os melhores bancos',
  'Acompanhamento do processo até a aprovação',
  'Orientação sobre documentação necessária',
  'Suporte jurídico na escritura',
];

export default function FinanciamentoPage() {
  return (
    <main id="primary" className="site-main" role="main">
      <section className="page-hero">
        <div className="container">
          <span className="section-label">Crédito Imobiliário</span>
          <h1 className="page-hero-title">
            Taxas de <span>Financiamento</span>
          </h1>
          <p className="page-hero-desc">
            Compare as taxas dos principais bancos e realize o sonho do seu imóvel com as melhores condições do
            mercado.
          </p>
        </div>
      </section>

      <section className="financing-section section-py">
        <div className="container">
          <div className="financing-inner">
            <div>
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
                * Taxas de referência. Sujeitas à análise de crédito e renda. Consulte o corretor para simular.
              </p>

              <div className="financing-howto">
                <h3>Como funciona?</h3>
                <ul>
                  {PASSOS.map((p) => (
                    <li key={p}>✓ {p}</li>
                  ))}
                </ul>
              </div>
            </div>

            <Simulator />
          </div>
        </div>
      </section>
    </main>
  );
}
