/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import {
  Home,
  Calendar,
  Sparkles,
  BarChart2,
  User,
  BedDouble,
  Bath,
  MapPin,
  Filter,
} from "lucide-react";
import Link from "next/link"; // Importação do Link do Next.js
import { BottomNav } from "./_components/bottom-nav";

// Tipagem baseada no seu backend (Prisma)
interface Property {
  id: string;
  title: string;
  neighborhood: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  mainImage: string;
  price: number;
  transactionType: string;
}

export default function AppHome() {
  const [imoveis, setImoveis] = useState<Property[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Estados para os filtros
  const [transacao, setTransacao] = useState<string>("");
  const [tipoImovel, setTipoImovel] = useState<string>("");

  useEffect(() => {
    setCarregando(true);

    const params = new URLSearchParams();
    if (transacao) params.append("transactionType", transacao);
    if (tipoImovel) params.append("propertyType", tipoImovel);
    params.append("take", "5");

    // Conectando com o backend na porta 3000
    fetch(`http://localhost:8081/imoveis?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.imoveis) {
          setImoveis(data.imoveis);
        } else {
          setImoveis([]);
        }
        setCarregando(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar imóveis", err);
        setCarregando(false);
      });
  }, [transacao, tipoImovel]);

  return (
    // Container mobile que centraliza a tela no desktop
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 relative pb-24 font-sans shadow-2xl">
      {/* 1. HERO SECTION (Fundo com a foto do prédio) */}
      <div className="relative h-72 bg-gray-900 rounded-b-[2.5rem] overflow-hidden p-6 text-white flex flex-col justify-between">
        <img
          src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=600&auto=format&fit=crop"
          alt="Prédio"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="relative z-10 flex justify-between items-start mt-4">
          <h1 className="text-xl font-extrabold tracking-tight">IMÓVEIS.AI</h1>
          <button className="text-gray-300 hover:text-white">{"</>"}</button>
        </div>

        <div className="relative z-10 flex justify-between items-end mb-4">
          <div>
            <h2 className="text-3xl font-bold mb-1">Olá, Paulo</h2>
            <p className="text-gray-200 text-sm">Bora buscar hoje?</p>
          </div>
          <button className="bg-teal-400 hover:bg-teal-500 text-white font-semibold py-2 px-6 rounded-full shadow-lg transition">
            Bora!
          </button>
        </div>
      </div>

      <div className="px-6 mt-6 space-y-6">
        {/* 2. CATEGORIAS (Filtros em Cascata) */}
        <section>
          <div className="flex justify-between items-end mb-3">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Filter size={18} className="text-teal-500" />O que você procura?
            </h3>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <div className="flex gap-3">
              {/* Select: Compra ou Aluguel */}
              <div className="flex-1 relative">
                <select
                  className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent cursor-pointer font-medium"
                  value={transacao}
                  onChange={(e) => setTransacao(e.target.value)}>
                  <option value="">Negócio (Todos)</option>
                  <option value="ALUGUEL">Alugar</option>
                  <option value="VENDA">Comprar</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>

              {/* Select: Tipo de Imóvel */}
              <div className="flex-1 relative">
                <select
                  className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent cursor-pointer font-medium"
                  value={tipoImovel}
                  onChange={(e) => setTipoImovel(e.target.value)}>
                  <option value="">Tipo (Todos)</option>
                  <option value="APARTAMENTO">Apartamento</option>
                  <option value="CASA">Casa</option>
                  <option value="LOTE">Lote</option>
                  <option value="COMERCIAL">Comercial</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. CARD PARA VOCÊ (Lista Dinâmica do Banco de Dados) */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-lg font-bold text-gray-900">Para Você</h3>
            <span className="text-blue-500 text-xs font-semibold bg-blue-50 px-2 py-1 rounded-md">
              {imoveis.length} resultados
            </span>
          </div>

          {carregando ? (
            <div className="h-64 bg-gray-100 rounded-3xl animate-pulse flex items-center justify-center">
              <span className="text-gray-400 font-medium">
                Buscando imóveis...
              </span>
            </div>
          ) : imoveis.length === 0 ? (
            <div className="h-40 bg-gray-50 border border-dashed border-gray-300 rounded-3xl flex items-center justify-center text-gray-500 text-sm">
              Nenhum imóvel encontrado com estes filtros.
            </div>
          ) : (
            // Carrossel Horizontal para exibir os imóveis reais
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar">
              {imoveis.map((imovel) => {
                // 👇 Lógica para garantir que a imagem nunca fique em branco ou cinza
                const fotoReal =
                  imovel.mainImage && imovel.mainImage.length > 5
                    ? imovel.mainImage
                    : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop";

                return (
                  // 👇 Link que envolve todo o card e redireciona para a página do imóvel
                  <Link
                    href={`/imoveis/${imovel.id}`}
                    key={imovel.id}
                    className="snap-center flex-shrink-0">
                    <div className="relative w-[300px] h-64 bg-gray-200 rounded-3xl overflow-hidden shadow-md group cursor-pointer">
                      {/* IMAGEM REAL DO SEU BANCO DE DADOS OU FALLBACK */}
                      <img
                        src={fotoReal}
                        alt={imovel.title || "Imóvel"}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                        onError={(e) => {
                          // Proteção extra caso a URL da imagem esteja corrompida
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90"></div>

                      {/* Badge de Tipo no Topo */}
                      <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                        <Calendar size={14} />
                        {imovel.propertyType || "APARTAMENTO"}
                      </div>

                      {/* Badge de Preço no Topo Direito */}
                      <div className="absolute top-4 right-4 bg-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
                        R$ {Number(imovel.price).toLocaleString("pt-BR")}
                      </div>

                      {/* Info do Imóvel na Base */}
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
                            {imovel.bedrooms || 0} quartos
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Bath size={16} className="text-teal-400" />{" "}
                            {imovel.bathrooms || 1} banheiros
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* 4. BOTTOM NAVIGATION BAR */}
      <BottomNav />

      {/* Estilo embutido para esconder a barra de rolagem (opcional, deixa mais limpo) */}
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
