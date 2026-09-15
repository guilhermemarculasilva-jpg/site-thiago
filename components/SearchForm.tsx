'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { TIPOS, FINALIDADES } from '@/lib/imoveis';
import { IconSearch } from './icons';

/**
 * Substitui o formulário GET do WordPress (que ia para /?s=...&post_type=imovel).
 * Aqui navega para /imoveis com query string.
 */
export default function SearchForm() {
  const router = useRouter();
  const [s, setS] = useState('');
  const [tipo, setTipo] = useState('');
  const [finalidade, setFinalidade] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (s) params.set('s', s);
    if (tipo) params.set('tipo', tipo);
    if (finalidade) params.set('finalidade', finalidade);
    router.push(`/imoveis${params.toString() ? `?${params}` : ''}`);
  }

  return (
    <div className="search-wrap">
      <div className="container">
        <div className="search-box">
          <form className="search-form" onSubmit={handleSubmit} role="search" aria-label="Buscar imóveis">
            <div className="search-field" style={{ flex: 2 }}>
              <label htmlFor="search-keyword">O que você procura?</label>
              <input
                type="text"
                id="search-keyword"
                name="s"
                value={s}
                onChange={(e) => setS(e.target.value)}
                placeholder="Ex: Casa com piscina, Apartamento 3 quartos..."
              />
            </div>

            <div className="search-field">
              <label htmlFor="search-tipo">Tipo de Imóvel</label>
              <select id="search-tipo" name="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                <option value="">Todos os tipos</option>
                {TIPOS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="search-field">
              <label htmlFor="search-finalidade">Finalidade</label>
              <select
                id="search-finalidade"
                name="finalidade"
                value={finalidade}
                onChange={(e) => setFinalidade(e.target.value)}
              >
                <option value="">Comprar ou Alugar</option>
                {FINALIDADES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="search-submit" aria-label="Buscar imóveis">
              <IconSearch size={18} />
              Buscar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
