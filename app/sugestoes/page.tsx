"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  BedDouble,
  Bath,
  HelpCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "../_components/bottom-nav";

// 👇 IMPORTANTE: Importe o seu novo componente aqui. Ajuste o caminho conforme a sua pasta!
import { ImovelListCard } from "../_components/imovel-list-card";

interface Property {
  id: string;
  title: string;
  neighborhood: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  mainImage: string;
  price: number;
}

export default function SugestoesPage() {
  const router = useRouter();
  const [imoveis, setImoveis] = useState<Property[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [bairroExpandido, setBairroExpandido] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:8081/imoveis?take=50")
      .then((res) => res.json())
      .then((data) => {
        if (data.imoveis) setImoveis(data.imoveis);
        setCarregando(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar imóveis", err);
        setCarregando(false);
      });
  }, []);

  const imoveisPorBairro = imoveis.reduce(
    (acc, imovel) => {
      let bairroRaw = imovel.neighborhood || "Outros";
      let bairroLimpo = bairroRaw.replace(/^B\.\s*|^Bairro\s*/i, "").trim();
      bairroLimpo =
        bairroLimpo.charAt(0).toUpperCase() +
        bairroLimpo.slice(1).toLowerCase();

      if (bairroLimpo.toLowerCase().includes("joão monlevade")) {
        bairroLimpo = "Centro / Outros";
      }

      if (!acc[bairroLimpo]) acc[bairroLimpo] = [];
      acc[bairroLimpo].push(imovel);
      return acc;
    },
    {} as Record<string, Property[]>,
  );

  const imovelCapa = imoveis.length > 0 ? imoveis[0] : null;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white relative pb-32 font-sans shadow-2xl">
      {/* HEADER TIPO APP */}
      <header className="flex items-center justify-between p-6 bg-white sticky top-0 z-20">
        <button
          onClick={() => router.back()}
          className="text-gray-900 p-2 -ml-2 hover:bg-gray-100 rounded-full">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Sugestões</h1>
        <div className="w-8" />
      </header>

      <main className="px-6 space-y-6">
        {imovelCapa && (
          <Link href={`/imoveis/${imovelCapa.id}`} className="block mb-8 group">
            <div className="relative w-full h-56 bg-gray-200 rounded-3xl overflow-hidden shadow-lg cursor-pointer">
              <img
                src={
                  imovelCapa.mainImage && imovelCapa.mainImage.length > 5
                    ? imovelCapa.mainImage
                    : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop"
                }
                alt="Destaque"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80"></div>

              <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <Calendar size={14} />
                {imovelCapa.propertyType}
              </div>

              <div className="absolute bottom-4 left-4 text-white">
                <h2 className="text-3xl font-bold mb-1 shadow-sm">
                  {imovelCapa.neighborhood}
                </h2>
                <div className="flex items-center gap-4 text-sm font-medium text-gray-200">
                  <span className="flex items-center gap-1.5">
                    <BedDouble size={16} /> {imovelCapa.bedrooms} quartos
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Bath size={16} /> {imovelCapa.bathrooms} banheiros
                  </span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* LISTA DE BAIRROS UNIFICADOS */}
        {carregando ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 bg-gray-100 animate-pulse rounded-3xl"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(imoveisPorBairro).map(
              ([bairro, listaDeImoveis]) => {
                const estaAberto = bairroExpandido === bairro;

                return (
                  <div
                    key={bairro}
                    className="border border-gray-100 rounded-3xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] bg-white overflow-hidden transition-all duration-300">
                    {/* BOTÃO QUE ABRE O ACORDEÃO DO BAIRRO */}
                    <button
                      onClick={() =>
                        setBairroExpandido(estaAberto ? null : bairro)
                      }
                      className="w-full p-5 flex flex-col gap-4 text-left hover:bg-gray-50 transition-colors focus:outline-none">
                      <div className="flex justify-between items-center w-full">
                        <h3 className="text-[17px] font-extrabold text-gray-900">
                          {bairro}
                        </h3>
                        <div className="text-gray-400 border border-gray-200 rounded-full p-1">
                          <HelpCircle size={16} />
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <span className="bg-[#f5f5f5] text-gray-600 text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                          <Zap size={10} className="text-gray-500" />{" "}
                          {listaDeImoveis.length} IMÓVEIS
                        </span>
                      </div>
                    </button>

                    {/* CONTEÚDO EXPANDIDO */}
                    {estaAberto && (
                      <div className="bg-gray-50/50 p-4 border-t border-gray-50 flex flex-col gap-3">
                        {listaDeImoveis.map((imovel) => (
                          // 👇 OLHA COMO FICOU LIMPO AQUI 👇
                          <ImovelListCard key={imovel.id} imovel={imovel} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              },
            )}
          </div>
        )}

        <button className="w-full border-2 border-gray-100 bg-white text-gray-900 font-bold py-4 rounded-full mt-6 hover:bg-gray-50 transition shadow-sm text-sm">
          Marcar como concluído
        </button>
      </main>

      <BottomNav />
    </div>
  );
}
