'use client';

import { useState } from 'react';

/**
 * Formulário de contato.
 * Antes: jQuery -> admin-ajax.php -> tb_contact_form() -> wp_mail().
 * Agora: POST para /api/contato (Route Handler que roda como Serverless Function na Vercel).
 */
type Status = 'idle' | 'sending' | 'ok' | 'error';

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [feedback, setFeedback] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    setStatus('sending');
    setFeedback('');

    try {
      const res = await fetch('/api/contato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (res.ok) {
        setStatus('ok');
        setFeedback(json.message || 'Mensagem enviada! Entrarei em contato em breve.');
        form.reset();
      } else {
        setStatus('error');
        setFeedback(json.message || 'Não foi possível enviar. Tente pelo WhatsApp.');
      }
    } catch {
      setStatus('error');
      setFeedback('Erro de conexão. Tente novamente ou fale pelo WhatsApp.');
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="contact-name">Nome Completo *</label>
          <input type="text" id="contact-name" name="name" placeholder="Seu nome" required />
        </div>
        <div className="form-group">
          <label htmlFor="contact-email">E-mail *</label>
          <input type="email" id="contact-email" name="email" placeholder="seu@email.com" required />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="contact-phone">Telefone</label>
          <input type="tel" id="contact-phone" name="phone" placeholder="(77) 9 9999-9999" />
        </div>
        <div className="form-group">
          <label htmlFor="contact-interest">Interesse</label>
          <select id="contact-interest" name="interest" defaultValue="">
            <option value="">Selecione...</option>
            <option value="comprar">Quero Comprar</option>
            <option value="vender">Quero Vender</option>
            <option value="financiar">Financiamento</option>
            <option value="avaliar">Avaliação de Imóvel</option>
            <option value="outro">Outro</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="contact-message">Mensagem *</label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          placeholder="Descreva o que você procura ou sua dúvida..."
          required
        />
      </div>

      {feedback && (
        <div
          className="form-feedback"
          role="status"
          style={{
            display: 'block',
            padding: '12px 16px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            background: status === 'ok' ? 'rgba(37, 211, 102, 0.12)' : 'rgba(220, 38, 38, 0.12)',
            color: status === 'ok' ? '#25D366' : '#f87171',
            border: `1px solid ${status === 'ok' ? 'rgba(37,211,102,0.3)' : 'rgba(220,38,38,0.3)'}`,
          }}
        >
          {feedback}
        </div>
      )}

      <button type="submit" className="form-submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Enviando...' : 'Enviar Mensagem'}
      </button>
    </form>
  );
}
