# Thiago Bostock Imóveis — Next.js

Migração do tema WordPress `Thiago Bostock Imoveis` v1.0.1 para **Next.js 14 (App Router)**, pronto para deploy na Vercel.

O design é **idêntico** ao original: as 1.922 linhas do `style.css` foram preservadas sem alteração.

---

## Como rodar

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # build de produção
```

---

## Deploy na Vercel

### Opção A — pelo site (mais simples)

1. Suba este projeto para um repositório no GitHub
2. Acesse [vercel.com/new](https://vercel.com/new) e importe o repositório
3. A Vercel detecta Next.js sozinha — **não mude nenhuma configuração**
4. Clique em **Deploy**

### Opção B — pela CLI

```bash
npm i -g vercel
vercel
```

A partir daí, todo `git push` na branch principal publica automaticamente.

---

## Estrutura

```
app/
├── layout.tsx              # layout raiz: header, footer, fontes, SEO
├── page.tsx                # home com as 9 seções do front-page.php
├── theme.css               # style.css original (intocado)
├── main-extra.css          # estilos novos (páginas internas, ficha do imóvel)
├── not-found.tsx           # 404
├── sobre/page.tsx
├── contato/page.tsx
├── financiamento/page.tsx
├── imoveis/
│   ├── page.tsx            # listagem + filtros  (era archive-imovel.php)
│   └── [slug]/page.tsx     # ficha do imóvel     (era single-imovel.php)
└── api/contato/route.ts    # Serverless Function (era admin-ajax.php)

components/
├── Header.tsx              # header.php + menu mobile em React
├── Footer.tsx              # footer.php
├── PropertyCard.tsx        # template-parts/card-imovel.php
├── SearchForm.tsx          # busca da home
├── Simulator.tsx           # simulador + cálculo de parcela
├── ContactForm.tsx         # formulário com feedback
├── Newsletter.tsx
├── WhatsAppFloat.tsx       # botão flutuante
└── icons.tsx               # SVGs extraídos dos templates

lib/
├── site.ts                 # constantes TB_* e whatsappLink()
└── imoveis.ts              # modelo de dados + filtros

data/
└── imoveis.json            # os imóveis (era o CPT `imovel` no MySQL)
```

---

## De onde veio cada coisa

| WordPress | Next.js |
|---|---|
| `header.php` / `footer.php` | `app/layout.tsx` + `components/Header|Footer.tsx` |
| `front-page.php` (666 linhas) | `app/page.tsx` |
| `archive-imovel.php` | `app/imoveis/page.tsx` |
| `single-imovel.php` | `app/imoveis/[slug]/page.tsx` |
| `page-*.php` | `app/sobre|contato|financiamento/page.tsx` |
| `404.php` | `app/not-found.tsx` |
| CPT `imovel` + `wp_postmeta` | `data/imoveis.json` + `lib/imoveis.ts` |
| `admin-ajax.php` (filtro) | filtro no servidor via query string |
| `admin-ajax.php` + `wp_mail()` | `app/api/contato/route.ts` |
| `define('TB_PHONE', ...)` | `lib/site.ts` |
| `wp_nav_menu()` | `NAV_LINKS` em `lib/site.ts` |
| jQuery em `assets/js/main.js` | estado React nos componentes |
| Google Fonts via `wp_enqueue_style` | `next/font/google` (self-hosted) |

---

## Cadastrar um imóvel

Edite `data/imoveis.json` e faça commit. Cada entrada:

```json
{
  "slug": "casa-exemplo",          // vira a URL /imoveis/casa-exemplo
  "titulo": "Casa Exemplo",
  "descricao": "Texto descritivo...",
  "valor": 850000,                  // número puro, sem formatação
  "area": 180,
  "quartos": 3,
  "banheiros": 2,
  "vagas": 2,
  "endereco": "Rua Exemplo, 100",
  "cidade": "Barreiras",
  "bairro": "Centro",
  "codigo": "TB-010",
  "tipo": "casa",                   // casa | apartamento | terreno | comercial
  "finalidade": "venda",            // venda | aluguel | lancamento
  "destaque": true,                 // aparece na home
  "imagem": "https://..."
}
```

As rotas estáticas são regeradas no build. O TypeScript valida o formato.

---

## Ativar o envio de e-mail

A rota `/api/contato` valida os dados mas ainda **não dispara e-mail** — ela só registra no log. Para ativar, por exemplo com [Resend](https://resend.com):

1. `npm install resend`
2. Na Vercel, em *Settings → Environment Variables*, defina:
   - `RESEND_API_KEY`
   - `CONTACT_TO` (e-mail que recebe os leads)
3. Descomente o bloco marcado em `app/api/contato/route.ts`

Enquanto isso, os botões de WhatsApp continuam sendo o canal principal — e eles já funcionam.

---

## O que mudou em relação ao original

**Ganhos:**
- Imagens otimizadas automaticamente (`next/image`, AVIF/WebP)
- Fontes self-hosted, sem requisição ao Google
- Metadados de SEO por página + Open Graph
- JSON-LD `RealEstateListing` na ficha do imóvel
- Simulador agora **calcula a parcela** pela Tabela Price (o original só exibia os sliders)
- Página do imóvel com ficha técnica, imóveis similares e sidebar fixa
- Filtros por tipo e finalidade na listagem

**O que ficou pendente:**
- Sem painel administrativo — cadastro por JSON + commit
- Newsletter não persiste em lugar nenhum (falta plugar provedor)
- Galeria de fotos por imóvel: o campo `galeria` existe no tipo, mas a UI ainda não foi feita
- Os imóveis são fictícios, baseados nos placeholders do tema

---

## Trocar o JSON por um banco depois

Toda leitura de dados passa por `lib/imoveis.ts`. Para migrar para Vercel Postgres, Supabase ou um CMS, basta reimplementar `getImoveis()`, `getImovel()` e `filtrarImoveis()` — nenhum componente precisa mudar.
