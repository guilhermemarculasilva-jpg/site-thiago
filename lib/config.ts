/**
 * Conteúdo editável do site (textos, contatos, taxas, depoimentos).
 *
 * Lê de `data/config.json`, que o painel administrativo grava via API do GitHub.
 * Como o JSON é importado estaticamente, os valores entram no build — cada
 * alteração no painel gera um commit e a Vercel republica automaticamente.
 */
import configData from '@/data/config.json';

export interface Stat {
  numero: string;
  label: string;
}

export interface Banco {
  nome: string;
  taxa: string;
  sigla: string;
}

export interface Depoimento {
  inicial: string;
  texto: string;
  nome: string;
  cidade: string;
}

export interface SiteConfig {
  contato: {
    telefone: string;
    whatsapp: string;
    email: string;
    creci: string;
    localizacao: string;
    horario: string;
  };
  hero: {
    eyebrow: string;
    titulo: string;
    tituloDestaque: string;
    subtitulo: string;
    imagemFundo: string;
    fotoCorretor: string;
    stats: Stat[];
  };
  sobre: {
    foto: string;
    paragrafo1: string;
    paragrafo2: string;
  };
  bancos: Banco[];
  depoimentos: Depoimento[];
}

export const CONFIG = configData as SiteConfig;

export function getConfig(): SiteConfig {
  return CONFIG;
}
