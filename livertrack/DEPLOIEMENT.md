# 🚀 LiverTrack — Guide de déploiement

## Étape 1 — Créer la base de données Supabase (15 min)

1. Allez sur https://app.supabase.com et créez un compte gratuit
2. Cliquez **"New Project"** → donnez un nom (ex: "livertrack") → choisissez une région proche
3. Attendez 2 minutes que le projet se crée
4. Dans le menu gauche, cliquez **"SQL Editor"**
5. Copiez-collez tout le contenu du fichier `supabase/schema.sql`
6. Cliquez **"Run"** — toutes les tables sont créées ✓

## Étape 2 — Récupérer vos clés API Supabase

1. Dans Supabase, menu gauche → **Settings** → **API**
2. Copiez :
   - **Project URL** (ressemble à `https://xxxx.supabase.co`)
   - **anon public key** (longue chaîne de caractères)

## Étape 3 — Créer le premier compte gestionnaire

1. Dans Supabase, menu gauche → **Authentication** → **Users**
2. Cliquez **"Add user"** → entrez l'email et mot de passe du premier gestionnaire
3. Répétez pour chaque gestionnaire

## Étape 4 — Déployer sur Vercel (10 min)

### Option A — Via GitHub (recommandé)

1. Créez un compte sur https://github.com (gratuit)
2. Créez un nouveau repository "livertrack"
3. Uploadez tous les fichiers du projet
4. Allez sur https://vercel.com → connectez votre compte GitHub
5. Cliquez **"New Project"** → sélectionnez votre repository
6. Dans **"Environment Variables"**, ajoutez :
   - `NEXT_PUBLIC_SUPABASE_URL` = votre Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = votre anon key
7. Cliquez **"Deploy"** → votre app sera live en 2 minutes !

### Option B — Via Vercel CLI

```bash
# Installer Node.js depuis https://nodejs.org
# Puis dans le dossier du projet :

npm install
npm install -g vercel
vercel login
vercel --prod
# Suivez les instructions et entrez vos variables d'environnement
```

## Étape 5 — Configuration locale (pour tester en local)

```bash
# 1. Copier le fichier d'environnement
cp .env.local.example .env.local

# 2. Éditer .env.local avec vos vraies clés Supabase

# 3. Installer les dépendances
npm install

# 4. Lancer le serveur de développement
npm run dev

# 5. Ouvrir http://localhost:3000
```

## Structure des fichiers

```
livertrack/
├── app/
│   ├── page.tsx          → Dashboard
│   ├── auth/page.tsx     → Page de connexion
│   ├── ventes/page.tsx   → Saisie des ventes
│   ├── stocks/page.tsx   → Gestion des stocks
│   ├── historique/page.tsx → Historique + export Excel
│   └── stats/page.tsx    → Statistiques + graphiques
├── components/
│   └── Sidebar.tsx       → Navigation latérale
├── lib/
│   ├── supabase.ts       → Client Supabase
│   └── types.ts          → Types TypeScript
├── supabase/
│   └── schema.sql        → Script de création des tables
├── middleware.ts          → Protection des routes (auth)
├── .env.local.example    → Template des variables d'env
└── package.json          → Dépendances
```

## Coût estimé

| Service | Plan gratuit | Plan payant |
|---------|-------------|-------------|
| Supabase | 500 MB DB, 2 GB transfert | 25$/mois |
| Vercel | Projets illimités, 100 GB | 20$/mois |
| **Total démarrage** | **0 $/mois** | ~45$/mois si vous grandissez |

## Support

Pour toute question sur le déploiement, consultez :
- https://supabase.com/docs
- https://vercel.com/docs
- https://nextjs.org/docs
