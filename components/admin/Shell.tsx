'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const ITENS = [
  { href: '/admin', label: 'Início', icone: 'home' },
  { href: '/admin/imoveis', label: 'Imóveis', icone: 'building' },
  { href: '/admin/leads', label: 'Mensagens', icone: 'mail', badge: true },
  { href: '/admin/config', label: 'Textos do site', icone: 'settings' },
  { href: '/admin/usuarios', label: 'Usuários', icone: 'users' },
];

function Icone({ nome }: { nome: string }) {
  const p = { width: 17, height: 17, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (nome) {
    case 'home':
      return <svg {...p}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><path d="M9 22V12h6v10" /></svg>;
    case 'building':
      return <svg {...p}><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22v-4h6v4M9 6h.01M15 6h.01M9 10h.01M15 10h.01M9 14h.01M15 14h.01" /></svg>;
    case 'mail':
      return <svg {...p}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 6L2 7" /></svg>;
    case 'settings':
      return <svg {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 008 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 8a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 3.6 1.65 1.65 0 0010 2.09V2a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 8v0c.14.31.4.56.71.7H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>;
    case 'users':
      return <svg {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>;
    case 'sair':
      return <svg {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></svg>;
    case 'externo':
      return <svg {...p}><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><path d="M15 3h6v6M10 14L21 3" /></svg>;
    default:
      return null;
  }
}

export default function Shell({
  children,
  usuario,
}: {
  children: React.ReactNode;
  usuario: { nome: string; email: string };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [naoLidos, setNaoLidos] = useState(0);

  // Fecha o menu ao navegar (importante no celular)
  useEffect(() => {
    setAberto(false);
  }, [pathname]);

  // Conta mensagens não lidas para o badge
  useEffect(() => {
    fetch('/api/admin/leads')
      .then((r) => r.json())
      .then((j) => {
        if (j.ok && Array.isArray(j.leads)) {
          setNaoLidos(j.leads.filter((l: { lido: boolean }) => !l.lido).length);
        }
      })
      .catch(() => {});
  }, [pathname]);

  async function sair() {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <div className="adm-shell">
      <div className={`adm-overlay ${aberto ? 'ativo' : ''}`} onClick={() => setAberto(false)} />

      <nav className={`adm-menu ${aberto ? 'aberto' : ''}`}>
        <div className="adm-menu-marca">
          <strong>Thiago Bostock</strong>
          <span>Painel</span>
        </div>

        {ITENS.map((item) => {
          const ativo = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={`adm-link ${ativo ? 'ativo' : ''}`}>
              <Icone nome={item.icone} />
              {item.label}
              {item.badge && naoLidos > 0 && <span className="adm-link-badge">{naoLidos}</span>}
            </Link>
          );
        })}

        <div className="adm-menu-rodape">
          <a href="/" target="_blank" rel="noopener noreferrer" className="adm-link">
            <Icone nome="externo" />
            Ver o site
          </a>
          <button type="button" onClick={sair} className="adm-link">
            <Icone nome="sair" />
            Sair
          </button>
          <div className="adm-menu-user">
            <b>{usuario.nome}</b>
            <span>{usuario.email}</span>
          </div>
        </div>
      </nav>

      <main className="adm-conteudo">
        <button
          type="button"
          className="adm-abrir-menu"
          onClick={() => setAberto(true)}
          aria-label="Abrir menu"
          style={{ marginBottom: 18 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
        {children}
      </main>
    </div>
  );
}
