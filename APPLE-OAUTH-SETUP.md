# Configuration Apple OAuth pour Supabase

## Étapes pour configurer l'authentification Apple

### 1. Configuration Apple Developer

1. **Connectez-vous à [Apple Developer Console](https://developer.apple.com/account/)**

2. **Créez un App ID** :
   - Allez dans "Certificates, Identifiers & Profiles"
   - Cliquez sur "Identifiers" puis "+"
   - Sélectionnez "App IDs" et continuez
   - Choisissez "App" comme type
   - Remplissez les informations :
     - Description : "Wishlist App"
     - Bundle ID : `com.votrenom.wishlist` (ou utilisez votre domaine)
   - Dans "Capabilities", activez "Sign In with Apple"

3. **Créez un Services ID** :
   - Retournez aux "Identifiers" et cliquez "+"
   - Sélectionnez "Services IDs" et continuez
   - Remplissez :
     - Description : "Wishlist Web Auth"
     - Identifier : `com.votrenom.wishlist.web`
   - Activez "Sign In with Apple"
   - Cliquez "Configure" et ajoutez :
     - Primary App ID : Sélectionnez l'App ID créé précédemment
     - Web Domain : `wishlist-de-bathieuu.netlify.app`
     - Return URLs : 
       - `https://ngjdyjzoxvlvufkdrqkl.supabase.co/auth/v1/callback`
       - `http://localhost:5173/` (pour le développement)

4. **Créez une Private Key** :
   - Allez dans "Keys" et cliquez "+"
   - Donnez un nom : "Wishlist Apple Auth Key"
   - Activez "Sign In with Apple"
   - Cliquez "Configure" et sélectionnez votre Primary App ID
   - Téléchargez la clé (.p8) et notez le Key ID

### 2. Configuration Supabase

1. **Allez dans votre dashboard Supabase** : https://app.supabase.com/project/ngjdyjzoxvlvufkdrqkl

2. **Naviguez vers Authentication > Providers**

3. **Configurez Apple** :
   - Activez le provider "Apple"
   - Remplissez les champs :
     - **Client ID** : Votre Services ID (ex: `com.votrenom.wishlist.web`)
     - **Secret Key** : Le contenu de votre fichier .p8 (copiez tout le contenu)
     - **Key ID** : L'ID de votre clé privée Apple
     - **Team ID** : Votre Team ID Apple (visible dans le coin supérieur droit de la console Apple Developer)

4. **URLs de redirection** :
   - Ajoutez dans "Site URL" : `https://wishlist-de-bathieuu.netlify.app`
   - Ajoutez dans "Redirect URLs" :
     - `https://wishlist-de-bathieuu.netlify.app`
     - `http://localhost:5173` (pour le développement)

### 3. Variables d'environnement

Aucune variable d'environnement supplémentaire n'est nécessaire côté client, Supabase gère tout !

### 4. Test

1. Commitez et poussez les changements
2. Testez sur l'environnement de développement : `npm run dev`
3. Testez sur la production après déploiement

### Notes importantes

- **Domaines** : Assurez-vous que tous les domaines sont corrects dans la configuration Apple
- **HTTPS** : Apple exige HTTPS pour la production
- **Team ID** : Vérifiez que votre Team ID est correct
- **Certificats** : La clé privée .p8 doit être complète (avec les lignes BEGIN/END)

### Problèmes courants

1. **"invalid_client"** : Vérifiez le Client ID et les domaines configurés
2. **"invalid_grant"** : Problème avec la clé privée ou le Key ID
3. **"redirect_uri_mismatch"** : URLs de redirection mal configurées

### Format de la clé privée (.p8)

La clé doit ressembler à :
```
-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
[contenu de la clé]
...YWNhcHBsZSBhdXRoZW50aWNhdGlvbiBrZXk=
-----END PRIVATE KEY-----
```
