# Configuration Supabase pour le site communautaire MathArt

## 🚀 Étapes de configuration

### 1. Création du projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez votre URL de projet et vos clés API

### 2. Configuration des variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database URL (pour Prisma)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Discord OAuth (si utilisé)
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret

# Cloudinary (pour les images)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 3. Création des tables dans Supabase

1. Allez dans l'éditeur SQL de votre projet Supabase
2. Exécutez le script `scripts/supabase-schema.sql`
3. Ce script créera toutes les tables nécessaires avec :
   - Les contraintes de clés étrangères
   - Les index pour les performances
   - Les triggers pour `updated_at`
   - Les politiques de sécurité (RLS)

### 4. Installation des dépendances

```bash
npm install @supabase/supabase-js
```

### 5. Migration des données existantes (optionnel)

Si vous avez des données existantes dans votre base SQLite :

```bash
node scripts/migrate-to-supabase.js
```

## 📊 Structure des tables

### Tables principales

1. **users** - Utilisateurs du site
2. **categories** - Catégories d'articles
3. **articles** - Articles du site
4. **comments** - Commentaires sur les articles
5. **comment_likes** - Likes sur les commentaires
6. **news** - Actualités
7. **events** - Événements

### Tables NextAuth

1. **accounts** - Comptes OAuth
2. **sessions** - Sessions utilisateur
3. **verification_tokens** - Tokens de vérification

## 🔐 Sécurité (Row Level Security)

Le schéma inclut des politiques de sécurité pour :

- **Utilisateurs** : Peuvent voir/modifier leur propre profil
- **Articles** : Publiques si publiés, privés pour l'auteur
- **Commentaires** : Approuvés visibles par tous, création par utilisateurs connectés
- **Administrateurs** : Accès complet à toutes les données

## 🛠️ Utilisation des services

### Exemple d'utilisation

```typescript
import { articleService, userService } from '@/lib/supabase-services'

// Récupérer tous les articles publiés
const articles = await articleService.getAll()

// Récupérer un utilisateur par ID
const user = await userService.getById('user-id')

// Créer un nouvel article
const newArticle = await articleService.create({
  title: 'Mon article',
  content: 'Contenu...',
  author_id: 'user-id',
  category_id: 1,
  published: false
})
```

## 📝 Scripts disponibles

```bash
# Générer le client Prisma
npm run db:push

# Créer une migration
npm run db:migrate

# Ouvrir Prisma Studio
npm run db:studio
```

## 🔧 Configuration avancée

### Authentification avec Supabase Auth

Pour utiliser l'authentification native de Supabase au lieu de NextAuth :

```typescript
import { supabase } from '@/lib/supabase'

// Connexion
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// Inscription
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
})
```

### Stockage de fichiers

Supabase offre un stockage de fichiers intégré :

```typescript
// Upload d'un fichier
const { data, error } = await supabase.storage
  .from('images')
  .upload('public/avatar.jpg', file)

// Récupération d'une URL publique
const { data } = supabase.storage
  .from('images')
  .getPublicUrl('public/avatar.jpg')
```

## 🚨 Points d'attention

1. **Clés API** : Ne partagez jamais votre `SUPABASE_SERVICE_ROLE_KEY`
2. **RLS** : Toutes les tables ont RLS activé par défaut
3. **Migrations** : Utilisez Prisma pour les migrations de schéma
4. **Backup** : Configurez des sauvegardes automatiques dans Supabase

## 📞 Support

Pour toute question sur la configuration Supabase :
- [Documentation Supabase](https://supabase.com/docs)
- [Discord Supabase](https://discord.supabase.com)
- [GitHub Supabase](https://github.com/supabase/supabase) 