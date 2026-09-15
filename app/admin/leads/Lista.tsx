'use client';

import { useEffect, useState } from 'react';

interface Lead {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  interesse: string;
  mensagem: string;
  recebidoEm: string;
  lido: boolean;
}

function quando(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const agora = Date.now();
  const min = Math.floor((agora - d.getTime()) / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min} min`;
  if (min < 1440) return `há ${Math.floor(min / 60)}h`;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function soDigitos(t: string) {
  return (t || '').replace(/\D/g, '');
}

export default function ListaLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState<'todos' | 'nao-lidos'>('todos');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/admin/leads')
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setLeads(j.leads);
        else setMsg(j.message || '');
        setCarregando(false);
      })
      .catch(() => {
        setMsg('Não foi possível carregar as mensagens.');
        setCarregando(false);
      });
  }, []);

  async function alternarLido(lead: Lead) {
    const novo = !lead.lido;
    setLeads((l) => l.map((x) => (x.id === lead.id ? { ...x, lido: novo } : x)));
    await fetch('/api/admin/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: lead.id, lido: novo }),
    }).catch(() => {});
  }

  async function excluir(lead: Lead) {
    if (!confirm(`Excluir a mensagem de ${lead.nome}?`)) return;
    setLeads((l) => l.filter((x) => x.id !== lead.id));
    await fetch(`/api/admin/leads?id=${encodeURIComponent(lead.id)}`, { method: 'DELETE' }).catch(() => {});
  }

  const visiveis = filtro === 'nao-lidos' ? leads.filter((l) => !l.lido) : leads;
  const naoLidos = leads.filter((l) => !l.lido).length;

  return (
    <>
      <div className="adm-topo">
        <div>
          <h1 className="adm-titulo">Mensagens</h1>
          <p className="adm-sub">
            {carregando ? 'Carregando…' : `${leads.length} no total · ${naoLidos} não lida${naoLidos === 1 ? '' : 's'}`}
          </p>
        </div>
        {leads.length > 0 && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className={`adm-btn ${filtro === 'todos' ? 'adm-btn-ouro' : 'adm-btn-linha'}`}
              onClick={() => setFiltro('todos')}
            >
              Todas
            </button>
            <button
              type="button"
              className={`adm-btn ${filtro === 'nao-lidos' ? 'adm-btn-ouro' : 'adm-btn-linha'}`}
              onClick={() => setFiltro('nao-lidos')}
            >
              Não lidas {naoLidos > 0 && `(${naoLidos})`}
            </button>
          </div>
        )}
      </div>

      {msg && <div className="adm-aviso adm-aviso-erro">{msg}</div>}

      {carregando ? (
        <div className="adm-carregando">Carregando mensagens…</div>
      ) : visiveis.length === 0 ? (
        <div className="adm-vazio">
          <p>
            {filtro === 'nao-lidos'
              ? 'Nenhuma mensagem não lida. Tudo em dia!'
              : 'Nenhuma mensagem recebida ainda. Quando alguém preencher o formulário do site, ela aparece aqui.'}
          </p>
        </div>
      ) : (
        visiveis.map((lead) => (
          <div key={lead.id} className={`adm-lead ${lead.lido ? 'lido' : ''}`}>
            <div className="adm-lead-topo">
              <div>
                <h3 className="adm-lead-nome">{lead.nome}</h3>
                <div className="adm-lead-contatos">
                  <a href={`mailto:${lead.email}`}>{lead.email}</a>
                  {lead.telefone && <a href={`tel:${lead.telefone}`}>{lead.telefone}</a>}
                  {lead.interesse && <span>Interesse: {lead.interesse}</span>}
                </div>
              </div>
              <span className="adm-lead-data">{quando(lead.recebidoEm)}</span>
            </div>

            <div className="adm-lead-msg">{lead.mensagem}</div>

            <div className="adm-lead-acoes">
              {lead.telefone && (
                <a
                  href={`https://wa.me/55${soDigitos(lead.telefone)}?text=${encodeURIComponent(
                    `Olá, ${lead.nome.split(' ')[0]}! Recebi sua mensagem pelo site.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="adm-btn adm-btn-ouro"
                >
                  Responder no WhatsApp
                </a>
              )}
              <a href={`mailto:${lead.email}?subject=${encodeURIComponent('Sobre seu contato pelo site')}`} className="adm-btn adm-btn-linha">
                Responder por e-mail
              </a>
              <button type="button" className="adm-btn adm-btn-linha" onClick={() => alternarLido(lead)}>
                {lead.lido ? 'Marcar como não lida' : 'Marcar como lida'}
              </button>
              <button type="button" className="adm-btn adm-btn-perigo" onClick={() => excluir(lead)}>
                Excluir
              </button>
            </div>
          </div>
        ))
      )}
    </>
  );
}
