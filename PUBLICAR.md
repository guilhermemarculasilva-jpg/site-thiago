# Publicar no GitHub → Vercel

Projeto pronto: 1 commit em `main`, 30 arquivos, build validado.
Falta só conectar a um repositório remoto.

---

## Passo 1 — Criar o repositório vazio (você, 30 segundos)

Acesse **https://github.com/new** e preencha:

| Campo | Valor |
|---|---|
| **Repository name** | `site-imobiliaria-next` |
| **Visibility** | **Private** |
| Add a README | ❌ **deixe desmarcado** |
| Add .gitignore | ❌ **deixe desmarcado** |
| Choose a license | ❌ **deixe desmarcado** |

> ⚠️ **Importante:** não marque nenhuma das três opções de inicialização. Se o GitHub criar um commit inicial, o push vai dar conflito e teremos trabalho extra para resolver.

Clique em **Create repository**.

### Por que você cria e não eu?

Criar repositório pela API exige um token com permissão de **Administration**, que também permite **apagar** qualquer repositório seu. Criando o repo vazio à mão, o token que você me passa precisa apenas de `Contents: Read and write` — limitado a esse único repo. Se vazar, o estrago possível é muito menor.

---

## Passo 2 — Gerar o token (você)

Acesse **https://github.com/settings/personal-access-tokens/new**

| Campo | Valor |
|---|---|
| **Token name** | `deploy-bostock-next` |
| **Expiration** | 7 dias (ou menos) |
| **Repository access** | *Only select repositories* → **site-imobiliaria-next** |
| **Permissions** → Repository → **Contents** | **Read and write** |

Gere e copie o token (`github_pat_...`). Só isso — nenhuma outra permissão é necessária.

---

## Passo 3 — Me mande o token

Eu configuro o remote e faço o push. Você recebe o link do repositório pronto.

### Segurança

- O token fica **no histórico desta conversa**. Por isso: prazo curto, um repo só, uma permissão só.
- **Revogue depois** do deploy em https://github.com/settings/tokens — leva 5 segundos e não afeta o que já foi enviado.
- Gravo em `~/.git-credentials`, caminho **excluído dos snapshots** do workspace.

---

## Passo 4 — Vercel (depois do push)

1. Acesse **https://vercel.com/new**
2. Conecte sua conta GitHub e autorize o acesso ao `site-imobiliaria-next`
3. A Vercel detecta Next.js sozinha — **não altere nenhuma configuração**
4. **Deploy**

Em ~2 minutos o site está no ar num domínio `.vercel.app`. Todo `git push` seguinte republica automaticamente.

---

## Alternativa: fazer o push você mesmo

Se preferir não compartilhar token, rode isto na sua máquina — mas note que o projeto está **neste workspace**, então você precisaria baixá-lo antes. Me avise se quiser que eu gere um `.zip`.

```bash
git remote add origin https://github.com/guilhermemarculasilva-jpg/site-imobiliaria-next.git
git push -u origin main
```

---

## Detalhe: autoria do commit

O commit atual está como `Guilherme <guilherme@local>` — um placeholder, já que não havia identidade git configurada. Assim ele **não vai aparecer** no seu gráfico de contribuições.

Se quiser corrigir, me diga o e-mail da sua conta GitHub (ou o `@users.noreply.github.com` dela, para não expor o endereço real) que eu refaço a autoria antes do push.
