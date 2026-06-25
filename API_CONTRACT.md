# Contrat d'API — Frontend OSS

Ce document décrit l'API REST que le frontend Next.js attend. Le frontend
fonctionne aujourd'hui sur des données mock ; lorsque le backend est prêt, il
suffit de passer `NEXT_PUBLIC_DATA_SOURCE=http` et `NEXT_PUBLIC_API_URL=<url>`
(voir `.env.example`) — aucun composant à modifier.

## Conventions générales

- **Base URL** : valeur de `NEXT_PUBLIC_API_URL` (ex. `http://localhost:8080/api`).
- **Format** : JSON, encodage UTF-8.
- **Champs** : **camelCase** (le backend mappe depuis le snake_case PostgreSQL).
- **Auth** : JWT. Le frontend envoie `Authorization: Bearer <token>` sur chaque
  requête une fois connecté.
- **CORS** : autoriser l'origine du frontend (`http://localhost:3000` en dev) et
  l'en-tête `Authorization`.
- **Erreurs** : statut HTTP non-2xx + corps JSON `{ "message": "..." }` (ou
  `{ "error": "..." }`). Le frontend lit `message`/`error` pour l'afficher.
- **Rôles** : `AGENT_OSS` (agent de sécurité sociale) et `MEDECIN`.

> ⚠️ Écarts schéma PostgreSQL ↔ frontend à gérer côté backend :
> - La base sépare `consultations` et `feuilles_maladie` ; le frontend attend un
>   objet **`FeuilleMaladie` aplati** (motif, diagnostic, nomAssure, nomMedecin,
>   prescriptions[], remboursements[] inclus).
> - Mots de passe **BCrypt** (coût 12), tables `agents_ss` et `medecins`.
> - `feuilles_maladie.statut ∈ {EN_ATTENTE, VALIDEE, REJETEE}` ;
>   `remboursements.statut ∈ {EN_ATTENTE, EFFECTUE}`.

---

## Authentification

### POST /auth/login
Body : `{ "login": string, "password": string }`
200 : `{ "token": string, "user": AuthUser }`
401 : identifiants invalides.

### GET /auth/me  *(optionnel, utile en mode http)*
Header : `Authorization: Bearer <token>`
200 : `AuthUser`

```
AuthUser = {
  login: string,
  nom: string,
  prenom: string,
  role: "AGENT_OSS" | "MEDECIN",
  numMedecin?: number   // présent si role = MEDECIN
}
```
> Ne jamais renvoyer le mot de passe (ni hash).

---

## Assurés

| Méthode | Chemin | Rôle | Body | Réponse |
|---|---|---|---|---|
| GET | `/assures` | AGENT_OSS | — | `Assure[]` |
| GET | `/assures/{id}` | tous | — | `Assure` (404 si absent) |
| POST | `/assures` | AGENT_OSS | `AssureInput` | `Assure` (201) |
| DELETE | `/assures/{id}` | AGENT_OSS | — | `204` |

```
Assure = {
  numAssure: number, nom: string, prenom: string, email?: string,
  dateNaissance: string (YYYY-MM-DD), sexe: "M" | "F",
  numCompteBancaire?: string,
  numMedecinTraitant?: number, nomMedecinTraitant?: string
}
AssureInput = { nom, prenom, email?, dateNaissance, sexe, numCompteBancaire?, numMedecinTraitant }
```

---

## Médecins

| Méthode | Chemin | Rôle | Body | Réponse |
|---|---|---|---|---|
| GET | `/medecins` | tous | — | `Medecin[]` |
| GET | `/medecins/{id}` | tous | — | `Medecin` (404 si absent) |
| POST | `/medecins` | AGENT_OSS | `MedecinInput` | `Medecin` (201) — crée aussi le compte (mot de passe par défaut) |
| DELETE | `/medecins/{id}` | AGENT_OSS | — | `204` — cascade : les assurés rattachés perdent leur médecin traitant |
| PUT | `/medecins/{id}/motdepasse` | propriétaire | `{ ancienMdp, nouveauMdp }` | `204` (400 si ancien incorrect) |

```
Medecin = {
  numMedecin: number, nom: string, prenom: string, email?: string,
  dateNaissance: string, sexe: "M" | "F", login: string,
  typeMedecin: "GENERALISTE" | "SPECIALISTE",
  typeFormation?: string, nomSpecialite?: string,
  actif: boolean, estAssure?: boolean
}
MedecinInput = { nom, prenom, email?, dateNaissance, sexe, login, typeMedecin, typeFormation?, nomSpecialite?, estAssure?, numCompteBancaire?, numMedecinTraitant? }
```

