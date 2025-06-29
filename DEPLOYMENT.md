# Guide de déploiement sur Vercel

## Variables d'environnement requises

Configurez ces variables dans les paramètres de votre projet Vercel :

### Base de données (SQLite - pour commencer)
```
DATABASE_URL="file:./mathart.db"
```

**Note :** SQLite sur Vercel a des limitations :
- La base de données est en lecture seule après le déploiement
- Les données ne persistent pas entre les redéploiements
- Idéal pour les tests et le développement

### Base de données (PostgreSQL - pour la production)
```
DATABASE_URL="postgresql://username:password@host:port/database"
```

### Discord OAuth2
```
DISCORD_CLIENT_ID="votre_client_id_discord"
DISCORD_CLIENT_SECRET="votre_client_secret_discord"
DISCORD_REDIRECT_URI="https://votre-domaine.vercel.app/api/auth/callback/discord"
DISCORD_GUILD_ID="votre_guild_id_discord"
```

### NextAuth.js
```
NEXTAUTH_URL="https://votre-domaine.vercel.app"
NEXTAUTH_SECRET="votre_secret_key_ici"
```

## Étapes de déploiement

1. **Connectez votre repository GitHub à Vercel**
2. **Configurez les variables d'environnement** dans les paramètres du projet Vercel
3. **Déployez** - Vercel utilisera automatiquement le script `npm run build` qui inclut `prisma generate`

## Options de base de données

### SQLite (Démarrage rapide)
- ✅ Simple à configurer
- ✅ Pas de coût supplémentaire
- ❌ Données non persistantes
- ❌ Fonctionnalités limitées

### PostgreSQL (Production)
- ✅ Données persistantes
- ✅ Fonctionnalités complètes
- ✅ Performances optimales
- ❌ Coût supplémentaire

**Recommandations :**
- **Développement/Test :** SQLite
- **Production :** PostgreSQL (Vercel Postgres, PlanetScale, Supabase, Neon)

## Migration de la base de données

### Avec SQLite
1. Votre base de données SQLite sera automatiquement créée lors du premier déploiement
2. Les données seront réinitialisées à chaque redéploiement

### Avec PostgreSQL
1. Mettez à jour `DATABASE_URL` dans Vercel
2. Exécutez les migrations : `npx prisma db push` ou `npx prisma migrate deploy`
3. Redéployez votre application

## Résolution des problèmes

### Erreur Prisma Client
Si vous obtenez l'erreur "Prisma has detected that this project was built on Vercel", assurez-vous que :
- Le script de build inclut `prisma generate` (déjà configuré)
- Les variables d'environnement sont correctement définies
- La base de données est accessible depuis Vercel 