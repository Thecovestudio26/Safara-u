// To-do list : priorités, catégories, échéances, tri par urgence.

import { esc, sourtouLigne, videHTML, dateISO, texteJoli } from "../base.js";
import { icone } from "../icone.js";

const LIBELLES_PRIO = { haute: "Priorité haute", normale: "Priorité normale", basse: "Priorité basse" };

function formTacheHTML(tache, edition, categories) {
  const estEdition = !!edition;
  return `
    <form class="formulaire" data-module="taches">
      <input type="text" class="champ" id="tache-texte" placeholder="Qu'y a-t-il à faire ?"
        value="${estEdition ? esc(tache.texte) : ""}" aria-label="Intitulé de la tâche" ${estEdition ? "autofocus" : ""}>
      <select class="champ champ-tres-large" id="tache-prio" aria-label="Priorité">
        <option value="haute"${estEdition && tache.prio === "haute" ? " selected" : ""}>Priorité haute</option>
        <option value="normale"${!estEdition || tache.prio === "normale" ? " selected" : ""}>Priorité normale</option>
        <option value="basse"${estEdition && tache.prio === "basse" ? " selected" : ""}>Priorité basse</option>
      </select>
      <input type="text" class="champ champ-tres-large" id="tache-categorie"
        placeholder="Catégorie (maison, travail…)" list="tache-categories"
        value="${estEdition ? esc(tache.categorie ?? "") : ""}" aria-label="Catégorie (facultatif)">
      <datalist id="tache-categories">
        ${(categories || []).map((c) => `<option value="${esc(c)}"></option>`).join("")}
      </datalist>
      <input type="date" class="champ champ-large" id="tache-echeance"
        value="${estEdition ? esc(tache.echeance ?? "") : ""}" aria-label="Échéance (facultatif)">
      ${estEdition
        ? `<button type="button" class="bouton" data-action="valider-edition-tache" data-id="${esc(tache.id)}">Enregistrer</button>
           <button type="button" class="bouton bouton-discret" data-action="annuler-edition">Annuler</button>`
        : `<button type="button" class="bouton" data-action="ajouter-tache">Ajouter</button>`}
    </form>`;
}

function EtiquettePrio({ prio }) {
  return `<span class="etiquette etiquette-${esc(prio)}">${esc(LIBELLES_PRIO[prio] ?? prio)}</span>`;
}

export function vueTaches(etat) {
  const aujourdhui = dateISO();
  const categories = [...new Set(etat.taches.map((t) => t.categorie).filter(Boolean))].slice(0, 12);

  const ouvertes = etat.taches.filter((t) => !t.fait);
  const faites = etat.taches.filter((t) => t.fait);

  const ordrePrio = { haute: 0, normale: 1, basse: 2, "": 3 };
  const trier = (liste) => [...liste].sort((a, b) =>
    (a.echeance ?? "9999").localeCompare(b.echeance ?? "9999") ||
    (ordrePrio[a.prio ?? ""] - ordrePrio[b.prio ?? ""]) ||
    a.texte.localeCompare(b.texte));

  const modifier = etat.edition && etat.edition.module === "taches"
    ? etat.taches.find((t) => t.id === etat.edition.id) : null;

  const ligne = (t, faite) => {
    if (etat.edition && etat.edition.module === "taches" && etat.edition.id === t.id) return "";
    const enRetard = !faite && t.echeance && t.echeance < aujourdhui;
    const aujourdhuiEcheance = !faite && t.echeance === aujourdhui;
    return `
      <div class="ligne${faite ? " fait" : ""}">
        <button type="button" class="case-cocher${faite ? " fait" : ""}" data-action="basculer-tache"
          data-id="${t.id}" aria-pressed="${faite}" aria-label="${faite ? "Rouvrir" : "Terminer"} « ${esc(t.texte)} »">✓</button>
        <div class="principale">
          <b>${esc(t.texte)}</b>
          <small>
            ${t.echeance ? (enRetard ? `<span class="texte-alerte">en retard, ${texteJoli(t.echeance)}</span>`
              : aujourdhuiEcheance ? "à faire aujourd'hui" : esc(texteJoli(t.echeance)))
              : "sans échéance"}
            ${t.categorie ? " · " + esc(t.categorie) : ""}
          </small>
        </div>
        ${faite ? "" : EtiquettePrio(t)}
        <button type="button" class="action-iconique" data-action="editer-tache" data-id="${t.id}"
          aria-label="Modifier « ${esc(t.texte)} »">${icone("crayon", 15)}</button>
        <button type="button" class="action-iconique danger" data-action="supprimer-tache" data-id="${t.id}"
          aria-label="Supprimer « ${esc(t.texte)} »">${icone("poubelle", 15)}</button>
      </div>`;
  };

  const segments = [["ouvertes", "En cours"], ["faites", "Terminées"], ["toutes", "Tout"]]
    .map(([cle, libelle]) => `
      <button type="button" class="bouton-segment" data-action="filtrer-taches" data-valeur="${cle}"
        aria-pressed="${etat.filtreTaches === cle}">${libelle}
        ${cle === "ouvertes" ? `<b>${ouvertes.length}</b>` : cle === "faites" ? `<b>${faites.length}</b>` : ""}</button>`).join("");

  let listeHTML = "";
  if (etat.filtreTaches === "ouvertes") listeHTML = trier(ouvertes).map((t) => ligne(t, false)).join("");
  else if (etat.filtreTaches === "faites") listeHTML = trier(faites).map((t) => ligne(t, true)).join("");
  else listeHTML = trier(ouvertes).map((t) => ligne(t, false)).join("") + trier(faites).map((t) => ligne(t, true)).join("");

  const aucune = (etat.filtreTaches === "ouvertes" && !ouvertes.length)
    || (etat.filtreTaches === "faites" && !faites.length) || !etat.taches.length;

  return `
    <div class="entete-page">
      <p class="sourtou-ligne">Ce qui compte</p>
      <h2>Tâches</h2>
      <p>${ouvertes.length} en cours · ${ouvertes.filter((t) => t.echeance && t.echeance <= aujourdhui).length} à échéance</p>
    </div>

    <section class="carte">
      <div class="groupe-segments">${segments}</div>
      ${modifier ? formTacheHTML(modifier, true, categories) : formTacheHTML(null, false, categories)}
    </section>

    <section class="carte">
      ${aucune
        ? videHTML(etat.filtreTaches === "faites" ? "Aucune tâche terminée pour l'instant"
          : "Tout est fait, ma sha' Allah",
          "Note une tâche dès qu'elle arrive à l'esprit : la liste s'occupe du reste.")
        : listeHTML}
    </section>
  `;
}
