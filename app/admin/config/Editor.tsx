'use client';

import { useEffect, useState } from 'react';
import type { SiteConfig } from '@/lib/config';

export default function EditorConfig() {
  const [cfg, setCfg] = useState<SiteConfig | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/config')
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setCfg(j.config);
        else setMsg({ tipo: 'erro', texto: j.message });
        setCarregando(false);
      })
      .catch(() => {
        setMsg({ tipo: 'erro', texto: 'Não foi possível carregar as configurações.' });
        setCarregando(false);
      });
  }, []);

  function up<S extends keyof SiteConfig>(secao: S, campo: string, valor: unknown) {
    setCfg((c) => (c ? { ...c, [secao]: { ...(c[secao] as object), [campo]: valor } } : c));
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!cfg) return;
    setSalvando(true);
    setMsg(null);

    try {
      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cfg),
      });
      const json = await res.json();
      setMsg({
        tipo: json.ok ? 'ok' : 'erro',
        texto: json.message || (json.ok ? 'Salvo!' : 'Não foi possível salvar.'),
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setMsg({ tipo: 'erro', texto: 'Erro de conexão.' });
    }
    setSalvando(false);
  }

  if (carregando) return <div className="adm-carregando">Carregando…</div>;
  if (!cfg) return <div className="adm-aviso adm-aviso-erro">{msg?.texto || 'Erro ao carregar.'}</div>;

  return (
    <form onSubmit={salvar}>
      <div className="adm-topo">
        <div>
          <h1 className="adm-titulo">Textos do site</h1>
          <p className="adm-sub">Altere as informações que aparecem para os visitantes.</p>
        </div>
        <button type="submit" className="adm-btn adm-btn-ouro" disabled={salvando}>
          {salvando ? 'Salvando…' : 'Salvar tudo'}
        </button>
      </div>

      {msg && <div className={`adm-aviso adm-aviso-${msg.tipo}`}>{msg.texto}</div>}

      {/* CONTATO */}
      <div className="adm-card">
        <h2 className="adm-card-titulo">Contato</h2>
        <div className="adm-grade c2">
          <div className="adm-campo">
            <label className="adm-label">Telefone exibido</label>
            <input className="adm-input" value={cfg.contato.telefone} onChange={(e) => up('contato', 'telefone', e.target.value)} />
          </div>
          <div className="adm-campo">
            <label className="adm-label">WhatsApp (só números)</label>
            <input className="adm-input" value={cfg.contato.whatsapp} onChange={(e) => up('contato', 'whatsapp', e.target.value)} />
            <p className="adm-dica">Com código do país e DDD. Ex: 5577991555610</p>
          </div>
          <div className="adm-campo">
            <label className="adm-label">E-mail</label>
            <input type="email" className="adm-input" value={cfg.contato.email} onChange={(e) => up('contato', 'email', e.target.value)} />
          </div>
          <div className="adm-campo">
            <label className="adm-label">CRECI</label>
            <input className="adm-input" value={cfg.contato.creci} onChange={(e) => up('contato', 'creci', e.target.value)} />
          </div>
          <div className="adm-campo">
            <label className="adm-label">Localização</label>
            <input className="adm-input" value={cfg.contato.localizacao} onChange={(e) => up('contato', 'localizacao', e.target.value)} />
          </div>
          <div className="adm-campo">
            <label className="adm-label">Horário de atendimento</label>
            <input className="adm-input" value={cfg.contato.horario} onChange={(e) => up('contato', 'horario', e.target.value)} />
          </div>
        </div>
      </div>

      {/* TOPO DA PÁGINA */}
      <div className="adm-card">
        <h2 className="adm-card-titulo">Topo da página inicial</h2>
        <div className="adm-campo">
          <label className="adm-label">Frase pequena (acima do título)</label>
          <input className="adm-input" value={cfg.hero.eyebrow} onChange={(e) => up('hero', 'eyebrow', e.target.value)} />
        </div>
        <div className="adm-grade c2">
          <div className="adm-campo">
            <label className="adm-label">Título</label>
            <input className="adm-input" value={cfg.hero.titulo} onChange={(e) => up('hero', 'titulo', e.target.value)} />
          </div>
          <div className="adm-campo">
            <label className="adm-label">Parte em dourado</label>
            <input className="adm-input" value={cfg.hero.tituloDestaque} onChange={(e) => up('hero', 'tituloDestaque', e.target.value)} />
          </div>
        </div>
        <div className="adm-campo">
          <label className="adm-label">Subtítulo</label>
          <textarea className="adm-textarea" style={{ minHeight: 80 }} value={cfg.hero.subtitulo} onChange={(e) => up('hero', 'subtitulo', e.target.value)} />
        </div>
        <div className="adm-grade c2">
          <div className="adm-campo">
            <label className="adm-label">Foto do corretor (endereço)</label>
            <input className="adm-input" value={cfg.hero.fotoCorretor} onChange={(e) => up('hero', 'fotoCorretor', e.target.value)} />
          </div>
          <div className="adm-campo">
            <label className="adm-label">Imagem de fundo (endereço)</label>
            <input className="adm-input" value={cfg.hero.imagemFundo} onChange={(e) => up('hero', 'imagemFundo', e.target.value)} />
          </div>
        </div>

        <label className="adm-label" style={{ marginTop: 12 }}>Números em destaque</label>
        <div className="adm-grade c3">
          {cfg.hero.stats.map((s, i) => (
            <div key={i} className="adm-repetidor-item">
              <input
                className="adm-input"
                value={s.numero}
                placeholder="+500"
                onChange={(e) => {
                  const stats = [...cfg.hero.stats];
                  stats[i] = { ...stats[i], numero: e.target.value };
                  up('hero', 'stats', stats);
                }}
                style={{ marginBottom: 8 }}
              />
              <input
                className="adm-input"
                value={s.label}
                placeholder="Imóveis Vendidos"
                onChange={(e) => {
                  const stats = [...cfg.hero.stats];
                  stats[i] = { ...stats[i], label: e.target.value };
                  up('hero', 'stats', stats);
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* SOBRE */}
      <div className="adm-card">
        <h2 className="adm-card-titulo">Seção "Sobre"</h2>
        <div className="adm-campo">
          <label className="adm-label">Foto (endereço)</label>
          <input className="adm-input" value={cfg.sobre.foto} onChange={(e) => up('sobre', 'foto', e.target.value)} />
        </div>
        <div className="adm-campo">
          <label className="adm-label">Primeiro parágrafo</label>
          <textarea className="adm-textarea" value={cfg.sobre.paragrafo1} onChange={(e) => up('sobre', 'paragrafo1', e.target.value)} />
        </div>
        <div className="adm-campo">
          <label className="adm-label">Segundo parágrafo</label>
          <textarea className="adm-textarea" value={cfg.sobre.paragrafo2} onChange={(e) => up('sobre', 'paragrafo2', e.target.value)} />
        </div>
      </div>

      {/* BANCOS */}
      <div className="adm-card">
        <h2 className="adm-card-titulo">Taxas dos bancos</h2>
        {cfg.bancos.map((b, i) => (
          <div key={i} className="adm-repetidor-item">
            <div className="adm-repetidor-topo">
              <span className="adm-repetidor-num">Banco {i + 1}</span>
              <button
                type="button"
                className="adm-btn adm-btn-perigo"
                onClick={() => setCfg({ ...cfg, bancos: cfg.bancos.filter((_, x) => x !== i) })}
                style={{ padding: '5px 11px', fontSize: 13 }}
              >
                Remover
              </button>
            </div>
            <div className="adm-grade c3">
              <input
                className="adm-input"
                placeholder="Nome do banco"
                value={b.nome}
                onChange={(e) => {
                  const bancos = [...cfg.bancos];
                  bancos[i] = { ...bancos[i], nome: e.target.value };
                  setCfg({ ...cfg, bancos });
                }}
              />
              <input
                className="adm-input"
                placeholder="Sigla"
                value={b.sigla}
                onChange={(e) => {
                  const bancos = [...cfg.bancos];
                  bancos[i] = { ...bancos[i], sigla: e.target.value };
                  setCfg({ ...cfg, bancos });
                }}
              />
              <input
                className="adm-input"
                placeholder="11,19% a.a + TR"
                value={b.taxa}
                onChange={(e) => {
                  const bancos = [...cfg.bancos];
                  bancos[i] = { ...bancos[i], taxa: e.target.value };
                  setCfg({ ...cfg, bancos });
                }}
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          className="adm-btn adm-btn-linha"
          onClick={() => setCfg({ ...cfg, bancos: [...cfg.bancos, { nome: '', sigla: '', taxa: '' }] })}
        >
          + Adicionar banco
        </button>
      </div>

      {/* DEPOIMENTOS */}
      <div className="adm-card">
        <h2 className="adm-card-titulo">Depoimentos de clientes</h2>
        {cfg.depoimentos.map((d, i) => (
          <div key={i} className="adm-repetidor-item">
            <div className="adm-repetidor-topo">
              <span className="adm-repetidor-num">Depoimento {i + 1}</span>
              <button
                type="button"
                className="adm-btn adm-btn-perigo"
                onClick={() => setCfg({ ...cfg, depoimentos: cfg.depoimentos.filter((_, x) => x !== i) })}
                style={{ padding: '5px 11px', fontSize: 13 }}
              >
                Remover
              </button>
            </div>
            <div className="adm-grade c2" style={{ marginBottom: 10 }}>
              <input
                className="adm-input"
                placeholder="Nome do cliente"
                value={d.nome}
                onChange={(e) => {
                  const dep = [...cfg.depoimentos];
                  dep[i] = { ...dep[i], nome: e.target.value, inicial: e.target.value.charAt(0).toUpperCase() };
                  setCfg({ ...cfg, depoimentos: dep });
                }}
              />
              <input
                className="adm-input"
                placeholder="Cidade, BA"
                value={d.cidade}
                onChange={(e) => {
                  const dep = [...cfg.depoimentos];
                  dep[i] = { ...dep[i], cidade: e.target.value };
                  setCfg({ ...cfg, depoimentos: dep });
                }}
              />
            </div>
            <textarea
              className="adm-textarea"
              style={{ minHeight: 82 }}
              placeholder="O que o cliente disse…"
              value={d.texto}
              onChange={(e) => {
                const dep = [...cfg.depoimentos];
                dep[i] = { ...dep[i], texto: e.target.value };
                setCfg({ ...cfg, depoimentos: dep });
              }}
            />
          </div>
        ))}
        <button
          type="button"
          className="adm-btn adm-btn-linha"
          onClick={() =>
            setCfg({ ...cfg, depoimentos: [...cfg.depoimentos, { inicial: '', nome: '', cidade: '', texto: '' }] })
          }
        >
          + Adicionar depoimento
        </button>
      </div>

      <div className="adm-acoes">
        <button type="submit" className="adm-btn adm-btn-ouro" disabled={salvando}>
          {salvando ? 'Salvando…' : 'Salvar tudo'}
        </button>
      </div>

      <p className="adm-dica" style={{ marginTop: 14 }}>
        O site leva cerca de 1 minuto para mostrar as alterações.
      </p>
    </form>
  );
}
