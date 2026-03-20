"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

<<<<<<< HEAD
const API_URL = process.env.NEXT_PUBLIC_API_URL;
=======
const API_URL = "http://:8081";

>>>>>>> f3dfe1294a62e59d5394c826110acbdc5883d1d4
interface Property {
  id: string;
  title: string;
  neighborhood: string;
  city: string;
  price: number;
  mainImage: string;
  transactionType: string;
  propertyType: string;
  status: string;
}

export default function ImoveisPageClient() {
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    async function loadProperties() {
      try {
        setLoading(true);

        const ids = searchParams.get("ids");

        if (!ids) {
          setProperties([]);
          return;
        }

        const res = await fetch(`${API_URL}/imoveis?ids=${ids}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Erro ao carregar imóveis");
        }

        const data = await res.json();

        if (Array.isArray(data)) {
          setProperties(data);
        } else if (Array.isArray(data.imoveis)) {
          setProperties(data.imoveis);
        } else if (Array.isArray(data.properties)) {
          setProperties(data.properties);
        } else if (Array.isArray(data.data)) {
          setProperties(data.data);
        } else {
          setProperties([]);
        }
      } catch (error) {
        console.error(error);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    }

    loadProperties();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="size-10 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-28">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">
            Resultados da busca
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Veja os imóveis encontrados para sua pesquisa.
          </p>
        </div>

        <div className="grid gap-4">
          {properties.map((property) => (
            <Link
              key={property.id}
              href={`/imovel/${property.id}`}
              className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex gap-4 items-center">
              <img
                src={property.mainImage}
                alt={property.title}
                className="w-24 h-24 object-cover rounded-2xl bg-gray-100"
              />

              <div className="flex-1">
                <h2 className="text-lg font-extrabold text-gray-900">
                  {property.title}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {property.neighborhood}, {property.city}
                </p>
                <p className="text-lg font-extrabold text-teal-500 mt-2">
                  R$ {Number(property.price).toLocaleString("pt-BR")}
                </p>
              </div>
            </Link>
          ))}

          {properties.length === 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center text-gray-500">
              Nenhum imóvel encontrado para esta busca.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
