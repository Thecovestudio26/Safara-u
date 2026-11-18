// Safarau Planner — chef d'orchestre : état, rendu, actions.
// Toutes les données vivent dans localStorage (préfixe « planner: »),
// rien ne quitte l'appareil. Voir CONFIDENTIALITE.md.

import { villes, prieres, methodes, ecolesAsr, calculeHoraires, formatHeure } from "./horaires.js";
import {
  lire, ecrire, toutExporter, toutEffacer, restaurerSauvegarde, nettoyerLesJoursPasses,
} from "./stockage.js";
import { dateISO, moisISO } from "./base.js";
import { icone } from "./icone.js";

import { vueAccueil } from "./vues/accueil.js";
import { vuePrieres } from "./vues/prieres.js";
import { vueCoran } from "./vues/coran.js";
import { vueAgenda } from "./vues/agenda.js";
import { vueTaches } from "./vues/taches.js";
import { vueRepas } from "./vues/repas.js";
import { vueBudget } from "./vues/budget.js";
import { vueDhikr } from "./vues/dhikr.js";
import { vueObjectifs } from "./vues/objectifs.js";
import { vueBienetre } from "./vues/bienetre.js";
import { vueJournal } from "./vues/journal.js";
import { vueRecettes } from "./vues/recettes.js";
import { vueDefis } from "./vues/defis.js";
import { vueReglages } from "./vues/reglages.js";

const VUES = {
  accueil: vueAccueil, prieres: vuePrieres, coran: vueCoran, agenda: vueAgenda,
  taches: vueTaches, repas: vueRepas, budget: vueBudget, dhikr: vueDhikr,
  objectifs: vueObjectifs, bienetre: vueBienetre, journal: vueJournal,
  recettes: vueRecettes, defis: vueDefis, reglages: vueReglages,
};

const nouvelId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const aujourdhui = () => dateISO();

// ------------------------------------------------------------------
// État applicatif : données persistées + état d'interface éphémère.
// ------------------------------------------------------------------
const etat = {
  // persisté
  ville: lire("ville", 0),
  methode: lire("methode", "uoif"),
  asr: lire("asr", 0),
  coran: lire("coran", Array.from({ length: 30 }, () => false)),
  coranJournal: lire("coran:journal", []),
  evenements: lire("evenements", []),
  taches: lire("taches", []),
  repas: lire("repas", []),
  courses: lire("courses", []),
  budget: lire("budget", []),
  epargne: lire("epargne", []),
  bilans: lire("bilans", {}),
  objectifs: lire("objectifs", []),
  journal: lire("journal", []),
  recettes: lire("recettes", []),
  defis: lire("defis", []),
  sections: lire("sections", ["coran", "taches", "agenda", "habitudes", "objectifs"]),
  dhikrPerso: lire("dhikr-perso", []),
  hydratationCible: lire("hydratation-cible", 8),

  // données du jour, préfixées par la date
  dateJour: aujourdhui(),
  prieres: lire(`jour:${aujourdhui()}:prieres`, {}),
  dhikr: lire(`jour:${aujourdhui()}:dhikr`, {}),
  routines: lire(`jour:${aujourdhui()}:routines`, { eau: 0, habitudes: {} }),

  // interface
  onglet: "accueil",
  agenda: { vue: "mois", ancre: moisISO(), jourChoisi: aujourdhui() },
  filtreTaches: "ouvertes",
  budgetMois: moisISO(),
  journalMois: moisISO(),
  planification: null,
  edition: null,
  confirmationEffacement: false,
  villes,
  horaires: {},
  prochaine: { nom: "—", cle: "", heure: "--:--" },
  decompte: "",
};

const habitudesJour = () => etat.routines.habitudes ?? {};

// ------------------------------------------------------------------
// Annonces (petits retours d'action, discrets)
// ------------------------------------------------------------------
let minuteurAnnonce = null;
function annoncer(texte) {
  const zone = document.getElementById("annonce");
  if (!zone) return;
  zone.textContent = texte;
  zone.classList.add("visible");
  clearTimeout(minuteurAnnonce);
  minuteurAnnonce = setTimeout(() => zone.classList.remove("visible"), 3200);
}

// ------------------------------------------------------------------
// Horaires de prière et décompte
// ------------------------------------------------------------------
function majHoraires() {
  etat.ville = Math.min(Math.max(Number(etat.ville) || 0, 0), villes.length - 1);
  const methodeChoisie = methodes.find((m) => m.id === etat.methode) ?? methodes[0];
  etat.methodeChoisie = methodeChoisie;
  etat.horaires = calculeHoraires(new Date(), villes[etat.ville], {
    methode: methodeChoisie,
    ombreAsr: (ecolesAsr[etat.asr] ?? ecolesAsr[0]).id === "hanafi" ? 2 : 1,
  });
}

