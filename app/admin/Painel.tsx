'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Check {
  nome: string;
  ok: boolean;
  detalhe: string;
}

export default function Painel({ nome }: { nome: string }) {
  const [status, setStatus] = useState<{ pronto: boolean; repositorio: string; checks: Check[] } | null>(null);
  const [totais, setTotais] = useState({ imoveis: 0, destaques: 0, leads: 0, naoLidos: 0 });
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/status').then((r) => r.json()).catch(() => null),
      fetch('/api/admin/imoveis').then((r) => r.json()).catch(() => null),
      fetch('/api/admin/leads').then((r) => r.json()).catch(() => null),
    ]).then(([st, im, ld]) => {
      if (st?.ok) setStatus(st);
      const imoveis = im?.imoveis || [];
      const leads = ld?.leads || [];
      setTotais({
        imoveis: imoveis.length,
        destaques: imoveis.filter((i: { destaque: boolean }) => i.destaque).length,
        leads: leads.length,
        naoLidos: leads.filter((l: { lido: boolean }) => !l.lido).length,
      });
      setCarregando(false);
    });
  }, []);

  const primeiroNome = nome.split(' ')[0];

  return (
    <>
      <div className="adm-topo">
        <div>
          <h1 className="adm-titulo">Olá, {primeiroNome}</h1>
          <p className="adm-sub">Gerencie os imóveis e o conteúdo do site.</p>
        </div>
        <Link href="/admin/imoveis/novo" className="adm-btn adm-btn-ouro">
          + Novo imóvel
        </Link>
      </div>

      {status && !status.pronto && (
        <div className="adm-aviso adm-aviso-erro">
          <b>Instalação incompleta</b>
          O painel ainda não consegue salvar alterações. Veja o diagnóstico abaixo e configure as variáveis que estão
          faltando nas Environment Variables da Vercel.
        </div>
      )}

      {/* Números */}
      <div className="adm-grade c4" style={{ marginBottom: 22 }}>
        {[
          { rotulo: 'Imóveis', valor: totais.imoveis, href: '/admin/imoveis' },
          { rotulo: 'Em destaque', valor: totais.destaques, href: '/admin/imoveis' },
          { rotulo: 'Mensagens', valor: totais.leads, href: '/admin/leads' },
          { rotulo: 'Não lidas', valor: totais.naoLidos, href: '/admin/leads', alerta: totais.naoLidos > 0 },
        ].map((c) => (
          <Link key={c.rotulo} href={c.href} className="adm-card" style={{ textDecoration: 'none', marginBottom: 0 }}>
            <div
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: c.alerta ? '#D4AF37' : '#fff',
                lineHeight: 1.1,
              }}
            >
              {carregando ? '—' : c.valor}
            </div>
            <div style={{ fontSize: 13, color: '#9a9aa6', marginTop: 4 }}>{c.rotulo}</div>
          </Link>
        ))}
      </div>

      {/* Atalhos */}
      <div className="adm-card">
        <h2 className="adm-card-titulo">O que você quer fazer?</h2>
        <div className="adm-grade c2">
          {[
            { t: 'Cadastrar um imóvel', d: 'Adicionar fotos, preço e detalhes', h: '/admin/imoveis/novo' },
            { t: 'Ver as mensagens', d: 'Contatos recebidos pelo formulário', h: '/admin/leads' },
            { t: 'Editar textos do site', d: 'Telefone, WhatsApp, Sobre, taxas', h: '/admin/config' },
            { t: 'Gerenciar imóveis', d: 'Editar ou remover os já cadastrados', h: '/admin/imoveis' },
          ].map((a) => (
            <Link
              key={a.h + a.t}
              href={a.h}
              style={{
                display: 'block',
                padding: '15px 17px',
                background: '#1d1d22',
                border: '1px solid #2a2a31',
                borderRadius: 10,
                textDecoration: 'none',
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 700, color: '#D4AF37', marginBottom: 3 }}>{a.t}</div>
              <div style={{ fontSize: 13, color: '#9a9aa6' }}>{a.d}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Diagnóstico */}
      {status && (
        <div className="adm-card">
          <h2 className="adm-card-titulo">Diagnóstico da instalação</h2>
          {status.checks.map((c) => (
            <div key={c.nome} className="adm-check-linha">
              <span className={`adm-check-bola ${c.ok ? 'ok' : 'nao'}`} />
              <span className="adm-check-nome">{c.nome}</span>
              <span className="adm-check-det">{c.detalhe}</span>
            </div>
          ))}
          {status.repositorio && status.repositorio !== '/' && (
            <p className="adm-dica" style={{ marginTop: 14 }}>
              Salvando em <strong style={{ color: '#D4AF37' }}>{status.repositorio}</strong>. Cada alteração vira um
              commit no GitHub e o site é republicado automaticamente em cerca de 1 minuto.
            </p>
          )}
        </div>
      )}
    </>
  );
}
