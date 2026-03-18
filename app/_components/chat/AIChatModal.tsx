"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useQueryStates, parseAsBoolean, parseAsString } from "nuqs";
import { Sparkles, X, ArrowUp, ExternalLink } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/app/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { ChatBubble } from "./ChatComponents";
import { ImovelListCard } from "../imovel-list-card";

const SUGGESTED_MESSAGES = [
  "Quero comprar um apartamento",
  "Casas para alugar no centro",
  "Imóvel até 2000 reais",
];

const chatFormSchema = z.object({
  message: z.string().min(1),
});

type ChatFormValues = z.infer<typeof chatFormSchema>;

function buildPropertyImageUrl(mainImage?: string | null) {
  if (!mainImage || !mainImage.trim()) {
    return {
      valid: false,
      url: "",
      reason: "Imagem vazia",
    };
  }

  const cleaned = mainImage
    .trim()
    .replace(/\.\.+/g, ".")
    .replace(/^\/+/, "")
    .replace(/\s+/g, "");

  if (!cleaned || cleaned === ".jpg") {
    return {
      valid: false,
      url: "",
      reason: "Nome de imagem inválido",
    };
  }

  if (cleaned.includes("/imoveis/imoveis/")) {
    return {
      valid: false,
      url: cleaned,
      reason: "Caminho duplicado",
    };
  }

  if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
    try {
      const parsed = new URL(cleaned);

      const invalidPatterns = ["/.jpg", "..jpg", "/imoveis/imoveis/"];

      const hasInvalidPattern = invalidPatterns.some((pattern) =>
        parsed.href.includes(pattern),
      );

      return {
        valid: !hasInvalidPattern,
        url: parsed.href,
        reason: hasInvalidPattern ? "URL remota inválida" : "",
      };
    } catch {
      return {
        valid: false,
        url: cleaned,
        reason: "URL remota malformada",
      };
    }
  }

  if (cleaned.startsWith("imoveis/")) {
    return {
      valid: false,
      url: `https://imobiliariasaojose.com.br/${cleaned}`,
      reason: "Caminho parcial suspeito",
    };
  }

  const finalUrl = `https://imobiliariasaojose.com.br/imoveis/${cleaned}`;

  const invalidPatterns = ["/.jpg", "..jpg", "/imoveis/imoveis/"];

  const hasInvalidPattern = invalidPatterns.some((pattern) =>
    finalUrl.includes(pattern),
  );

  return {
    valid: !hasInvalidPattern,
    url: finalUrl,
    reason: hasInvalidPattern ? "URL final inválida" : "",
  };
}

function normalizeImageUrl(mainImage?: string | null): string | null {
  if (!mainImage || !mainImage.trim()) return null;

  const raw = mainImage.trim();

  if (raw === ".jpg") return null;
  if (raw.includes("..")) return null;

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    try {
      const parsed = new URL(raw);
      if (parsed.pathname.includes("..")) return null;
      return parsed.toString();
    } catch {
      return null;
    }
  }

  let cleaned = raw.replace(/^\/+/, "");

  if (!cleaned) return null;
  if (!/\.(jpg|jpeg|png|webp)$/i.test(cleaned)) return null;

  if (cleaned.toLowerCase().startsWith("imoveis/")) {
    cleaned = cleaned.replace(/^imoveis\//i, "");
  }

  return `https://imobiliariasaojose.com.br/imoveis/${cleaned}`;
}

