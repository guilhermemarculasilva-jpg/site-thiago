'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import '../admin.css';

function FormLogin() {
  const router = useRouter();
  const params = useSearchParams();
  const destino = params.get('next') || '/admin';

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setEnviando(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        setErro(json.message || 'Não foi possível entrar.');
        setEnviando(false);
        return;
      }

      router.push(destino);
      router.refresh();
    } catch {
      setErro('Erro de conexão. Verifique sua internet.');
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={entrar}>
      <div className="adm-login-logo">
        <strong>Thiago Bostock</strong>
        <span>Painel Administrativo</span>
      </div>

      {erro && <div className="adm-aviso adm-aviso-erro">{erro}</div>}

      <div className="adm-campo">
        <label className="adm-label" htmlFor="email">E-mail</label>
        <input
          id="email"
          type="email"
          className="adm-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          required
          autoFocus
        />
      </div>

      <div className="adm-campo">
        <label className="adm-label" htmlFor="senha">Senha</label>
        <input
          id="senha"
          type="password"
          className="adm-input"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          autoComplete="current-password"
          required
        />
      </div>

      <button type="submit" className="adm-btn adm-btn-ouro adm-btn-bloco" disabled={enviando} style={{ marginTop: 8 }}>
        {enviando ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="adm">
      <div className="adm-login">
        <div className="adm-login-card">
          <Suspense fallback={<div className="adm-carregando">Carregando…</div>}>
            <FormLogin />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
