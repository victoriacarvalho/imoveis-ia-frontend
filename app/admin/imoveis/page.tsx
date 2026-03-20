/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { AdminNav } from "../../_components/admin-bottom-nav";

<<<<<<< HEAD
const API_URL = process.env.NEXT_PUBLIC_API_URL;
=======
const API_URL = "https://imoveis-ia-api.onrender.com";

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
  source: "MANUAL" | "SCRAPING";
  status: string;
  isActive?: boolean; // Adicionado para a checagem no layout
}

export default function AdminImoveisPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/sign-in");
    }
  }, [isLoaded, userId, router]);

  useEffect(() => {
    async function checkAdmin() {
      if (!userId) return;

      try {
        const res = await fetch(`${API_URL}/admin/me?userId=${userId}`);
        const data = await res.json();
        setIsAdmin(Boolean(data.isAdmin));
      } catch {
        setIsAdmin(false);
      }
    }

    if (isLoaded && userId) {
      checkAdmin();
    }
  }, [isLoaded, userId]);

  async function loadProperties() {
    if (!userId) return;

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/admin/properties?userId=${userId}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Erro ao carregar imóveis");
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        setProperties(data);
      } else if (Array.isArray(data.properties)) {
        setProperties(data.properties);
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

  useEffect(() => {
    if (isAdmin) {
      loadProperties();
    } else if (isAdmin === false) {
      setLoading(false);
    }
  }, [isAdmin]);

  async function handleToggleActive(id: string) {
    if (!userId) return;

    try {
      await fetch(`${API_URL}/admin/properties/${id}/toggle-active`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      loadProperties(); // Agora isso funciona perfeitamente!
    } catch (error) {
      console.error(error);
    }
  }

  async function handleDelete(id: string) {
    if (!userId) return;
    if (!confirm("Deseja realmente excluir este imóvel?")) return;

    try {
      await fetch(`${API_URL}/admin/properties/${id}?userId=${userId}`, {
        method: "DELETE",
      });

      loadProperties(); // E aqui também!
    } catch (error) {
      console.error(error);
    }
  }

  if (!isLoaded || isAdmin === null || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="size-10 animate-spin text-teal-500" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-8 text-center max-w-md w-full">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
            Acesso negado
          </h2>
          <p className="text-gray-500">
            Você não tem permissão para acessar esta área administrativa.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <AdminNav />

        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Imóveis</h1>
            <p className="text-gray-500 mt-2">
              Gerencie imóveis manuais e importados por scraping.
            </p>
          </div>

          <Link
            href="/admin/imoveis/novo"
            className="inline-flex items-center justify-center rounded-full bg-teal-500 px-5 py-3 text-sm font-bold text-white hover:bg-teal-600 transition">
            <Plus className="size-4 mr-2" />
            Adicionar imóvel
          </Link>
        </div>

        <div className="grid gap-6">
          {properties.map((property) => (
            <div
              key={property.id}
              className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-5 md:items-center">
              <img
                src={property.mainImage}
                alt={property.title}
                className="w-full md:w-44 h-32 object-cover rounded-2xl bg-gray-100 shadow-sm"
              />

              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
                    {property.source}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      property.status === "ACTIVE"
                        ? "bg-teal-50 text-teal-700"
                        : "bg-red-50 text-red-700"
                    }`}>
                    {property.status}
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-gray-900">
                  {property.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {property.neighborhood}, {property.city}
                </p>
                <p className="text-lg font-extrabold text-teal-500 mt-3">
                  R$ {Number(property.price).toLocaleString("pt-BR")}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/admin/imoveis/${property.id}/editar`}
                  className="inline-flex items-center justify-center rounded-full bg-gray-900 px-4 py-3 text-sm font-bold text-white">
                  <Pencil className="size-4 mr-2" />
                  Editar
                </Link>

                <button
                  onClick={() => handleDelete(property.id)}
                  className="inline-flex items-center justify-center rounded-full bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                  <Trash2 className="size-4 mr-2" />
                  Excluir
                </button>
              </div>
            </div>
          ))}

          {properties.length === 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center text-gray-500">
              Nenhum imóvel cadastrado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