export function AIChatModal() {
  const router = useRouter();

  const [chatParams, setChatParams] = useQueryStates({
    chat_open: parseAsBoolean.withDefault(false),
    chat_initial_message: parseAsString,
  });

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "http://localhost:8081/ai/chat",
    }),
  });

  const isStreaming = status === "streaming";
  const isLoading = status === "submitted" || isStreaming;

  const form = useForm<ChatFormValues>({
    resolver: zodResolver(chatFormSchema),
    defaultValues: { message: "" },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialMessageSentRef = useRef(false);

  useEffect(() => {
    if (
      chatParams.chat_open &&
      chatParams.chat_initial_message &&
      !initialMessageSentRef.current
    ) {
      initialMessageSentRef.current = true;
      sendMessage({ text: chatParams.chat_initial_message });
      setChatParams({ chat_initial_message: null });
    }
  }, [
    chatParams.chat_open,
    chatParams.chat_initial_message,
    sendMessage,
    setChatParams,
  ]);

  useEffect(() => {
    if (!chatParams.chat_open) initialMessageSentRef.current = false;
  }, [chatParams.chat_open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  if (!chatParams.chat_open) return null;

  const handleClose = () => {
    setChatParams({ chat_open: false, chat_initial_message: null });
  };

  const onSubmit = (values: ChatFormValues) => {
    sendMessage({ text: values.message });
    form.reset();
  };

  const handleSuggestion = (text: string) => {
    sendMessage({ text });
  };

  const handleRedirectToSearch = (properties: any[]) => {
    if (!properties || properties.length === 0) return;

    const ids = properties.map((p) => p.id).join(",");

    router.push(`/sugestoes?ids=${ids}`);
  };

  const handleRedirectToProperty = (propertyId: string) => {
    handleClose();
    router.push(`/imoveis/${propertyId}`);
  };

  const chatContent = (
    <div className="flex flex-1 flex-col overflow-hidden bg-white rounded-t-3xl md:rounded-3xl shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex shrink-0 items-center justify-between border-b border-gray-100 p-5 bg-white z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#eef4ff] rounded-full flex items-center justify-center relative">
            <Sparkles className="text-[#3ed4b4] size-6" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="flex flex-col">
            <h3 className="font-bold text-gray-900 leading-tight">Imob AI</h3>
            <span className="text-xs text-green-500 font-medium">● Online</span>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
          <X className="size-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/50">
        {messages.length === 0 && (
          <ChatBubble
            role="assistant"
            content="Olá! Sou sua IA personal da Casa São José. O que você está buscando hoje?"
          />
        )}

        {messages.map((message) => {
          const textContent = message.parts
            ?.filter((part: any) => part.type === "text")
            .map((part: any) => part.text)
            .join("");

          return (
            <div key={message.id} className="flex flex-col">
              {textContent && (
                <ChatBubble role={message.role as "assistant" | "user"}>
                  {textContent}
                </ChatBubble>
              )}
              {message.parts?.map((part: any, index: number) => {
                if (part.type === "tool-buscarImoveis") {
                  if (
                    part.state === "input-streaming" ||
                    part.state === "input-available"
                  ) {
                    return (
                      <ChatBubble
                        key={`tool-loading-${index}`}
                        role="assistant">
                        <span className="animate-pulse text-gray-500">
                          Analisando nosso catálogo... 🔍
                        </span>
                      </ChatBubble>
                    );
                  }

                  if (part.state === "output-error") {
                    return (
                      <ChatBubble key={`tool-error-${index}`} role="assistant">
                        Ocorreu um erro ao buscar os imóveis.
                      </ChatBubble>
                    );
                  }

                  if (part.state === "output-available") {
                    const properties = part.output;

                    if (properties && properties.length > 0) {
                      return (
                        <div
                          key={`result-${index}`}
                          className="flex flex-col gap-3 w-full mb-4">
                          {/* 👇 Mudamos de carrossel para uma lista vertical limpa 👇 */}
                          <div className="flex flex-col gap-3 w-full pl-2 pr-2">
                            {properties.map((prop: any) => {
                              const validImageUrl = normalizeImageUrl(
                                prop.mainImage,
                              );

                              const imovelFormatado = {
                                id: prop.id,
                                title: prop.title,
                                propertyType: "Imóvel", // IA não traz o tipo por padrão
                                mainImage: validImageUrl || "",
                                price: prop.price || 0,
                              };

                              return (
                                <ImovelListCard
                                  key={prop.id}
                                  imovel={imovelFormatado}
                                  onClick={() =>
                                    handleRedirectToSearch(part.input)
                                  }
                                />
                              );
                            })}
                          </div>

                          <div className="flex justify-start pl-2 mt-2">
                            <button
                              onClick={() => handleRedirectToSearch(properties)}
                              className="flex items-center gap-2 bg-[#3ed4b4]/10 text-[#00c1ac] hover:bg-[#3ed4b4]/20 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer">
                              <ExternalLink size={16} />
                              Ver todos os resultados da busca
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <ChatBubble key={`empty-${index}`} role="assistant">
                        Desculpe, não encontrei nenhum imóvel com essas
                        características no momento. Quer tentar buscar de outra
                        forma?
                      </ChatBubble>
                    );
                  }
                }

                return null;
              })}
            </div>
          );
        })}

        {status === "submitted" && (
          <div className="flex justify-start mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-[#eeeeee] p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5 h-12">
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="flex shrink-0 flex-col gap-3 p-4 border-t border-gray-100 bg-white z-10">
        {!isLoading && messages.length < 3 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {SUGGESTED_MESSAGES.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestion(suggestion)}
                className="whitespace-nowrap px-4 py-2 bg-[#e8efff] text-[#3c4c70] rounded-full text-xs font-medium hover:bg-[#dbe6ff] transition-colors cursor-pointer">
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex items-center gap-2 pt-2">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Digite sua mensagem"
                      autoComplete="off"
                      className="w-full bg-[#f3f3f3] py-4 px-6 h-auto rounded-full text-sm outline-none border-none focus-visible:ring-2 focus-visible:ring-[#3ed4b4]/20 transition-all shadow-inner"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <button
              type="submit"
              disabled={!form.watch("message")?.trim() || isLoading}
              className="bg-[#00c1ac] text-white p-3 rounded-full shadow-lg shadow-[#00c1ac]/30 disabled:opacity-50 disabled:shadow-none hover:scale-105 active:scale-95 transition-all cursor-pointer flex-shrink-0">
              <ArrowUp size={22} />
            </button>
          </form>
        </Form>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm cursor-pointer"
        onClick={handleClose}
      />
      <div className="absolute inset-x-0 bottom-0 top-20 md:inset-auto md:bottom-24 md:right-4 md:w-[420px] md:h-[650px] flex flex-col">
        {chatContent}
      </div>
    </div>
  );
}
