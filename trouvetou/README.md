# Trouvetou

Portail public de petites annonces — **Trouvez tout, restez serein.**

Application Next.js (App Router) ultra-fluide, moderne et responsive qui référence
hôtels, résidences meublées, écoles et cliniques. Les annonces sont publiées en
direct depuis la base de données Supabase partagée des projets de gestion
**Séjoura**.

## Stack technique

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS 4** (design épuré, cartes arrondies, ombres douces)
- **Lucide React** (icônes)
- **Framer Motion** (micro-animations au survol, modals fluides)
- **Supabase** (`@supabase/supabase-js`) — lecture seule des annonces publiques

## Pages

### `/` — Page d'accueil (Hub)

- Hero section : titre, sous-titre et barre de recherche globale.
- 3 cartes d'univers animées. Un clic sur l'une des cartes ouvre d'abord un
  **modal « Que recherchez-vous ? »** présentant les 3 univers pour laisser
  l'utilisateur choisir ce qu'il cherche :
  - Hôtels & Résidences Meublées → redirige vers `/hotels`
  - Écoles & Établissements Privés → badge « Bientôt disponible » (clics désactivés)
  - Cliniques & Santé → badge « Bientôt disponible » (clics désactivés)

### `/hotels` — Hôtels & Résidences (section principale active)

- Connexion directe à la base Supabase partagée Séjoura.
- Cartes de chambres : image (Cloudinary/CDN), nom de la chambre, type
  d'établissement, prix par nuit en FCFA, commodités en badges/icônes.
- Bouton **Itinéraire** → ouvre Google Maps (`google.com/maps/dir`).
- Bouton **Réserver / Contacter** → modal avec coordonnées du gérant
  (téléphone, WhatsApp, email) et lien d'itinéraire.
- États de chargement (skeletons), état vide, gestion d'erreur.
- Filtres : recherche, type d'établissement, budget, tri par prix.

## Requête Supabase (adaptative)

Depuis `src/lib/supabase/hotels.ts` :

1. **Schéma cible (cahier des charges)** — `rooms` + `establishments` :
   - `is_listed_on_trouvetou = true`
   - `subscriptions.subscription_status = 'active'` (établissement)
   - tableau `images` non vide (complété côté client)
2. **Repli automatique (schéma Séjoura actuel)** — si les tables/colonnes du
   schéma cible n'existent pas encore en base (erreur de schéma PostgREST), la
   requête bascule sur le schéma existant :
   - `room_types` (nom, `base_price`, `capacity`, `amenities`)
   - + `accommodations` (`is_active = true`, position, contact)
   - + `tenants` → `subscriptions` (`status = 'active'`)
   - Image de repli : logo du tenant, sinon image de démonstration.

Seuls les champs nécessaires à l'affichage sont sélectionnés. Filtres
recherche / type / budget appliqués côté client.

## Démarrage rapide

### 1. Installation

```bash
npm install
```

### 2. Variables d'environnement

Copiez `.env.example` en `.env.local` et renseignez les variables publiques du
projet Supabase partagé Séjoura :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Lancement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

## Schéma attendu

### Schéma cible (cahier des charges)

| Table            | Champs utilisés                                                                     |
| ---------------- | ----------------------------------------------------------------------------------- |
| `rooms`          | `id`, `name`, `description`, `price_per_night`, `capacity`, `amenities[]`, `images[]`, `is_listed_on_trouvetou`, `establishment_id` |
| `establishments` | `id`, `name`, `type`, `city`, `country`, `address`, `latitude`, `longitude`, `contact_phone`, `contact_email`, `whatsapp` |
| `subscriptions`  | `id`, `establishment_id`, `subscription_status` (`active`, …)                       |

### Schéma actuellement en base (repli automatique)

Tables Séjoura accessibles : `room_types`, `accommodations`, `tenants`,
`subscriptions` (colonne `status`), `trouvetou_listings` (`establishment_id`,
`is_published`). La base est pour l'instant vide ; le portail affiche les
annonces dès que les données sont saisies.

Types TypeScript : `src/lib/supabase/database.types.ts`.

## Scripts

```bash
npm run dev      # Serveur de développement (Turbopack)
npm run build    # Build de production
npm run start    # Serveur de production
npm run lint     # ESLint (flat config)
```

## Sécurité

- Lecture seule publique (`anon`), aucune mutation possible via ce portail.
- Aucune clé secrète : seules les variables `NEXT_PUBLIC_*` sont utilisées.
- L'activation de la publication des annonces est contrôlée par les projets
  Séjoura (`is_listed_on_trouvetou`) et l'état de l'abonnement.
