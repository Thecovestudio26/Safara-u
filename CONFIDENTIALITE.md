# Confidentialité et protection des données

Dernière mise à jour : novembre 2026 — Safarau Planner, The Cove Studio.

## Résumé en une phrase

Safarau Planner fonctionne entièrement sur votre appareil : vos données
n'ont jamais vocation à nous quitter, et l'application n'a aucun moyen
de les recevoir.

## Ce que l'application stocke, et où

Toutes les informations que vous saisissez (prières cochées, lecture du
Coran, événements, tâches, repas, courses, écritures de budget, enveloppes
d'épargne, dhikr, objectifs, journal, recettes, défis, réglages) sont
enregistrées dans l'espace de stockage local de votre navigateur
(`localStorage`), sous un préfixe réservé (`planner:`).

Conséquences :

- **Aucune transmission à un serveur.** Pas de compte utilisateur, pas de
  base de données distante, pas d'appel réseau contenant vos données.
- **Aucun cookie**, publicitaire ou autre.
- **Aucun traceur ni outil de mesure d'audience.**
- **Pas de vente, ni de partage** de données avec des tiers : rien ne sort.

## Fonctionnalités « données »

| Fonction | Ce qu'elle fait |
| --- | --- |
| **Exporter mes données** (Réglages) | Télécharge un fichier JSON contenant uniquement vos données, sur votre appareil. Droit à la portabilité (RGPD, art. 20). |
| **Restaurer une sauvegarde** | Importe le fichier JSON précédent, avec validation clé par clé : rien n'est écrasé à l'aveugle. |
| **Effacer toutes mes données** | Supprime définitivement les clés `planner:` du navigateur, après une confirmation en deux temps. Droit à l'effacement (RGPD, art. 17). |

Aucune donnée ne disparaît sans votre action : la mise à jour de
l'application ou le nettoyage automatique des jours révolus
(suivi quotidien) ne touchent jamais vos contenus (journal, budget, etc.).

## Service worker (mode hors ligne)

Pour fonctionner sans connexion, l'application installe un cache local ne
contenant que ses propres fichiers (HTML, CSS, JavaScript, icônes). Ce cache
ne stocke jamais vos données saisies ni votre navigation.

## Vos données ne servent à rien d'autre

L'application ne profile pas, ne personnalise pas de publicité, n'expose pas
de données à des tiers et n utilise aucun service externe. Vos données de
prières ou de journal sont traitées sur l'appareil uniquement.

## Base légale des traitements

Les données locales servent uniquement à l'exécution du service que vous
demandez (votre planner). Elles ne sont accessibles que par vous, depuis
votre navigateur. Les chiffres du budget et de l'épargne restent locaux :
aucun traitement automatisé de décision ne les utilise.

## Vos droits

Puisque tout reste sur votre appareil, vous exercez vos droits directement :
exportez (portabilité), corrigez (modifiez dans l'application) ou effacez
(effacement) depuis les Réglages. Aucune demande à formuler auprès de
qui que ce soit.

## Contact

Toute question sur ce document : **The Cove Studio**, via le dépôt du projet.
