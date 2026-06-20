# 🏥 OSS Frontend — Gestion de la Sécurité Sociale

Interface web de l'application de **Gestion de l'Organisme de Sécurité Sociale (OSS)**, développée avec **Next.js 16** et **TypeScript**. Elle permet aux agents OSS et aux médecins de gérer les assurés, les consultations, les feuilles de maladie et les remboursements.

---

## 📋 Table des matières

- [Aperçu du projet](#aperçu-du-projet)
- [Stack technique](#stack-technique)
- [Architecture du projet](#architecture-du-projet)
- [Fonctionnalités](#fonctionnalités)
- [Prérequis](#prérequis)
- [Installation et démarrage](#installation-et-démarrage)
- [Variables d'environnement](#variables-denvironnement)
- [Mode Mock vs Mode HTTP](#mode-mock-vs-mode-http)
- [Structure des routes](#structure-des-routes)
- [Rôles et permissions](#rôles-et-permissions)
- [API Contract](#api-contract)
- [Scripts disponibles](#scripts-disponibles)
- [Déploiement (Vercel)](#déploiement-vercel)

---

## 🌟 Aperçu du projet

L'application OSS Frontend est une **Single Page Application (SPA)** construite avec le framework Next.js (App Router). Elle s'interface avec un backend Spring Boot via une API REST sécurisée par JWT.

Le frontend peut fonctionner en **deux modes** :
- **Mode mock** : données locales embarquées (`src/data/mock.ts`), aucune API requise. Idéal pour le développement UI.
- **Mode http** : appels réseau vers le backend Spring Boot réel.

---

## 🛠️ Stack technique

| Technologie | Version | Rôle |
|---|---|---|
| **Next.js** | 16.2.7 | Framework React (App Router) |
| **React** | 19.2.4 | Bibliothèque UI |
| **TypeScript** | ^5 | Typage statique |
| **Tailwind CSS** | ^4 | Utilitaires CSS |
| **Framer Motion** | ^12 | Animations & transitions |
| **Recharts** | ^3 | Graphiques et visualisations |
| **React Hook Form** | ^7 | Gestion des formulaires |
| **Zod** | ^4 | Validation des schémas |
| **SWR** | ^2 | Fetching & cache des données |
| **Lucide React** | ^1 | Icônes |

---

## 📁 Architecture du projet

```
frontend/
├── public/                     # Ressources statiques
├── src/
│   ├── app/                    # App Router Next.js
│   │   ├── (auth)/             # Groupe de routes — Authentification
│   │   │   └── login/          # Page de connexion
│   │   ├── (dashboard)/        # Groupe de routes — Interface principale
│   │   │   ├── page.tsx        # Tableau de bord
│   │   │   ├── assures/        # Gestion des assurés
│   │   │   │   ├── page.tsx
│   │   │   │   ├── nouveau/    # Formulaire création
│   │   │   │   └── [id]/       # Détail / édition assuré
│   │   │   ├── medecins/       # Gestion des médecins
│   │   │   │   ├── page.tsx
│   │   │   │   ├── nouveau/
│   │   │   │   └── [id]/
│   │   │   └── feuilles-maladie/   # Gestion des feuilles
│   │   │       ├── page.tsx
│   │   │       ├── nouvelle/
│   │   │       └── [id]/
│   │   ├── globals.css         # Styles globaux
│   │   ├── layout.tsx          # Layout racine
│   │   ├── error.tsx           # Page d'erreur globale
│   │   └── not-found.tsx       # Page 404
│   ├── components/
│   │   ├── auth/               # Composants d'authentification
│   │   ├── charts/             # Graphiques (Recharts)
│   │   │   ├── MonthlyChart.tsx
│   │   │   ├── PaymentModeChart.tsx
│   │   │   └── RemboursementStatusChart.tsx
│   │   ├── facture/            # Composants d'impression facture
│   │   ├── layout/             # Sidebar, Header, Navigation
│   │   ├── remboursements/     # Composants de remboursement
│   │   └── ui/                 # Composants UI génériques
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── EmptyState.tsx
│   │       ├── Skeleton.tsx
│   │       └── StatCard.tsx
│   ├── data/                   # Données mock locales
│   ├── hooks/
│   │   ├── useAuth.tsx         # Hook d'authentification
│   │   ├── useConfirm.tsx      # Hook de dialogue de confirmation
│   │   ├── useDebounce.ts      # Hook de debounce
│   │   ├── useFocusTrap.ts     # Hook d'accessibilité
│   │   ├── useKeyboard.ts      # Hook de gestion clavier
│   │   └── data/               # Hooks de données (SWR)
│   │       ├── useAssures.ts
│   │       ├── useMedecins.ts
│   │       └── useFeuilles.ts
│   └── lib/
│       ├── api/                # Couche HTTP (fetch client)
│       ├── services/           # Services métier
│       │   ├── auth.ts         # Authentification
│       │   ├── assures.ts      # CRUD assurés
│       │   ├── medecins.ts     # CRUD médecins
│       │   ├── feuilles.ts     # CRUD feuilles de maladie
│       │   ├── remboursements.ts  # Remboursements
│       │   └── dashboard.ts    # Statistiques dashboard
│       ├── types.ts            # Interfaces TypeScript
│       ├── schemas.ts          # Schémas Zod
│       ├── utils.ts            # Fonctions utilitaires
│       ├── theme.ts            # Constantes de thème
│       └── imprimerFacture.ts  # Génération PDF/impression facture
├── .env.example                # Template des variables d'environnement
├── next.config.ts              # Configuration Next.js
├── vercel.json                 # Configuration déploiement Vercel
├── tsconfig.json               # Configuration TypeScript
└── package.json
```

---

## ✨ Fonctionnalités

### 🖥️ Tableau de bord
- **Vue Agent OSS** : statistiques globales (total remboursements, nombre d'assurés, médecins actifs, feuilles en attente), graphiques mensuels, répartition par mode de paiement (virement / cash), activités récentes
- **Vue Médecin** : consultations du jour, patients suivis, remboursements en attente, dernières consultations
- **Filtre de période** : 7, 30 ou 90 jours

### 👥 Gestion des assurés
- Liste paginée et recherchable des assurés
- Création d'un nouvel assuré (formulaire validé avec Zod)
- Fiche détaillée : informations personnelles, médecin traitant, historique des feuilles
- Suppression (avec confirmation)

### 👨‍⚕️ Gestion des médecins
- Liste des médecins (généralistes / spécialistes)
- Création d'un compte médecin (génère aussi le compte d'accès)
- Fiche détaillée : profil, spécialité, patients rattachés
- Changement de mot de passe (réservé au propriétaire du compte)
- Suppression (avec cascade sur les assurés rattachés)

### 📋 Feuilles de maladie
- Liste des feuilles filtrée par rôle (un médecin ne voit que les siennes)
- Création d'une nouvelle feuille (consultation + prescriptions)
- Fiche détaillée : consultation, paramètres médicaux, prescriptions, remboursements
- **Impression / génération de facture PDF** (iText côté client)

### 💰 Remboursements
- Traitement d'un remboursement en attente (choix du mode : VIREMENT ou CASH)
- Visualisation des statuts (EN_ATTENTE / EFFECTUE)
- Graphiques de répartition des statuts

### 🔐 Authentification
- Connexion par login / mot de passe
- Gestion des tokens JWT (stockage sécurisé)
- Protection des routes par rôle
- Déconnexion automatique à expiration du token

---

## ⚙️ Prérequis

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x

> Aucun autre prérequis en mode **mock**. Pour le mode **http**, le backend Spring Boot doit être démarré (voir [README Backend](../gestion-ss-backend/README.md)).

---

## 🚀 Installation et démarrage

### 1. Cloner le dépôt et accéder au dossier

```bash
git clone <url-du-depot>
cd GESTION-OSS-APP/frontend
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

```bash
# Copier le template
cp .env.example .env.local

# Éditer selon votre configuration
```

> Voir la section [Variables d'environnement](#variables-denvironnement) pour le détail.

### 4. Démarrer le serveur de développement

```bash
npm run dev
```

L'application sera accessible sur : **http://localhost:3000**

---

## 🌿 Variables d'environnement

Créez un fichier `.env.local` à la racine du dossier `frontend/` :

```env
# Source de données du frontend.
#   mock → données locales (src/data/mock.ts), aucune API requise (défaut)
#   http → appels réseau vers l'API REST (NEXT_PUBLIC_API_URL)
NEXT_PUBLIC_DATA_SOURCE=mock

# URL de base de l'API REST Spring Boot (utilisée uniquement si DATA_SOURCE=http).
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

| Variable | Valeurs possibles | Description |
|---|---|---|
| `NEXT_PUBLIC_DATA_SOURCE` | `mock` \| `http` | Source des données de l'application |
| `NEXT_PUBLIC_API_URL` | URL complète | URL de base du backend Spring Boot |

---

## 🔄 Mode Mock vs Mode HTTP

### Mode Mock (`NEXT_PUBLIC_DATA_SOURCE=mock`)

- **Aucun backend requis**
- Les données sont servies depuis `src/data/mock.ts`
- Toutes les opérations CRUD fonctionnent en mémoire (les modifications ne persistent pas après refresh)
- Idéal pour le développement et les démonstrations UI

```env
NEXT_PUBLIC_DATA_SOURCE=mock
```

### Mode HTTP (`NEXT_PUBLIC_DATA_SOURCE=http`)

- Connexion au backend Spring Boot via REST API
- Authentification JWT activée
- Toutes les mutations sont persistées en base de données (PostgreSQL)

```env
NEXT_PUBLIC_DATA_SOURCE=http
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

> **Important** : Aucun composant React n'a besoin d'être modifié pour basculer entre les deux modes. L'abstraction est gérée dans `src/lib/services/`.

---

## 🗺️ Structure des routes

| Route | Rôle requis | Description |
|---|---|---|
| `/login` | — | Page de connexion |
| `/` | tous | Tableau de bord (vue adaptée selon le rôle) |
| `/assures` | AGENT_OSS | Liste des assurés |
| `/assures/nouveau` | AGENT_OSS | Formulaire de création d'assuré |
| `/assures/[id]` | tous | Fiche détaillée d'un assuré |
| `/medecins` | tous | Liste des médecins |
| `/medecins/nouveau` | AGENT_OSS | Formulaire de création de médecin |
| `/medecins/[id]` | tous | Fiche détaillée d'un médecin |
| `/feuilles-maladie` | tous | Liste des feuilles de maladie |
| `/feuilles-maladie/nouvelle` | MEDECIN | Formulaire de nouvelle consultation |
| `/feuilles-maladie/[id]` | tous | Détail d'une feuille + traitement remboursement |

---

## 🔑 Rôles et permissions

L'application gère deux rôles utilisateur :

| Rôle | Accès | Actions |
|---|---|---|
| **AGENT_OSS** | Tableau de bord global, tous les assurés, tous les médecins, toutes les feuilles | Créer/supprimer assurés, créer/supprimer médecins, traiter les remboursements |
| **MEDECIN** | Tableau de bord personnel, ses propres feuilles uniquement | Créer des feuilles de maladie (consultations), changer son propre mot de passe |

---

## 📄 API Contract

Le fichier [`API_CONTRACT.md`](./API_CONTRACT.md) décrit l'intégralité du contrat d'interface entre le frontend et le backend :

- Endpoints REST attendus
- Schémas JSON (camelCase)
- Règles de gestion des rôles
- Règles métier (taux de remboursement, génération automatique des remboursements)
- Correspondance service frontend → endpoint backend

> **Résumé des endpoints** :
> - `POST /auth/login` — Connexion
> - `GET /auth/me` — Utilisateur courant
> - `GET|POST|DELETE /assures` — CRUD assurés
> - `GET|POST|DELETE /medecins` — CRUD médecins
> - `PUT /medecins/{id}/motdepasse` — Changement de mot de passe
> - `GET|POST /feuilles` — Feuilles de maladie
> - `POST /remboursements/{id}/effectuer` — Traitement remboursement
> - `GET /dashboard` — Statistiques
> - `GET /logs` — Journal d'activité (AGENT_OSS uniquement)

---

## 📜 Scripts disponibles

```bash
# Démarrer le serveur de développement
npm run dev

# Compiler pour la production
npm run build

# Démarrer en mode production (après build)
npm run start

# Linter ESLint
npm run lint
```

---

## ☁️ Déploiement (Vercel)

Le projet est configuré pour un déploiement sur **Vercel** via [`vercel.json`](./vercel.json).

### Étapes de déploiement

1. **Pousser le code** sur GitHub/GitLab/Bitbucket
2. **Importer le projet** sur [vercel.com](https://vercel.com)
3. **Configurer les variables d'environnement** dans le dashboard Vercel :

| Variable | Valeur production |
|---|---|
| `NEXT_PUBLIC_DATA_SOURCE` | `http` |
| `NEXT_PUBLIC_API_URL` | `https://<votre-backend>.onrender.com/api` |

4. **Déployer** — Vercel détecte automatiquement Next.js

> Le backend (Spring Boot) peut être déployé séparément sur **Render** ou tout autre hébergeur compatible Docker. Pensez à mettre à jour la variable `FRONTEND_URL` côté backend avec l'URL Vercel réelle.

---

## 🧰 Modèles de données (TypeScript)

Les interfaces principales sont définies dans [`src/lib/types.ts`](./src/lib/types.ts) :

```typescript
// Rôles
type Role = 'AGENT_OSS' | 'MEDECIN'

// Assuré
interface Assure {
  numAssure: number
  nom: string; prenom: string; email?: string
  dateNaissance: string   // YYYY-MM-DD
  sexe: 'M' | 'F'
  numCompteBancaire?: string
  numMedecinTraitant?: number; nomMedecinTraitant?: string
}

// Feuille de maladie (objet aplati)
interface FeuilleMaladie {
  numFeuille: number; dateEmission: string; statut: string
  numConsultation: number
  numAssure: number; nomAssure: string
  numMedecin: number; nomMedecin: string
  dateConsultation: string; motif: string; symptomes: string
  diagnostic: string; traitementPrescrit: string
  parametresMedicaux?: ParametresMedicaux
  prescriptions: Prescription[]
  remboursements: Remboursement[]
}

// Remboursement
interface Remboursement {
  numRemboursement: number; nature: string
  taux: number; montant: number
  modeReglement: 'VIREMENT' | 'CASH'
  statut: 'EN_ATTENTE' | 'EFFECTUE'
  numFeuille: number; dateRemboursement?: string; agentLogin?: string
}
```

---

## 👥 Auteurs

Projet tutoré CSI — Gestion de la Sécurité Sociale (OSS)

---

*Pour le backend Spring Boot, consultez le [README Backend](../gestion-ss-backend/README.md).*
