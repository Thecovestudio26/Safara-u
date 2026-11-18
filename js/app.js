// Point d'entrée : état de l'application, actions et navigation entre
// les onglets. Une seule page, aucun framework, aucune dépendance.

import { calculeHoraires, formatHeure, villes, prieres } from "./horaires.js";
import { lire, ecrire, toutExporter, toutEffacer, nettoyerLesJoursPasses } from "./stockage.js";
import {
  vueAccueil, vuePrieres, vueCoran, vueAgenda, vueTaches, vueRepas,
  vueBudget, vueDhikr, vueObjectifs, vueBienEtre, vueReglages,
} from "./vues.js";

/* ---------- petit outillage ---------- */

const deuxChiffres = (n) => String(n).padStart(2, "0");

function dateLocale(d = new Date()) {
  return `${d.getFullYear()}-${deuxChiffres(d.getMonth() + 1)}-${deuxChiffres(d.getDate())}`;
}

function nouvelIdentifiant() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/* ---------- état ---------- */

const aujourdhui = dateLocale();
const cleJour = `jour:${aujourdhui}`;

const etat = {
  onglet: "accueil",
  ville: lire("ville", 0),
  horaires: null,
  prochaine: { cle: "", nom: "", heure: "" },
  decompte: "--:--:--",
  prieres: lire(cleJour + ":prieres", {}),
  coran: lire("coran", Array.from({ length: 30 }, () => false)),
  evenements: lire("evenements", []),
  taches: lire("taches", []),
  filtreTaches: "toutes",
  repas: lire("repas", []),
  courses: lire("courses", []),
  budget: lire("budget", []),
  dhikr: lire(cleJour + ":dhikr", {}),
  routines: lire(cleJour + ":routines", {}),
  objectifs: lire("objectifs", []),
};

// On oublie les données datées des jours précédents, l'appli commence
// chaque matin sur des pages vierges.
nettoyerLesJoursPasses(aujourdhui);

function sauvegarder() {
  ecrire("ville", etat.ville);
  ecrire(cleJour + ":prieres", etat.prieres);
  ecrire("coran", etat.coran);
  ecrire("evenements", etat.evenements);
  ecrire("taches", etat.taches);
  ecrire("repas", etat.repas);
  ecrire("courses", etat.courses);
  ecrire("budget", etat.budget);
  ecrire(cleJour + ":dhikr", etat.dhikr);
  ecrire(cleJour + ":routines", etat.routines);
  ecrire("objectifs", etat.objectifs);
}

/* ---------- prochaine prière et compte à rebours ---------- */

function rafraichirHoraires() {
  const maintenant = new Date();
  etat.horaires = calculeHoraires(maintenant, villes[etat.ville]);

  const heure = maintenant.getHours() + maintenant.getMinutes() / 60
    + maintenant.getSeconds() / 3600;

  let cle = null, reste = 0;
  for (const p of prieres) {
    const h = etat.horaires[p.cle];
    if (!isNaN(h) && h > heure) { cle = p; reste = h - heure; break; }
  }
  if (!cle) {
    // Toutes les prières du jour sont passées : on vise le Fajr de
    // demain (l'heure affichée est celle d'aujourd'hui, l'écart d'une
    // nuit est négligeable).
    cle = prieres[0];
    reste = (isNaN(etat.horaires.fajr) ? 6 : etat.horaires.fajr) + 24 - heure;
  }

  const secondes = Math.max(0, Math.round(reste * 3600));
  etat.decompte = `${deuxChiffres(Math.floor(secondes / 3600))}:`
    + `${deuxChiffres(Math.floor((secondes % 3600) / 60))}:`
    + `${deuxChiffres(secondes % 60)}`;
  etat.prochaine = {
    cle: cle.cle,
    nom: cle.nom,
    heure: formatHeure(etat.horaires[cle.cle]),
  };
  return cle.cle;
}

/* ---------- rendu ---------- */

const vuesOnglets = {
  accueil: vueAccueil,
  prieres: vuePrieres,
  coran: vueCoran,
  agenda: vueAgenda,
  taches: vueTaches,
  repas: vueRepas,
  budget: vueBudget,
  dhikr: vueDhikr,
  objectifs: vueObjectifs,
  bienetre: vueBienEtre,
  reglages: vueReglages,
};

