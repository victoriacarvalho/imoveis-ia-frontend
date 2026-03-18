import Link from "next/link";
import { Calendar, BedDouble, Bath, MapPin } from "lucide-react";

interface Property {
  id: string;
  title: string;
  neighborhood: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  parkingSpots?: number;
  mainImage: string;
  price: number;
  description?: string;
}

interface ImovelDestaqueCardProps {
  imovel: Property;
}

function extrairDadosDaDescricao(descricao: string, imovel: Property) {
  let quartos = imovel.bedrooms || 0;
  let banheiros = imovel.bathrooms || 0;
  let vagas = imovel.parkingSpots || 0;
  let descLimpa = descricao || "";

  if (descricao) {
    const quartoMatch = descricao.match(
      /(\d+)\s*(?:Quartos?|Quarto|dormitórios?|dormitório|qto|qtos)/i,
    );
    if (quartoMatch && quartos === 0) quartos = parseInt(quartoMatch[1]);

    const banhMatch = descricao.match(/(\d+)\s*(?:banheiros?|wc|suítes?)/i);
    if (banhMatch && banheiros === 0) banheiros = parseInt(banhMatch[1]);
    else if (descricao.toLowerCase().includes("suíte") && banheiros === 0)
      banheiros = 1;

    const vagaMatch = descricao.match(/(\d+)\s*(?:vagas?|garagens?|garagem)/i);
    if (vagaMatch && vagas === 0) vagas = parseInt(vagaMatch[1]);

    descLimpa = descLimpa
      .replace(/Condom[íi]nio:\s*R\$\s*0(?:[.,]00)?/gi, "")
      .trim();
  }

  if (banheiros === 0) banheiros = 1;

  return { quartos, banheiros, vagas, descLimpa };
}

export function ImovelDestaqueCard({ imovel }: ImovelDestaqueCardProps) {
  const fotoReal =
    imovel.mainImage && imovel.mainImage.length > 5
      ? imovel.mainImage
      : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop";

  const dadosCorrigidos = extrairDadosDaDescricao(
    imovel.description || "",
    imovel,
  );

  return (
    <Link href={`/imoveis/${imovel.id}`} className="snap-center flex-shrink-0">
      <div className="relative w-[300px] h-64 bg-gray-200 rounded-3xl overflow-hidden shadow-md group cursor-pointer">
        <img
          src={fotoReal}
          alt={imovel.title || "Imóvel"}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90"></div>

        <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
          <Calendar size={14} />
          {imovel.propertyType || "APARTAMENTO"}
        </div>

        <div className="absolute top-4 right-4 bg-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
          R$ {Number(imovel.price).toLocaleString("pt-BR")}
        </div>

        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h4 className="text-xl font-bold mb-1 shadow-sm line-clamp-1">
            {imovel.neighborhood || "Bairro não informado"}
          </h4>
          <p className="text-xs text-gray-300 mb-2 flex items-center gap-1 line-clamp-1">
            <MapPin size={12} /> João Monlevade, MG
          </p>
          <div className="flex items-center gap-4 text-sm font-medium text-gray-200">
            <span className="flex items-center gap-1.5">
              <BedDouble size={16} className="text-teal-400" />{" "}
              {dadosCorrigidos.quartos} quartos
            </span>
            <span className="flex items-center gap-1.5">
              <Bath size={16} className="text-teal-400" />{" "}
              {dadosCorrigidos.banheiros} banheiros
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
