'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { Imovel } from '@/lib/imoveis';

function preco(v: number) {
  if (!v) return 'Sob consulta';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);
}

export default function ListaImoveis() {
  const params = useSearchParams();
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(
    params.get('salvo') ? { tipo: 'ok', texto: 'Imóvel salvo! O site será atualizado em cerca de 1 minuto.' } : null
  );
  const [excluindo, setExcluindo] = useState<string | null>(null);

  async function carregar() {
    setCarregando(true);
    try {
      const res = await fetch('/api/admin/imoveis');
      const json = await res.json();
      if (json.ok) setImoveis(json.imoveis);
      else setMsg({ tipo: 'erro', texto: json.message });
    } catch {
      setMsg({ tipo: 'erro', texto: 'Não foi possível carregar os imóveis.' });
    }
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function excluir(slug: string, titulo: string) {
    if (!confirm(`Excluir "${titulo}"?\n\nEsta ação não pode ser desfeita.`)) return;

    setExcluindo(slug);
    try {
      const res = await fetch(`/api/admin/imoveis?slug=${encodeURIComponent(slug)}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.ok) {
        setImoveis((l) => l.filter((i) => i.slug !== slug));
        setMsg({ tipo: 'ok', texto: 'Imóvel excluído.' });
      } else {
        setMsg({ tipo: 'erro', texto: json.message });
      }
    } catch {
      setMsg({ tipo: 'erro', texto: 'Erro ao excluir.' });
    }
    setExcluindo(null);
  }

  const filtrados = busca
    ? imoveis.filter((i) =>
        [i.titulo, i.bairro, i.cidade, i.codigo].join(' ').toLowerCase().includes(busca.toLowerCase())
      )
    : imoveis;

  return (
    <>
      <div className="adm-topo">
        <div>
          <h1 className="adm-titulo">Imóveis</h1>
          <p className="adm-sub">
            {carregando ? 'Carregando…' : `${imoveis.length} cadastrado${imoveis.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <Link href="/admin/imoveis/novo" className="adm-btn adm-btn-ouro">
          + Novo imóvel
        </Link>
      </div>

      {msg && <div className={`adm-aviso adm-aviso-${msg.tipo}`}>{msg.texto}</div>}

      {imoveis.length > 3 && (
        <input
          className="adm-input"
          placeholder="Buscar por título, bairro ou código…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{ marginBottom: 18 }}
        />
      )}

      {carregando ? (
        <div className="adm-carregando">Carregando imóveis…</div>
      ) : filtrados.length === 0 ? (
        <div className="adm-vazio">
          <p>{busca ? 'Nenhum imóvel encontrado para esta busca.' : 'Nenhum imóvel cadastrado ainda.'}</p>
          {!busca && (
            <Link href="/admin/imoveis/novo" className="adm-btn adm-btn-ouro">
              Cadastrar o primeiro imóvel
            </Link>
          )}
        </div>
      ) : (
        <div className="adm-lista">
          {filtrados.map((im) => (
            <div key={im.slug} className="adm-item">
              <div className="adm-item-foto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {im.imagem && <img src={im.imagem} alt="" loading="lazy" />}
              </div>

              <div className="adm-item-info">
                <h3 className="adm-item-titulo">{im.titulo}</h3>
                <div className="adm-item-meta">
                  <span className="adm-item-preco">
                    {preco(im.valor)}
                    {im.finalidade === 'aluguel' ? '/mês' : ''}
                  </span>
                  {(im.bairro || im.cidade) && ` · ${[im.bairro, im.cidade].filter(Boolean).join(', ')}`}
                </div>
                <div className="adm-tags">
                  <span className="adm-tag">{im.codigo}</span>
                  <span className="adm-tag">{im.tipo}</span>
                  <span className="adm-tag">{im.finalidade}</span>
                  {im.destaque && <span className="adm-tag ouro">Destaque</span>}
                  {(im.galeria?.length || 0) > 1 && (
                    <span className="adm-tag verde">{im.galeria!.length} fotos</span>
                  )}
                </div>
              </div>

              <div className="adm-item-acoes">
                <a
                  href={`/imoveis/${im.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="adm-btn adm-btn-linha"
                  title="Ver no site"
                >
                  Ver
                </a>
                <Link href={`/admin/imoveis/${im.slug}`} className="adm-btn adm-btn-linha">
                  Editar
                </Link>
                <button
                  type="button"
                  className="adm-btn adm-btn-perigo"
                  onClick={() => excluir(im.slug, im.titulo)}
                  disabled={excluindo === im.slug}
                >
                  {excluindo === im.slug ? '…' : 'Excluir'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