function majProchaine() {
  const maintenant = new Date();
  const heureActuelle = maintenant.getHours() + maintenant.getMinutes() / 60;
  const ordre = prieres;
  let trouve = null;
  for (const p of ordre) {
    const h = etat.horaires[p.cle];
    if (!Number.isNaN(h) && h > heureActuelle) { trouve = { p, h }; break; }
  }
  if (trouve) {
    etat.prochaine = { nom: trouve.p.nom, cle: trouve.p.cle, heure: formatHeure(trouve.h) };
    const ecart = (trouve.h - heureActuelle) * 3600; // secondes
    etat.secondes = Math.max(0, Math.round(ecart));
  } else {
    // plus aucune prière aujourd'hui : la prochaine est le fajr de demain.
    const demain = new Date();
    demain.setDate(demain.getDate() + 1);
    const hDemain = calculeHoraires(demain, villes[etat.ville], {
      methode: etat.methodeChoisie, ombreAsr: (ecolesAsr[etat.asr] ?? ecolesAsr[0]).id === "hanafi" ? 2 : 1,
    });
    etat.prochaine = { nom: "Fajr (demain)", cle: "fajr", heure: formatHeure(hDemain.fajr) };
    const minuit = 24 * 3600;
    const maintenantS = Math.round(heureActuelle * 3600);
    etat.secondes = Math.max(0, minuit - maintenantS + (Number.isNaN(hDemain.fajr) ? 0 : hDemain.fajr * 3600));
  }
  etat.decompte = texteDecompte(etat.secondes);
}

function texteDecompte(secondes) {
  if (!Number.isFinite(secondes) || secondes < 0) return "";
  const h = Math.floor(secondes / 3600);
  const mn = Math.floor((secondes % 3600) / 60);
  return h > 0 ? `dans ${h} h ${String(mn).padStart(2, "0")}` : `dans ${mn} min`;
}

function tic() {
  // 1) décompte, sans re-rendu complet
  etat.secondes = Math.max(0, etat.secondes - 1);
  const zoneDecompte = document.getElementById("decompte");
  if (zoneDecompte) zoneDecompte.textContent = texteDecompte(etat.secondes);
  if (etat.secondes <= 0) { majProchaine(); rendu(); return; }

  // 2) bascule de minuit : recharger les données du jour
  const cejour = aujourdhui();
  if (cejour !== etat.dateJour) {
    etat.dateJour = cejour;
    chargerJour();
    nettoyerLesJoursPasses(cejour);
    majHoraires();
    majProchaine();
    rendu();
  }
}

function chargerJour() {
  const j = etat.dateJour;
  etat.prieres = lire(`jour:${j}:prieres`, {});
  etat.dhikr = lire(`jour:${j}:dhikr`, {});
  etat.routines = lire(`jour:${j}:routines`, { eau: 0, habitudes: {} });
}

// ------------------------------------------------------------------
// Rendu
// ------------------------------------------------------------------
const principal = () => document.getElementById("contenu");

function rendu() {
  const vue = VUES[etat.onglet] ?? vueAccueil;
  principal().innerHTML = vue(etat);

  // état actif de la navigation : aria-current sur tous les boutons
  const dansFeuille = ["repas", "dhikr", "objectifs", "bienetre", "journal", "recettes", "defis", "reglages", "budget"];
  document.querySelectorAll("[data-onglet]").forEach((b) => {
    const actif = b.dataset.onglet === etat.onglet;
    b.setAttribute("aria-current", actif ? "page" : "false");
  });
  // pastille active de la barre mobile (le bouton « Plus » reprend
  // la main quand le module courant n'y figure pas)
  document.querySelectorAll(".barre-basse button").forEach((b) => {
    const onglet = b.dataset.onglet;
    const actif = onglet
      ? onglet === etat.onglet
      : dansFeuille.includes(etat.onglet);
    b.setAttribute("aria-current", actif ? "page" : "false");
    const pastille = b.querySelector("[class^=pastille]");
    if (pastille) pastille.className = actif ? "pastille-active" : "pastille-active-invisible";
  });
  fermerFeuille();

  // focus : si un champ d'édition est autofocus, le rendre réel
  const cible = principal().querySelector("[autofocus]");
  if (cible) cible.focus();
}

const ONGLETS_AUTRES = ["repas", "dhikr", "objectifs", "bienetre", "journal", "recettes", "defis"];

function ouvrirFeuille() {
  document.getElementById("feuille-modules")?.classList.add("ouvert");
  document.getElementById("fond-feuille")?.classList.add("visible");
}
function fermerFeuille() {
  document.getElementById("feuille-modules")?.classList.remove("ouvert");
  document.getElementById("fond-feuille")?.classList.remove("visible");
}

