"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, MessageCircle, MousePointerClick, Users } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { AdminNav } from "../../_components/admin-bottom-nav";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface AdminPropertyLeadStats {
  id: string;
  title: string;
  neighborhood: string;
  city: string;
  price: number;
  mainImage: string;
  interestClicks: number;
  whatsappClicks: number;
  uniqueInterestedUsers: number;
  uniqueWhatsappUsers: number;
  conversionRate: number;
}

interface AdminLeadSummary {
  totalEvents: number;
  interestClicks: number;
  whatsappClicks: number;
  uniqueUsers: number;
  uniqueProperties: number;
  conversionRate: number;
}

export default function AdminInteressesPage() {
  const [summary, setSummary] = useState<AdminLeadSummary | null>(null);
  const [properties, setProperties] = useState<AdminPropertyLeadStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const { userId, isLoaded } = useAuth();
  const router = useRouter();

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

        if (!res.ok) {
          throw new Error("Erro ao verificar permissão");
        }

        const data = await res.json();
        setIsAdmin(Boolean(data.isAdmin));
      } catch (error) {
        console.error("Erro ao verificar admin:", error);
        setIsAdmin(false);
      }
    }

    if (isLoaded && userId) {
      checkAdmin();
    }
  }, [isLoaded, userId]);

  useEffect(() => {
    async function loadData() {
      try {
        const [summaryRes, propertiesRes] = await Promise.all([
          fetch(`${API_URL}/admin/lead-events/summary`),
          fetch(`${API_URL}/admin/lead-events/top-properties`),
        ]);

        if (!summaryRes.ok || !propertiesRes.ok) {
          throw new Error("Erro ao carregar métricas");
        }

        const summaryData = await summaryRes.json();
        const propertiesData = await propertiesRes.json();

        setSummary(summaryData);
        setProperties(propertiesData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    if (isAdmin === true) {
      loadData();
    }

    if (isAdmin === false) {
      setLoading(false);
    }
  }, [isAdmin]);

  if (!isLoaded || isAdmin === null || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="size-10 animate-spin text-teal-500 mb-4" />
        <p className="text-gray-500">Carregando dashboard...</p>
      </div>
    );
  }

  if (!userId) {
    return null;
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
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              Dashboard de Interesses
            </h1>
            <p className="text-gray-500 mt-2">
              Acompanhe quem clicou em interesse e quem avançou para o WhatsApp.
            </p>
          </div>

          <Link
            href="/admin/imoveis/novo"
            className="inline-flex items-center justify-center rounded-full bg-teal-500 px-5 py-3 text-sm font-bold text-white hover:bg-teal-600 transition">
            Adicionar imóvel
          </Link>
        </div>

        <AdminNav />

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Cliques em Interesse</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-2">
                {summary.interestClicks}
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Cliques no WhatsApp</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-2">
                {summary.whatsappClicks}
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Usuários Únicos</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-2">
                {summary.uniqueUsers}
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Conversão para WhatsApp</p>
              <p className="text-3xl font-extrabold text-teal-500 mt-2">
                {summary.conversionRate}%
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-extrabold text-gray-900">
              Imóveis com mais interesse
            </h2>
          </div>

          <div className="p-6 grid gap-6 bg-gray-50/50">
            {properties.map((property) => (
              <div
                key={property.id}
                className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-5 md:items-center hover:shadow-md transition">
                <img
                  src={property.mainImage}
                  alt={property.title}
                  className="w-full md:w-44 h-32 object-cover rounded-2xl bg-gray-100 shadow-sm"
                />

                <div className="flex-1">
                  <h3 className="text-lg font-extrabold text-gray-900">
                    {property.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {property.neighborhood}, {property.city}
                  </p>
                  <p className="text-lg font-extrabold text-teal-500 mt-3">
                    R$ {Number(property.price).toLocaleString("pt-BR")}
                  </p>

                  <div className="flex flex-wrap gap-3 mt-4">
                    <div className="bg-gray-50 rounded-2xl px-4 py-3 flex items-center gap-2 shadow-sm">
                      <MousePointerClick className="size-4 text-gray-500" />
                      <span className="text-sm font-semibold text-gray-700">
                        Interesse: {property.interestClicks}
                      </span>
                    </div>

                    <div className="bg-gray-50 rounded-2xl px-4 py-3 flex items-center gap-2 shadow-sm">
                      <MessageCircle className="size-4 text-gray-500" />
                      <span className="text-sm font-semibold text-gray-700">
                        WhatsApp: {property.whatsappClicks}
                      </span>
                    </div>

                    <div className="bg-gray-50 rounded-2xl px-4 py-3 flex items-center gap-2 shadow-sm">
                      <Users className="size-4 text-gray-500" />
                      <span className="text-sm font-semibold text-gray-700">
                        Usuários únicos: {property.uniqueInterestedUsers}
                      </span>
                    </div>

                    <div className="bg-teal-50 text-teal-700 rounded-2xl px-4 py-3 shadow-sm">
                      <span className="text-sm font-bold">
                        Conversão: {property.conversionRate}%
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <Link
                    href={`/admin/interesses/${property.id}`}
                    className="inline-flex items-center justify-center rounded-full bg-gray-900 px-5 py-3 text-sm font-bold text-white hover:bg-gray-800 transition">
                    Ver usuários
                  </Link>
                </div>
              </div>
            ))}

            {properties.length === 0 && (
              <div className="p-8 text-center text-gray-500 bg-white rounded-3xl border border-gray-100">
                Nenhum evento registrado ainda.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
