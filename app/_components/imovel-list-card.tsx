import Link from "next/link";

interface Property {
  id: string;
  title: string;
  propertyType: string;
  mainImage: string;
  price: number | string;
}

interface ImovelListCardProps {
  imovel: Property;
  onClick?: () => void;
}

export function ImovelListCard({ imovel, onClick }: ImovelListCardProps) {
  return (
    <Link
      href={`/imoveis/${imovel.id}`}
      onClick={onClick}
      className="block w-full">
      <div className="bg-white rounded-2xl p-3 flex gap-4 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 hover:border-teal-200">
        <img
          src={
            imovel.mainImage && imovel.mainImage.length > 5
              ? imovel.mainImage
              : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=300&auto=format&fit=crop"
          }
          alt={imovel.title}
          className="w-24 h-24 object-cover rounded-xl"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=300&auto=format&fit=crop";
          }}
        />
        <div className="flex flex-col justify-between py-1 flex-1">
          <div>
            <span className="text-[10px] font-extrabold text-teal-500 uppercase tracking-wider mb-1 block">
              {imovel.propertyType}
            </span>
            <h4 className="font-bold text-gray-800 text-sm line-clamp-2 leading-tight">
              {imovel.title}
            </h4>
          </div>
          <div className="flex justify-between items-end mt-2">
            <span className="font-extrabold text-gray-900">
              R$ {Number(imovel.price).toLocaleString("pt-BR")}
            </span>
            <span className="text-[10px] text-gray-400 font-bold uppercase">
              Detalhes ›
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
