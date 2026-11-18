# Guide natif : publier Safarau Planner sur l'App Store et Google Play

La PWA fonctionne déjà seule : publiée sur GitHub Pages (ou Vercel), elle
s'installe sur iPhone et Android depuis le navigateur. Le wrap **Capacitor**
sert uniquement à produire de vrais paquets `.ipa` / `.aab` à soumettre aux
stores. Tout est déjà préparé dans le dépôt ; il reste à exécuter quelques
commandes sur votre machine.

| | PWA (déjà prête) | Wrap Capacitor |
| --- | --- | --- |
| Installation | « Ajouter à l'écran d'accueil » | App Store / Google Play |
| Hors ligne | Oui (service worker) | Oui (fichiers embarqués) |
| Coût | 0 € | Apple : 99 €/an, Google : 25 USD une fois |
| Mise à jour | Git push, immédiate | Nouvelle soumission + relecture |

## 0. Prérequis

- **Node.js 18 ou plus** (LTS conseillé) et npm : https://nodejs.org
- Pour Android : **Android Studio** (il embarque le JDK nécessaire).
- Pour iOS : un **Mac avec Xcode**. Sans Mac, aucune solution ne permet
  de soumettre sur l'App Store ; la PWA et le wrap Android restent
  disponibles.
- Depuis la racine du dépôt :

```bash
git pull
npm install                        # installe Capacitor 7
python3 outils/generer_icones.py   # crée les PNG d'icônes (192 à 1024)
npm run web                        # prépare www/ pour Capacitor
```

`npm run web` exécute `outils/preparer_www.mjs` : il recopie `index.html`,
`css/`, `js/`, `img/`, le manifest et le service worker dans `www/`, le
dossier que Capacitor embarque (voir `capacitor.config.json`). L'app étant
déjà 100 % statique, il n'y a aucune compilation.

⚠️ **Ne changez plus `appId` après publication sur un store** : il identifie
l'app pour toujours. Par défaut c'est `com.thecovestudio.safarau`. Si vous
préférez votre propre identificateur (ex. `com.monstudio.safarau`),
modifiez-le maintenant dans `capacitor.config.json`.

## 1. Android

```bash
npx cap add android      # crée le projet natif android/ (première fois)
npm run sync:android     # régénère www/ puis synchronise le projet natif
npx cap open android     # ouvre Android Studio
```

Dans Android Studio :

1. **Icône** : clic droit sur `android/app/src/main/res` → New → Image
   Asset → Asset type « Image » → choisissez `img/icone-512.png` →
   ajustez la taille à 512 puis validez.
2. **Nom affiché** : `res/values/strings.xml` > `app_name`.
   L'identifiant du store est `applicationId` dans `app/build.gradle`
   (repris de l'`appId` ci-dessus).
3. **Test sur un vrai téléphone** : Build > Build Bundle(s)/APK(s) >
   Build APK(s), transférez l'APK, autorisez « sources inconnues »,
   installez.

Pour une mise à jour après un changement de code : `npm run sync:android`
puis rebuild dans Android Studio.

## 2. iOS (sur Mac)

```bash
npx cap add ios          # crée le projet natif ios/ (première fois)
npm run sync:ios         # régénère www/ puis synchronise le projet natif
npx cap open ios         # ouvre Xcode
```

Dans Xcode :

1. **Signature** : cible `App` > Signing & Capabilities > Team :
   sélectionnez votre équipe Apple Developer.
2. **Icône** : `Assets.xcassets` > AppIcon > glissez
   `img/icone-1024.png` dans la case unique (depuis Xcode 14, cette seule
   case suffit pour tous les appareils).
3. **Test** : branchez un iPhone ou ouvrez le simulateur, Product > Run.
4. **Nom sous l'icône** : cible `App` > Info > Bundle display name
   (par ex. `Safarau` pour raccourcir).

## 3. Soumettre sur Google Play

1. Créez un compte **Play Console** (25 USD, une seule fois) :
   https://play.google.com/console
2. Créez une application (français, catégorie « Style de vie » ou
   « Productivité »).
3. **Testez d'abord en interne** : Testing > Internal testing > nouvelle
   release > téléversez le fichier `.aab` généré par
   Build > Generate Signed Bundle/APK. La clé de signature se crée à
   cette étape : sauvegardez-la précieusement, **hors du dépôt** (perte de
   clé = impossibilité de mettre à jour l'app).
4. Ajoutez des testeurs, vérifiez sur un vrai téléphone, puis passez en
   Production.
5. Renseignez la fiche : titre, description, captures d'écran, et
   **confidentialité** : « l'application ne collecte aucune donnée »
   (tout reste dans le stockage local de l'appareil, conforme à
   [CONFIDENTIALITE.md](../CONFIDENTIALITE.md)).

## 4. Soumettre sur l'App Store

1. Compte **Apple Developer** (99 €/an) : https://developer.apple.com
2. Dans Xcode : Product > Archive, puis Distribute App > App Store Connect.
3. Dans **App Store Connect** : créez la fiche, chargez le build, testez
   via **TestFlight** avant la revue (24 à 48 h en général).
4. Points qu'Apple vérifie souvent sur ce type d'app :
   - **fonctionnalité suffisante** : présentez les modules (agenda, budget,
     recettes, défis…) et des captures de plusieurs écrans différents ;
   - **confidentialité** : déclarez « données non collectées » (nutrition
     labels vides), cohérent avec le fonctionnement hors ligne ;
   - **pas de compte requis** : mentionnez que l'app fonctionne sans
     inscription.

## 5. Cycle de mise à jour

Identique pour les deux stores :

```bash
# 1. modifiez le code (css, js, index.html) puis commit / push
npm run sync:android     # ou npm run sync:ios
# 2. rebuild dans Android Studio / Xcode, incrémentez versionCode / build
#    number, resoumettez
```

## 6. Notes techniques

- Tous les chemins de l'app sont relatifs (`./css/…`, `./js/…`) : rien à
  changer pour le wrap. Sous iOS (schéma `capacitor://localhost`),
  l'enregistrement du service worker est automatiquement écarté par
  app.js, sans erreur ; sous Android, `sw.js` est copié mais reste
  inoffensif : les fichiers sont servis localement par Capacitor.
- L'app n'utilise ni géolocalisation ni capteurs : aucune permission
  native à déclarer.
- Les projets natifs `android/` et `ios/` sont ignorés par Git par défaut
  pour garder le dépôt lisible. Retirez les deux lignes du `.gitignore`
  si vous préférez les versionner (pratique courante de Capacitor).
- **Alternative à connaître** : si la relecture Apple rebute, la PWA
  publiée (GitHub Pages / Vercel) reste installable sur iPhone via
  Safari, et le wrap Android couvre Google Play. La contrainte Mac ne
  s'applique qu'à l'App Store.
