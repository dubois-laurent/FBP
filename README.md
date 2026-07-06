# Festival Booking Platform — FBP

Plateforme complète de gestion et réservation d'événements pour festivals de photographie.  
Projet réalisé dans le cadre du cours **HETIC Web2**.

---

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Stack technique](#stack-technique)
3. [Architecture du projet](#architecture-du-projet)
4. [Prérequis](#prérequis)
5. [Installation & démarrage](#installation--démarrage)
6. [Base de données](#base-de-données)
7. [Variables d'environnement](#variables-denvironnement)
8. [API Reference](#api-reference)
9. [Frontend — Routes & Pages](#frontend--routes--pages)
10. [Design — Paper](#design--paper)
11. [Tests](#tests)
12. [CI/CD](#cicd)
13. [Docker](#docker)
14. [Comptes de démonstration](#comptes-de-démonstration)

---

## Vue d'ensemble

FBP est une application full-stack permettant à des utilisateurs de :

- Consulter le programme d'un festival photo (expositions, ateliers, conférences, rencontres)
- Créer un compte et se connecter (email/mot de passe ou Google OAuth)
- Réserver des places pour des événements
- Gérer ses réservations (annulation)
- Envoyer des messages en temps réel via Socket.io

Les administrateurs peuvent en plus :

- Créer, modifier et supprimer des événements
- Contacter les utilisateurs par messagerie

---

## Stack technique

### Backend

| Outil | Version | Rôle |
|---|---|---|
| Node.js | 24.x | Runtime |
| TypeScript | 5.7 | Typage statique |
| Express | 4.x | Serveur HTTP |
| Drizzle ORM | 0.41 | ORM PostgreSQL |
| PostgreSQL | 16 | Base de données |
| Socket.io | 4.x | WebSockets temps réel |
| Passport.js | 0.7 | Auth (local + Google OAuth2) |
| bcryptjs | 2.x | Hash des mots de passe |
| jsonwebtoken | 9.x | JWT access + refresh tokens |
| Zod | 3.x | Validation des données |
| Swagger UI | 5.x | Documentation API |
| Vitest | 2.x | Tests unitaires |

### Frontend

| Outil | Version | Rôle |
|---|---|---|
| React | 19.x | UI |
| TypeScript | 5.7 | Typage statique |
| Vite | 8.x | Bundler (Rolldown) |
| TanStack Router | 1.170+ | Routing type-safe |
| TanStack Query | 5.x | Server state / cache |
| Zustand | 5.x | State management (auth) |
| Tailwind CSS | 4.x | Styles (CSS @theme) |
| react-hook-form | 7.x | Formulaires |
| Zod | 3.x | Validation côté client |
| Socket.io-client | 4.x | WebSockets |
| Radix UI | — | Composants accessibles |
| Vitest | 4.x | Tests |

---

## Architecture du projet

```
FBP/                              # Monorepo pnpm
├── apps/
│   ├── backend/                  # API Express + Socket.io
│   │   ├── src/
│   │   │   ├── config/           # DB, env, passport, swagger
│   │   │   ├── controllers/      # Handlers HTTP
│   │   │   ├── db/
│   │   │   │   ├── migrations/   # SQL Drizzle (auto-générées)
│   │   │   │   ├── schema/       # Schémas Drizzle ORM
│   │   │   │   ├── migrate.ts    # Script de migration
│   │   │   │   └── seed.ts       # Données de démonstration
│   │   │   ├── lib/              # AppError, asyncHandler, jwt
│   │   │   ├── middleware/       # authenticate, errorHandler, isAdmin
│   │   │   ├── routes/           # Routes Express + tests
│   │   │   ├── schemas/          # Schémas Zod de validation
│   │   │   ├── services/         # Logique métier + tests unitaires
│   │   │   ├── sockets/          # Socket.io (send_message)
│   │   │   └── types/            # Types partagés
│   │   ├── Dockerfile
│   │   ├── drizzle.config.ts
│   │   └── package.json
│   │
│   └── frontend/                 # React + TanStack Router
│       ├── src/
│       │   ├── api/              # Hooks TanStack Query (auth, events, bookings…)
│       │   ├── components/
│       │   │   ├── layout/       # Navbar, Layout
│       │   │   └── ui/           # Button, Input, Badge, Card, Dialog…
│       │   ├── hooks/            # useSocket (Socket.io)
│       │   ├── lib/              # axios, auth-guard, utils
│       │   ├── routes/           # Pages (file-based routing)
│       │   ├── store/            # Zustand auth store
│       │   ├── types/            # Interfaces partagées
│       │   └── __tests__/        # Tests unitaires
│       ├── Dockerfile
│       └── package.json
│
├── docker-compose.yml
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── .github/workflows/ci.yml
```

---

## Prérequis

- **Node.js** >= 24.0.0
- **pnpm** >= 10.27.0 (`corepack enable`)
- **Docker** + **Docker Compose** (pour le mode containerisé)
- Un projet **Google Cloud** avec OAuth2 configuré (pour l'auth Google)

---

## Installation & démarrage

### Mode Docker (recommandé)

```bash
# 1. Cloner le dépôt
git clone https://github.com/dubois-laurent/FBP.git
cd FBP

# 2. Créer le fichier d'environnement backend
cp apps/backend/.env.example apps/backend/.env
# Éditer .env avec vos vraies valeurs (voir section Variables d'environnement)

# 3. Démarrer les containers (DB + backend + frontend)
docker compose up -d --build

# 4. Seed de la base de données (données de démonstration)
docker exec fpb_backend npx tsx src/db/seed.ts
```

Le frontend est accessible sur **http://localhost:5173**  
L'API backend sur **http://localhost:3000**  
La documentation Swagger sur **http://localhost:3000/api/docs**

### Mode développement local

```bash
# 1. Installer les dépendances
pnpm install

# 2. Démarrer la DB PostgreSQL (via Docker ou installation locale)
docker compose up -d db

# 3. Configurer les variables d'environnement
cp apps/backend/.env.example apps/backend/.env
# Modifier DATABASE_URL pour pointer sur votre DB locale

# 4. Migrations
cd apps/backend
pnpm db:migrate

# 5. Seed (optionnel)
pnpm db:seed

# 6. Démarrer frontend + backend en parallèle
cd ../..
pnpm dev
```

---

## Base de données

### Schéma

#### `users`
| Colonne | Type | Description |
|---|---|---|
| `id` | uuid PK | Identifiant unique |
| `name` | varchar(255) | Nom complet |
| `email` | varchar(255) UNIQUE | Email |
| `password` | varchar(60) | Hash bcrypt (null pour OAuth) |
| `role` | enum(user, admin) | Rôle |
| `google_id` | varchar(255) | ID Google OAuth |
| `created_at` | timestamp | Date de création |

#### `events`
| Colonne | Type | Description |
|---|---|---|
| `id` | uuid PK | Identifiant unique |
| `title` | varchar(255) | Titre |
| `description` | text | Description |
| `type` | enum(exposition, conference, atelier, rencontre) | Type |
| `venue` | varchar(255) | Lieu |
| `date` | timestamp | Date et heure |
| `total_seats` | integer | Places totales |
| `available_seats` | integer | Places restantes |
| `image_url` | varchar(500) | URL image |

#### `bookings`
| Colonne | Type | Description |
|---|---|---|
| `id` | uuid PK | Identifiant |
| `user_id` | uuid FK -> users | Utilisateur |
| `event_id` | uuid FK -> events | Événement |
| `status` | enum(confirmed, cancelled) | Statut |
| `booked_at` | timestamp | Date de réservation |

#### `messages`
| Colonne | Type | Description |
|---|---|---|
| `id` | uuid PK | Identifiant |
| `sender_id` | uuid FK -> users | Expéditeur |
| `receiver_id` | uuid FK -> users | Destinataire |
| `content` | text | Contenu |
| `created_at` | timestamp | Date d'envoi |

### Commandes utiles

```bash
# Générer une migration après modification du schéma
pnpm --filter backend db:generate

# Appliquer les migrations
pnpm --filter backend db:migrate

# Insérer les données de démonstration
pnpm --filter backend db:seed

# Reset complet (migrate + seed)
pnpm --filter backend db:reset

# Ouvrir Drizzle Studio (interface visuelle)
pnpm --filter backend db:studio
```

---

## Variables d'environnement

### `apps/backend/.env`

```env
# Serveur
NODE_ENV=development
PORT=3000

# Base de données
DATABASE_URL=postgresql://user:password@localhost:5432/fbp_db

# JWT — secrets longs et aléatoires (min. 32 caractères)
JWT_ACCESS_SECRET=your_access_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Frontend (CORS + redirections OAuth)
FRONTEND_URL=http://localhost:5173
```

---

## API Reference

La documentation complète est disponible via Swagger UI :  
**http://localhost:3000/api/docs**

### Authentification des requêtes

Toutes les routes protégées requièrent le header :

```
Authorization: Bearer <accessToken>
```

Les access tokens expirent après **15 minutes**. Utiliser `POST /auth/refresh` avec le `refreshToken` pour en obtenir un nouveau sans re-connexion.

### Endpoints

#### Auth `/auth`

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Créer un compte `{ name, email, password }` |
| POST | `/auth/login` | — | Connexion `{ email, password }` |
| POST | `/auth/refresh` | — | Rafraîchir le token `{ refreshToken }` |
| POST | `/auth/logout` | Bearer | Invalider le refresh token |
| GET | `/auth/google` | — | Initier la connexion Google OAuth |
| GET | `/auth/google/callback` | — | Callback Google (redirige vers le frontend) |

#### Users `/users`

| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/users/user` | Bearer | Profil de l'utilisateur connecté |
| PATCH | `/users/user` | Bearer | Modifier `{ name?, email?, password? }` |

#### Events `/events`

| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/events` | — | Liste paginée. Query: `type`, `page`, `limit` |
| GET | `/events/:id` | — | Détail d'un événement |
| POST | `/events` | Bearer + Admin | Créer un événement |
| PUT | `/events/:id` | Bearer + Admin | Modifier un événement |
| DELETE | `/events/:id` | Bearer + Admin | Supprimer un événement |

#### Bookings `/bookings`

| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/bookings` | Bearer | Mes réservations |
| POST | `/bookings` | Bearer | Réserver `{ eventId }` |
| PATCH | `/bookings/:id/cancel` | Bearer | Annuler une réservation |

#### Messages `/messages`

| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/messages/:userId` | Bearer | Historique avec un utilisateur |

### WebSocket (Socket.io)

```js
import { io } from 'socket.io-client'

const socket = io('/', {
  auth: { token: accessToken },
  transports: ['websocket'],
})
```

| Événement | Direction | Payload | Description |
|---|---|---|---|
| `send_message` | Client → Serveur | `{ receiverId: string, content: string }` | Envoyer un message |
| `receive_message` | Serveur → Client | `Message` | Recevoir un message entrant |

---

## Frontend — Routes & Pages

### Routes publiques

| Route | Description |
|---|---|
| `/` | Accueil : hero + 4 prochains événements |
| `/events` | Programme complet avec filtres par type |
| `/events/:id` | Détail d'un événement + réservation |
| `/login` | Connexion email/mot de passe ou Google |
| `/register` | Création de compte |
| `/auth/callback` | Traitement silencieux du callback Google OAuth |

### Routes protégées

| Route | Description |
|---|---|
| `/bookings` | Mes réservations (confirmées et annulées) |
| `/profile` | Modifier mon profil |
| `/messages` | Messagerie — inbox ou lien vers le support |
| `/messages/:userId` | Conversation temps réel avec un utilisateur |

### Routes admin

| Route | Description |
|---|---|
| `/admin` | Dashboard CRUD des événements |

### State management (Zustand)

```ts
import { useAuthStore, selectIsAuthenticated, selectIsAdmin } from '@/store/auth.store'

const { user, accessToken, setAuth, clearAuth } = useAuthStore()
const isAuthenticated = useAuthStore(selectIsAuthenticated)
const isAdmin = useAuthStore(selectIsAdmin)
```

L'état est persisté dans `localStorage` (clé `fbp-auth`). Le refresh token est géré automatiquement par l'intercepteur Axios : en cas d'erreur 401, la requête est mise en attente, le token est rafraîchi, puis toutes les requêtes en attente sont rejouées.

---

## Design — Paper

L'ensemble du design de l'interface frontend a été réalisé avec **[Paper](https://paper.design/)**, un outil de design professionnel intégré à VS Code permettant de composer des interfaces sur un canvas 2D et d'en exporter directement le code JSX.

### Workflow

1. **Maquettage** — Les pages (accueil, liste d'événements, détail, réservations, admin, messagerie) ont été conçues directement dans Paper avant toute implémentation.
2. **Export JSX** — Les composants ont été exportés depuis Paper vers `apps/frontend/src/components/` et `apps/frontend/src/routes/`, puis intégrés avec TanStack Router et TanStack Query.
3. **Design system** — La palette de couleurs et la typographie définies dans Paper ont été transposées dans le fichier CSS global via les custom properties Tailwind v4 (`@theme {}`).

### Système de design

| Token | Valeur | Usage |
|---|---|---|
| `--color-cobalt` | `#0d2d8a` | Couleur principale (CTA, liens, Navbar) |
| `--color-cobalt-dark` | `#0a2270` | Hover sur les éléments cobalt |
| `--color-ink` | `#0a0a0a` | Texte principal |
| `--color-canvas` | `#ffffff` | Fond des pages |
| `--color-surface` | `#f5f4f1` | Fond des cartes et sections |
| `--font-sans` | `Inter` | Corps de texte, UI |
| `--font-serif` | `DM Serif Display` | Titres éditoriaux (hero, 404) |

### Composants UI générés

- **Button** — variantes `primary`, `outline`, `destructive`, support `asChild`
- **Input** — champ de formulaire avec label intégré
- **Badge** — variantes `default`, `outline`, `success`, `destructive`
- **Card** — conteneur avec image, titre, métadonnées
- **Dialog** — modal Radix UI (création/édition/suppression d'événements)
- **Navbar** — navigation responsive avec liens contextuels selon le rôle

---

## Tests

### Backend — 71 tests

```bash
cd apps/backend
pnpm test

# Avec rapport de couverture
pnpm test:coverage
```

Couverture :
- `services/auth` — register, login, refresh, logout
- `services/events` — CRUD, pagination, filtres
- `services/bookings` — réserver, annuler, disponibilité
- `services/messages` — historique conversations
- `services/users` — profil, mise à jour
- `routes/*` — tests d'intégration HTTP pour chaque endpoint

### Frontend — 19 tests

```bash
cd apps/frontend
pnpm test

# Mode watch
pnpm test:watch
```

Couverture :
- `auth.store.test.ts` — état initial, `setAuth`, `clearAuth`, `setTokens`, sélecteurs
- `button.test.tsx` — rendu, disabled, variantes (primary / outline / destructive), `asChild`
- `badge.test.tsx` — variantes (default / outline / success / destructive)

---

## CI/CD

Pipeline défini dans `.github/workflows/ci.yml`, déclenché sur chaque push et pull request.

```
lint:backend  ──┐
                ├──► test:backend  ──┐
                │                    ├──► build:frontend
lint:frontend ──┘                    │
                  ──► test:frontend ─┘
```

| Job | Commande | Dépendance |
|---|---|---|
| `lint:backend` | `tsc --noEmit` | — |
| `lint:frontend` | `tsc --noEmit` | — |
| `test:backend` | `vitest run` | lint:backend |
| `test:frontend` | `vitest run` | lint:frontend |
| `build:frontend` | `vite build` | test:backend + test:frontend |

L'artefact de build (`dist/`) est uploadé comme artifact GitHub Actions avec une rétention de 7 jours.

---

## Docker

### Commandes

```bash
# Démarrer tous les services en arrière-plan
docker compose up -d

# Rebuild les images et démarrer
docker compose up -d --build

# Voir les logs en temps réel
docker compose logs -f

# Arrêter les containers
docker compose down

# Arrêter et supprimer les volumes (reset complet de la DB)
docker compose down -v
```

### Services

| Service | Image | Port exposé | Description |
|---|---|---|---|
| `db` | postgres:16-alpine | 5432 | Base de données PostgreSQL |
| `backend` | node:24-alpine | 3000 | API Express + Socket.io |
| `frontend` | node:24-alpine | 5173 | Dev server Vite avec HMR |

### Variables Docker

| Variable | Service | Valeur par défaut | Description |
|---|---|---|---|
| `BACKEND_URL` | frontend | `http://backend:3000` | URL interne pour le proxy Vite |
| `DATABASE_URL` | backend | — | Connexion PostgreSQL |
| `POSTGRES_DB` | db | `fbp_db` | Nom de la base |
| `POSTGRES_USER` | db | `fbp_user` | Utilisateur PostgreSQL |
| `POSTGRES_PASSWORD` | db | — | Mot de passe PostgreSQL |

### Proxy Vite

Le frontend Vite proxifie les requêtes vers le backend via deux règles :

- `/api/*` → `http://backend:3000/*` (préfixe `/api` retiré)
- `/socket.io/*` → `http://backend:3000/socket.io/*` (WebSocket)

### Seed en Docker

```bash
# Insérer les données de démonstration
docker exec fpb_backend npx tsx src/db/seed.ts

# Reset complet (migrations + seed)
docker exec fpb_backend sh -c "npx tsx src/db/migrate.ts && npx tsx src/db/seed.ts"
```

---

## Comptes de démonstration

Après avoir lancé la seed, les comptes suivants sont disponibles :

| Rôle | Email | Mot de passe |
|---|---|---|
| Admin | `admin@festival.com` | `Admin1234!` |
| Utilisateur | `alice@example.com` | `User1234!` |
| Utilisateur | `bob@example.com` | `User1234!` |

---

## Auteurs

Projet HETIC Web2 — 2026
