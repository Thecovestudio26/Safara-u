# Safara'u Planner 🌸

Un planner pensé pour le quotidien d'une musulmane : prières, lecture du
Coran, agenda, to-do list, menus de la semaine, liste de courses, budget,
adhkar, objectifs et petites habitudes du quotidien.

Le fil conducteur du projet : **tout reste sur l'appareil**. Pas de compte,
pas de réseau, pas de cookie, pas de publicité. On ouvre la page, ça marche.

## Ce qu'on y trouve

- Horaires de prière calculés hors ligne (une vingtaine de villes)
- Suivi des cinq prières du jour
- Lecture du Coran sur 30 jours, un juz par jour
- Agenda et to-do list avec priorités
- Menus de la semaine et liste de courses
- Budget du mois, dépenses par catégorie
- Compteurs d'adhkar avec objectifs (33, 100…)
- Objectifs personnels, étape par étape
- Routines du quotidien : soin de soi, sport, ménage

## Démarrer

Ouvrir `index.html` dans un navigateur. C'est tout.
Aucune installation, aucune dépendance, aucune donnée envoyée.

### Le mettre en ligne (GitHub Pages)

1. Réglages du dépôt → **Pages**
2. Source : branche `main`, dossier `/ (root)`
3. L'application arrive sur `https://votre-compte.github.io/safarau-planner/`

## Respect de la vie privée

Conçu avec le RGPD en tête :

- aucune donnée collectée, aucun cookie, aucune mesure d'audience ;
- tout vit dans le stockage local du navigateur, exportable en JSON et
  effaçable en un clic depuis l'onglet Réglages ;
- aucune ressource externe (polices, CDN, images) : rien ne part chez un tiers ;
- navigation clavier, libellés ARIA et contrastes soignés pour l'accessibilité.

Détails : [CONFIDENTIALITE.md](CONFIDENTIALITE.md).

## Structure du projet

```
├── index.html          la page unique
├── css/style.css       style reposant, couleurs douces
├── js/horaires.js      villes et calcul des horaires de prière
├── js/stockage.js      persistance locale, export, effacement
├── js/vues.js          le rendu des onglets
└── js/app.js           état, actions et navigation
```

## Limites connues

- Les horaires de prière sont indicatifs (méthode des angles, Fajr 18° /
  Icha 17°). Aux hautes latitudes en plein été, le Fajr ou l'Icha peuvent
  afficher `--:--` quand le calcul n'a pas de sens physique. Dans tous les
  cas, la mosquée reste la référence pour la prière en groupe.
- Si la page reste ouverte après minuit, la journée ne bascule qu'au
  rechargement suivant (les cases du jour se remettent à zéro à ce moment-là).

## Licence

Code sous licence MIT — voir [LICENSE](LICENSE).
