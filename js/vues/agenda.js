// Agenda : vues mois, semaine et jour, ajout / modification /
// suppression d'événements, tâches associées via leur échéance.

import {
  esc, sourtouLigne, videHTML, dateISO, texteJoli, deuxChiffres, JOURS,
} from "../base.js";
import { icone } from "../icone.js";

function verifierGrilleMois(ancreMois, etat) {
  // ancre : premier jour du mois affiché
  const annee = ancreMois.getFullYear();
  const mois = ancreMois.getMonth();
  const premier = new Date(annee, mois, 1);
  const decalage = (premier.getDay() + 6) % 7; // lundi en tête de grille
  const nbJours = new Date(annee, mois + 1, 0).getDate();
  const cellules = [];
  for (let i = 0; i < decalage; i++) cellules.push(`<span class="cal-jour" aria-hidden="true"></span>`);
  const aujourdhui = dateISO();
  for (let j = 1; j <= nbJours; j++) {
    const iso = `${annee}-${deuxChiffres(mois + 1)}-${deuxChiffres(j)}`;
    const aDesEvenements = etat.evenements.some((e) => e.date === iso);
    const classes = ["cal-jour"];
    if (iso === aujourdhui) classes.push("aujourd");
    if (iso === etat.agenda.jourChoisi) classes.push("choisi");
    cellules.push(`
      <button type="button" class="${classes.join(" ")}"
        data-action="choisir-jour-agenda" data-id="${iso}"
        ${iso === aujourdhui ? 'aria-current="date"' : ""}
        aria-label="${texteJoli(iso)}${aDesEvenements ? ", événement(s) prévu(s)" : ""}">
        ${j}
        ${aDesEvenements ? '<span class="cal-point"></span>' : ""}
      </button>`);
  }
  return cellules.join("");
}

function bandeSemaine(ancreJour, etat) {
  const base = new Date(ancreJour + "T12:00:00");
  const lundi = new Date(base);
  lundi.setDate(base.getDate() - ((base.getDay() + 6) % 7));
  const cellules = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(lundi);
    d.setDate(lundi.getDate() + i);
    const iso = dateISO(d);
    cellules.push(`
      <button type="button" class="jour-bande${iso === etat.agenda.jourChoisi ? " choisi" : ""}"
        data-action="choisir-jour-agenda" data-id="${iso}"
        ${iso === dateISO() ? 'aria-current="date"' : ""}>
        ${JOURS[i].slice(0, 3)}
        <b>${d.getDate()}</b>
      </button>`);
  }
  return cellules.join("");
}

function lignesJour(etat, iso) {
  const evenementsJour = etat.evenements
    .filter((e) => e.date === iso)
    .sort((a, b) => (a.heure ?? "99").localeCompare(b.heure ?? "99"));
  const tachesJour = etat.taches.filter((t) => !t.fait && t.echeance === iso);

  const modifier = etat.edition && etat.edition.module === "agenda"
    ? evenementsJour.find((e) => e.id === etat.edition.id) : null;

  const lignes = evenementsJour.map((e) => {
    if (etat.edition && etat.edition.module === "agenda" && etat.edition.id === e.id) return "";
    return `
      <div class="ligne">
        <div class="principale"><b>${esc(e.titre)}</b>
          <small>${e.heure ? esc(e.heure) : "journée"}</small></div>
        <button type="button" class="action-iconique" data-action="editer-evenement"
          data-id="${e.id}" aria-label="Modifier « ${esc(e.titre)} »">${icone("crayon", 15)}</button>
        <button type="button" class="action-iconique danger" data-action="supprimer-evenement"
          data-id="${e.id}" aria-label="Supprimer « ${esc(e.titre)} »">${icone("poubelle", 15)}</button>
      </div>`;
  }).join("");

  const tachesLignes = tachesJour.map((t) => `
    <div class="ligne">
      <button type="button" class="case-cocher" data-action="basculer-tache" data-id="${t.id}"
        aria-pressed="false" aria-label="Terminer « ${esc(t.texte)} »">✓</button>
      <div class="principale"><b>${esc(t.texte)}</b><small>tâche à échéance</small></div>
    </div>`).join("");

  return { lignes, tachesLignes, nbTaches: tachesJour.length, evenementsJour, modifier };
}

