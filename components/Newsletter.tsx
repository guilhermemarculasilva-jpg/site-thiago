'use client';

import { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    // Plugue aqui seu provedor (Mailchimp, Brevo, Resend...).
    setDone(true);
    setEmail('');
    setTimeout(() => setDone(false), 5000);
  }

  return (
    <section className="newsletter-section" aria-label="Cadastro de newsletter">
      <div className="container">
        <div className="newsletter-inner">
          <div>
            <h2 className="newsletter-title">
              Receba <span>Oportunidades</span> Exclusivas
            </h2>
            <p className="newsletter-subtitle">
              Seja o primeiro a saber sobre lançamentos e imóveis premium antes de chegarem ao mercado.
            </p>
          </div>
          <form className="newsletter-form" onSubmit={handleSubmit} noValidate>
            <input
              type="email"
              className="newsletter-input"
              placeholder="Seu melhor e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Seu e-mail"
            />
            <button type="submit" className="newsletter-btn">
              {done ? 'Cadastrado!' : 'Quero Receber'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
