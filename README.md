# Safarau Planner

**Premium Muslimah lifestyle & productivity.** Une application web hors ligne
pour organiser sa journée autour de ce qui compte : prières, Coran, agenda,
tâches, budget et bien-être.

> 📍 Application web installable (PWA). Ajoutez-la à votre écran d'accueil :
> elle s'ouvre comme une application native et fonctionne sans réseau.
> Pour aller jusqu'à l'App Store / Google Play, le wrap natif Capacitor est
> prêt : voir [docs/GUIDE-NATIF.md](docs/GUIDE-NATIF.md).

## Ce que fait l'application

| Module | Ce qu'on y trouve |
| --- | --- |
| **Accueil** | Tableau de bord : prochaine prière et décompte, lecture du Coran, tâches prioritaires, rendez-vous à venir, habitudes, objectifs |
| **Prières** | Horaires calculés sur l'appareil (5 méthodes, école chafiite ou hanafite), suivi des cinq prières, 22 villes |
| **Coran** | Programme de lecture de 30 jours (un juz par jour), limites usuelles des juz, historique des jours lus |
| **Agenda** | Vues mois / semaine / jour, événements avec heure, tâches à échéance du jour |
| **Tâches** | Priorités, catégories, échéances, retards signalés, filtres en cours / terminées |
| **Repas & courses** | Menu de la semaine, liste de courses interactive, recettes reliées aux courses en un geste |
| **Budget** | Écritures mensuelles par catégorie, répartition visuelle, enveloppes d'épargne, bilan libre |
| **Adhkār** | Compteurs quotidiens (réinitialisés chaque nuit), dhikr personnalisables avec objectif |
| **Objectifs** | Objectifs annuels ou mensuels, avancement étape par étape |
| **Bien-être** | Hydratation, habitudes du jour, rituel du soir |
| **Journal** | Entrées datées, gratitude du jour, navigation par mois |
| **Recettes** | Bibliothèque maison, « planifier cette semaine », « ingrédients aux courses » |
| **Défis** | Défis de 7, 21 ou 30 jours, un jour validé par jour |

## Principes du produit

- **Hors ligne d'abord.** Pas de compte, pas de serveur : toutes les données
  restent dans le navigateur de l'appareil (`localStorage`).
- **Sobriété visuelle.** Direction « quiet luxury » : chocolat, ivoire, taupe,
  champagne ; serif éditorial pour les titres, sans-serif pour l'interface,
  icônes vectorielles dessinées sur une grille unique.
- **Accessibilité.** Contrastes AA, navigation clavier, libellés ARIA,
  zone d'évitement « aller au contenu », cibles tactiles confortables.
- **Vos données sont à vous.** Export JSON en un clic, restauration, effacement
  définitif. Voir [CONFIDENTIALITE.md](CONFIDENTIALITE.md).

## Tester et installer

Ouvrez simplement `index.html` dans un navigateur, ou publiez le dossier sur
n'importe quel hébergement statique :

- **GitHub Pages** : Settings → Pages → Deploy from branch → `main` / racine.
- **Vercel** : New Project → importer ce dépôt GitHub, aucun réglage
  (site statique), déploiement automatique à chaque push.
- **Hors ligne** : l'application s'installe (« Ajouter à l'écran d'accueil »
  sur iOS, bouton d'installation sur Android et ordinateur) et fonctionne
  sans connexion grâce au service worker.

### Icônes PNG (une seule commande)

L'icône vectorielle `img/icone.svg` suffit au navigateur. Pour les
installations iOS/Android les plus propres, générez les PNG :

```bash
python3 outils/generer_icones.py   # 192, 512, 1024 + masquables
git add img/*.png && git commit -m "icônes PWA générées"
```

Le script n'utilise que la bibliothèque standard Python (aucune dépendance).

## Aller plus loin : application native (App Store / Play Store)

Le dépôt est **prêt pour un wrap Capacitor**, sans rien installer de plus
que Node.js :

```bash
npm install          # Capacitor 7
npm run web          # prépare www/ (copie des fichiers, aucune compilation)
npx cap add android  # ou : npx cap add ios
```

Configuration : `capacitor.config.json` + `package.json`. Le guide complet
étape par étape (icônes, signature, soumission aux deux stores, cycle de
mise à jour) est dans [docs/GUIDE-NATIF.md](docs/GUIDE-NATIF.md).

## Tests

```bash
cd tests
node test-render.mjs        # rendu de chaque vue, états vides, éditions
node test-stockage.mjs      # export, import, effacement, nettoyage des jours
node test-integration.mjs  # chargement complet + navigation entre modules
```

## Avertissement

Les horaires de prière sont calculés localement, à titre indicatif. La mosquée
reste la référence pour la prière en groupe, surtout aux hautes latitudes.
Les dhikr et sources citées sont des hadiths célèbres ; aucune référence
n'est inventée au-delà des sources usuelles (al-Bukhârî, Muslim, Tirmidhî).

---

Safarau Planner est un produit **The Cove Studio** — licence MIT.
