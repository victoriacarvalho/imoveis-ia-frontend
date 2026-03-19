/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import {
  ChevronLeft,
  MapPin,
  MessageCircle,
  Loader2,
  Send,
  ShieldCheck,
} from "lucide-react";

interface PropertyDetails {
  id: string;
  title: string;
  neighborhood: string;
  city: string;
  price: number;
  mainImage: string;
  agencyId: string;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "admin";
  timestamp: string;
}

const API_URL = "https://imoveis-ia-api.onrender.com";

function extrairNumerosTelefone(valor: string) {
  return valor.replace(/\D/g, "");
}

function telefoneValido(valor: string) {
  const numeros = extrairNumerosTelefone(valor);
  return numeros.length === 10 || numeros.length === 11;
}

function formatarTelefoneWhatsapp(valor: string) {
  let numeros = extrairNumerosTelefone(valor);

  if (numeros.length === 10 || numeros.length === 11) {
    numeros = `55${numeros}`;
  }

  return numeros;
}

export default function ContatoImobiliariaPage() {
  const params = useParams();
  const router = useRouter();
  const { userId } = useAuth();
  const { user } = useUser();

  const [imovel, setImovel] = useState<PropertyDetails | null>(null);
  const [carregando, setCarregando] = useState(true);

  const [mensagemInput, setMensagemInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [aguardandoTelefone, setAguardandoTelefone] = useState(false);
  const [primeiraMensagem, setPrimeiraMensagem] = useState<string | null>(null);
  const [leadEnviado, setLeadEnviado] = useState(false);

  const [mensagens, setMensagens] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      text: "Olá! Vi que você tem interesse neste imóvel. Como posso te ajudar hoje?",
      sender: "admin",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!params.id) return;

    fetch(`${API_URL}/imoveis/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Imóvel não encontrado");
        return res.json();
      })
      .then((data) => {
        setImovel(data);
        setCarregando(false);
      })
      .catch((error) => {
        console.error(error);
        setCarregando(false);
      });
  }, [params.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, isTyping]);

  async function handleEnviarMensagem(e: React.FormEvent) {
    e.preventDefault();
    if (!mensagemInput.trim() || !imovel) return;

    const textoUsuario = mensagemInput.trim();

    const novaMensagem: ChatMessage = {
      id: Date.now().toString(),
      text: textoUsuario,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMensagens((prev) => [...prev, novaMensagem]);
    setMensagemInput("");

    if (leadEnviado) {
      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);
        setMensagens((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            text: "Recebemos sua mensagem. Nosso corretor continuará o atendimento com você em breve.",
            sender: "admin",
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      }, 1000);

      return;
    }

    if (!aguardandoTelefone && !primeiraMensagem) {
      setPrimeiraMensagem(textoUsuario);
      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);
        setMensagens((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            text: "Para nosso corretor falar com você, me envie seu número de celular com DDD.",
            sender: "admin",
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
        setAguardandoTelefone(true);
      }, 900);

      return;
    }

    if (aguardandoTelefone) {
      if (!telefoneValido(textoUsuario)) {
        setIsTyping(true);

        setTimeout(() => {
          setIsTyping(false);
          setMensagens((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              text: "Não consegui identificar um celular válido. Me envie no formato (31) 99999-9999.",
              sender: "admin",
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ]);
        }, 700);

        return;
      }

      setIsTyping(true);

      try {
        const nome =
          user?.fullName?.trim() || user?.firstName || "Cliente (Chat App)";

        const telefoneFormatado = formatarTelefoneWhatsapp(textoUsuario);

        const res = await fetch(`${API_URL}/leads`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientName: nome,
            clientPhone: telefoneFormatado,
            origin: "CHAT_IA",
            propertyId: imovel.id,
            agencyId: imovel.agencyId,
            aiSummary: primeiraMensagem
              ? `Primeira mensagem: "${primeiraMensagem}"`
              : null,
          }),
        });

        if (!res.ok) {
          throw new Error("Falha ao salvar o Lead no banco de dados");
        }

        setLeadEnviado(true);
        setAguardandoTelefone(false);

        setTimeout(() => {
          setIsTyping(false);
          setMensagens((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              text: "Perfeito! Seu número foi registrado e nosso corretor entrará em contato com você pelo WhatsApp em instantes.",
              sender: "admin",
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ]);
        }, 1000);
      } catch (error) {
        console.error("Erro ao salvar lead com telefone:", error);
        setIsTyping(false);

        setMensagens((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            text: "Ops! Tivemos um problema ao registrar seu contato. Tente novamente em instantes ou use o botão do WhatsApp acima.",
            sender: "admin",
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      }

      return;
    }
  }

  async function registrarInteresseWhatsapp() {
    if (!imovel) return;

    const linkZap = `https://wa.me/5531999999999?text=${encodeURIComponent(
      `Olá! Tenho interesse no imóvel "${imovel.title}".`,
    )}`;

    if (!userId) {
      window.open(linkZap, "_blank");
      return;
    }

    try {
      const nome = user?.fullName?.trim() || user?.firstName || "Cliente Web";

      await fetch(`${API_URL}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: nome,
          clientPhone: "",
          origin: "BOTAO_AGENDAR",
          propertyId: imovel.id,
          agencyId: imovel.agencyId,
          aiSummary: 'Lead iniciado pelo botão "WhatsApp"',
        }),
      });
    } catch (error) {
      console.error(error);
    } finally {
      window.open(linkZap, "_blank");
    }
  }

  if (carregando) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="size-10 text-teal-500 animate-spin mb-4" />
      </div>
    );
  }

  if (!imovel) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Imóvel não encontrado
        </h2>
        <button
          onClick={() => router.back()}
          className="bg-teal-500 text-white px-6 py-3 rounded-full font-bold mt-4">
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto h-dvh bg-gray-50 flex flex-col shadow-2xl">
      {" "}
      <div className="relative h-48 shrink-0">
        <img
          src={imovel.mainImage}
          alt={imovel.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-black/40 to-black/20" />

        <div className="absolute top-0 left-0 w-full p-4 z-20 flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="bg-white/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/30">
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={registrarInteresseWhatsapp}
            className="bg-[#25D366] text-white p-2 rounded-full shadow-lg flex items-center gap-2 px-4 text-xs font-bold hover:bg-[#20bd5a] transition">
            <MessageCircle size={16} /> WhatsApp
          </button>
        </div>

        <div className="absolute bottom-4 left-4 right-4 z-20 text-white">
          <h1 className="text-lg font-extrabold leading-tight truncate">
            {imovel.title}
          </h1>
          <div className="flex justify-between items-end mt-1">
            <p className="text-xs opacity-90 flex items-center gap-1">
              <MapPin size={12} /> {imovel.neighborhood}
            </p>
            <p className="text-base font-extrabold text-teal-400">
              R$ {Number(imovel.price).toLocaleString("pt-BR")}
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-0 bg-gray-50 overflow-y-auto p-4 flex flex-col gap-4 pb-24">
        {" "}
        <div className="flex justify-center mb-2">
          <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 uppercase tracking-wider">
            <ShieldCheck size={14} /> Atendimento Seguro
          </span>
        </div>
        {mensagens.map((msg) => {
          const isAdmin = msg.sender === "admin";

          return (
            <div
              key={msg.id}
              className={`flex w-full ${isAdmin ? "justify-start" : "justify-end"}`}>
              <div
                className={`flex flex-col max-w-[80%] ${isAdmin ? "items-start" : "items-end"}`}>
                <div
                  className={`px-4 py-3 rounded-2xl shadow-sm relative ${
                    isAdmin
                      ? "bg-white text-gray-800 rounded-tl-sm border border-gray-100"
                      : "bg-teal-500 text-white rounded-tr-sm"
                  }`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>

                <span className="text-[10px] text-gray-400 font-medium mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm border border-gray-100 shadow-sm flex items-center gap-1.5 h-10">
              <div
                className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="sticky bottom-[88px] z-30 bg-white border-t border-gray-100 p-4">
        <form
          onSubmit={handleEnviarMensagem}
          className="flex items-center gap-2">
          <input
            type="text"
            value={mensagemInput}
            onChange={(e) => setMensagemInput(e.target.value)}
            placeholder={
              aguardandoTelefone
                ? "Digite seu celular com DDD"
                : "Digite sua mensagem..."
            }
            className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none rounded-full px-5 py-3.5 text-sm transition-all"
          />
          <button
            type="submit"
            disabled={!mensagemInput.trim()}
            className="bg-teal-500 text-white p-3.5 rounded-full shadow-md hover:bg-teal-600 disabled:opacity-50 disabled:shadow-none transition-all flex-shrink-0">
            <Send size={20} className="ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
