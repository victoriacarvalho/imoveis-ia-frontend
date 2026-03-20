
# Imóveis.AI Frontend

Frontend do **Imóveis.AI**, uma aplicação web/mobile-first para busca de imóveis com suporte a **IA**, **favoritos**, **onboarding de perfil**, **login com Clerk** e **painel administrativo**.

## Acesso ao projeto

### Produção
[https://imoveis-ia-frontend-4a7e.vercel.app](https://imoveis-ia-frontend-4a7e.vercel.app)

### Repositório
[https://github.com/victoriacarvalho/imoveis-ia-frontend](https://github.com/victoriacarvalho/imoveis-ia-frontend)

---

## Sobre o app

O **Imóveis.AI** foi desenvolvido para tornar a busca por imóveis mais simples, personalizada e inteligente.

A aplicação permite que o usuário:

- visualize imóveis disponíveis
- receba sugestões com base no seu perfil
- favorite imóveis
- converse com um assistente virtual com IA
- preencha preferências de busca por meio de onboarding
- acesse perfil com dados personalizados

Além da experiência do usuário comum, o sistema também conta com uma área administrativa, onde usuários com permissão de administrador podem ser redirecionados para o painel de gestão.

---

## Principais funcionalidades

- Autenticação com **Clerk**
- Interface mobile-first com **Next.js**
- Navegação inferior personalizada
- Chat com IA para apoio na busca de imóveis
- Onboarding de perfil do usuário
- Sincronização automática do usuário com o backend
- Sistema de favoritos
- Redirecionamento automático para painel admin quando `isAdmin = true`
- Integração com backend via API

---

## Tecnologias utilizadas

- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Clerk**
- **Nuqs**
- **Lucide React**
- **Vercel** para deploy

---

## Estrutura do projeto

```bash
app/
components/
lib/
public/
````

A aplicação utiliza o App Router do Next.js e componentes client-side para autenticação, navegação e integração com o chat.

---

## Como rodar localmente

### 1. Clonar o repositório

```bash
git clone https://github.com/victoriacarvalho/imoveis-ia-frontend.git
```

### 2. Acessar a pasta do projeto

```bash
cd imoveis-ia-frontend
```

### 3. Instalar as dependências

```bash
pnpm install
```

### 4. Configurar as variáveis de ambiente

Crie um arquivo `.env.local` com as variáveis necessárias, por exemplo:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=sua_chave_publica_clerk
CLERK_SECRET_KEY=sua_chave_secreta_clerk
```

> As chaves reais dependem da configuração do seu ambiente no Clerk e da URL do backend.

### 5. Rodar o projeto

```bash
pnpm dev
```

A aplicação ficará disponível em:

```bash
http://localhost:3000
```

---

## Integração com backend

Este frontend consome um backend responsável por:

* autenticação complementar e sincronização de usuário
* onboarding e perfil
* favoritos
* imóveis
* leads
* permissões administrativas

Backend do projeto:
[https://github.com/victoriacarvalho/imoveis-ia-api](https://github.com/victoriacarvalho/imoveis-ia-api)

---

## Fluxo de usuário

### Usuário comum

* faz login
* é sincronizado com o backend
* pode visualizar imóveis
* favorite imóveis
* preencher perfil
* receber sugestões

### Usuário administrador

* faz login
* é sincronizado com o backend
* se estiver com `isAdmin = true`, é redirecionado para a área administrativa

---

## Objetivo do projeto

O projeto foi criado com foco em melhorar a experiência de busca imobiliária, utilizando inteligência artificial para personalização, automação e melhor interação com o usuário.

---

## Status

Projeto em desenvolvimento e evolução contínua.

---

## Autora

**Victória Costa**
[GitHub](https://github.com/victoriacarvalho)
