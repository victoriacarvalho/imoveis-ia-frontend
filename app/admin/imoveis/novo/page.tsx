"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Loader2, Plus, X } from "lucide-react";

const API_URL = "http://localhost:8081";

interface FormDataState {
  status: string | number | readonly string[] | undefined;
  title: string;
  description: string;
  neighborhood: string;
  city: string;
  state: string;
  agencyId: string;
  propertyType: string;
  transactionType: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  parkingSpots: string;
  mainImage: string;
}

export default function NovoImovelPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [galleryInput, setGalleryInput] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [formData, setFormData] = useState<FormDataState>({
    title: "",
    description: "",
    neighborhood: "",
    city: "João Monlevade",
    state: "MG",
    agencyId: "",
    propertyType: "APARTAMENTO",
    transactionType: "ALUGUEL",
    price: "",
    bedrooms: "",
    bathrooms: "",
    parkingSpots: "",
    mainImage: "",
    status: "DISPONÍVEL",
  });

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
      } catch (error) {
        console.error(error);
        setIsAdmin(false);
      }
    }

    if (isLoaded && userId) {
      checkAdmin();
    }
  }, [isLoaded, userId]);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function addGalleryImage() {
    const url = galleryInput.trim();

    if (!url) return;
    if (gallery.includes(url)) {
      setGalleryInput("");
      return;
    }

    setGallery((prev) => [...prev, url]);
    setGalleryInput("");
  }

  function removeGalleryImage(url: string) {
    setGallery((prev) => prev.filter((item) => item !== url));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!userId) return;

    try {
      setSaving(true);

      const res = await fetch(`${API_URL}/admin/properties`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          title: formData.title,
          description: formData.description,
          neighborhood: formData.neighborhood,
          city: formData.city,
          agencyId: formData.agencyId,
          state: formData.state,
          propertyType: formData.propertyType,
          transactionType: formData.transactionType,
          price: Number(formData.price),
          bedrooms: Number(formData.bedrooms || 0),
          bathrooms: Number(formData.bathrooms || 0),
          parkingSpots: Number(formData.parkingSpots || 0),
          mainImage: formData.mainImage,
          gallery,
        }),
      });

      if (!res.ok) {
        throw new Error("Erro ao cadastrar imóvel");
      }

      const createdProperty = await res.json();

      router.push(`/imovel/${createdProperty.id}`);
    } catch (error) {
      console.error(error);
      alert("Não foi possível cadastrar o imóvel.");
    } finally {
      setSaving(false);
    }
  }

  if (!isLoaded || isAdmin === null) {
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-32">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/admin/interesses"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm border border-gray-100 text-gray-700">
            <ChevronLeft className="size-4" />
            Voltar
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Adicionar imóvel
          </h1>
          <p className="text-gray-500 mt-2">
            Cadastre um novo imóvel manualmente pelo painel administrativo.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Título">
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ex.: CASA - Aluguel"
                className="input-admin"
                required
              />
            </Field>
            <Field label="ID da imobiliária">
              <input
                name="agencyId"
                value={formData.agencyId}
                onChange={handleChange}
                className="input-admin"
                required
              />
            </Field>

            <Field label="Bairro">
              <input
                name="neighborhood"
                value={formData.neighborhood}
                onChange={handleChange}
                placeholder="Ex.: Centro Industrial"
                className="input-admin"
                required
              />
            </Field>

            <Field label="Cidade">
              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="input-admin"
                required
              />
            </Field>
            <Field label="Estado">
              <input
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="input-admin"
                required
              />
            </Field>
            <Field label="Status">
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input-admin">
                <option value="DISPONIVEL">Disponível</option>
                <option value="ALUGADO">Alugado</option>
                <option value="VENDIDO">Vendido</option>
              </select>
            </Field>

            <Field label="Preço">
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                placeholder="Ex.: 1800"
                className="input-admin"
                required
              />
            </Field>

            <Field label="Tipo de imóvel">
              <select
                name="propertyType"
                value={formData.propertyType}
                onChange={handleChange}
                className="input-admin">
                <option value="APARTAMENTO">Apartamento</option>
                <option value="CASA">Casa</option>
                <option value="SALA_COMERCIAL">Sala Comercial</option>
                <option value="LOTE">Lote</option>
                <option value="COBERTURA">Cobertura</option>
              </select>
            </Field>

            <Field label="Tipo de transação">
              <select
                name="transactionType"
                value={formData.transactionType}
                onChange={handleChange}
                className="input-admin">
                <option value="ALUGUEL">Aluguel</option>
                <option value="VENDA">Venda</option>
              </select>
            </Field>

            <Field label="Quartos">
              <input
                name="bedrooms"
                type="number"
                min="0"
                value={formData.bedrooms}
                onChange={handleChange}
                className="input-admin"
              />
            </Field>

            <Field label="Banheiros">
              <input
                name="bathrooms"
                type="number"
                min="0"
                value={formData.bathrooms}
                onChange={handleChange}
                className="input-admin"
              />
            </Field>

            <Field label="Vagas">
              <input
                name="parkingSpots"
                type="number"
                min="0"
                value={formData.parkingSpots}
                onChange={handleChange}
                className="input-admin"
              />
            </Field>

            <Field label="Imagem principal (URL)">
              <input
                name="mainImage"
                value={formData.mainImage}
                onChange={handleChange}
                placeholder="https://..."
                className="input-admin"
                required
              />
            </Field>
          </div>

          <Field label="Descrição">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              placeholder="Descreva o imóvel..."
              className="input-admin resize-none"
              required
            />
          </Field>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Galeria de imagens
            </label>

            <div className="flex gap-3">
              <input
                value={galleryInput}
                onChange={(e) => setGalleryInput(e.target.value)}
                placeholder="Cole a URL da imagem"
                className="input-admin"
              />
              <button
                type="button"
                onClick={addGalleryImage}
                className="inline-flex items-center justify-center rounded-full bg-gray-900 px-5 py-3 text-sm font-bold text-white hover:bg-gray-800 transition">
                <Plus className="size-4" />
              </button>
            </div>

            {gallery.length > 0 && (
              <div className="mt-4 grid gap-3">
                {gallery.map((url) => (
                  <div
                    key={url}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                    <span className="text-sm text-gray-600 truncate">
                      {url}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(url)}
                      className="text-red-500 hover:text-red-600">
                      <X className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 grid gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-full bg-teal-500 px-6 py-4 text-base font-bold text-white hover:bg-teal-600 transition disabled:opacity-60 shadow-lg shadow-teal-500/30">
              {saving ? (
                <>
                  <Loader2 className="size-5 animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                "Cadastrar imóvel"
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx global>{`
        .input-admin {
          width: 100%;
          border-radius: 1rem;
          border: 1px solid rgb(229 231 235);
          background: white;
          padding: 0.9rem 1rem;
          color: rgb(17 24 39);
          outline: none;
          transition: 0.2s;
        }

        .input-admin:focus {
          border-color: rgb(45 212 191);
          box-shadow: 0 0 0 3px rgba(45, 212, 191, 0.15);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-3">
        {label}
      </label>
      {children}
    </div>
  );
}