// ------------------------------------------------------------------
// Persistance ciblée : chaque mutation passe par ici.
// ------------------------------------------------------------------
const garde = {
  prieres: () => ecrire(`jour:${etat.dateJour}:prieres`, etat.prieres),
  dhikr: () => ecrire(`jour:${etat.dateJour}:dhikr`, etat.dhikr),
  routines: () => ecrire(`jour:${etat.dateJour}:routines`, etat.routines),
  coran: () => ecrire("coran", etat.coran),
  coranJournal: () => ecrire("coran:journal", etat.coranJournal),
  evenements: () => ecrire("evenements", etat.evenements),
  taches: () => ecrire("taches", etat.taches),
  repas: () => ecrire("repas", etat.repas),
  courses: () => ecrire("courses", etat.courses),
  budget: () => ecrire("budget", etat.budget),
  epargne: () => ecrire("epargne", etat.epargne),
  bilans: () => ecrire("bilans", etat.bilans),
  objectifs: () => ecrire("objectifs", etat.objectifs),
  journal: () => ecrire("journal", etat.journal),
  recettes: () => ecrire("recettes", etat.recettes),
  defis: () => ecrire("defis", etat.defis),
  sections: () => ecrire("sections", etat.sections),
  dhikrPerso: () => ecrire("dhikr-perso", etat.dhikrPerso),
  ville: () => ecrire("ville", etat.ville),
  methode: () => ecrire("methode", etat.methode),
  asr: () => ecrire("asr", etat.asr),
  hydratationCible: () => ecrire("hydratation-cible", etat.hydratationCible),
};

// ------------------------------------------------------------------
// Lecture des champs de formulaire
// ------------------------------------------------------------------
const champ = (id) => document.getElementById(id);
const valeur = (id) => (champ(id)?.value ?? "").trim();