---

## Feuilles de maladie

| Méthode | Chemin | Rôle | Body | Réponse |
|---|---|---|---|---|
| GET | `/feuilles` | tous | — | `FeuilleMaladie[]` — **filtré par rôle** : un MEDECIN ne reçoit que ses feuilles (déduit du token) |
| GET | `/feuilles/{id}` | tous | — | `FeuilleMaladie` (404 si absent) |
| POST | `/feuilles` | MEDECIN | `FeuilleInput` | `FeuilleMaladie` (201) |

```
FeuilleMaladie = {
  numFeuille: number, dateEmission: string, statut: string,
  numConsultation: number,
  numAssure: number, nomAssure: string,
  numMedecin: number, nomMedecin: string,
  dateConsultation: string, motif: string, symptomes: string,
  diagnostic: string, traitementPrescrit: string,
  parametresMedicaux?: { poids?, taille?, temperature?, tensionArterielle?,
    frequenceCardiaque?, frequenceRespiratoire?, saturationOxygene?,
    antecedents?, observations? },   // valeurs string
  prescriptions: Prescription[],
  remboursements: Remboursement[]
}
FeuilleInput = { numAssure, numMedecin, dateConsultation, motif, symptomes?,
  diagnostic, traitementPrescrit?, poids?, taille?, temperature?,
  tensionArterielle?, frequenceCardiaque?, frequenceRespiratoire?,
  saturationOxygene?, antecedents?, observations?,
  prescriptions?: PrescriptionInput[] }

PrescriptionInput =
  | { type: "MEDICAMENT", nomMedicament: string, dosage?: string, posologie?: string, duree?: string }
  | { type: "CONSULTATION_SPECIALISTE", numSpecialiste: number, motifMedical?: string }
```

> **À la création d'une feuille, le backend GÉNÈRE les remboursements** (le
> frontend n'en envoie pas) : un remboursement « Consultation généraliste » pour
> la consultation, plus un « Consultation spécialiste » par prescription de type
> `CONSULTATION_SPECIALISTE`. Le **taux** de chacun suit la règle métier ci-dessous.

---

## Remboursements

| Méthode | Chemin | Rôle | Body | Réponse |
|---|---|---|---|---|
| POST | `/remboursements/{id}/effectuer` | AGENT_OSS | `{ modeReglement: "VIREMENT" \| "CASH" }` | `Remboursement` mis à jour |

```
Remboursement = {
  numRemboursement: number, nature: string, taux: number, montant: number,
  modeReglement: "VIREMENT" | "CASH", statut: "EN_ATTENTE" | "EFFECTUE",
  numFeuille: number, dateRemboursement?: string, agentLogin?: string
}
```

### Règles métier (à appliquer côté backend)

- **Taux de remboursement** (calculé à la génération du remboursement, jamais
  saisi par l'utilisateur) :
  - Consultation **généraliste** → **`taux = 1.0` (100 %)**
  - Consultation **spécialiste** → **`taux = 0.8` (80 %)**
  - ⚠️ Ne pas inverser. Le `montant` renvoyé est la somme effectivement remboursée
    (= base × taux) ; la facture recalcule la base via `montant / taux`.
- **Mode de règlement** : `VIREMENT` ou `CASH`, choisi **par le malade** au moment
  où l'agent OSS exécute `POST /remboursements/{id}/effectuer`. Il n'est pas figé
  à la création du remboursement.

---

## Tableau de bord & journal

| Méthode | Chemin | Rôle | Réponse |
|---|---|---|---|
| GET | `/dashboard` | tous | `{ stats, recentActivities }` |
| GET | `/logs` | AGENT_OSS | `LogEntry[]` |

```
stats = { totalRemboursements: number, virements: number, cash: number,
          nbAssures: number, nbMedecins: number, feuillesEnAttente: number }
recentActivities = { id: number, action: string, date: string, type: string }[]
LogEntry = { id: number, utilisateur: string, action: string, details: string, createdAt: string }
```

---

## Correspondance frontend → endpoint

Chaque fonction de `src/lib/services/*` correspond à un endpoint ci-dessus :
`auth.login → POST /auth/login`, `assures.{list,get,create,delete}Assure(s)`,
`medecins.{list,get,create,delete}Medecin(s)` + `changePassword`,
`feuilles.{list,get,create}Feuille(s)`,
`remboursements.effectuerRemboursement → POST /remboursements/{id}/effectuer`,
`dashboard.getDashboard → GET /dashboard`.
