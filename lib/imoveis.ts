/**
 * Modelo de dados do imóvel.
 *
 * No WordPress isto era o CPT `imovel` + meta fields `_tb_*` na tabela wp_postmeta.
 * Aqui os imóveis vivem em `data/imoveis.json`, lido no servidor.
 *
 * Para trocar por um banco (Vercel Postgres, Supabase) depois, basta reimplementar
 * getImoveis() / getImovel() — o resto do site não muda.
 */
import imoveisData from '@/data/imoveis.json';

export type Finalidade = 'venda' | 'aluguel' | 'lancamento';
export type TipoImovel = 'casa' | 'apartamento' | 'terreno' | 'comercial';

export interface Imovel {
  slug: string;
  titulo: string;
  descricao: string;
  valor: number;
  area: number;
  quartos: number;
  banheiros: number;
  vagas: number;
  endereco: string;
  cidade: string;
  bairro: string;
  codigo: string;
  tipo: TipoImovel;
  finalidade: Finalidade;
  destaque: boolean;
  imagem: string;
  galeria?: string[];
}

const imoveis = imoveisData as Imovel[];

export function getImoveis(): Imovel[] {
  return imoveis;
}

export function getImoveisDestaque(limit = 6): Imovel[] {
  return imoveis.filter((i) => i.destaque).slice(0, limit);
}

export function getImovel(slug: string): Imovel | undefined {
  return imoveis.find((i) => i.slug === slug);
}

export function getSlugs(): string[] {
  return imoveis.map((i) => i.slug);
}

/** Equivalente ao filtro AJAX tb_filter_imoveis() */
export function filtrarImoveis(params: {
  s?: string;
  tipo?: string;
  finalidade?: string;
}): Imovel[] {
  let resultado = imoveis;

  if (params.tipo) {
    resultado = resultado.filter((i) => i.tipo === params.tipo);
  }
  if (params.finalidade) {
    resultado = resultado.filter((i) => i.finalidade === params.finalidade);
  }
  if (params.s) {
    const termo = params.s.toLowerCase();
    resultado = resultado.filter(
      (i) =>
        i.titulo.toLowerCase().includes(termo) ||
        i.descricao.toLowerCase().includes(termo) ||
        i.cidade.toLowerCase().includes(termo) ||
        i.bairro.toLowerCase().includes(termo)
    );
  }
  return resultado;
}

export const TIPOS: { value: TipoImovel; label: string }[] = [
  { value: 'casa', label: 'Casa' },
  { value: 'apartamento', label: 'Apartamento' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'comercial', label: 'Comercial' },
];

export const FINALIDADES: { value: Finalidade; label: string }[] = [
  { value: 'venda', label: 'Comprar' },
  { value: 'aluguel', label: 'Alugar' },
  { value: 'lancamento', label: 'Lançamento' },
];