export function vueAgenda(etat) {
  const ancreMois = new Date(etat.agenda.ancre + "T02:00:00");
  const libelleMois = ancreMois.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const iso = etat.agenda.jourChoisi;
  const { lignes, tachesLignes, nbTaches, evenementsJour, modifier } = lignesJour(etat, iso);

  const segments = [["mois", "Mois"], ["semaine", "Semaine"], ["jour", "Jour"]]
    .map(([cle, libelle]) => `
      <button type="button" class="bouton-segment" data-action="vue-agenda" data-valeur="${cle}"
        aria-pressed="${etat.agenda.vue === cle}">${libelle}</button>`).join("");

  return `
    <div class="entete-page">
      <p class="sourtou-ligne">Organisation</p>
      <h2>Agenda</h2>
      <p>${etat.evenements.length} événement(s) enregistré(s)</p>
    </div>

    <section class="carte">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem">
        <div>${segments}</div>
        <div class="groupe-boutons">
          <button type="button" class="action-iconique" data-action="reculer-ancre-agenda"
            aria-label="Mois précédent">${icone("chevronG", 16)}</button>
          <span class="serif" style="text-transform:capitalize;min-width:8rem;text-align:center">${esc(libelleMois)}</span>
          <button type="button" class="action-iconique" data-action="avancer-ancre-agenda"
            aria-label="Mois suivant">${icone("chevronD", 16)}</button>
        </div>
      </div>
    </section>

    ${etat.agenda.vue === "mois" ? `
    <section class="carte">
      <div class="cal-grille" aria-hidden="true">
        ${JOURS.map((j) => `<span class="cal-jour-semaine">${j.slice(0, 3)}</span>`).join("")}
      </div>
      <div class="cal-grille" role="grid" aria-label="Calendrier de ${esc(libelleMois)}">
        ${verifierGrilleMois(ancreMois, etat)}
      </div>
    </section>` : ""}

    ${etat.agenda.vue === "semaine" ? `
    <section class="carte">
      <div class="semaine-bande" role="grid" aria-label="Semaine autour du jour choisi">
        ${bandeSemaine(iso, etat)}
      </div>
    </section>` : ""}

    <section class="carte">
      <div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap">
        <div>
          ${sourtouLigne("Journée du")}
          <p class="serif" style="margin:0.15rem 0 0.4rem;text-transform:capitalize">${esc(texteJoli(iso))}</p>
        </div>
        <span class="etiquette">${evenementsJour.length} évt · ${nbTaches} tâche</span>
      </div>

      ${modifier ? formulaireEvenementHTML(modifier, true) : formulaireEvenementHTML({ date: iso, titre: "", heure: "" }, false)}

      ${lignes}
      ${tachesLignes}
      ${!evenementsJour.length && !nbTaches
        ? videHTML("Journée libre", "Un rendez-vous, un anniversaire, un cours ? Note-le ici.")
        : ""}
    </section>
  `;
}

function formulaireEvenementHTML(evenement, edition) {
  return `
    <form class="formulaire" data-module="agenda">
      <input type="date" class="champ champ-etroit" id="evenement-date"
        value="${esc(evenement.date)}" aria-label="Date de l'événement">
      <input type="time" class="champ champ-tres-etroit" id="evenement-heure"
        value="${esc(evenement.heure ?? "")}" aria-label="Heure (facultatif)">
      <input type="text" class="champ" id="evenement-titre"
        placeholder="Titre de l'événement" value="${esc(evenement.titre)}"
        aria-label="Titre de l'événement" ${edition ? "autofocus" : ""}>
      ${edition
        ? `<button type="button" class="bouton" data-action="valider-edition-evenement" data-id="${esc(evenement.id)}">Enregistrer</button>
           <button type="button" class="bouton bouton-discret" data-action="annuler-edition">Annuler</button>`
        : `<button type="button" class="bouton" data-action="ajouter-evenement">Ajouter</button>`}
    </form>`;
}
