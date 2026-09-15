/**
 * GitHub como banco de dados.
 *
 * O painel grava os arquivos JSON direto no repositório via API do GitHub.
 * Cada gravação é um commit; a Vercel detecta e republica o site sozinha.
 *
 * Variáveis de ambiente necessárias:
 *   GITHUB_TOKEN   - Personal Access Token (fine-grained) com permissão
 *                    "Contents: Read and write" neste repositório
 *   GITHUB_OWNER   - dono do repositório (ex: guilhermemarculasilva-jpg)
 *   GITHUB_REPO    - nome do repositório (ex: site-thiago)
 *   GITHUB_BRANCH  - branch de publicação (padrão: main)
 */

const API = 'https://api.github.com';

function env() {
  return {
    token: process.env.GITHUB_TOKEN || '',
    owner: process.env.GITHUB_OWNER || '',
    repo: process.env.GITHUB_REPO || '',
    branch: process.env.GITHUB_BRANCH || 'main',
  };
}

export function githubConfigurado(): boolean {
  const e = env();
  return Boolean(e.token && e.owner && e.repo);
}

export function githubInfo() {
  const e = env();
  return { owner: e.owner, repo: e.repo, branch: e.branch, configurado: githubConfigurado() };
}

async function gh(path: string, init: RequestInit = {}) {
  const { token } = env();
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'bostock-admin',
      ...(init.headers || {}),
    },
    cache: 'no-store',
  });
  return res;
}

/* --------------------------------------------------------------- leitura */

interface ArquivoRemoto<T> {
  data: T;
  sha: string | null;
}

/** Lê um JSON do repositório. Devolve o fallback se o arquivo não existir. */
export async function lerJson<T>(caminho: string, fallback: T): Promise<ArquivoRemoto<T>> {
  const { owner, repo, branch } = env();
  const res = await gh(`/repos/${owner}/${repo}/contents/${caminho}?ref=${branch}`);

  if (res.status === 404) return { data: fallback, sha: null };
  if (!res.ok) {
    throw new Error(`GitHub ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }

  const json = (await res.json()) as { content?: string; sha: string };
  if (!json.content) return { data: fallback, sha: json.sha ?? null };

  const bin = atob(json.content.replace(/\n/g, ''));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  const texto = new TextDecoder().decode(bytes);

  try {
    return { data: JSON.parse(texto) as T, sha: json.sha };
  } catch {
    return { data: fallback, sha: json.sha };
  }
}

/* --------------------------------------------------------------- escrita */

function paraBase64(texto: string): string {
  const bytes = new TextEncoder().encode(texto);
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}

/**
 * Grava um JSON no repositório (cria ou atualiza).
 *
 * @param pularDeploy quando true, adiciona "[skip ci]" à mensagem do commit,
 *        fazendo a Vercel ignorar o push. Usado para leads — senão cada
 *        mensagem recebida republicaria o site inteiro.
 */
export async function gravarJson(
  caminho: string,
  dados: unknown,
  mensagem: string,
  sha: string | null,
  pularDeploy = false
): Promise<{ sha: string; commit: string }> {
  const { owner, repo, branch } = env();
  const conteudo = JSON.stringify(dados, null, 2) + '\n';

  const body: Record<string, unknown> = {
    message: pularDeploy ? `${mensagem} [skip ci]` : mensagem,
    content: paraBase64(conteudo),
    branch,
  };
  if (sha) body.sha = sha;

  const res = await gh(`/repos/${owner}/${repo}/contents/${caminho}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    // 409 = conflito de sha (alguém salvou antes). Tentamos de novo com o sha atual.
    if (res.status === 409 || res.status === 422) {
      const atual = await lerJson<unknown>(caminho, null);
      if (atual.sha && atual.sha !== sha) {
        return gravarJson(caminho, dados, mensagem, atual.sha, pularDeploy);
      }
    }
    throw new Error(`Falha ao gravar ${caminho} — GitHub ${res.status}: ${txt.slice(0, 300)}`);
  }

  const json = (await res.json()) as { content: { sha: string }; commit: { sha: string } };
  return { sha: json.content.sha, commit: json.commit.sha };
}

/** Envia um arquivo binário (foto) já em base64 para o repositório. */
export async function gravarBinario(
  caminho: string,
  base64: string,
  mensagem: string
): Promise<string> {
  const { owner, repo, branch } = env();

  // Se já existir, precisamos do sha para sobrescrever
  let sha: string | null = null;
  const check = await gh(`/repos/${owner}/${repo}/contents/${caminho}?ref=${branch}`);
  if (check.ok) {
    const j = (await check.json()) as { sha: string };
    sha = j.sha;
  }

  const body: Record<string, unknown> = { message: mensagem, content: base64, branch };
  if (sha) body.sha = sha;

  const res = await gh(`/repos/${owner}/${repo}/contents/${caminho}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Falha no upload — GitHub ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }

  return `/${caminho.replace(/^public\//, '')}`;
}

/** Apaga um arquivo do repositório. */
export async function apagarArquivo(caminho: string, mensagem: string): Promise<void> {
  const { owner, repo, branch } = env();
  const check = await gh(`/repos/${owner}/${repo}/contents/${caminho}?ref=${branch}`);
  if (!check.ok) return;
  const { sha } = (await check.json()) as { sha: string };

  await gh(`/repos/${owner}/${repo}/contents/${caminho}`, {
    method: 'DELETE',
    body: JSON.stringify({ message: mensagem, sha, branch }),
  });
}

/** Testa se o token tem permissão de escrita — usado no diagnóstico do painel. */
export async function testarConexao(): Promise<{ ok: boolean; erro?: string; permissoes?: string }> {
  if (!githubConfigurado()) {
    return { ok: false, erro: 'Variáveis de ambiente não configuradas' };
  }
  const { owner, repo } = env();
  const res = await gh(`/repos/${owner}/${repo}`);
  if (!res.ok) {
    return { ok: false, erro: `GitHub ${res.status} — verifique GITHUB_TOKEN, GITHUB_OWNER e GITHUB_REPO` };
  }
  const json = (await res.json()) as { permissions?: { push?: boolean } };
  if (!json.permissions?.push) {
    return { ok: false, erro: 'O token não tem permissão de escrita (Contents: Read and write)' };
  }
  return { ok: true, permissoes: 'leitura e escrita' };
}
