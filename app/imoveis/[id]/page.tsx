"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  MapPin,
  BedDouble,
  Bath,
  Car,
  Share2,
  Heart,
  CheckCircle2,
} from "lucide-react";

// Tipagem completa baseada no seu Prisma Schema
interface PropertyDetails {
  id: string;
  title: string;
  description: string;
  neighborhood: string;
  city: string;
  propertyType: string;
  transactionType: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpots?: number;
  mainImage: string;
  gallery: string[];
}

export default function ImovelDetalhesPage() {
  const router = useRouter();
  const params = useParams(); // Pega o ID da URL

  const [imovel, setImovel] = useState<PropertyDetails | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [fotoAtiva, setFotoAtiva] = useState<string>("");

  useEffect(() => {
    // Garante que temos o ID antes de buscar
    if (!params.id) return;

    fetch(`http://localhost:8081/imoveis/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Imóvel não encontrado");
        return res.json();
      })
      .then((data) => {
        setImovel(data);
        // Define a foto principal como a primeira a ser exibida
        const primeiraFoto =
          data.mainImage && data.mainImage.length > 5
            ? data.mainImage
            : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop";
        setFotoAtiva(primeiraFoto);
        setCarregando(false);
      })
      .catch((err) => {
        console.error(err);
        setCarregando(false);
      });
  }, [params.id]);

  if (carregando) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col items-center justify-center animate-pulse">
        <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">
          Buscando chaves do imóvel...
        </p>
      </div>
    );
  }

  if (!imovel) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Ops!</h2>
        <p className="text-gray-500 mb-6">
          Não conseguimos encontrar este imóvel. Ele pode ter sido alugado ou
          vendido.
        </p>
        <button
          onClick={() => router.back()}
          className="bg-teal-500 text-white px-6 py-3 rounded-full font-bold">
          Voltar para Sugestões
        </button>
      </div>
    );
  }

  // Prepara a galeria de fotos (mistura a principal com as outras, se houver)
  const galeriaCompleta =
    imovel.gallery && imovel.gallery.length > 0
      ? [
          imovel.mainImage,
          ...imovel.gallery.filter((img) => img !== imovel.mainImage),
        ]
      : [fotoAtiva];

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white relative pb-32 font-sans shadow-2xl">
      {/* 1. HEADER & FOTO PRINCIPAL */}
      <div className="relative h-80 bg-gray-900 w-full">
        {/* Botões flutuantes no topo */}
        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20">
          <button
            onClick={() => router.back()}
            className="bg-white/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/30 transition">
            <ChevronLeft size={24} />
          </button>
          <div className="flex gap-3">
            <button className="bg-white/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/30 transition">
              <Share2 size={20} />
            </button>
            <button className="bg-white/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/30 transition">
              <Heart size={20} />
            </button>
          </div>
        </div>

        {/* Imagem em destaque */}
        <img
          src={fotoAtiva}
          alt={imovel.title}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

        {/* Badge Flutuante */}
        <div className="absolute bottom-10 left-6 bg-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide shadow-lg">
          {imovel.transactionType === "VENDA" ? "À Venda" : "Para Alugar"}
        </div>
      </div>

      {/* 2. CONTEÚDO DO IMÓVEL (Card que sobrepõe a foto) */}
      <div className="relative -mt-6 bg-white rounded-t-[2rem] px-6 pt-8 pb-6 z-10 flex flex-col gap-6">
        {/* Título e Preço */}
        <div>
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-2xl font-extrabold text-gray-900 leading-tight flex-1 pr-4">
              {imovel.title}
            </h1>
            <span className="text-2xl font-extrabold text-teal-500">
              R$ {Number(imovel.price).toLocaleString("pt-BR")}
            </span>
          </div>
          <p className="text-gray-500 flex items-center gap-1.5 font-medium">
            <MapPin size={16} className="text-gray-400" />
            {imovel.neighborhood}, {imovel.city || "João Monlevade"}
          </p>
        </div>

        {/* Características (Quartos, Banheiros, Vagas) */}
        <div className="flex gap-4 overflow-x-auto hide-scrollbar py-2">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-4 py-3 rounded-2xl flex-shrink-0">
            <div className="bg-white p-2 rounded-full shadow-sm text-teal-500">
              <BedDouble size={20} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Quartos
              </p>
              <p className="font-extrabold text-gray-900">
                {imovel.bedrooms || 0}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-4 py-3 rounded-2xl flex-shrink-0">
            <div className="bg-white p-2 rounded-full shadow-sm text-teal-500">
              <Bath size={20} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Banheiros
              </p>
              <p className="font-extrabold text-gray-900">
                {imovel.bathrooms || 0}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-4 py-3 rounded-2xl flex-shrink-0">
            <div className="bg-white p-2 rounded-full shadow-sm text-teal-500">
              <Car size={20} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Vagas
              </p>
              <p className="font-extrabold text-gray-900">
                {imovel.parkingSpots || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Mini Galeria de Fotos */}
        {galeriaCompleta.length > 1 && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Galeria</h3>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 snap-x">
              {galeriaCompleta.map((foto, index) => (
                <button
                  key={index}
                  onClick={() => setFotoAtiva(foto)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 snap-center border-2 transition-all ${fotoAtiva === foto ? "border-teal-500 opacity-100" : "border-transparent opacity-60 hover:opacity-100"}`}>
                  <img
                    src={foto}
                    alt={`Foto ${index}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Descrição do Imóvel */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            Sobre o imóvel
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
            {imovel.description || "Descrição não disponível para este imóvel."}
          </p>
        </div>
      </div>

      {/* 3. CTA FIXO NA BASE (Call to Action) */}
      <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-100 p-4 pb-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50 flex gap-4 items-center">
        <div className="flex-1">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">
            Valor Total
          </p>
          <p className="text-xl font-extrabold text-teal-500">
            R$ {Number(imovel.price).toLocaleString("pt-BR")}
          </p>
        </div>
        <button className="bg-gray-900 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:bg-gray-800 transition flex items-center gap-2">
          <CheckCircle2 size={20} />
          Tenho Interesse
        </button>
      </div>

      {/* Oculta scrollbar da galeria */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
