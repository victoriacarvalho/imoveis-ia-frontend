/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { Filter } from "lucide-react";
import { BottomNav } from "./_components/bottom-nav";
import { ImovelDestaqueCard } from "./_components/imoveis-destaque";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

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
  const { user } = useUser();
  const [imoveis, setImoveis] = useState<Property[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [transacao, setTransacao] = useState<string>("");
  const [tipoImovel, setTipoImovel] = useState<string>("");

  useEffect(() => {
    setCarregando(true);

    const params = new URLSearchParams();

    if (transacao && transacao !== "")
      params.append("transactionType", transacao);
    if (tipoImovel && tipoImovel !== "")
      params.append("propertyType", tipoImovel);

    params.append("take", "10");

    fetch(`https://imoveis-ia-api.onrender.com`)
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

  const linkParams = new URLSearchParams();
  if (transacao) linkParams.append("transactionType", transacao);
  if (tipoImovel) linkParams.append("propertyType", tipoImovel);

  const linkSugestoes = linkParams.toString()
    ? `/sugestoes?${linkParams.toString()}`
    : "/sugestoes";

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 relative pb-24 font-sans shadow-2xl">
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
            <h2 className="text-3xl font-bold mb-1">
              Olá, {user?.firstName || "Visitante"}
            </h2>
            <p className="text-gray-200 text-sm">Bora buscar hoje?</p>
          </div>
        </div>
      </div>

      <div className="px-6 mt-6 space-y-6">
        <section>
          <div className="flex justify-between items-end mb-3">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Filter size={18} className="text-teal-500" />O que você procura?
            </h3>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <div className="flex gap-3">
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
                  <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>

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
                  <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-lg font-bold text-gray-900">Para Você</h3>
            <span className="text-blue-500 text-xs font-semibold bg-blue-50 px-2 py-1 rounded-md">
              <Link href={linkSugestoes} className="flex items-center gap-1">
                Ver sugestões
              </Link>
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
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar">
              {imoveis.map((imovel) => (
                <ImovelDestaqueCard key={imovel.id} imovel={imovel} />
              ))}
            </div>
          )}
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
