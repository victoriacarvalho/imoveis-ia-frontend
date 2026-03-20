"use client";

import { useEffect, useRef, useState } from "react";
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
import { useAuth } from "@clerk/nextjs";

const SUGGESTED_MESSAGES = [
  "Quero comprar um apartamento",
  "Casas para alugar no centro",
  "Imóvel até 2000 reais",
];

const chatFormSchema = z.object({
  message: z.string().min(1),
});

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ChatFormValues = z.infer<typeof chatFormSchema>;

type ProfileData = {
  id: string;
  name: string | null;
  plan: string | null;
  bedrooms: number | null;
  parkingSpots: number | null;
  bathrooms: number | null;
  neighborhood: string | null;
  transactionType: string | null;
  propertyType: string | null;
  maxPrice: number | null;
  onboardingDone: boolean;
};

type OnboardingStep =
  | "name"
  | "plan"
  | "bedrooms"
  | "parkingSpots"
  | "bathrooms"
  | "neighborhood"
  | null;

type LocalMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

type PropertyResult = {
  id: string;
  title: string;
  mainImage?: string | null;
  price?: number | null;
};

type ProfilePreferenceOutput = Partial<{
  plan: string | null;
  bedrooms: number | null;
  parkingSpots: number | null;
  bathrooms: number | null;
  neighborhood: string | null;
  transactionType: string | null;
  propertyType: string | null;
  maxPrice: number | null;
}>;

type TextPart = {
  type: "text";
  text: string;
};

type BuscarImoveisPart = {
  type: "tool-buscarImoveis";
  state:
    | "input-streaming"
    | "input-available"
    | "output-error"
    | "output-available";
  output?: PropertyResult[];
};

type AtualizarPerfilPart = {
  type: "tool-atualizarPerfilPreferencias";
  state:
    | "input-streaming"
    | "input-available"
    | "output-error"
    | "output-available";
  output?: ProfilePreferenceOutput;
};

type MessagePart = TextPart | BuscarImoveisPart | AtualizarPerfilPart;

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  parts?: MessagePart[];
};

<<<<<<< HEAD
const API_URL = process.env.NEXT_PUBLIC_API_URL!;
=======
const API_URL = "https://imoveis-ia-api.onrender.com";
>>>>>>> f3dfe1294a62e59d5394c826110acbdc5883d1d4

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

