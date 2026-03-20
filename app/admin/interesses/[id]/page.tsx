"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface PropertyInfo {
  id: string;
  title: string;
  neighborhood: string;
  city: string;
}

interface PropertyUserLead {
  userId: string;
  userName: string | null;
  userEmail: string | null;
  interestClicks: number;
  whatsappClicks: number;
  lastEventAt: string;
}

interface PropertyUsersResponse {
  property: PropertyInfo;
  users: PropertyUserLead[];
}

export default function AdminPropertyUsersPage() {
  const params = useParams();
  const router = useRouter();

  const [data, setData] = useState<PropertyUsersResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(
          `${API_URL}/admin/lead-events/property/${params.id}/users`,
        );

        if (!res.ok) {
          throw new Error("Erro ao carregar usuários");
        }

        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      loadData();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="size-10 animate-spin text-teal-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-gray-500 mb-4">
          Não foi possível carregar os dados.
        </p>
        <button
          onClick={() => router.back()}
          className="bg-gray-900 text-white px-5 py-3 rounded-full font-bold">
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm border border-gray-100 text-gray-700">
          <ChevronLeft className="size-4" />
          Voltar
        </button>

        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-2xl font-extrabold text-gray-900">
              {data.property.title}
            </h1>
            <p className="text-gray-500 mt-1">
              {data.property.neighborhood}, {data.property.city}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-6 py-4 text-sm font-bold text-gray-500">
                    Nome
                  </th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-500">
                    Email
                  </th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-500">
                    User ID
                  </th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-500">
                    Cliques em Interesse
                  </th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-500">
                    Cliques no WhatsApp
                  </th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-500">
                    Última interação
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((user) => (
                  <tr key={user.userId} className="border-t border-gray-100">
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                      {user.userName || "Não informado"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {user.userEmail || "Não informado"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {user.userId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {user.interestClicks}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {user.whatsappClicks}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(user.lastEventAt).toLocaleString("pt-BR")}
                    </td>
                  </tr>
                ))}

                {data.users.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-gray-500">
                      Nenhum usuário interagiu com este imóvel ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
