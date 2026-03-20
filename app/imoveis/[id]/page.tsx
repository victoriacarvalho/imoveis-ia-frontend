"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import {
  ChevronLeft,
  MapPin,
  BedDouble,
  Bath,
  Car,
  Share2,
  Heart,
  CheckCircle2,
  Loader2,
} from "lucide-react";

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

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function extrairDadosDaDescricao(descricao: string, imovel: PropertyDetails) {
  let quartos = imovel.bedrooms || 0;
  let banheiros = imovel.bathrooms || 0;
  let vagas = imovel.parkingSpots || 0;
  let descLimpa = descricao || "";

  if (descricao) {
    const quartoMatch = descricao.match(
      /(\d+)\s*(?:Quartos?|Quarto|dormitórios?|dormitório|qto|qtos)/i,
    );
    if (quartoMatch && quartos === 0) quartos = parseInt(quartoMatch[1], 10);

    const banhMatch = descricao.match(/(\d+)\s*(?:banheiros?|wc|suítes?)/i);
    if (banhMatch && banheiros === 0) {
      banheiros = parseInt(banhMatch[1], 10);
    } else if (descricao.toLowerCase().includes("suíte") && banheiros === 0) {
      banheiros = 1;
    }

    const vagaMatch = descricao.match(/(\d+)\s*(?:vagas?|garagens?|garagem)/i);
    if (vagaMatch && vagas === 0) vagas = parseInt(vagaMatch[1], 10);

    descLimpa = descLimpa
      .replace(/Condom[íi]nio:\s*R\$\s*0(?:[.,]00)?/gi, "")
      .trim();
  }

  return { quartos, banheiros, vagas, descLimpa };
}

export default function ImovelDetalhesPage() {
  const router = useRouter();
  const params = useParams();
  const { userId } = useAuth();
  const { user } = useUser();

  const [imovel, setImovel] = useState<PropertyDetails | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [fotoAtiva, setFotoAtiva] = useState("");
  const [isFavorito, setIsFavorito] = useState(false);
  const [carregandoFavorito, setCarregandoFavorito] = useState(false);
  const [redirecionandoContato, setRedirecionandoContato] = useState(false);

  useEffect(() => {
    if (!params.id) return;

    fetch(`${API_URL}/imoveis/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Imóvel não encontrado");
        return res.json();
      })
      .then((data: PropertyDetails) => {
        setImovel(data);

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

  useEffect(() => {
    async function carregarFavorito() {
      if (!userId || !params.id) return;

      try {
        const res = await fetch(
          `${API_URL}/favorites/check?userId=${userId}&propertyId=${params.id}`,
        );

        if (!res.ok) return;

        const data = await res.json();
        setIsFavorito(Boolean(data.isFavorite));
      } catch (error) {
        console.error("Erro ao carregar favorito:", error);
      }
    }

    carregarFavorito();
  }, [userId, params.id]);

  async function toggleFavorito() {
    if (!userId || !imovel?.id || carregandoFavorito) return;

    try {
      setCarregandoFavorito(true);

      const res = await fetch(`${API_URL}/favorites/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          propertyId: imovel.id,
        }),
      });

      if (!res.ok) throw new Error("Erro ao atualizar favorito");

      const data = await res.json();
      setIsFavorito(Boolean(data.isFavorite));
    } catch (error) {
      console.error("Erro ao favoritar:", error);
    } finally {
      setCarregandoFavorito(false);
    }
  }

  async function handleTenhoInteresse() {
    if (!imovel?.id || !userId || redirecionandoContato) return;

    try {
      setRedirecionandoContato(true);

      const nome =
        user?.fullName?.trim() ||
        [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
        user?.username?.trim() ||
        user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
        undefined;

      const email = user?.primaryEmailAddress?.emailAddress || undefined;

      const response = await fetch(`${API_URL}/lead-events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          userName: nome,
          userEmail: email,
          propertyId: imovel.id,
          eventType: "interest_click",
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao registrar interesse");
      }

      await new Promise((resolve) => setTimeout(resolve, 900));

      router.push(`/contato/${imovel.id}`);
    } catch (error) {
      console.error("Erro ao registrar interesse:", error);
      setRedirecionandoContato(false);
    }
  }

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

  const galeriaCompleta =
    imovel.gallery && imovel.gallery.length > 0
      ? [
          imovel.mainImage,
          ...imovel.gallery.filter((img) => img !== imovel.mainImage),
        ]
      : [fotoAtiva];

  const dadosCorrigidos = extrairDadosDaDescricao(imovel.description, imovel);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white relative pb-[220px] font-sans shadow-2xl">
      <div className="relative h-80 bg-gray-900 w-full">
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

            <button
              onClick={toggleFavorito}
              disabled={!userId || carregandoFavorito}
              className="bg-white/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/30 transition disabled:opacity-60">
              <Heart
                size={20}
                className={
                  isFavorito ? "fill-red-500 text-red-500" : "text-white"
                }
              />
            </button>
          </div>
        </div>

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

        <div className="absolute bottom-10 left-6 bg-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide shadow-lg">
          {imovel.transactionType === "VENDA" ? "À Venda" : "Para Alugar"}
        </div>
      </div>

      <div className="relative -mt-6 bg-white rounded-t-[2rem] px-6 pt-8 pb-6 z-10 flex flex-col gap-6">
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
                {dadosCorrigidos.quartos}
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
                {dadosCorrigidos.banheiros}
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
                {dadosCorrigidos.vagas}
              </p>
            </div>
          </div>
        </div>

        {galeriaCompleta.length > 1 && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Galeria</h3>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 snap-x">
              {galeriaCompleta.map((foto, index) => (
                <button
                  key={index}
                  onClick={() => setFotoAtiva(foto)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 snap-center border-2 transition-all ${
                    fotoAtiva === foto
                      ? "border-teal-500 opacity-100"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}>
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

        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            Sobre o imóvel
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
            {dadosCorrigidos.descLimpa}
          </p>
        </div>
      </div>

      <div className="fixed bottom-20 left-1/2 w-full max-w-md -translate-x-1/2 bg-white border-t border-gray-100 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40 flex gap-4 items-center">
        <div className="flex-1">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">
            Valor Total
          </p>
          <p className="text-xl font-extrabold text-teal-500">
            R$ {Number(imovel.price).toLocaleString("pt-BR")}
          </p>
        </div>

        <button
          onClick={handleTenhoInteresse}
          disabled={!userId || redirecionandoContato}
          className="bg-gray-900 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:bg-gray-800 transition flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
          {redirecionandoContato ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Redirecionando...
            </>
          ) : (
            <>
              <CheckCircle2 size={20} />
              Tenho Interesse
            </>
          )}
        </button>
      </div>

      {redirecionandoContato && (
        <div className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-3xl px-8 py-7 shadow-2xl flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center">
              <Loader2 className="size-8 text-teal-500 animate-spin" />
            </div>

            <div className="text-center">
              <p className="text-lg font-extrabold text-gray-900">
                Redirecionando...
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Estamos preparando seu contato com a imobiliária
              </p>
            </div>
          </div>
        </div>
      )}

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