export function AIChatModal({ isOpen, onClose }: AIChatModalProps) {
  const router = useRouter();
  const { userId } = useAuth();

  const [, setProfileState] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>(null);
  const [isOnboardingTyping, setIsOnboardingTyping] = useState(false);
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([]);

  const [chatParams, setChatParams] = useQueryStates({
    chat_open: parseAsBoolean.withDefault(false),
    chat_initial_message: parseAsString,
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
<<<<<<< HEAD
      api: `${API_URL}/ai/chat`,
=======
      api: "https://imoveis-ia-api.onrender.com",
>>>>>>> f3dfe1294a62e59d5394c826110acbdc5883d1d4
    }),
  });

  const typedMessages = messages as ChatMessage[];

  const isStreaming = status === "streaming";
  const isLoading = status === "submitted" || isStreaming;

  const form = useForm<ChatFormValues>({
    resolver: zodResolver(chatFormSchema),
    defaultValues: { message: "" },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialMessageSentRef = useRef(false);
  const onboardingInitializedRef = useRef(false);

  function getNextMissingStep(profileData: ProfileData | null): OnboardingStep {
    if (!profileData?.name) return "name";
    if (!profileData?.plan) return "plan";
    if (profileData?.bedrooms == null) return "bedrooms";
    if (profileData?.parkingSpots == null) return "parkingSpots";
    if (profileData?.bathrooms == null) return "bathrooms";
    if (!profileData?.neighborhood) return "neighborhood";
    return null;
  }

  function getQuestionForStep(step: OnboardingStep) {
    switch (step) {
      case "name":
        return "Antes de começarmos, qual é o seu nome?";
      case "plan":
        return "Qual é o seu plano? Exemplo: Plano Básico.";
      case "bedrooms":
        return "Quantos quartos você procura?";
      case "parkingSpots":
        return "Quantas vagas de garagem você precisa?";
      case "bathrooms":
        return "Quantos banheiros você precisa?";
      case "neighborhood":
        return "Qual bairro você prefere?";
      default:
        return "Vamos continuar.";
    }
  }

  async function reloadProfile() {
    if (!userId) return;

    try {
      const res = await fetch(`${API_URL}/profile/${userId}`);

      if (!res.ok) {
        console.error("Erro ao recarregar perfil:", await res.text());
        return;
      }

      const data: ProfileData = await res.json();
      setProfileState(data);
    } catch (error) {
      console.error("Erro ao recarregar perfil:", error);
    }
  }

  async function askNextOnboardingQuestion(step: OnboardingStep) {
    if (!step) return;

    setIsOnboardingTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setIsOnboardingTyping(false);

    setOnboardingStep(step);
    setLocalMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: getQuestionForStep(step),
      },
    ]);
  }

  async function saveOnboardingField(step: OnboardingStep, value: string) {
    if (!userId || !step) return null;

    const payload: Record<string, unknown> = { userId };

    if (step === "name") payload.name = value;
    if (step === "plan") payload.plan = value;
    if (step === "bedrooms") payload.bedrooms = Number(value);
    if (step === "parkingSpots") payload.parkingSpots = Number(value);
    if (step === "bathrooms") payload.bathrooms = Number(value);
    if (step === "neighborhood") payload.neighborhood = value;

    const res = await fetch(`${API_URL}/profile/onboarding`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("Erro ao salvar onboarding:", await res.text());
      return null;
    }

    const updatedProfile: ProfileData = await res.json();
    setProfileState(updatedProfile);
    return updatedProfile;
  }

  async function finishOnboarding() {
    if (!userId) return;

    const res = await fetch(`${API_URL}/profile/onboarding`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        onboardingDone: true,
      }),
    });

    if (!res.ok) {
      console.error("Erro ao finalizar onboarding:", await res.text());
      return;
    }

    const updatedProfile: ProfileData = await res.json();
    setProfileState(updatedProfile);
    setIsOnboarding(false);
    setOnboardingStep(null);
    setIsOnboardingTyping(false);

    setLocalMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "Perfeito! Salvei seu perfil. Agora posso te ajudar a encontrar imóveis com base nas suas preferências.",
      },
    ]);
  }

  useEffect(() => {
    if (
      isOpen &&
      chatParams.chat_initial_message &&
      !initialMessageSentRef.current &&
      !isOnboarding
    ) {
      initialMessageSentRef.current = true;
      sendMessage({ text: chatParams.chat_initial_message });
      setChatParams({ chat_initial_message: null });
    }
  }, [
    isOpen,
    chatParams.chat_initial_message,
    sendMessage,
    setChatParams,
    isOnboarding,
  ]);

  useEffect(() => {
    if (!isOpen) {
      initialMessageSentRef.current = false;
      onboardingInitializedRef.current = false;
      setLocalMessages([]);
      setIsOnboarding(false);
      setOnboardingStep(null);
      setIsOnboardingTyping(false);
      setLoadingProfile(true);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [typedMessages, status, localMessages, isOnboardingTyping]);

  useEffect(() => {
    const hasProfileUpdate = typedMessages.some((message) =>
      message.parts?.some(
        (part) =>
          part.type === "tool-atualizarPerfilPreferencias" &&
          part.state === "output-available",
      ),
    );

    if (hasProfileUpdate) {
      reloadProfile();
      router.refresh();
    }
  }, [typedMessages, router]);

  useEffect(() => {
    async function loadProfile() {
      if (!userId || !isOpen) return;
      if (onboardingInitializedRef.current) return;

      try {
        setLoadingProfile(true);

        const res = await fetch(`${API_URL}/profile/${userId}`);

        if (!res.ok) {
          console.error("Erro ao carregar perfil:", await res.text());
          onboardingInitializedRef.current = true;
          setProfileState(null);
          setIsOnboarding(true);
          setLocalMessages([]);
          await askNextOnboardingQuestion("name");
          return;
        }

        const data: ProfileData | null = await res.json();

        if (!data) {
          onboardingInitializedRef.current = true;
          setProfileState(null);
          setIsOnboarding(true);
          setLocalMessages([]);
          await askNextOnboardingQuestion("name");
          return;
        }

        setProfileState(data);

        const nextStep = getNextMissingStep(data);

        if (!data.onboardingDone && nextStep) {
          onboardingInitializedRef.current = true;
          setIsOnboarding(true);
          setLocalMessages([]);
          await askNextOnboardingQuestion(nextStep);
        } else {
          onboardingInitializedRef.current = true;
          setIsOnboarding(false);
          setOnboardingStep(null);
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        onboardingInitializedRef.current = true;
        setProfileState(null);
        setIsOnboarding(true);
        setLocalMessages([]);
        await askNextOnboardingQuestion("name");
      } finally {
        setLoadingProfile(false);
      }
    }

    loadProfile();
  }, [userId, isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setChatParams({ chat_open: false, chat_initial_message: null });
    onClose();
  };

  const onSubmit = async (values: ChatFormValues) => {
    const text = values.message.trim();
    if (!text) return;

    form.reset();

    if (isOnboarding && onboardingStep) {
      setLocalMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "user",
          content: text,
        },
      ]);

      const updatedProfile = await saveOnboardingField(onboardingStep, text);

      if (!updatedProfile) {
        setLocalMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Não consegui salvar sua resposta agora. Tente novamente.",
          },
        ]);
        return;
      }

      const nextStep = getNextMissingStep(updatedProfile);

      if (nextStep) {
        await askNextOnboardingQuestion(nextStep);
      } else {
        await finishOnboarding();
      }

      return;
    }

    sendMessage({
      text,
      metadata: {
        userId,
      },
    });
  };

  const handleSuggestion = async (text: string) => {
    if (isOnboarding && onboardingStep) {
      setLocalMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "user",
          content: text,
        },
      ]);

      const updatedProfile = await saveOnboardingField(onboardingStep, text);

      if (!updatedProfile) {
        setLocalMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Não consegui salvar sua resposta agora. Tente novamente.",
          },
        ]);
        return;
      }

      const nextStep = getNextMissingStep(updatedProfile);

      if (nextStep) {
        await askNextOnboardingQuestion(nextStep);
      } else {
        await finishOnboarding();
      }

      return;
    }

    sendMessage({
      text,
      metadata: {
        userId,
      },
    });
  };

  function handleRedirectToSearch(properties: PropertyResult[]) {
    if (!properties || properties.length === 0) return;

    const ids = properties.map((property) => property.id).join(",");

    router.push(`/imoveis?ids=${ids}&chat_open=false&chat_initial_message=`);
  }

  const handleRedirectToProperty = (propertyId: string) => {
    router.push(`/imovel/${propertyId}?chat_open=false&chat_initial_message=`);
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
        {loadingProfile && (
          <ChatBubble role="assistant">Carregando seu perfil...</ChatBubble>
        )}

        {typedMessages.length === 0 &&
          localMessages.length === 0 &&
          !isOnboarding &&
          !loadingProfile && (
            <ChatBubble
              role="assistant"
              content="Olá! Sou sua IA personal da Casa São José. O que você está buscando hoje?"
            />
          )}

        {localMessages.map((message) => (
          <div key={message.id} className="flex flex-col">
            <ChatBubble role={message.role}>{message.content}</ChatBubble>
          </div>
        ))}

        {isOnboardingTyping && (
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

        {typedMessages.map((message) => {
          const textContent =
            message.parts
              ?.filter((part): part is TextPart => part.type === "text")
              .map((part) => part.text)
              .join("") ?? "";

          return (
            <div key={message.id} className="flex flex-col">
              {textContent && (
                <ChatBubble role={message.role}>{textContent}</ChatBubble>
              )}

              {message.parts?.map((part, index) => {
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
                    const properties = part.output ?? [];

                    if (properties.length > 0) {
                      return (
                        <div
                          key={`result-${index}`}
                          className="flex flex-col gap-3 w-full mb-4">
                          <div className="flex flex-col gap-3 w-full pl-2 pr-2">
                            {properties.map((prop) => {
                              const validImageUrl = normalizeImageUrl(
                                prop.mainImage,
                              );

                              const imovelFormatado = {
                                id: prop.id,
                                title: prop.title,
                                propertyType: "Imóvel",
                                mainImage: validImageUrl || "",
                                price: prop.price || 0,
                              };

                              return (
                                <ImovelListCard
                                  key={prop.id}
                                  imovel={imovelFormatado}
                                  onClick={() =>
                                    handleRedirectToProperty(prop.id)
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

                if (part.type === "tool-atualizarPerfilPreferencias") {
                  if (
                    part.state === "input-streaming" ||
                    part.state === "input-available"
                  ) {
                    return (
                      <ChatBubble
                        key={`tool-profile-loading-${index}`}
                        role="assistant">
                        Atualizando suas preferências...
                      </ChatBubble>
                    );
                  }

                  if (part.state === "output-error") {
                    return (
                      <ChatBubble
                        key={`tool-profile-error-${index}`}
                        role="assistant">
                        Não consegui atualizar suas preferências agora.
                      </ChatBubble>
                    );
                  }

                  if (part.state === "output-available") {
                    const output = part.output;

                    const partesAtualizadas: string[] = [];

                    if (output?.plan)
                      partesAtualizadas.push(`plano: ${output.plan}`);
                    if (output?.bedrooms != null)
                      partesAtualizadas.push(`${output.bedrooms} quarto(s)`);
                    if (output?.parkingSpots != null)
                      partesAtualizadas.push(`${output.parkingSpots} vaga(s)`);
                    if (output?.bathrooms != null)
                      partesAtualizadas.push(`${output.bathrooms} banheiro(s)`);
                    if (output?.neighborhood)
                      partesAtualizadas.push(`bairro ${output.neighborhood}`);
                    if (output?.transactionType)
                      partesAtualizadas.push(
                        `transação ${output.transactionType}`,
                      );
                    if (output?.propertyType)
                      partesAtualizadas.push(`tipo ${output.propertyType}`);
                    if (output?.maxPrice != null)
                      partesAtualizadas.push(
                        `até R$ ${Number(output.maxPrice).toLocaleString("pt-BR")}`,
                      );

                    return (
                      <ChatBubble
                        key={`tool-profile-success-${index}`}
                        role="assistant">
                        {partesAtualizadas.length > 0
                          ? `Atualizei suas preferências: ${partesAtualizadas.join(", ")}.`
                          : "Atualizei suas preferências com sucesso."}
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
        {!isLoading && !isOnboarding && typedMessages.length < 3 && (
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
              disabled={
                !form.watch("message")?.trim() ||
                isLoading ||
                isOnboardingTyping
              }
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
