// Objectifs : annuels ou mensuels, avancement pas à pas.

import { esc, sourtouLigne, videHTML, barreHTML } from "../base.js";
import { icone } from "../icone.js";

export function vueObjectifs(etat) {
  const annee = new Date().getFullYear();
  const ordonne = [...etat.objectifs].sort((a, b) =>
    (b.etapes - b.avancement) - (a.etapes - a.avancement)
    || a.titre.localeCompare(b.titre));

  const ligne = (o) => {
    const fini = o.etapes > 0 && o.avancement >= o.etapes;
    return `
    <div class="ligne${fini ? " fait" : ""}" style="flex-wrap:wrap">
      <div class="principale" style="flex:1;min-width:60%">
        <b>${esc(o.titre)}</b>
        <small>${o.rythme ? esc(o.rythme) + " · " : ""}${o.avancement} / ${o.etapes} étapes</small>
        ${barreHTML(o.avancement, o.etapes, "")}
      </div>
      ${fini
        ? `<span class="etiquette">accompli</span>`
        : `<div class="groupe-boutons">
            <button type="button" class="action-iconique" data-action="reculer-objectif" data-id="${o.id}"
              aria-label="Revenir d'une étape sur « ${esc(o.titre)} »">${icone("moins", 15)}</button>
            <button type="button" class="action-iconique" data-action="avancer-objectif" data-id="${o.id}"
              aria-label="Franchir une étape de « ${esc(o.titre)} »">${icone("plus", 15)}</button>
          </div>`}
      <button type="button" class="action-iconique danger" data-action="supprimer-objectif"
        data-id="${o.id}" aria-label="Supprimer l'objectif « ${esc(o.titre)} »">${icone("poubelle", 15)}</button>
    </div>`;
  };

  return `
    <div class="entete-page">
      <p class="sourtou-ligne">Cap sur ${annee}</p>
      <h2>Objectifs</h2>
      <p>${etat.objectifs.length} objectif(s) · ${etat.objectifs.filter((o) => o.etapes > 0 && o.avancement >= o.etapes).length} accompli(s)</p>
    </div>

    <section class="carte">
      ${sourtouLigne("Nouvel objectif")}
      <form class="formulaire" data-module="objectifs">
        <input type="text" class="champ" id="objectif-titre" placeholder="Ex. Apprendre 10 sourates par cœur"
          aria-label="Intitulé de l'objectif">
        <select class="champ champ-tres-large" id="objectif-rythme" aria-label="Rythme">
          <option value="">Sans rythme</option>
          <option value="annuel">Annuel</option>
          <option value="mensuel">Mensuel</option>
        </select>
        <select class="champ champ-tres-large" id="objectif-etapes" aria-label="Nombre d'étapes">
          ${[3, 5, 10, 12, 20, 30].map((v) => `<option value="${v}"${v === 10 ? " selected" : ""}>${v} étapes</option>`).join("")}
        </select>
        <button type="button" class="bouton" data-action="ajouter-objectif">Ajouter</button>
      </form>
    </section>

    <section class="carte">
      ${sourtouLigne("En cours")}
      ${ordonne.length ? ordonne.map(ligne).join("")
        : videHTML("Rien de fixé pour l'instant",
          "Un objectif en 10 étapes vaut mieux que dix intentions sans étapes.")}
    </section>
  `;
}
