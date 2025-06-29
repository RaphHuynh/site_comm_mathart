# Guide de déploiement sur Vercel

## Solution recommandée : PostgreSQL

SQLite ne fonctionne pas correctement sur Vercel (erreur "Unable to open the database file"). 
Nous avons migré vers PostgreSQL pour résoudre ce problème.

## Variables d'environnement requises

Configurez ces variables dans les paramètres de votre projet Vercel :

### Base de données (PostgreSQL - OBLIGATOIRE)
```
DATABASE_URL="postgresql://username:password@host:port/database"
```

**Options recommandées :**
- **Vercel Postgres** (intégré à Vercel)
- **PlanetScale** (gratuit pour commencer)
- **Supabase** (gratuit pour commencer)
- **Neon** (gratuit pour commencer)

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

### 1. Configurer une base de données PostgreSQL

**Option A : Vercel Postgres (recommandé)**
1. Dans votre projet Vercel, allez dans "Storage"
2. Cliquez sur "Create Database"
3. Choisissez "Postgres"
4. Copiez l'URL de connexion

**Option B : PlanetScale (gratuit)**
1. Créez un compte sur [planetscale.com](https://planetscale.com)
2. Créez un nouveau projet
3. Copiez l'URL de connexion

### 2. Configurer les variables d'environnement sur Vercel

1. Dans votre projet Vercel, allez dans "Settings" > "Environment Variables"
2. Ajoutez toutes les variables listées ci-dessus
3. Assurez-vous que `DATABASE_URL` pointe vers votre base PostgreSQL

### 3. Migrer les données (optionnel)

Si vous avez des données dans votre SQLite locale :

```bash
# Installer les dépendances
npm install

# Exécuter la migration
DATABASE_URL="votre_url_postgresql" node scripts/migrate-to-postgres.js
```

### 4. Déployer

1. Poussez vos changements vers GitHub
2. Vercel redéploiera automatiquement
3. Le script `npm run build` inclut `prisma generate`

## Résolution des problèmes

### Erreur "Unable to open the database file"
- ✅ **Résolu** : Migration vers PostgreSQL
- Le schema Prisma a été mis à jour pour utiliser PostgreSQL

### Erreur Prisma Client
- ✅ **Résolu** : Le script de build inclut `prisma generate`
- Assurez-vous que `DATABASE_URL` est correctement configuré

### Base de données vide
- Exécutez les migrations : `npx prisma db push`
- Ou migrez vos données avec le script fourni

## Migration des données

Le script `scripts/migrate-to-postgres.js` migre automatiquement toutes vos données de SQLite vers PostgreSQL :

```bash
# Configurer l'URL PostgreSQL
export DATABASE_URL="postgresql://..."

# Exécuter la migration
node scripts/migrate-to-postgres.js
```

## Support

Si vous rencontrez des problèmes :
1. Vérifiez que `DATABASE_URL` pointe vers PostgreSQL
2. Assurez-vous que toutes les variables d'environnement sont configurées
3. Consultez les logs Vercel pour plus de détails 