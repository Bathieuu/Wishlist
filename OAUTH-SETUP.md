# Configuration OAuth Google pour Supabase

## 🚨 Problème rencontré
L'erreur `"Unsupported provider: provider is not enabled"` indique que le fournisseur Google n'est pas correctement configuré dans Supabase.

## 🔧 Étapes de résolution

### 1. Google Cloud Console

1. **Allez sur** : https://console.cloud.google.com/
2. **Créez ou sélectionnez un projet**
3. **Activez l'API Google+ :**
   - Menu ☰ → APIs & Services → Library
   - Recherchez "Google+ API" 
   - Cliquez sur "ENABLE"

4. **Créez des identifiants OAuth 2.0 :**
   - APIs & Services → Credentials
   - "+ CREATE CREDENTIALS" → "OAuth 2.0 Client IDs"
   - Application type : **Web application**
   - Name : `Wishlist Link Collector`

5. **URLs de redirection autorisées :**
   ```
   https://dzgvcqetruyclgazjzjl.supabase.co/auth/v1/callback
   ```

6. **Notez vos identifiants :**
   - Client ID : `123456789-abcdef.apps.googleusercontent.com`
   - Client Secret : `GOCSPX-abcdef123456789`

### 2. Configuration Supabase

1. **Allez sur** : https://supabase.com/dashboard/project/dzgvcqetruyclgazjzjl
2. **Navigation** : Authentication → Providers
3. **Trouvez Google** dans la liste des providers
4. **Configuration :**
   - ✅ **Enable Google provider** : Activé
   - **Client ID (required)** : Collez votre Google Client ID
   - **Client Secret (required)** : Collez votre Google Client Secret
   - **Redirect URL** : `https://dzgvcqetruyclgazjzjl.supabase.co/auth/v1/callback`

5. **Sauvegardez** la configuration

### 3. URLs à configurer dans Google Cloud

**URLs autorisées JavaScript :**
```
http://localhost:3000
https://votre-domaine-final.netlify.app
```

**URLs de redirection autorisées :**
```
https://dzgvcqetruyclgazjzjl.supabase.co/auth/v1/callback
```

## ✅ Test de la configuration

Une fois configuré :

1. Allez sur http://localhost:3000
2. Cliquez sur "Se connecter avec Google"
3. Vous devriez être redirigé vers Google OAuth
4. Après autorisation, retour sur votre app avec l'utilisateur connecté

## 🐛 Dépannage

**Si ça ne marche toujours pas :**

1. Vérifiez que l'API Google+ est bien activée
2. Vérifiez les URLs de redirection (pas d'espace, orthographe exacte)
3. Attendez 5-10 minutes après configuration (propagation)
4. Testez en mode incognito pour éviter le cache

**Erreurs courantes :**
- `redirect_uri_mismatch` → Vérifiez les URLs de redirection
- `invalid_client` → Vérifiez le Client ID/Secret
- `access_denied` → L'utilisateur a refusé l'autorisation

## 📋 Checklist de vérification

- [ ] Projet Google Cloud créé
- [ ] API Google+ activée  
- [ ] Identifiants OAuth 2.0 créés
- [ ] URLs de redirection configurées
- [ ] Provider Google activé dans Supabase
- [ ] Client ID copié dans Supabase
- [ ] Client Secret copié dans Supabase
- [ ] Configuration sauvegardée
- [ ] Test en mode incognito

Une fois tout configuré, l'authentification Google devrait fonctionner parfaitement ! 🎉
