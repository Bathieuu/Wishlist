# Wishlist Link Collector

Une application React permettant de collecter et gérer des articles en wishlist à partir d'URLs de produits. L'application extrait automatiquement les métadonnées des produits (nom, prix, image) et les stocke dans une base de données.

## 🚀 Fonctionnalités

- **Extraction automatique** : Coller une URL de produit pour extraire automatiquement nom, prix, image
- **Supports multiples** : Compatible avec Amazon, eBay, IKEA, Zalando, Cdiscount, Fnac, et de nombreux autres sites
- **Authentification** : Connexion sécurisée avec Google via Supabase Auth
- **Gestion de wishlist** : Ajouter, supprimer, rafraîchir les prix de vos articles
- **Filtres et tri** : Filtrer par domaine, trier par date, prix ou nom
- **Interface responsive** : Optimisée pour mobile, tablette et desktop
- **Accessibilité** : Conforme aux standards A11Y

## 🛠 Stack Technique

### Frontend
- **React 18** avec TypeScript
- **Vite** pour le build et dev server
- **Tailwind CSS** pour le styling
- **React Router** pour la navigation

### Backend
- **Netlify Functions** (TypeScript)
- **Supabase** pour l'authentification et la base de données
- **PostgreSQL** avec Row Level Security (RLS)

### Qualité & Tests
- **ESLint** + **Prettier** pour le linting/formatting
- **Vitest** + **React Testing Library** pour les tests unitaires
- **Playwright** pour les tests E2E

## 📋 Prérequis

- Node.js 20+
- Compte Supabase
- Compte Netlify (pour le déploiement)

## 🔧 Installation

1. **Cloner le repository**
```bash
git clone <repo-url>
cd wishlist-link-collector
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration Supabase**

Créer un nouveau projet sur [supabase.com](https://supabase.com)

Exécuter les requêtes SQL suivantes dans l'éditeur SQL Supabase :

```sql
-- Créer la table des items de wishlist
create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  url text not null,
  domain text not null,
  title text not null,
  image_url text,
  price_cents int,
  currency text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  last_checked_at timestamptz,
  status text default 'active' check (status in ('active','deleted'))
);

-- Créer l'index pour les performances
create index on public.wishlist_items (user_id, created_at desc);

-- Activer RLS
alter table public.wishlist_items enable row level security;

-- Politiques RLS
create policy "user can read own"
on public.wishlist_items for select
using (auth.uid() = user_id);

create policy "user can insert own"
on public.wishlist_items for insert
with check (auth.uid() = user_id);

create policy "user can update own"
on public.wishlist_items for update
using (auth.uid() = user_id);

create policy "user can delete own"
on public.wishlist_items for delete
using (auth.uid() = user_id);
```

4. **Configuration OAuth Google**

Dans Supabase Dashboard > Authentication > Providers :
- Activer Google Provider
- Ajouter les Client ID et Client Secret de votre app Google
- Configurer l'URL de redirection : `https://your-project.supabase.co/auth/v1/callback`

5. **Variables d'environnement**

Copier `.env.example` vers `.env` et renseigner :

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optionnel : Configuration rate limiting
RATE_LIMIT_WINDOW=600000
RATE_LIMIT_MAX=30
```

Pour le déploiement Netlify, ajouter également :
```env
SUPABASE_SERVICE_KEY=your-service-role-key
```

## 🖥 Développement Local

```bash
# Démarrer le serveur de développement (avec Netlify Functions)
npm run dev

# Lancer les tests unitaires
npm test

# Lancer les tests E2E
npm run test:e2e

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format

# Type checking
npm run type-check
```

L'application sera disponible sur `http://localhost:8888`

## 🏗 Build et Déploiement

### Build local
```bash
npm run build
```

### Déploiement Netlify

1. **Via Netlify CLI**
```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Déployer
netlify deploy --prod
```

2. **Via Git (recommandé)**
- Pousser le code sur GitHub/GitLab
- Connecter le repo dans Netlify Dashboard
- Configurer les variables d'environnement dans Netlify
- Le déploiement se fera automatiquement

### Configuration Netlify

Dans Netlify Dashboard > Site Settings > Environment Variables, ajouter :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` 
- `SUPABASE_SERVICE_KEY`
- `RATE_LIMIT_WINDOW` (optionnel)
- `RATE_LIMIT_MAX` (optionnel)

## 🧪 Tests

### Tests unitaires
```bash
# Lancer tous les tests
npm test

