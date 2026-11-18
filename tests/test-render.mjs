// Test de rendu : chaque vue doit produire du HTML sans « undefined »,
// « NaN » ni « [object ». État factice complet, proche d'un premier
// lancement avec quelques données.

import { villes, methodes, ecolesAsr, calculeHoraires, formatHeure, prieres } from "../js/horaires.js";
import { dateISO, moisISO } from "../js/base.js";

import { vueAccueil } from "../js/vues/accueil.js";
import { vuePrieres } from "../js/vues/prieres.js";
import { vueCoran } from "../js/vues/coran.js";
import { vueAgenda } from "../js/vues/agenda.js";
import { vueTaches } from "../js/vues/taches.js";
import { vueRepas } from "../js/vues/repas.js";
import { vueBudget } from "../js/vues/budget.js";
import { vueDhikr } from "../js/vues/dhikr.js";
import { vueObjectifs } from "../js/vues/objectifs.js";
import { vueBienetre } from "../js/vues/bienetre.js";
import { vueJournal } from "../js/vues/journal.js";
import { vueRecettes } from "../js/vues/recettes.js";
import { vueDefis } from "../js/vues/defis.js";
import { vueReglages } from "../js/vues/reglages.js";

const AUJ = dateISO();
const etat = {
  ville: 7, methode: "uoif", asr: 0,
  coran: Array.from({ length: 30 }, (_, i) => i < 4),
  coranJournal: [AUJ, dateISO(new Date(Date.now() - 86400000))],
  evenements: [{ id: "e1", titre: "Cours de tajwîd", date: AUJ, heure: "18:30" }],
  taches: [
    { id: "t1", texte: "Préparer le goûter", prio: "haute", categorie: "maison", echeance: AUJ, fait: false },
    { id: "t2", texte: "Appeler la banque", prio: "normale", categorie: null, echeance: null, fait: true },
  ],
  repas: [{ id: "r1", jour: 2, moment: "Déjeuner", plat: "Couscous", recette: null }],
  courses: [{ id: "c1", texte: "Semoule", fait: false }],
  budget: [
    { id: "b1", mois: moisISO(), type: "revenu", categorie: null, montant: 1800, libelle: "Salaire" },
    { id: "b2", mois: moisISO(), type: "depense", categorie: "Alimentation", montant: 73.4, libelle: "Marché" },
  ],
  epargne: [{ id: "ep1", nom: "OMRA", cible: 3000, solde: 450 }],
  bilans: { [moisISO()]: "Mois calme, alhamdulillah." },
  objectifs: [{ id: "o1", titre: "Apprendre 10 sourates", rythme: "annuel", etapes: 10, avancement: 3 }],
  journal: [{ id: "j1", date: AUJ, texte: "Journée douce.", gratitude: "le temps partagé en famille" }],
  recettes: [{ id: "rc1", titre: "Harira", ingredients: ["tomates", "lentilles", "celeri"], etapes: "Mijoter." }],
  defis: [{ id: "d1", titre: "Coran chaque matin", duree: 21, jours: [AUJ] }],
  sections: ["coran", "taches", "agenda", "habitudes", "objectifs"],
  dhikrPerso: [{ id: "dp1", texte: "Rabbi zidni 'ilma", latin: "Rabbi zidni 'ilma", cible: 100, source: "" }],
  hydratationCible: 8,
  dateJour: AUJ,
  prieres: { fajr: true, dhouhr: false, asr: false, maghrib: false, icha: false },
  dhikr: { subhanallah: 12 },
  routines: { eau: 3, habitudes: { sport: true, soin: false } },
  onglet: "accueil",
  agenda: { vue: "mois", ancre: moisISO(), jourChoisi: AUJ },
  filtreTaches: "ouvertes",
  budgetMois: moisISO(),
  journalMois: moisISO(),
  planification: null,
  edition: null,
  confirmationEffacement: false,
  installationPossible: true,
  villes,
  methodeChoisie: methodes[1],
  horaires: calculeHoraires(new Date(), villes[7], { methode: methodes[1], ombreAsr: 1 }),
  prochaine: { nom: "Asr", cle: "asr", heure: "--:--" },
  decompte: "dans 2 h 05",
};

// vueBienetre lit etat.routines.habitudes ; le test l'expose tel quel.

const VUES = {
  accueil: vueAccueil, prieres: vuePrieres, coran: vueCoran, agenda: vueAgenda,
  taches: vueTaches, repas: vueRepas, budget: vueBudget, dhikr: vueDhikr,
  objectifs: vueObjectifs, bienetre: vueBienetre, journal: vueJournal,
  recettes: vueRecettes, defis: vueDefis, reglages: vueReglages,
};

