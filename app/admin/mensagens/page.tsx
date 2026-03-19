"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  Loader2,
  MessageSquare,
  Phone,
  MapPin,
  Bot,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { AdminNav } from "../../_components/admin-bottom-nav";

const API_URL = "http://localhost:8081";

interface Lead {
  id: string;
  clientName: string;
  clientPhone: string;
  origin: "BOTAO_AGENDAR" | "CHAT_IA";
  aiSummary: string | null;
  status: "NOVO" | "ENVIADO_IMOBILIARIA" | "VISITA_FEITA";
  createdAt: string;
  property?: {
    id: string;
    title: string;
    neighborhood: string | null;
    city: string | null;
    price?: number | null;
    mainImage?: string | null;
  };
}

export default function AdminMensagensPage() {
  const { userId, isLoaded } = useAuth();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeadId, setLoadingLeadId] = useState<string | null>(null);

  async function loadLeads(showLoader = true) {
    try {
      if (showLoader) setLoading(true);

      const res = await fetch(`${API_URL}/leads`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Falha ao carregar leads");
      }

      const data = await res.json();
      setLeads(data);
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
    } finally {
      if (showLoader) setLoading(false);
    }
  }

  useEffect(() => {
    async function checkAdmin() {
      if (!userId) return;

      try {
        const res = await fetch(`${API_URL}/admin/me?userId=${userId}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Falha ao verificar admin");
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

  async function handleChangeStatus(leadId: string, status: Lead["status"]) {
    try {
      const res = await fetch(`${API_URL}/leads/${leadId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        throw new Error("Erro ao atualizar status");
      }

      const updatedLead = await res.json();

      setLeads((prev) =>
        prev.map((item) =>
          item.id === leadId ? { ...item, status: updatedLead.status } : item,
        ),
      );
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  }

  useEffect(() => {
    if (isAdmin) {
      loadLeads();
    } else if (isAdmin === false) {
      setLoading(false);
    }
  }, [isAdmin]);

  async function handleResponderWhatsapp(lead: Lead) {
    const phoneDigits = lead.clientPhone?.replace(/\D/g, "") || "";

    if (!phoneDigits) return;

    const texto = `Olá, ${lead.clientName || "cliente"}! Vi seu interesse no imóvel "${lead.property?.title || "selecionado"}". Podemos continuar por aqui?`;
    const whatsappUrl = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(texto)}`;

    try {
      setLoadingLeadId(lead.id);

      const res = await fetch(`${API_URL}/leads/${lead.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          status: "ENVIADO_IMOBILIARIA",
        }),
      });

      if (!res.ok) {
        console.error("Erro ao atualizar status:", await res.text());
        throw new Error("Falha ao atualizar status do lead");
      }

      const updatedLead = await res.json();

      setLeads((prev) =>
        prev.map((item) =>
          item.id === lead.id ? { ...item, status: updatedLead.status } : item,
        ),
      );

      setTimeout(async () => {
        await loadLeads(false);
        window.open(whatsappUrl, "_blank");
      }, 150);
    } catch (error) {
      console.error("Erro ao marcar lead como lido:", error);
      window.open(whatsappUrl, "_blank");
    } finally {
      setLoadingLeadId(null);
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
            Você não tem permissão para acessar esta área.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-32">
      <div className="max-w-5xl mx-auto">
        <AdminNav />

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Mensagens e Leads
          </h1>
          <p className="text-gray-500 mt-2">
            Acompanhe os clientes interessados vindos do site e da IA.
          </p>
        </div>

        <div className="grid gap-5">
          {leads.map((lead) => {
            const phoneDigits = lead.clientPhone?.replace(/\D/g, "") || "";
            const hasPhone = Boolean(phoneDigits);

            return (
              <div
                key={lead.id}
                className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                          lead.origin === "CHAT_IA"
                            ? "bg-purple-100 text-purple-600"
                            : "bg-green-100 text-green-600"
                        }`}>
                        {lead.origin === "CHAT_IA" ? (
                          <Bot size={24} />
                        ) : (
                          <MessageSquare size={24} />
                        )}
                      </div>

                      <div>
                        <h3 className="font-extrabold text-gray-900 text-lg leading-tight">
                          {lead.clientName || "Cliente Web"}
                        </h3>

                        <p className="text-sm text-gray-500 font-medium flex items-center gap-1.5 mt-1">
                          <Phone size={14} />
                          {lead.clientPhone || "Telefone não informado"}
                        </p>
                      </div>
                    </div>

                    <select
                      value={lead.status}
                      onChange={(e) =>
                        handleChangeStatus(
                          lead.id,
                          e.target.value as Lead["status"],
                        )
                      }
                      className={`text-xs font-extrabold text-center px-2 py-2 rounded-full uppercase tracking-wider border outline-none cursor-pointer ${
                        lead.status === "NOVO"
                          ? "bg-blue-50 text-blue-600 border-blue-100"
                          : lead.status === "ENVIADO_IMOBILIARIA"
                            ? "bg-green-50 text-green-600 border-green-100"
                            : "bg-purple-50 text-purple-600 border-purple-100"
                      }`}>
                      <option value="NOVO">Novo</option>
                      <option value="ENVIADO_IMOBILIARIA">
                        Em atendimento
                      </option>
                      <option value="VISITA_FEITA">Finalizado</option>
                    </select>
                  </div>

                  <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                    {lead.property?.mainImage ? (
                      <img
                        src={lead.property.mainImage}
                        alt={lead.property.title || "Imóvel"}
                        className="w-full h-44 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop";
                        }}
                      />
                    ) : (
                      <div className="w-full h-44 bg-gray-200 flex items-center justify-center text-gray-400 font-semibold">
                        Imagem do imóvel não disponível
                      </div>
                    )}

                    <div className="p-4">
                      <div className="flex items-start gap-2">
                        <MapPin
                          size={16}
                          className="text-gray-400 mt-0.5 shrink-0"
                        />
                        <div>
                          <p className="text-sm text-gray-700 font-bold">
                            Interesse:{" "}
                            <span className="text-gray-900 font-extrabold">
                              {lead.property?.title || "Não especificado"}
                            </span>
                          </p>

                          {lead.property?.neighborhood && (
                            <p className="text-xs text-gray-500 mt-1">
                              Bairro: {lead.property.neighborhood}
                            </p>
                          )}

                          {lead.property?.city && (
                            <p className="text-xs text-gray-500 mt-1">
                              Cidade: {lead.property.city}
                            </p>
                          )}

                          {typeof lead.property?.price === "number" && (
                            <p className="text-sm text-teal-600 font-extrabold mt-2">
                              R${" "}
                              {Number(lead.property.price).toLocaleString(
                                "pt-BR",
                              )}
                            </p>
                          )}
                        </div>
                      </div>

                      {lead.aiSummary && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">
                            Resumo da Inteligência Artificial
                          </p>
                          <p className="text-sm text-gray-600 leading-relaxed italic">
                            `{lead.aiSummary}`
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-1">
                    <button
                      type="button"
                      onClick={() => handleResponderWhatsapp(lead)}
                      disabled={!hasPhone || loadingLeadId === lead.id}
                      className={`flex-1 font-bold text-sm py-3 rounded-full flex items-center justify-center gap-2 transition shadow-lg ${
                        hasPhone
                          ? "bg-[#25D366] text-white hover:bg-[#20bd5a] shadow-[#25D366]/30"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed shadow-none"
                      }`}>
                      {loadingLeadId === lead.id ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <MessageSquare size={18} />
                      )}

                      {hasPhone
                        ? "Responder no WhatsApp"
                        : "Telefone não informado"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {leads.length === 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center flex flex-col items-center">
              <div className="bg-gray-50 p-4 rounded-full text-gray-400 mb-4">
                <MessageSquare size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Caixa de entrada vazia
              </h3>
              <p className="text-gray-500">
                Nenhum cliente entrou em contato ainda.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
