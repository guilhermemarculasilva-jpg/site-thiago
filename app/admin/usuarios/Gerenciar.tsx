'use client';

import { useEffect, useState } from 'react';

interface UsuarioLista {
  email: string;
  nome: string;
  tipo: string;
}

export default function GerenciarUsuarios({ emailAtual }: { emailAtual: string }) {
  const [usuarios, setUsuarios] = useState<UsuarioLista[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);
  const [criando, setCriando] = useState(false);
  const [novo, setNovo] = useState({ nome: '', email: '', senha: '' });

  async function carregar() {
    try {
      const res = await fetch('/api/admin/usuarios');
      const json = await res.json();
      if (json.ok) setUsuarios(json.usuarios);
    } catch {
      setMsg({ tipo: 'erro', texto: 'Não foi possível carregar os usuários.' });
    }
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    setCriando(true);
    setMsg(null);

    try {
      const res = await fetch('/api/admin/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novo),
      });
      const json = await res.json();

      if (json.ok) {
        setMsg({ tipo: 'ok', texto: 'Usuário criado! Ele já pode entrar com esse e-mail e senha.' });
        setNovo({ nome: '', email: '', senha: '' });
        carregar();
      } else {
        setMsg({ tipo: 'erro', texto: json.message });
      }
    } catch {
      setMsg({ tipo: 'erro', texto: 'Erro de conexão.' });
    }
    setCriando(false);
  }

  async function remover(u: UsuarioLista) {
    if (!confirm(`Remover o acesso de ${u.nome} (${u.email})?`)) return;
    try {
      const res = await fetch(`/api/admin/usuarios?email=${encodeURIComponent(u.email)}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.ok) {
        setUsuarios((l) => l.filter((x) => x.email !== u.email));
        setMsg({ tipo: 'ok', texto: 'Usuário removido.' });
      } else {
        setMsg({ tipo: 'erro', texto: json.message });
      }
    } catch {
      setMsg({ tipo: 'erro', texto: 'Erro ao remover.' });
    }
  }

  return (
    <>
      <div className="adm-topo">
        <div>
          <h1 className="adm-titulo">Usuários</h1>
          <p className="adm-sub">Quem pode entrar no painel.</p>
        </div>
      </div>

      {msg && <div className={`adm-aviso adm-aviso-${msg.tipo}`}>{msg.texto}</div>}

      <div className="adm-card">
        <h2 className="adm-card-titulo">Com acesso hoje</h2>
        {carregando ? (
          <div className="adm-carregando" style={{ padding: 24 }}>Carregando…</div>
        ) : (
          usuarios.map((u) => (
            <div key={u.email} className="adm-check-linha" style={{ gap: 14 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14.5 }}>
                  {u.nome}
                  {u.email === emailAtual && (
                    <span className="adm-tag ouro" style={{ marginLeft: 8 }}>você</span>
                  )}
                  {u.tipo === 'dono' && (
                    <span className="adm-tag" style={{ marginLeft: 6 }}>principal</span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: '#9a9aa6', wordBreak: 'break-all' }}>{u.email}</div>
              </div>
              {u.tipo !== 'dono' && u.email !== emailAtual && (
                <button type="button" className="adm-btn adm-btn-perigo" onClick={() => remover(u)} style={{ padding: '6px 12px', fontSize: 13 }}>
                  Remover
                </button>
              )}
            </div>
          ))
        )}

        <p className="adm-dica" style={{ marginTop: 14 }}>
          O usuário <strong>principal</strong> vem das variáveis ADMIN_EMAIL e ADMIN_PASSWORD na Vercel. Para trocar a
          senha dele, altere a variável lá e faça um novo deploy.
        </p>
      </div>

      <div className="adm-card">
        <h2 className="adm-card-titulo">Adicionar pessoa</h2>
        <form onSubmit={criar}>
          <div className="adm-grade c2">
            <div className="adm-campo">
              <label className="adm-label">Nome</label>
              <input className="adm-input" value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })} required />
            </div>
            <div className="adm-campo">
              <label className="adm-label">E-mail</label>
              <input type="email" className="adm-input" value={novo.email} onChange={(e) => setNovo({ ...novo, email: e.target.value })} required />
            </div>
          </div>
          <div className="adm-campo">
            <label className="adm-label">Senha</label>
            <input
              type="text"
              className="adm-input"
              value={novo.senha}
              onChange={(e) => setNovo({ ...novo, senha: e.target.value })}
              minLength={8}
              required
              placeholder="Mínimo 8 caracteres"
            />
            <p className="adm-dica">Anote e envie para a pessoa — a senha não fica visível depois de salva.</p>
          </div>
          <button type="submit" className="adm-btn adm-btn-ouro" disabled={criando}>
            {criando ? 'Criando…' : 'Criar acesso'}
          </button>
        </form>
      </div>
    </>
  );
}
