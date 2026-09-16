'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { NAV_LINKS } from '@/lib/site';

/**
 * Descobre qual item do menu deve ficar destacado.
 *
 * O menu do site mistura dois tipos de link:
 *   - páginas de verdade  ->  "/imoveis", "/sobre"
 *   - âncoras da home     ->  "/#imoveis", "/#sobre"
 *
 * Por isso a regra tem duas partes:
 *   1. Fora da home, vale o começo da URL.
 *   2. Na home, vale a seção que está passando pela tela.
 *
 * Retorna o href do item ativo (ex.: "/#sobre") ou string vazia.
 */
export function useSecaoAtiva(): string {
  const pathname = usePathname();
  const [ativo, setAtivo] = useState('');

  useEffect(() => {
    const naHome = pathname === '/';

    // --- Fora da home: o destaque vem do caminho da URL ---------------
    if (!naHome) {
      const alvo = NAV_LINKS.filter((l) => !l.href.includes('#')) // só páginas
        .filter((l) => l.href !== '/')
        .find((l) => pathname === l.href || pathname.startsWith(l.href + '/'));

      // /imoveis/casa-x destaca "Imóveis" mesmo que o link seja âncora
      const fallback = NAV_LINKS.find((l) => {
        const nome = l.href.replace('/#', '').replace('/', '');
        return nome && pathname.startsWith('/' + nome);
      });

      setAtivo(alvo?.href ?? fallback?.href ?? '');
      return;
    }

    // --- Na home: acompanha a rolagem ---------------------------------
    const ancoras = NAV_LINKS.filter((l) => l.href.startsWith('/#')).map((l) => ({
      href: l.href,
      id: l.href.slice(2),
    }));

    const calcular = () => {
      // Linha de leitura: um terço abaixo do topo da janela
      const linha = window.scrollY + window.innerHeight * 0.33;
      let atual = '';

      for (const { href, id } of ancoras) {
        const el = document.getElementById(id);
        if (!el) continue;
        const topo = el.getBoundingClientRect().top + window.scrollY;
        if (linha >= topo - 120) atual = href;
      }

      // Bem no topo da página: "Início"
      if (window.scrollY < 220) atual = '/';

      // No fim da página, destaca a última seção (ela pode ser curta
      // demais para alcançar a linha de leitura)
      const fim = window.scrollY + window.innerHeight >= document.body.scrollHeight - 80;
      if (fim && ancoras.length) atual = ancoras[ancoras.length - 1].href;

      setAtivo(atual);
    };

    calcular();

    let travado = false;
    const aoRolar = () => {
      if (travado) return;
      travado = true;
      requestAnimationFrame(() => {
        calcular();
        travado = false;
      });
    };

    window.addEventListener('scroll', aoRolar, { passive: true });
    window.addEventListener('resize', aoRolar);
    window.addEventListener('hashchange', calcular);

    return () => {
      window.removeEventListener('scroll', aoRolar);
      window.removeEventListener('resize', aoRolar);
      window.removeEventListener('hashchange', calcular);
    };
  }, [pathname]);

  return ativo;
}