// ------------------------------------------------------------------
// Actions : dictionnaire dispatché par data-action.
// ------------------------------------------------------------------
const actions = {
  // ----- Prières -----
  "cocher-priere": (el) => {
    const cle = el.dataset.priere;
    etat.prieres[cle] = !etat.prieres[cle];
    garde.prieres();
    rendu();
  },

  // ----- Coran -----
  "cocher-lecture-jour": () => {
    const joursLus = etat.coran.filter(Boolean).length;
    const index = Math.min(29, joursLus);
    etat.coran[index] = true;
    const j = aujourdhui();
    if (!etat.coranJournal.includes(j)) etat.coranJournal.push(j);
    garde.coran();
    garde.coranJournal();
    rendu();
  },
  "basculer-jour-coran": (el) => {
    const i = Number(el.dataset.jour);
    if (Number.isInteger(i) && i >= 0 && i < 30) {
      etat.coran[i] = !etat.coran[i];
      garde.coran();
      rendu();
    }
  },
  "reinitialiser-coran": () => {
    etat.coran = Array.from({ length: 30 }, () => false);
    garde.coran();
    rendu();
  },

  // ----- Agenda -----
  "choisir-jour-agenda": (el) => {
    etat.agenda.jourChoisi = el.dataset.id;
    rendu();
  },
  "vue-agenda": (el) => {
    etat.agenda.vue = el.dataset.valeur;
    rendu();
  },
  "reculer-ancre-agenda": () => { etat.agenda.ancre = moisRelatif(etat.agenda.ancre, -1); rendu(); },
  "avancer-ancre-agenda": () => { etat.agenda.ancre = moisRelatif(etat.agenda.ancre, 1); rendu(); },
  "ajouter-evenement": () => {
    const titre = valeur("evenement-titre");
    const date = valeur("evenement-date");
    if (!titre || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      annoncer("Un titre et une date sont nécessaires."); return;
    }
    etat.evenements.push({
      id: nouvelId(), titre, date,
      heure: valeur("evenement-heure") || null,
    });
    etat.agenda.jourChoisi = date;
    etat.agenda.ancre = date.slice(0, 7);
    garde.evenements();
    rendu();
    annoncer("Événement ajouté.");
  },
  "editer-evenement": (el) => { etat.edition = { module: "agenda", id: el.dataset.id }; rendu(); },
  "valider-edition-evenement": (el) => {
    const e = etat.evenements.find((x) => x.id === el.dataset.id);
    if (!e) { etat.edition = null; rendu(); return; }
    const titre = valeur("evenement-titre");
    const date = valeur("evenement-date");
    if (!titre || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      annoncer("Un titre et une date sont nécessaires."); return;
    }
    e.titre = titre; e.date = date;
    e.heure = valeur("evenement-heure") || null;
    etat.edition = null;
    garde.evenements();
    rendu();
    annoncer("Événement mis à jour.");
  },
  "supprimer-evenement": (el) => {
    etat.evenements = etat.evenements.filter((x) => x.id !== el.dataset.id);
    if (etat.edition?.id === el.dataset.id) etat.edition = null;
    garde.evenements();
    rendu();
    annoncer("Événement supprimé.");
  },

  // ----- Tâches -----
  "filtrer-taches": (el) => { etat.filtreTaches = el.dataset.valeur; rendu(); },
  "ajouter-tache": () => {
    const texte = valeur("tache-texte");
    if (!texte) { annoncer("Décris d'abord la tâche."); return; }
    const echeance = valeur("tache-echeance");
    etat.taches.push({
      id: nouvelId(), texte,
      prio: valeur("tache-prio") || "normale",
      categorie: valeur("tache-categorie") || null,
      echeance: /^\d{4}-\d{2}-\d{2}$/.test(echeance) ? echeance : null,
      fait: false,
    });
    garde.taches();
    rendu();
    annoncer("Tâche ajoutée.");
  },
  "basculer-tache": (el) => {
    const t = etat.taches.find((x) => x.id === el.dataset.id);
    if (!t) return;
    t.fait = !t.fait;
    garde.taches();
    rendu();
  },
  "editer-tache": (el) => { etat.edition = { module: "taches", id: el.dataset.id }; rendu(); },
  "valider-edition-tache": (el) => {
    const t = etat.taches.find((x) => x.id === el.dataset.id);
    if (!t) { etat.edition = null; rendu(); return; }
    const texte = valeur("tache-texte");
    if (!texte) { annoncer("Décris d'abord la tâche."); return; }
    t.texte = texte;
    t.prio = valeur("tache-prio") || "normale";
    t.categorie = valeur("tache-categorie") || null;
    const echeance = valeur("tache-echeance");
    t.echeance = /^\d{4}-\d{2}-\d{2}$/.test(echeance) ? echeance : null;
    etat.edition = null;
    garde.taches();
    rendu();
    annoncer("Tâche mise à jour.");
  },
  "supprimer-tache": (el) => {
    etat.taches = etat.taches.filter((x) => x.id !== el.dataset.id);
    if (etat.edition?.id === el.dataset.id) etat.edition = null;
    garde.taches();
    rendu();
    annoncer("Tâche supprimée.");
  },

  // ----- Repas et courses -----
  "ajouter-repas": () => {
    const plat = valeur("nouveau-repas-plat");
    if (!plat) { annoncer("Indique le plat à planifier."); return; }
    etat.repas.push({
      id: nouvelId(),
      jour: Number(valeur("nouveau-repas-jour")) || 0,
      moment: valeur("nouveau-repas-moment") || "Déjeuner",
      plat,
      recette: null,
    });
    garde.repas();
    rendu();
    annoncer("Plat planifié.");
  },
  "supprimer-repas": (el) => {
    etat.repas = etat.repas.filter((x) => x.id !== el.dataset.id);
    garde.repas();
    rendu();
  },
  "planifier-recette": (el) => { etat.planification = el.dataset.id; etat.onglet = "repas"; rendu(); },
  "planifier-recette-valider": (el) => {
    const r = etat.recettes.find((x) => x.id === el.dataset.id);
    if (!r) { etat.planification = null; rendu(); return; }
    etat.repas.push({
      id: nouvelId(),
      jour: Number(valeur("repas-jour")) || 0,
      moment: valeur("repas-moment") || "Déjeuner",
      plat: r.titre,
      recette: r.id,
    });
    etat.planification = null;
    garde.repas();
    rendu();
    annoncer("Recette planifiée dans le menu.");
  },
  "annuler-planification": () => { etat.planification = null; rendu(); },
  "courses-depuis-recette": (el) => {
    const r = etat.recettes.find((x) => x.id === el.dataset.id);
    if (!r) return;
    const existants = new Set(etat.courses.map((c) => c.texte.toLowerCase()));
    let ajoutes = 0;
    for (const ingredient of (r.ingredients ?? [])) {
      const texte = ingredient.trim();
      if (!texte || existants.has(texte.toLowerCase())) continue;
      etat.courses.push({ id: nouvelId(), texte, fait: false });
      existants.add(texte.toLowerCase());
      ajoutes++;
    }
    garde.courses();
    rendu();
    annoncer(ajoutes ? `${ajoutes} article(s) ajouté(s) à la liste.` : "Tout était déjà sur la liste.");
  },
  "ajouter-course": () => {
    const texte = valeur("nouveau-course");
    if (!texte) { annoncer("Indique l'article à acheter."); return; }
    etat.courses.push({ id: nouvelId(), texte, fait: false });
    garde.courses();
    rendu();
  },
  "basculer-course": (el) => {
    const c = etat.courses.find((x) => x.id === el.dataset.id);
    if (!c) return;
    c.fait = !c.fait;
    garde.courses();
    rendu();
  },
  "supprimer-course": (el) => {
    etat.courses = etat.courses.filter((x) => x.id !== el.dataset.id);
    garde.courses();
    rendu();
  },
  "vider-courses-faites": () => {
    const avant = etat.courses.length;
    etat.courses = etat.courses.filter((c) => !c.fait);
    garde.courses();
    rendu();
    annoncer(avant - etat.courses.length + " article(s) retiré(s).");
  },

  // ----- Budget -----
  "reculer-budget-mois": () => { etat.budgetMois = moisRelatif(etat.budgetMois, -1); rendu(); },
  "avancer-budget-mois": () => { etat.budgetMois = moisRelatif(etat.budgetMois, 1); rendu(); },
  "ajouter-ligne-budget": () => {
    const montant = Number(valeur("budget-montant").replace(",", "."));
    if (!Number.isFinite(montant) || montant <= 0) {
      annoncer("Indique un montant supérieur à zéro."); return;
    }
    const type = valeur("budget-type") === "revenu" ? "revenu" : "depense";
    etat.budget.push({
      id: nouvelId(), mois: etat.budgetMois, type,
      categorie: valeur("budget-categorie") || null,
      montant, libelle: valeur("budget-libelle") || null,
    });
    garde.budget();
    rendu();
    annoncer(type === "revenu" ? "Revenu enregistré." : "Dépense enregistrée.");
  },
  "supprimer-ligne-budget": (el) => {
    etat.budget = etat.budget.filter((x) => x.id !== el.dataset.id);
    garde.budget();
    rendu();
    annoncer("Écriture supprimée.");
  },
  "ajouter-enveloppe": () => {
    const nom = valeur("enveloppe-nom");
    if (!nom) { annoncer("Donne un nom au projet d'épargne."); return; }
    const cible = Number(valeur("enveloppe-cible").replace(",", "."));
    etat.epargne.push({
      id: nouvelId(), nom,
      cible: Number.isFinite(cible) && cible > 0 ? cible : 0,
      solde: 0,
    });
    garde.epargne();
    rendu();
    annoncer("Projet d'épargne créé.");
  },
  "verser-enveloppe": (el) => {
    const env = etat.epargne.find((x) => x.id === el.dataset.id);
    const montant = Number((valeur(`versement-${el.dataset.id}`) || "").replace(",", "."));
    if (!env || !Number.isFinite(montant) || montant <= 0) {
      annoncer("Indique un montant à verser."); return;
    }
    env.solde += montant;
    garde.epargne();
    rendu();
    annoncer(`Versement noté sur « ${env.nom} ».`);
  },
  "retirer-enveloppe": (el) => {
    const env = etat.epargne.find((x) => x.id === el.dataset.id);
    const montant = Number((valeur(`versement-${el.dataset.id}`) || "").replace(",", "."));
    if (!env || !Number.isFinite(montant) || montant <= 0) {
      annoncer("Indique un montant à retirer."); return;
    }
    env.solde = Math.max(0, env.solde - montant);
    garde.epargne();
    rendu();
    annoncer(`Retrait noté sur « ${env.nom} ».`);
  },
  "supprimer-enveloppe": (el) => {
    etat.epargne = etat.epargne.filter((x) => x.id !== el.dataset.id);
    garde.epargne();
    rendu();
  },
  "enregistrer-bilan": (el) => {
    etat.bilans[el.dataset.valeur] = valeur("bilan-texte");
    garde.bilans();
    rendu();
    annoncer("Bilan enregistré.");
  },

  // ----- Adhkar -----
  "compter-dhikr": (el) => {
    const id = el.dataset.id;
    etat.dhikr[id] = (etat.dhikr[id] ?? 0) + 1;
    garde.dhikr();
    rendu();
  },
  "reinitialiser-dhikr": (el) => {
    delete etat.dhikr[el.dataset.id];
    garde.dhikr();
    rendu();
  },
  "ajouter-dhikr-perso": () => {
    const texte = valeur("dhikr-perso-texte");
    if (!texte) { annoncer("Écris d'abord l'invocation."); return; }
    etat.dhikrPerso.push({
      id: nouvelId(), texte, latin: texte,
      cible: Number(valeur("dhikr-perso-cible")) || 100,
      source: "",
    });
    garde.dhikrPerso();
    rendu();
    annoncer("Dhikr personnel ajouté.");
  },
  "supprimer-dhikr-perso": (el) => {
    etat.dhikrPerso = etat.dhikrPerso.filter((x) => x.id !== el.dataset.id);
    delete etat.dhikr[el.dataset.id];
    garde.dhikrPerso();
    garde.dhikr();
    rendu();
  },

  // ----- Objectifs -----
  "ajouter-objectif": () => {
    const titre = valeur("objectif-titre");
    if (!titre) { annoncer("Donne un titre à l'objectif."); return; }
    etat.objectifs.push({
      id: nouvelId(), titre,
      rythme: valeur("objectif-rythme") || null,
      etapes: Number(valeur("objectif-etapes")) || 10,
      avancement: 0,
    });
    garde.objectifs();
    rendu();
    annoncer("Objectif créé.");
  },
  "avancer-objectif": (el) => {
    const o = etat.objectifs.find((x) => x.id === el.dataset.id);
    if (!o) return;
    o.avancement = Math.min(o.etapes, o.avancement + 1);
    garde.objectifs();
    rendu();
  },
  "reculer-objectif": (el) => {
    const o = etat.objectifs.find((x) => x.id === el.dataset.id);
    if (!o) return;
    o.avancement = Math.max(0, o.avancement - 1);
    garde.objectifs();
    rendu();
  },
  "supprimer-objectif": (el) => {
    etat.objectifs = etat.objectifs.filter((x) => x.id !== el.dataset.id);
    garde.objectifs();
    rendu();
    annoncer("Objectif supprimé.");
  },

  // ----- Bien-être -----
  "ajouter-eau": (el) => {
    const i = Number(el.dataset.valeur);
    etat.routines.eau = Math.max(etat.routines.eau ?? 0, (Number.isInteger(i) ? i : 0) + 1);
    if (etat.routines.eau >= etat.hydratationCible) etat.routines.eau = etat.hydratationCible;
    garde.routines();
    rendu();
  },
  "retirer-eau": (el) => {
    const i = Number(el.dataset.valeur);
    etat.routines.eau = Math.max(0, Number.isInteger(i) ? i : 0);
    garde.routines();
    rendu();
  },
  "basculer-habitude": (el) => {
    const cle = el.dataset.valeur;
    if (!cle) return;
    const h = etat.routines.habitudes ?? (etat.routines.habitudes = {});
    h[cle] = !h[cle];
    garde.routines();
    rendu();
  },
  "definir-hydratation": () => {
    const v = Number(valeur("hydratation-cible"));
    if ([6, 8, 10].includes(v)) {
      etat.hydratationCible = v;
      garde.hydratationCible();
      annoncer(`Objectif : ${v} verres par jour.`);
    }
    rendu();
  },

  // ----- Journal -----
  "reculer-journal-mois": () => { etat.journalMois = moisRelatif(etat.journalMois, -1); rendu(); },
  "avancer-journal-mois": () => { etat.journalMois = moisRelatif(etat.journalMois, 1); rendu(); },
  "ajouter-entree": () => {
    const texte = valeur("entree-texte");
    const gratitude = valeur("entree-gratitude");
    if (!texte && !gratitude) { annoncer("Écris au moins une ligne."); return; }
    const date = valeur("entree-date");
    etat.journal.push({
      id: nouvelId(),
      date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : aujourdhui(),
      texte, gratitude: gratitude || null,
    });
    garde.journal();
    rendu();
    annoncer("Entrée enregistrée.");
  },
  "editer-entree": (el) => { etat.edition = { module: "journal", id: el.dataset.id }; rendu(); },
  "valider-edition-entree": (el) => {
    const e = etat.journal.find((x) => x.id === el.dataset.id);
    if (!e) { etat.edition = null; rendu(); return; }
    const date = valeur("entree-date");
    e.date = /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : e.date;
    e.texte = valeur("entree-texte");
    e.gratitude = valeur("entree-gratitude") || null;
    etat.edition = null;
    garde.journal();
    rendu();
    annoncer("Entrée mise à jour.");
  },
  "supprimer-entree": (el) => {
    etat.journal = etat.journal.filter((x) => x.id !== el.dataset.id);
    if (etat.edition?.id === el.dataset.id) etat.edition = null;
    garde.journal();
    rendu();
    annoncer("Entrée supprimée.");
  },

  // ----- Recettes -----
  "ajouter-recette": () => {
    const titre = valeur("recette-titre");
    if (!titre) { annoncer("Donne un titre à la recette."); return; }
    etat.recettes.push({
      id: nouvelId(), titre,
      ingredients: valeur("recette-ingredients").split("\n").map((s) => s.trim()).filter(Boolean),
      etapes: valeur("recette-etapes") || null,
    });
    garde.recettes();
    rendu();
    annoncer("Recette enregistrée.");
  },
  "editer-recette": (el) => { etat.edition = { module: "recettes", id: el.dataset.id }; rendu(); },
  "valider-edition-recette": (el) => {
    const r = etat.recettes.find((x) => x.id === el.dataset.id);
    if (!r) { etat.edition = null; rendu(); return; }
    const titre = valeur("recette-titre");
    if (!titre) { annoncer("Donne un titre à la recette."); return; }
    r.titre = titre;
    r.ingredients = valeur("recette-ingredients").split("\n").map((s) => s.trim()).filter(Boolean);
    r.etapes = valeur("recette-etapes") || null;
    etat.edition = null;
    garde.recettes();
    rendu();
    annoncer("Recette mise à jour.");
  },
  "supprimer-recette": (el) => {
    etat.recettes = etat.recettes.filter((x) => x.id !== el.dataset.id);
    if (etat.edition?.id === el.dataset.id) etat.edition = null;
    garde.recettes();
    rendu();
    annoncer("Recette supprimée.");
  },

  // ----- Défis -----
  "ajouter-defi": () => {
    const titre = valeur("defi-titre");
    if (!titre) { annoncer("Décris d'abord le défi."); return; }
    etat.defis.push({
      id: nouvelId(), titre,
      duree: Number(valeur("defi-duree")) || 30,
      jours: [],
    });
    garde.defis();
    rendu();
    annoncer("Défi lancé, courage !");
  },
  "cocher-jour-defi": (el) => {
    const d = etat.defis.find((x) => x.id === el.dataset.id);
    if (!d) return;
    if (!(d.jours ?? []).includes(aujourdhui())) {
      d.jours = [...(d.jours ?? []), aujourdhui()];
      garde.defis();
    }
    rendu();
  },
  "supprimer-defi": (el) => {
    etat.defis = etat.defis.filter((x) => x.id !== el.dataset.id);
    garde.defis();
    rendu();
    annoncer("Défi supprimé.");
  },

  // ----- Édition générique -----
  "annuler-edition": () => { etat.edition = null; rendu(); },

  // ----- Réglages : données et installation -----
  "exporter-donnees": () => {
    const donnees = JSON.stringify(toutExporter(), null, 2);
    const nom = `safarau-sauvegarde-${aujourdhui()}.json`;
    telechargerTexte(nom, donnees, "application/json");
    annoncer("Sauvegarde téléchargée.");
  },
  "demander-effacement": () => { etat.confirmationEffacement = true; rendu(); },
  "annuler-effacement": () => { etat.confirmationEffacement = false; rendu(); },
  "confirmer-effacement": () => {
    toutEffacer();
    // recharger l'état à neuf sans recharger la page
    for (const [cle, defaut] of Object.entries(VALEURS_DEFAUT)) etat[cle] = structuredClone(defaut);
    etat.edition = null;
    etat.confirmationEffacement = false;
    etat.onglet = "accueil";
    chargerJour();
    majHoraires();
    majProchaine();
    rendu();
    annoncer("Toutes les données ont été effacées de cet appareil.");
  },
  "installer-pwa": async () => {
    const evenement = etat.evenementInstallation;
    if (!evenement) { annoncer("Installation non proposée par ce navigateur."); return; }
    evenement.prompt();
    const choix = await evenement.userChoice;
    annoncer(choix.outcome === "accepted" ? "Application installée." : "Installation annulée.");
    etat.evenementInstallation = null;
    etat.installationPossible = false;
    rendu();
  },
};

