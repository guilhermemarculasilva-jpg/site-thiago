'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';

/**
 * Carrossel de fotos do imóvel.
 *
 * Funciona em qualquer dispositivo:
 *  - Desktop: setas laterais, miniaturas e navegação por teclado
 *  - Celular: arrasto com o dedo (swipe) e pontinhos indicadores
 *  - Tela cheia: clique na foto abre o modo ampliado, Esc fecha
 *
 * Acessibilidade: rótulos ARIA, foco visível e suporte a leitores de tela.
 */
export default function Gallery({ fotos, titulo }: { fotos: string[]; titulo: string }) {
  const [atual, setAtual] = useState(0);
  const [zoom, setZoom] = useState(false);
  const touchX = useRef<number | null>(null);
  const trilhaRef = useRef<HTMLDivElement>(null);

  const total = fotos.length;

  const ir = useCallback(
    (i: number) => setAtual(((i % total) + total) % total),
    [total]
  );
  const proxima = useCallback(() => ir(atual + 1), [atual, ir]);
  const anterior = useCallback(() => ir(atual - 1), [atual, ir]);

  // Teclado: setas navegam, Esc fecha o zoom
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') proxima();
      else if (e.key === 'ArrowLeft') anterior();
      else if (e.key === 'Escape') setZoom(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [proxima, anterior]);

  // Trava o scroll do fundo enquanto o zoom está aberto
  useEffect(() => {
    document.body.style.overflow = zoom ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [zoom]);

  // Mantém a miniatura ativa visível.
  //
  // Importante: NÃO usar scrollIntoView aqui. Ele rola a página inteira até a
  // fita de miniaturas, e como este efeito roda na montagem do componente, a
  // página do imóvel abria já rolada no carrossel em vez de começar no topo.
  //
  // A rolagem é feita só dentro da fita, escrevendo em scrollLeft.
  const primeiraVez = useRef(true);
  useEffect(() => {
    const trilha = trilhaRef.current;
    if (!trilha) return;

    const item = trilha.children[atual] as HTMLElement | undefined;
    if (!item) return;

    // Centraliza a miniatura dentro da própria fita
    const alvo = item.offsetLeft - trilha.clientWidth / 2 + item.clientWidth / 2;
    const max = trilha.scrollWidth - trilha.clientWidth;
    const destino = Math.max(0, Math.min(alvo, max));

    // Na montagem posiciona sem animação e sem mexer na página
    trilha.scrollTo({
      left: destino,
      behavior: primeiraVez.current ? 'auto' : 'smooth',
    });
    primeiraVez.current = false;
  }, [atual]);

  function onTouchStart(e: React.TouchEvent) {
    touchX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(delta) > 50) {
      delta < 0 ? proxima() : anterior();
    }
    touchX.current = null;
  }

  if (total === 0) return null;

  return (
    <>
      <div className="galeria">
        <div
          className="galeria-palco"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          role="group"
          aria-roledescription="carrossel"
          aria-label={`Fotos de ${titulo}`}
        >
          {fotos.map((foto, i) => (
            <div
              key={foto + i}
              className={`galeria-slide ${i === atual ? 'ativo' : ''}`}
              aria-hidden={i !== atual}
            >
              <Image
                src={foto}
                alt={`${titulo} — foto ${i + 1} de ${total}`}
                fill
                sizes="(max-width: 968px) 100vw, 60vw"
                style={{ objectFit: 'cover' }}
                priority={i === 0}
              />
            </div>
          ))}

          <button
            type="button"
            className="galeria-zoom"
            onClick={() => setZoom(true)}
            aria-label="Ampliar foto"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
          </button>

          <span className="galeria-contador" aria-live="polite">
            {atual + 1} / {total}
          </span>

          {total > 1 && (
            <>
              <button type="button" className="galeria-seta esq" onClick={anterior} aria-label="Foto anterior">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button type="button" className="galeria-seta dir" onClick={proxima} aria-label="Próxima foto">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </>
          )}
        </div>

        {total > 1 && (
          <>
            <div className="galeria-miniaturas" ref={trilhaRef}>
              {fotos.map((foto, i) => (
                <button
                  key={foto + i}
                  type="button"
                  className={`galeria-mini ${i === atual ? 'ativa' : ''}`}
                  onClick={() => ir(i)}
                  aria-label={`Ver foto ${i + 1}`}
                  aria-current={i === atual}
                >
                  <Image src={foto} alt="" width={120} height={80} style={{ objectFit: 'cover' }} />
                </button>
              ))}
            </div>

            <div className="galeria-pontos" role="tablist" aria-label="Navegação de fotos">
              {fotos.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  className={`galeria-ponto ${i === atual ? 'ativo' : ''}`}
                  onClick={() => ir(i)}
                  aria-label={`Foto ${i + 1}`}
                  aria-selected={i === atual}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {zoom && (
        <div
          className="galeria-lightbox"
          onClick={() => setZoom(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`Foto ampliada de ${titulo}`}
        >
          <button type="button" className="galeria-fechar" onClick={() => setZoom(false)} aria-label="Fechar">
            ✕
          </button>

          <div className="galeria-lightbox-img" onClick={(e) => e.stopPropagation()}>
            <Image
              src={fotos[atual]}
              alt={`${titulo} — foto ${atual + 1}`}
              fill
              sizes="100vw"
              style={{ objectFit: 'contain' }}
            />
          </div>

          {total > 1 && (
            <>
              <button
                type="button"
                className="galeria-seta esq grande"
                onClick={(e) => {
                  e.stopPropagation();
                  anterior();
                }}
                aria-label="Foto anterior"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                className="galeria-seta dir grande"
                onClick={(e) => {
                  e.stopPropagation();
                  proxima();
                }}
                aria-label="Próxima foto"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </>
          )}

          <span className="galeria-lightbox-contador">
            {atual + 1} / {total}
          </span>
        </div>
      )}
    </>
  );
}
