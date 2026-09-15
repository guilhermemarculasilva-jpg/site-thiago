import Link from 'next/link';
import Image from 'next/image';
import type { Imovel } from '@/lib/imoveis';
import { formatPrice, whatsappLink } from '@/lib/site';
import { IconMapPin, IconBed, IconBath, IconArea } from './icons';

export default function PropertyCard({ imovel, priority = false }: { imovel: Imovel; priority?: boolean }) {
  const precoLabel =
    imovel.finalidade === 'aluguel' ? `${formatPrice(imovel.valor)}/mês` : formatPrice(imovel.valor);

  const badge =
    imovel.finalidade === 'lancamento' ? 'Lançamento' : imovel.finalidade === 'aluguel' ? 'Aluguel' : 'Destaque';

  return (
    <article className="property-card">
      <div className="property-card-media">
        <Link href={`/imoveis/${imovel.slug}`} aria-label={imovel.titulo}>
          <Image
            src={imovel.imagem}
            alt={imovel.titulo}
            width={800}
            height={560}
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>
        <span className="property-badge">{badge}</span>
        <div className="property-price">{precoLabel}</div>
      </div>

      <div className="property-card-body">
        <div className="property-location">
          <IconMapPin size={12} />
          {imovel.bairro}, {imovel.cidade}
        </div>

        <h3 className="property-title">
          <Link href={`/imoveis/${imovel.slug}`}>{imovel.titulo}</Link>
        </h3>

        <div className="property-features">
          {imovel.quartos > 0 && (
            <div className="property-feature">
              <IconBed size={16} />
              {imovel.quartos} Qts
            </div>
          )}
          {imovel.banheiros > 0 && (
            <div className="property-feature">
              <IconBath size={16} />
              {imovel.banheiros} Banh
            </div>
          )}
          <div className="property-feature">
            <IconArea size={16} />
            {imovel.area}m²
          </div>
        </div>

        <a
          href={whatsappLink(`Olá! Tenho interesse no imóvel: ${imovel.titulo} (${imovel.codigo})`)}
          className="property-btn"
          target="_blank"
          rel="noopener noreferrer"
        >
          Tenho Interesse
        </a>
      </div>
    </article>
  );
}