function moisRelatif(mois, decalage) {
  const [annee, m] = mois.split("-").map(Number);
  const d = new Date(annee, m - 1 + decalage, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function telechargerTexte(nom, texte, type) {
  const blob = new Blob([texte], { type });
  const lien = document.createElement("a");
  lien.href = URL.createObjectURL(blob);
  lien.download = nom;
  document.body.appendChild(lien);
  lien.click();
  setTimeout(() => URL.revokeObjectURL(lien.href), 3000);
  lien.remove();
}

// Réglages : selects et cases à cocher gérés via l'événement change.
function surChangement(cible) {
  const reglage = cible.dataset?.reglage;
  if (reglage === "ville" || cible.id?.startsWith("ville-")) {
    etat.ville = Math.min(Math.max(Number(cible.value) || 0, 0), villes.length - 1);
    garde.ville();
    majHoraires();
    majProchaine();
    rendu();
    return;
  }
  if (reglage === "methode") {
    etat.methode = cible.value;
    garde.methode();
    majHoraires();
    majProchaine();
    rendu();
    return;
  }
  if (reglage === "asr") {
    etat.asr = Number(cible.value) || 0;
    garde.asr();
    majHoraires();
    majProchaine();
    rendu();
    return;
  }
  if (reglage === "section" && cible.type === "checkbox") {
    const cle = cible.value;
    if (cible.checked && !etat.sections.includes(cle)) etat.sections.push(cle);
    if (!cible.checked) etat.sections = etat.sections.filter((s) => s !== cle);
    garde.sections();
    return; // pas de re-rendu : la case doit rester visible
  }
  if (reglage === "import" && cible.files?.[0]) {
    const fichier = cible.files[0];
    fichier.text().then((texte) => {
      try {
        const resultat = restaurerSauvegarde(JSON.parse(texte));
        if (resultat < 0) throw new Error("structure");
        rechargerTout();
        rendu();
        annoncer(resultat ? `${resultat} élément(s) restauré(s).` : "Aucune donnée reconnue dans ce fichier.");
      } catch (_e) {
        annoncer("Fichier illisible : sauvegarde Safarau attendue.");
      }
    });
    cible.value = "";
  }
}

// Recharge l'ensemble de l'état depuis le stockage (après import ou effacement).
function rechargerTout() {
  for (const [cle, lecteur] of Object.entries(LECTEURS)) etat[cle] = lecteur();
  chargerJour();
  majHoraires();
  majProchaine();
}

const VALEURS_DEFAUT = {
  ville: 0, methode: "uoif", asr: 0,
  coran: Array.from({ length: 30 }, () => false),
  coranJournal: [], evenements: [], taches: [], repas: [], courses: [],
  budget: [], epargne: [], bilans: {}, objectifs: [], journal: [],
  recettes: [], defis: [],
  sections: ["coran", "taches", "agenda", "habitudes", "objectifs"],
  dhikrPerso: [], hydratationCible: 8,
};

const LECTEURS = {
  ville: () => lire("ville", 0),
  methode: () => lire("methode", "uoif"),
  asr: () => lire("asr", 0),
  coran: () => lire("coran", VALEURS_DEFAUT.coran),
  coranJournal: () => lire("coran:journal", []),
  evenements: () => lire("evenements", []),
  taches: () => lire("taches", []),
  repas: () => lire("repas", []),
  courses: () => lire("courses", []),
  budget: () => lire("budget", []),
  epargne: () => lire("epargne", []),
  bilans: () => lire("bilans", {}),
  objectifs: () => lire("objectifs", []),
  journal: () => lire("journal", []),
  recettes: () => lire("recettes", []),
  defis: () => lire("defis", []),
  sections: () => lire("sections", VALEURS_DEFAUT.sections),
  dhikrPerso: () => lire("dhikr-perso", []),
  hydratationCible: () => lire("hydratation-cible", 8),
};

// ------------------------------------------------------------------
// Écouteurs globaux
// ------------------------------------------------------------------
function demarrer() {
  majHoraires();
  majProchaine();

  document.addEventListener("click", (e) => {
    const boutonOnglet = e.target.closest("[data-onglet]");
    if (boutonOnglet) {
      e.preventDefault();
      etat.onglet = boutonOnglet.dataset.onglet;
      fermerFeuille();
      rendu();
      window.scrollTo({ top: 0 });
      return;
    }
    const ouvrir = e.target.closest("[data-ouvrir-feuille]");
    if (ouvrir) {
      e.preventDefault();
      const dejaOuverte = document.getElementById("feuille-modules")?.classList.contains("ouvert");
      dejaOuverte ? fermerFeuille() : ouvrirFeuille();
      return;
    }
    if (e.target.closest("#fond-feuille")) { fermerFeuille(); return; }

    const el = e.target.closest("[data-action]");
    if (!el || el.disabled) return;
    const action = actions[el.dataset.action];
    if (action) {
      e.preventDefault();
      action(el);
    }
  });

  document.addEventListener("change", (e) => {
    const cible = e.target;
    if (cible.matches?.("[data-reglage]") || cible.id?.startsWith("ville-")) {
      surChangement(cible);
    }
  });

  // Entrée dans un champ : déclenche le bouton principal du formulaire.
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || e.shiftKey) return;
    const champActif = e.target;
    if (!champActif.matches?.('input[type="text"], input[type="number"], input:not([type])')) return;
    if (champActif.type === "date" || champActif.type === "time") return; // laisser le calendrier
    const formulaire = champActif.closest(".formulaire");
    if (!formulaire) return;
    const boutonPrincipal = formulaire.querySelector('[data-action^="ajouter"], [data-action^="valider-edition"], [data-action^="planifier-recette-valider"]');
    if (boutonPrincipal && !boutonPrincipal.disabled) {
      e.preventDefault();
      boutonPrincipal.click();
    }
  });

  // Installation PWA quand le navigateur la propose.
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    etat.evenementInstallation = e;
    etat.installationPossible = true;
    if (etat.onglet === "reglages") rendu();
  });

  // Service worker : cache pour le hors-ligne (silencieux si absent).
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      /* pas de hors-ligne sur ce contexte (http local, etc.) */
    });
  }

  // Icônes vectorielles de la navigation (fixe, hors du contenu re-rendu).
  document.querySelectorAll("[data-icone]").forEach((zone) => {
    zone.innerHTML = icone(zone.dataset.icone, 19);
  });

  // Échap referme la feuille des modules.
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") fermerFeuille();
  });

  // date française dans le bandeau (plateformes mobiles)
  const zoneDate = document.getElementById("date-du-jour");
  if (zoneDate) {
    const cejour = new Date();
    let hegire = "";
    try {
      hegire = new Intl.DateTimeFormat("fr-FR-u-ca-islamic-umalqura",
        { day: "numeric", month: "long" }).format(cejour);
    } catch (_e) { /* calendrier hégirien indisponible ici */ }
    zoneDate.textContent = cejour.toLocaleDateString("fr-FR",
      { weekday: "long", day: "numeric", month: "long" })
      + (hegire ? "\n" + hegire : "");
  }

  rendu();
  setInterval(tic, 1000);
}

demarrer();
