# Guide de Déploiement Netlify

## Déploiement Direct (Option Rapide)

1. **Allez sur [netlify.com](https://netlify.com)** et connectez-vous
2. **Cliquez sur "Add new site" → "Deploy manually"**
3. **Glissez-déposez le dossier `dist`** sur la zone de drop
4. **Votre site sera déployé instantanément !**

## Configuration des Variables d'Environnement

Une fois déployé :

1. **Allez dans Site settings → Environment variables**
2. **Ajoutez ces 3 variables :**
   - `VITE_SUPABASE_URL` = `https://dzgvcqetruyclgazjzjl.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6Z3ZjcWV0cnV5Y2xnYXpqempsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MzUzNzIsImV4cCI6MjA3MzAxMTM3Mn0.q6ldwphunbAXms4teZK6uKA4zKWEJ3-SFoVcvKiPNOs`
   - `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6Z3ZjcWV0cnV5Y2xnYXpqempsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQzNTM3MiwiZXhwIjoyMDczMDExMzcyfQ.tZBn7SyH4u-xZBqcZhdD2NuWvtyRWH8c1ChESGkUezQ`

3. **Cliquez sur "Deploy site" pour rebuilder**

## Configuration Base de Données Supabase

1. **Allez sur [supabase.com](https://supabase.com) → votre projet**
2. **Dans le menu gauche : "SQL Editor"**
3. **Copiez-collez le contenu du fichier `supabase-setup.sql`**
4. **Cliquez sur "Run" pour créer les tables**

## Configuration Authentification Google

1. **Dans Supabase : "Authentication" → "Providers"**
2. **Activez "Google"**
3. **Ajoutez votre domaine Netlify dans les URLs autorisées**

## Test Final

Une fois tout configuré :
- ✅ Testez votre URL de Roborock
- ✅ Les vraies données Amazon apparaîtront !
- ✅ Connectez-vous avec Google
- ✅ Sauvegardez dans votre wishlist

🎉 **Votre Wishlist Link Collector sera 100% fonctionnel !**