# Mode watch
npm test -- --watch

# Coverage
npm test -- --coverage

# Interface graphique
npm run test:ui
```

### Tests E2E
```bash
# Lancer les tests E2E
npm run test:e2e

# Interface graphique Playwright
npx playwright test --ui

# Rapport de tests
npx playwright show-report
```

## 📁 Structure du Projet

```
src/
├── components/          # Composants React réutilisables
│   ├── AuthGate.tsx    # Composant de protection d'accès
│   ├── Header.tsx      # En-tête avec navigation
│   ├── UrlForm.tsx     # Formulaire de saisie URL
│   ├── PreviewCard.tsx # Carte de prévisualisation produit
│   └── ItemCard.tsx    # Carte d'item de wishlist
├── pages/              # Pages/vues principales
│   ├── Home.tsx        # Page d'accueil
│   └── Me.tsx          # Page ma wishlist
├── lib/                # Utilitaires et logique métier
│   ├── supabase.ts     # Configuration Supabase
│   ├── price.ts        # Parsing et formatage prix
│   ├── domain.ts       # Utilitaires domaines/URLs
│   └── meta.ts         # Extraction métadonnées
├── hooks/              # Hooks React personnalisés
│   └── useAuth.ts      # Hook authentification
└── test/               # Configuration et tests
    ├── setup.ts        # Configuration tests
    ├── price.test.ts   # Tests utilitaires prix
    └── meta.test.ts    # Tests extraction métadonnées

netlify/
└── functions/          # Netlify Functions (backend)
    ├── resolve.ts      # Extraction métadonnées depuis URL
    └── items.ts        # CRUD items wishlist

tests/                  # Tests E2E Playwright
└── basic.spec.ts      # Tests fonctionnels de base
```

## 🔒 Sécurité

### Protection SSRF
- Validation stricte des URLs
- Blocage des IPs privées/localhost
- Whitelist des schémas (http/https uniquement)

### Rate Limiting
- Limite par IP : 30 requêtes / 10 minutes (configurable)
- Protection contre les abus

### Sanitisation
- Parsing HTML sécurisé sans exécution JS
- Validation des données côté backend
- Utilisation des politiques RLS Supabase

### Authentification
- OAuth Google via Supabase
- JWT tokens sécurisés
- Isolation des données par utilisateur

## 🎯 Utilisation

1. **Connexion** : Cliquer sur "Se connecter avec Google"
2. **Ajouter un produit** : 
   - Coller l'URL d'un produit dans le champ
   - Cliquer "Prévisualiser"
   - Vérifier les informations extraites
   - Cliquer "Ajouter à ma wishlist"
3. **Gérer sa wishlist** :
   - Aller dans "Ma Wishlist"
   - Filtrer par domaine
   - Trier par date, prix, nom
   - Rafraîchir les prix
   - Supprimer des articles

## 🔧 Configuration Avancée

### Rate Limiting personnalisé
```env
RATE_LIMIT_WINDOW=600000  # 10 minutes en ms
RATE_LIMIT_MAX=50         # 50 requêtes max
```

### Support de nouveaux domaines
Modifier `src/lib/domain.ts` pour ajouter des domaines dans `getDomainDisplayName()`

### Parsing de prix personnalisé
Modifier `src/lib/price.ts` pour ajouter des formats de prix spécifiques

## 🐛 Dépannage

### Problèmes courants

**Erreur "Missing Supabase environment variables"**
- Vérifier que `.env` contient les bonnes clés Supabase
- Redémarrer le serveur de développement

**Erreur d'authentification**
- Vérifier la configuration OAuth Google dans Supabase
- Vérifier l'URL de redirection

**Fonctions Netlify qui ne marchent pas**
- Vérifier que `netlify dev` est utilisé pour le développement local
- Vérifier les variables d'environnement dans Netlify Dashboard pour la production

**Tests qui échouent**
- S'assurer que toutes les dépendances sont installées
- Vérifier que le serveur de dev tourne pour les tests E2E

### Logs et Debugging

En développement, les logs des fonctions Netlify sont visibles dans la console.
En production, consulter les logs dans Netlify Dashboard > Functions.

## 🤝 Contribution

1. Fork le repository
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commiter les changements (`git commit -m 'Add amazing feature'`)
4. Pousser la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📝 Licence

MIT License - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙋‍♂️ Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Consulter la documentation Supabase : https://supabase.com/docs
- Consulter la documentation Netlify : https://docs.netlify.com