let erreurs = 0;
const MOTS_INTERDITS = [
  /undefined/, /\[object/, /NaN\b/, /\bnull\b/, /\bfalse\b/, /\btrue\b/,
];

function tester(nom, html) {
  if (typeof html !== "string" || html.length < 50) {
    console.error("ÉCHEC", nom, ": sortie vide ou non-textuelle");
    erreurs++;
    return;
  }
  // On retire les attributs booléens légitimes avant la recherche.
  const depouille = html
    .replace(/(aria-pressed|aria-current|disabled|checked|selected|open|focusable|aria-hidden)="[^"]*"/g, "")
    .replace(/\b(disabled|checked|autofocus)\b/g, "");
  for (const motif of MOTS_INTERDITS) {
    const trouve = depouille.match(motif);
    if (trouve) {
      const autour = depouille.slice(Math.max(0, (trouve.index ?? 0) - 60), (trouve.index ?? 0) + 80);
      console.error(`ÉCHEC ${nom} : « ${trouve[0]} » → …${autour}…`);
      erreurs++;
    }
  }
}

// Rendu nominal avec données
for (const [nom, vue] of Object.entries(VUES)) {
  try {
    tester(nom, vue(etat));
  } catch (e) {
    console.error("ÉCHEC", nom, ": exception →", e.message);
    erreurs++;
  }
}

// États d'édition (formulaire prérempli) sur chaque module éditable
const CAS_EDITION = [
  ["agenda", { module: "agenda", id: "e1" }],
  ["taches", { module: "taches", id: "t1" }],
  ["journal", { module: "journal", id: "j1" }],
  ["recettes", { module: "recettes", id: "rc1" }],
];
for (const [nom, edition] of CAS_EDITION) {
  const etatEdite = { ...etat, edition };
  try {
    tester(nom + " (édition)", VUES[nom](etatEdite));
  } catch (e) {
    console.error("ÉCHEC", nom, "(édition) : exception →", e.message);
    erreurs++;
  }
}

// Vides complets : premier lancement, aucune donnée
const vide = { ...etat,
  coran: Array.from({ length: 30 }, () => false),
  coranJournal: [], evenements: [], taches: [], repas: [], courses: [],
  budget: [], epargne: [], bilans: {}, objectifs: [], journal: [],
  recettes: [], defis: [], dhikrPerso: [], dhikr: {}, prieres: {},
  routines: { eau: 0, habitudes: {} }, confirmationEffacement: true,
};
for (const [nom, vue] of Object.entries(VUES)) {
  try {
    tester(nom + " (vide)", vue(vide));
  } catch (e) {
    console.error("ÉCHEC", nom, "(vide) : exception →", e.message);
    erreurs++;
  }
}

// Agenda : autres vues et navigation
for (const v of ["semaine", "jour"]) {
  try {
    tester("agenda/vue " + v, vueAgenda({ ...etat, agenda: { vue: v, ancre: moisISO(), jourChoisi: AUJ } }));
    tester("taches/filtre " + v, vueTaches({ ...etat, filtreTaches: v === "semaine" ? "faites" : "toutes" }));
  } catch (e) {
    console.error("ÉCHEC vues alternatives →", e.message);
    erreurs++;
  }
}

// Repas avec planification en attente
try {
  tester("repas (planification)", vueRepas({ ...etat, planification: "rc1" }));
} catch (e) {
  console.error("ÉCHEC repas (planification) →", e.message);
  erreurs++;
}

// Horaires : les 5 prières pour plusieurs villes et méthodes
console.log("\n— Horaires de prière —");
for (const ville of [villes[0], villes[7], villes[13]]) {
  for (const m of methodes) {
    const h = calculeHoraires(new Date("2026-11-19T12:00:00"), ville, { methode: m });
    const ligne = prieres.map((p) => `${p.cle} ${formatHeure(h[p.cle])}`).join(" · ");
    console.log(`${ville.nom} — ${m.nom} : ${ligne}`);
    for (const p of prieres) {
      if (Number.isNaN(h[p.cle])) { console.error("ÉCHEC horaire NaN :", ville.nom, m.nom, p.cle); erreurs++; }
    }
    if (!(h.fajr < h.dhouhr && h.dhouhr < h.asr && h.asr < h.maghrib && h.maghrib < h.icha)) {
      console.error("ÉCHEC ordre des prières :", ville.nom, m.nom); erreurs++;
    }
  }
}
// École asr : hanafite plus tard que majoritaire
{
  const v = villes[0];
  const chafii = calculeHoraires(new Date("2026-06-21T12:00:00"), v, { methode: methodes[0], ombreAsr: 1 });
  const hanafi = calculeHoraires(new Date("2026-06-21T12:00:00"), v, { methode: methodes[0], ombreAsr: 2 });
  console.log(`Asr chafii ${formatHeure(chafii.asr)} / hanafi ${formatHeure(hanafi.asr)}`);
  if (!(hanafi.asr > chafii.asr)) { console.error("ÉCHEC école Asr"); erreurs++; }
}

console.log(erreurs === 0
  ? "\n=== RENDU : tous les tests passent ==="
  : `\n=== ${erreurs} problème(s) détecté(s) ===`);
process.exit(erreurs === 0 ? 0 : 1);