const contenu = document.getElementById("contenu");

function rendre() {
  rafraichirHoraires();
  document.querySelectorAll(".onglets button").forEach((b) => {
    b.classList.toggle("actif", b.dataset.onglet === etat.onglet);
  });
  const vue = vuesOnglets[etat.onglet] || vueAccueil;
  contenu.innerHTML = vue(etat);
}

// Le compte à rebours vit sa vie sans redessiner toute la page
// (sinon les menus déroulants ouverts se refermeraient chaque seconde).
let prochaineAffichee = "";
setInterval(() => {
  const cle = rafraichirHoraires();
  if (etat.onglet !== "accueil") return;
  if (cle !== prochaineAffichee) {
    prochaineAffichee = cle;
    rendre();
    return;
  }
  const decompte = document.getElementById("decompte");
  if (decompte) decompte.textContent = etat.decompte;
  const nom = document.getElementById("prochaine-nom");
  if (nom) nom.textContent = etat.prochaine.nom;
}, 1000);

/* ---------- actions ---------- */

const trouve = (liste, id) => liste.find((x) => x.id === id);

function lireMontant(brut) {
  const v = parseFloat(String(brut).replace(",", "."));
  return isNaN(v) ? null : v;
}

const actions = {
  "cocher-priere": (d) => {
    etat.prieres[d.priere] = !etat.prieres[d.priere];
  },

  "basculer-jour-coran": (d) => {
    const n = Number(d.jour);
    etat.coran[n] = !etat.coran[n];
  },

  "reinitialiser-coran": () => {
    etat.coran = etat.coran.map(() => false);
  },

  "ajouter-evenement": () => {
    const titre = document.getElementById("nouvel-evenement-titre");
    const date = document.getElementById("nouvel-evenement-date");
    if (!titre || !titre.value.trim() || !date || !date.value) return;
    etat.evenements.push({ id: nouvelIdentifiant(), titre: titre.value.trim(), date: date.value });
    titre.value = "";
  },

  "supprimer-evenement": (d) => {
    etat.evenements = etat.evenements.filter((e) => e.id !== d.id);
  },

  "ajouter-tache": () => {
    const champ = document.getElementById("nouvelle-tache");
    const prio = document.getElementById("nouvelle-tache-prio");
    if (!champ || !champ.value.trim()) return;
    etat.taches.unshift({
      id: nouvelIdentifiant(),
      texte: champ.value.trim(),
      prio: prio ? prio.value : "normale",
      fait: false,
    });
    champ.value = "";
  },

  "basculer-tache": (d) => {
    const t = trouve(etat.taches, d.id);
    if (t) t.fait = !t.fait;
  },

  "supprimer-tache": (d) => {
    etat.taches = etat.taches.filter((t) => t.id !== d.id);
  },

  "filtrer-taches": (d) => {
    etat.filtreTaches = d.filtre;
  },

  "ajouter-repas": () => {
    const plat = document.getElementById("nouveau-repas-nom");
    const jour = document.getElementById("nouveau-repas-jour");
    const moment = document.getElementById("nouveau-repas-moment");
    if (!plat || !plat.value.trim()) return;
    etat.repas.push({
      id: nouvelIdentifiant(),
      jour: jour ? jour.value : "Lundi",
      moment: moment ? moment.value : "Déjeuner",
      plat: plat.value.trim(),
    });
    plat.value = "";
  },

  "supprimer-repas": (d) => {
    etat.repas = etat.repas.filter((r) => r.id !== d.id);
  },

  "ajouter-course": () => {
    const nom = document.getElementById("nouvelle-course-nom");
    const qte = document.getElementById("nouvelle-course-qte");
    if (!nom || !nom.value.trim()) return;
    etat.courses.push({
      id: nouvelIdentifiant(),
      nom: nom.value.trim(),
      qte: qte ? qte.value.trim() : "",
      fait: false,
    });
    nom.value = "";
    if (qte) qte.value = "";
  },

  "basculer-course": (d) => {
    const c = trouve(etat.courses, d.id);
    if (c) c.fait = !c.fait;
  },

  "supprimer-course": (d) => {
    etat.courses = etat.courses.filter((c) => c.id !== d.id);
  },

  "rayer-courses": () => {
    etat.courses = etat.courses.filter((c) => !c.fait);
  },

  "ajouter-ligne-budget": () => {
    const libelle = document.getElementById("budget-libelle");
    const montant = lireMontant((document.getElementById("budget-montant") || {}).value);
    const categorie = document.getElementById("budget-categorie");
    const type = document.getElementById("budget-type");
    if (!libelle || !libelle.value.trim() || montant === null || montant === 0) return;
    etat.budget.unshift({
      id: nouvelIdentifiant(),
      libelle: libelle.value.trim(),
      montant: Math.abs(montant),
      categorie: categorie ? categorie.value : "Autre",
      type: type ? type.value : "depense",
      mois: dateLocale().slice(0, 7),
    });
    libelle.value = "";
  },

  "supprimer-ligne-budget": (d) => {
    etat.budget = etat.budget.filter((l) => l.id !== d.id);
  },

  "compter-dhikr": (d) => {
    etat.dhikr[d.id] = (etat.dhikr[d.id] || 0) + 1;
  },

  "remettre-dhikr": (d) => {
    delete etat.dhikr[d.id];
  },

  "remettre-tous-dhikr": () => {
    etat.dhikr = {};
  },

  "ajouter-objectif": () => {
    const titre = document.getElementById("nouvel-objectif-titre");
    const etapes = parseInt((document.getElementById("nouvel-objectif-etapes") || {}).value, 10);
    if (!titre || !titre.value.trim() || !etapes || etapes < 1) return;
    etat.objectifs.push({
      id: nouvelIdentifiant(),
      titre: titre.value.trim(),
      etapes,
      avancement: 0,
    });
    titre.value = "";
  },

  "avancer-objectif": (d) => {
    const o = trouve(etat.objectifs, d.id);
    if (o) o.avancement = Math.min(o.etapes, o.avancement + 1);
  },

  "reculer-objectif": (d) => {
    const o = trouve(etat.objectifs, d.id);
    if (o) o.avancement = Math.max(0, o.avancement - 1);
  },

  "supprimer-objectif": (d) => {
    etat.objectifs = etat.objectifs.filter((o) => o.id !== d.id);
  },

  "basculer-routine": (d) => {
    etat.routines[d.id] = !etat.routines[d.id];
  },

  "exporter-donnees": () => {
    const donnees = JSON.stringify(toutExporter(), null, 2);
    const blob = new Blob([donnees], { type: "application/json" });
    const lien = document.createElement("a");
    lien.href = URL.createObjectURL(blob);
    lien.download = "safarau-planner-donnees.json";
    document.body.appendChild(lien);
    lien.click();
    lien.remove();
    setTimeout(() => URL.revokeObjectURL(lien.href), 3000);
  },

  "effacer-donnees": () => {
    if (!confirm("Supprimer définitivement toutes les données de l'application ?")) return;
    toutEffacer();
    location.reload();
  },
};

