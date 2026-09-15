'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SITE, whatsappLink, NAV_LINKS } from '@/lib/site';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Trava o scroll do body quando o menu mobile está aberto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <>
      <header id="masthead" className="site-header" role="banner">
        <div className="container">
          <div className="header-inner">
            <Link href="/" className="site-logo" rel="home" aria-label={`${SITE.name} - Ir para a página inicial`}>
              <Image
                src="/assets/images/logo.png"
                alt={SITE.name}
                width={52}
                height={52}
                className="logo-img"
                priority
              />
              <div className="logo-text-wrapper">
                <span className="logo-name">{SITE.name}</span>
                <span className="logo-creci">CRECI {SITE.creci}</span>
              </div>
            </Link>

            <nav className="main-nav" id="site-navigation" role="navigation" aria-label="Menu Principal">
              <ul id="primary-menu">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="header-cta">
              <a
                href={whatsappLink('Olá! Vim pelo site e gostaria de atendimento exclusivo.')}
                className="btn btn-gold"
                target="_blank"
                rel="noopener noreferrer"
              >
                Atendimento Exclusivo
              </a>

              <button
                className="hamburger"
                id="hamburger"
                aria-label="Abrir menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(true)}
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div
        className={`mobile-menu${menuOpen ? ' active' : ''}`}
        id="mobile-menu"
        role="dialog"
        aria-label="Menu Mobile"
        aria-hidden={!menuOpen}
      >
        <button className="mobile-menu-close" aria-label="Fechar menu" onClick={() => setMenuOpen(false)}>
          &times;
        </button>
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
            {link.label}
          </Link>
        ))}
        <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" style={{ color: '#25D366' }}>
          {SITE.phone}
        </a>
      </div>
    </>
  );
}
