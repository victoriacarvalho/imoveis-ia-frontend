"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Heart, MapPin, ChevronLeft } from "lucide-react";

type FavoriteProperty = {
  id: string;
  createdAt: string;
  property: {
    id: string;
    title: string;
    price: number;
    neighborhood: string;
    city: string;
    mainImage: string;
    transactionType: string;
  };
};

const API_URL = "http://localhost:8081";

export default function FavoritosPage() {
  const { userId } = useAuth();
  const router = useRouter();

  const [favoritos, setFavoritos] = useState<FavoriteProperty[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarFavoritos() {
      if (!userId) {
        setCarregando(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/favorites/${userId}`);
        if (!res.ok) throw new Error("Erro ao carregar favoritos");

        const data = await res.json();
        setFavoritos(data);
      } catch (error) {
        console.error("Erro ao buscar favoritos:", error);
      } finally {
        setCarregando(false);
      }
    }

    carregarFavoritos();
  }, [userId]);

  async function removerFavorito(propertyId: string) {
    if (!userId) return;

    try {
      const res = await fetch(`${API_URL}/favorites/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          propertyId,
        }),
      });

      if (!res.ok) throw new Error("Erro ao remover favorito");

      setFavoritos((prev) =>
        prev.filter((item) => item.property.id !== propertyId),
      );
    } catch (error) {
      console.error("Erro ao remover favorito:", error);
    }
  }

  if (carregando) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-200 border-t-red-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500">Carregando favoritos...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-8">
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-gray-100 transition">
          <ChevronLeft size={22} />
        </button>

        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Favoritos</h1>
          <p className="text-sm text-gray-500">Seus imóveis salvos</p>
        </div>
      </div>

      {favoritos.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <Heart className="text-red-500" size={28} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Nenhum favorito ainda
          </h2>
          <p className="text-gray-500">
            Quando você favoritar imóveis, eles vão aparecer aqui.
          </p>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {favoritos.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => router.push(`/imoveis/${item.property.id}`)}
                className="w-full text-left">
                <img
                  src={
                    item.property.mainImage ||
                    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop"
                  }
                  alt={item.property.title}
                  className="w-full h-48 object-cover"
                />

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">
                      {item.property.title}
                    </h3>

                    <span className="text-xs font-bold px-2 py-1 rounded-lg bg-teal-500 text-white whitespace-nowrap">
                      {item.property.transactionType === "VENDA"
                        ? "À Venda"
                        : "Aluguel"}
                    </span>
                  </div>

                  <p className="mt-2 text-gray-500 flex items-center gap-1 text-sm">
                    <MapPin size={14} />
                    {item.property.neighborhood}, {item.property.city}
                  </p>

                  <p className="mt-3 text-xl font-extrabold text-teal-500">
                    R$ {Number(item.property.price).toLocaleString("pt-BR")}
                  </p>
                </div>
              </button>

              <div className="px-4 pb-4">
                <button
                  onClick={() => removerFavorito(item.property.id)}
                  className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-500 py-3 rounded-xl font-semibold hover:bg-red-50 transition">
                  <Heart size={18} className="fill-red-500 text-red-500" />
                  Remover dos favoritos
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
