'use client';

import { useState, useMemo } from 'react';
import { SITE, whatsappLink, formatPrice } from '@/lib/site';
import { IconWhatsApp } from './icons';

/**
 * Simulador de financiamento.
 * No tema original os sliders eram controlados por jQuery em assets/js/main.js.
 * Aqui viram estado React, e adicionamos o cálculo da parcela (tabela Price),
 * que o original apenas exibia como rótulo.
 */
const TAXA_ANUAL = 0.1119; // Caixa: 11,19% a.a.

export default function Simulator() {
  const [valor, setValor] = useState(600000);
  const [prazo, setPrazo] = useState(360);

  const { parcela, entrada, financiado } = useMemo(() => {
    const entrada = valor * 0.2; // 20% de entrada
    const financiado = valor - entrada;
    const i = Math.pow(1 + TAXA_ANUAL, 1 / 12) - 1; // taxa mensal equivalente
    const parcela = (financiado * i) / (1 - Math.pow(1 + i, -prazo));
    return { parcela, entrada, financiado };
  }, [valor, prazo]);

  const mensagem = `Olá! Quero simular um financiamento imobiliário.
Valor do imóvel: ${formatPrice(valor)}
Prazo: ${prazo} meses
Parcela estimada: ${formatPrice(Math.round(parcela))}`;

  return (
    <div className="simulator-card">
      <div className="simulator-inner">
        <p className="simulator-label">Simulador de Crédito</p>

        <div className="simulator-field">
          <div className="simulator-field-header">
            <span>Valor do Imóvel</span>
            <span id="valor-display">{formatPrice(valor)}</span>
          </div>
          <input
            type="range"
            className="simulator-range"
            min={100000}
            max={5000000}
            step={50000}
            value={valor}
            onChange={(e) => setValor(Number(e.target.value))}
            aria-label="Valor do imóvel"
          />
        </div>

        <div className="simulator-field">
          <div className="simulator-field-header">
            <span>Prazo</span>
            <span id="prazo-display">{prazo} meses</span>
          </div>
          <input
            type="range"
            className="simulator-range"
            min={60}
            max={420}
            step={12}
            value={prazo}
            onChange={(e) => setPrazo(Number(e.target.value))}
            aria-label="Prazo em meses"
          />
        </div>

        <div className="simulator-result">
          <div className="simulator-result-row">
            <span>Entrada (20%)</span>
            <strong>{formatPrice(Math.round(entrada))}</strong>
          </div>
          <div className="simulator-result-row">
            <span>Valor financiado</span>
            <strong>{formatPrice(Math.round(financiado))}</strong>
          </div>
          <div className="simulator-result-row simulator-result-main">
            <span>Parcela estimada</span>
            <strong>{formatPrice(Math.round(parcela))}</strong>
          </div>
          <p className="simulator-disclaimer">
            Estimativa pela Tabela Price a {(TAXA_ANUAL * 100).toFixed(2).replace('.', ',')}% a.a. Não inclui TR,
            seguros e taxas administrativas. Sujeito a análise de crédito.
          </p>
        </div>

        <a href={whatsappLink(mensagem)} className="simulator-cta" target="_blank" rel="noopener noreferrer">
          Solicitar Simulação Grátis
        </a>
      </div>

      <div className="simulator-contact">
        <div className="simulator-contact-icon">
          <IconWhatsApp size={22} fill="#25D366" />
        </div>
        <div>
          <div className="simulator-contact-label">Dúvidas? Fale com Thiago</div>
          <div className="simulator-contact-num">{SITE.phone}</div>
        </div>
      </div>
    </div>
  );
}
