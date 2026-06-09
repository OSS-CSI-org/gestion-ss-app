This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Source de données : mock ou API réelle

L'application peut fonctionner sans backend (données locales) ou contre l'API
REST. Le choix se fait par variables d'environnement (voir `.env.example`) :

```bash
# Données locales (défaut) — aucun backend requis
NEXT_PUBLIC_DATA_SOURCE=mock

# API REST réelle
NEXT_PUBLIC_DATA_SOURCE=http
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### Brancher le backend

1. Cloner et démarrer l'API REST (Spring Boot). Elle doit respecter le contrat
   décrit dans [`API_CONTRACT.md`](./API_CONTRACT.md) et autoriser le CORS pour
   `http://localhost:3000`.
2. Dans `.env.local`, mettre `NEXT_PUBLIC_DATA_SOURCE=http` et renseigner
   `NEXT_PUBLIC_API_URL`.
3. Redémarrer `npm run dev`. Aucune modification de composant n'est nécessaire.

### Architecture de la couche données

- `src/lib/api/` — configuration (`config.ts`) et client HTTP (`client.ts`,
  `apiFetch` + `ApiError` + token JWT).
- `src/lib/services/` — fonctions typées par ressource ; chaque fonction bascule
  entre mock et HTTP selon `NEXT_PUBLIC_DATA_SOURCE`.
- `src/hooks/data/` — hooks SWR (`useAssures`, `useFeuilles`, …) exposant
  `{ data, isLoading, error, mutate }`.
- `src/data/mock.ts` — source de l'adaptateur `mock`.

Les comptes de démo (mode mock) : `admin` / `drmbarga` / `drndongo`
(mots de passe `admin@2026` / `med@2026`).

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