function executer(action, donnees) {
  const fn = actions[action];
  if (!fn) return;
  fn(donnees);
  sauvegarder();
  rendre();
}

/* ---------- événements ---------- */

// La touche Entrée valide aussi les formulaires, sans qu'on ait à
// viser le bouton « Ajouter ».
const champParAction = {
  "nouvel-evenement-titre": "ajouter-evenement",
  "nouvelle-tache": "ajouter-tache",
  "nouveau-repas-nom": "ajouter-repas",
  "nouvelle-course-nom": "ajouter-course",
  "budget-libelle": "ajouter-ligne-budget",
  "budget-montant": "ajouter-ligne-budget",
  "nouvel-objectif-titre": "ajouter-objectif",
};

document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const action = champParAction[e.target.id];
  if (action) {
    e.preventDefault();
    executer(action, {});
  }
});

document.addEventListener("click", (e) => {
  const boutonOnglet = e.target.closest("[data-onglet]");
  if (boutonOnglet) {
    etat.onglet = boutonOnglet.dataset.onglet;
    rendre();
    return;
  }
  const cible = e.target.closest("[data-action]");
  if (cible) executer(cible.dataset.action, cible.dataset);
});

document.addEventListener("change", (e) => {
  if (e.target.classList.contains("choix-ville")) {
    etat.ville = Number(e.target.value);
    sauvegarder();
    rendre();
  }
});

/* ---------- départ ---------- */

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => rendre());
} else {
  rendre();
}
