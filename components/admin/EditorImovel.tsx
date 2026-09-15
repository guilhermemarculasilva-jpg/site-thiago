'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Imovel } from '@/lib/imoveis';

const VAZIO = {
  slug: '',
  titulo: '',
  descricao: '',
  valor: 0,
  area: 0,
  quartos: 0,
  banheiros: 0,
  vagas: 0,
  endereco: '',
  cidade: 'Barreiras',
  bairro: '',
  codigo: '',
  tipo: 'casa' as const,
  finalidade: 'venda' as const,
  destaque: false,
  imagem: '',
  galeria: [] as string[],
};

export default function EditorImovel({ imovel }: { imovel?: Imovel }) {
  const router = useRouter();
  const editando = Boolean(imovel);
  const slugOriginal = imovel?.slug;

  // A capa é sempre a primeira foto da galeria — modelo único, sem ambiguidade
  const fotosIniciais = imovel
    ? Array.from(new Set([imovel.imagem, ...(imovel.galeria || [])].filter(Boolean)))
    : [];

  const [form, setForm] = useState({ ...VAZIO, ...(imovel || {}) });
  const [fotos, setFotos] = useState<string[]>(fotosIniciais);
  const [salvando, setSalvando] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);
  const [urlManual, setUrlManual] = useState('');
  const [sobreDrop, setSobreDrop] = useState(false);
  const inputFile = useRef<HTMLInputElement>(null);

  function set<K extends keyof typeof form>(campo: K, valor: (typeof form)[K]) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  /* ----------------------------------------------------------- fotos */

  async function enviarArquivos(lista: FileList | File[]) {
    const arquivos = Array.from(lista).slice(0, 12);
    if (!arquivos.length) return;

    setEnviandoFoto(true);
    setMsg(null);
    const novas: string[] = [];
    const erros: string[] = [];

    for (const arquivo of arquivos) {
      const fd = new FormData();
      fd.append('arquivo', arquivo);
      fd.append('prefixo', form.titulo || 'imovel');

      try {
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
        const json = await res.json();
        if (json.ok) novas.push(json.url);
        else erros.push(`${arquivo.name}: ${json.message}`);
      } catch {
        erros.push(`${arquivo.name}: falha de conexão`);
      }
    }

    if (novas.length) setFotos((f) => [...f, ...novas]);
    if (erros.length) setMsg({ tipo: 'erro', texto: erros.join(' • ') });
    else if (novas.length) setMsg({ tipo: 'ok', texto: `${novas.length} foto(s) enviada(s).` });

    setEnviandoFoto(false);
    if (inputFile.current) inputFile.current.value = '';
  }

  function adicionarUrl() {
    const url = urlManual.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url) && !url.startsWith('/')) {
      setMsg({ tipo: 'erro', texto: 'Cole um endereço que comece com https://' });
      return;
    }
    setFotos((f) => [...f, url]);
    setUrlManual('');
    setMsg(null);
  }

  function moverFoto(de: number, para: number) {
    if (para < 0 || para >= fotos.length) return;
    const novas = [...fotos];
    const [item] = novas.splice(de, 1);
    novas.splice(para, 0, item);
    setFotos(novas);
  }

  function removerFoto(i: number) {
    setFotos((f) => f.filter((_, idx) => idx !== i));
  }

  /* ---------------------------------------------------------- salvar */

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!form.titulo.trim()) {
      setMsg({ tipo: 'erro', texto: 'Informe o título do imóvel.' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (fotos.length === 0) {
      setMsg({ tipo: 'erro', texto: 'Adicione pelo menos uma foto.' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSalvando(true);

    const corpo = {
      ...form,
      imagem: fotos[0],
      galeria: fotos,
      ...(editando ? { slugOriginal } : {}),
    };

    try {
      const res = await fetch('/api/admin/imoveis', {
        method: editando ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo),
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        setMsg({ tipo: 'erro', texto: json.message || 'Não foi possível salvar.' });
        setSalvando(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      router.push('/admin/imoveis?salvo=1');
      router.refresh();
    } catch {
      setMsg({ tipo: 'erro', texto: 'Erro de conexão ao salvar.' });
      setSalvando(false);
    }
  }

  /* ------------------------------------------------------------ view */

  return (
    <form onSubmit={salvar}>
      {msg && <div className={`adm-aviso adm-aviso-${msg.tipo}`}>{msg.texto}</div>}

      {/* FOTOS */}
      <div className="adm-card">
        <h2 className="adm-card-titulo">Fotos do imóvel</h2>

        <div
          className={`adm-dropzone ${sobreDrop ? 'sobre' : ''}`}
          onClick={() => inputFile.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setSobreDrop(true);
          }}
          onDragLeave={() => setSobreDrop(false)}
          onDrop={(e) => {
            e.preventDefault();
            setSobreDrop(false);
            if (e.dataTransfer.files?.length) enviarArquivos(e.dataTransfer.files);
          }}
        >
          <p>
            {enviandoFoto ? (
              'Enviando fotos…'
            ) : (
              <>
                <strong>Clique para escolher</strong> ou arraste as fotos aqui
              </>
            )}
          </p>
          <p style={{ fontSize: 12, marginTop: 6 }}>JPG, PNG ou WebP — até 4 MB cada</p>
        </div>

        <input
          ref={inputFile}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          hidden
          onChange={(e) => e.target.files && enviarArquivos(e.target.files)}
        />

        <div style={{ display: 'flex', gap: 9, marginTop: 13, flexWrap: 'wrap' }}>
          <input
            type="url"
            className="adm-input"
            placeholder="Ou cole o endereço de uma foto da internet"
            value={urlManual}
            onChange={(e) => setUrlManual(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                adicionarUrl();
              }
            }}
            style={{ flex: '1 1 260px' }}
          />
          <button type="button" className="adm-btn adm-btn-linha" onClick={adicionarUrl}>
            Adicionar
          </button>
        </div>

        {fotos.length > 0 && (
          <>
            <p className="adm-dica" style={{ marginTop: 15 }}>
              A primeira foto é a <strong style={{ color: '#D4AF37' }}>capa</strong> — ela aparece na listagem. Use as
              setas para reordenar.
            </p>
            <div className="adm-fotos">
              {fotos.map((foto, i) => (
                <div key={foto + i} className={`adm-foto ${i === 0 ? 'capa' : ''}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={foto} alt={`Foto ${i + 1}`} loading="lazy" />
                  {i === 0 && <span className="adm-foto-capa-tag">Capa</span>}
                  <div className="adm-foto-acoes">
                    {i > 0 && (
                      <button type="button" className="adm-foto-btn" onClick={() => moverFoto(i, i - 1)} title="Mover para trás">
                        ‹
                      </button>
                    )}
                    {i < fotos.length - 1 && (
                      <button type="button" className="adm-foto-btn" onClick={() => moverFoto(i, i + 1)} title="Mover para frente">
                        ›
                      </button>
                    )}
                    <button type="button" className="adm-foto-btn del" onClick={() => removerFoto(i)} title="Remover">
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* DADOS PRINCIPAIS */}
      <div className="adm-card">
        <h2 className="adm-card-titulo">Dados principais</h2>

        <div className="adm-campo">
          <label className="adm-label" htmlFor="titulo">Título *</label>
          <input
            id="titulo"
            className="adm-input"
            value={form.titulo}
            onChange={(e) => set('titulo', e.target.value)}
            placeholder="Ex: Casa com 3 quartos no Centro"
            required
          />
        </div>

        <div className="adm-campo">
          <label className="adm-label" htmlFor="descricao">Descrição</label>
          <textarea
            id="descricao"
            className="adm-textarea"
            value={form.descricao}
            onChange={(e) => set('descricao', e.target.value)}
            placeholder="Descreva os diferenciais do imóvel: acabamento, localização, área de lazer…"
          />
        </div>

        <div className="adm-grade c3">
          <div className="adm-campo">
            <label className="adm-label" htmlFor="valor">Valor (R$)</label>
            <input
              id="valor"
              type="number"
              className="adm-input"
              value={form.valor || ''}
              onChange={(e) => set('valor', Number(e.target.value))}
              placeholder="450000"
              min={0}
            />
            <p className="adm-dica">Deixe 0 para "Sob consulta"</p>
          </div>

          <div className="adm-campo">
            <label className="adm-label" htmlFor="tipo">Tipo</label>
            <select id="tipo" className="adm-select" value={form.tipo} onChange={(e) => set('tipo', e.target.value as typeof form.tipo)}>
              <option value="casa">Casa</option>
              <option value="apartamento">Apartamento</option>
              <option value="terreno">Terreno</option>
              <option value="comercial">Comercial</option>
            </select>
          </div>

          <div className="adm-campo">
            <label className="adm-label" htmlFor="finalidade">Finalidade</label>
            <select
              id="finalidade"
              className="adm-select"
              value={form.finalidade}
              onChange={(e) => set('finalidade', e.target.value as typeof form.finalidade)}
            >
              <option value="venda">Venda</option>
              <option value="aluguel">Aluguel</option>
              <option value="lancamento">Lançamento</option>
            </select>
          </div>
        </div>

        <div className="adm-grade c4">
          <div className="adm-campo">
            <label className="adm-label" htmlFor="area">Área (m²)</label>
            <input id="area" type="number" className="adm-input" value={form.area || ''} onChange={(e) => set('area', Number(e.target.value))} min={0} />
          </div>
          <div className="adm-campo">
            <label className="adm-label" htmlFor="quartos">Quartos</label>
            <input id="quartos" type="number" className="adm-input" value={form.quartos || ''} onChange={(e) => set('quartos', Number(e.target.value))} min={0} />
          </div>
          <div className="adm-campo">
            <label className="adm-label" htmlFor="banheiros">Banheiros</label>
            <input id="banheiros" type="number" className="adm-input" value={form.banheiros || ''} onChange={(e) => set('banheiros', Number(e.target.value))} min={0} />
          </div>
          <div className="adm-campo">
            <label className="adm-label" htmlFor="vagas">Vagas</label>
            <input id="vagas" type="number" className="adm-input" value={form.vagas || ''} onChange={(e) => set('vagas', Number(e.target.value))} min={0} />
          </div>
        </div>
      </div>

      {/* LOCALIZAÇÃO */}
      <div className="adm-card">
        <h2 className="adm-card-titulo">Localização</h2>

        <div className="adm-campo">
          <label className="adm-label" htmlFor="endereco">Endereço</label>
          <input id="endereco" className="adm-input" value={form.endereco} onChange={(e) => set('endereco', e.target.value)} placeholder="Rua, número" />
        </div>

        <div className="adm-grade c3">
          <div className="adm-campo">
            <label className="adm-label" htmlFor="bairro">Bairro</label>
            <input id="bairro" className="adm-input" value={form.bairro} onChange={(e) => set('bairro', e.target.value)} />
          </div>
          <div className="adm-campo">
            <label className="adm-label" htmlFor="cidade">Cidade</label>
            <input id="cidade" className="adm-input" value={form.cidade} onChange={(e) => set('cidade', e.target.value)} />
          </div>
          <div className="adm-campo">
            <label className="adm-label" htmlFor="codigo">Código</label>
            <input id="codigo" className="adm-input" value={form.codigo} onChange={(e) => set('codigo', e.target.value)} placeholder="TB-010" />
            <p className="adm-dica">Deixe vazio para gerar automático</p>
          </div>
        </div>

        <label className="adm-check" style={{ marginTop: 6 }}>
          <input type="checkbox" checked={form.destaque} onChange={(e) => set('destaque', e.target.checked)} />
          <span>Mostrar na página inicial (destaque)</span>
        </label>
      </div>

      <div className="adm-acoes">
        <button type="submit" className="adm-btn adm-btn-ouro" disabled={salvando || enviandoFoto}>
          {salvando ? 'Salvando…' : editando ? 'Salvar alterações' : 'Cadastrar imóvel'}
        </button>
        <button type="button" className="adm-btn adm-btn-linha" onClick={() => router.push('/admin/imoveis')} disabled={salvando}>
          Cancelar
        </button>
      </div>

      <p className="adm-dica" style={{ marginTop: 14 }}>
        Depois de salvar, o site leva cerca de 1 minuto para mostrar a alteração.
      </p>
    </form>
  );
}
