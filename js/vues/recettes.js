// Recettes : la bibliothèque maison, reliée au menu de la semaine
// et à la liste de courses.

import { esc, sourtouLigne, videHTML, bouton } from "../base.js";
import { icone } from "../icone.js";

function formRecetteHTML(recette, edition) {
  const est = !!edition;
  const ingredients = est && recette.ingredients ? recette.ingredients.join("\n") : "";
  return `
    <form class="formulaire colonne" data-module="recettes">
      <label for="recette-titre" class="texte-petit">Titre</label>
      <input type="text" class="champ" id="recette-titre" placeholder="Ex. Tajine de poulet aux olives"
        value="${est ? esc(recette.titre) : ""}" aria-label="Titre de la recette" ${est ? "autofocus" : ""}>

      <label for="recette-ingredients" class="texte-petit">Ingrédients, un par ligne</label>
      <textarea class="champ" id="recette-ingredients" rows="4"
        placeholder="4 cuisses de poulet&#10;1 oignon&#10;Une poignée d'olives…">${esc(ingredients)}</textarea>

      <label for="recette-etapes" class="texte-petit">Étapes (facultatif)</label>
      <textarea class="champ" id="recette-etapes" rows="3"
        placeholder="Faire revenir, laisser mijoter…">${est ? esc(recette.etapes ?? "") : ""}</textarea>

      ${est
        ? `<div class="rangee-boutons">
            <button type="button" class="bouton" data-action="valider-edition-recette" data-id="${esc(recette.id)}">Enregistrer</button>
            <button type="button" class="bouton bouton-discret" data-action="annuler-edition">Annuler</button>
          </div>`
        : `<button type="button" class="bouton" data-action="ajouter-recette">Enregistrer la recette</button>`}
    </form>`;
}

export function vueRecettes(etat) {
  const modifier = etat.edition && etat.edition.module === "recettes"
    ? etat.recettes.find((r) => r.id === etat.edition.id) : null;

  return `
    <div class="entete-page">
      <p class="sourtou-ligne">Cuisine maison</p>
      <h2>Recettes</h2>
      <p>${etat.recettes.length} recette(s) dans la bibliothèque</p>
    </div>

    <section class="carte">
      ${sourtouLigne(modifier ? "Modifier la recette" : "Nouvelle recette")}
      ${formRecetteHTML(modifier, !!modifier)}
    </section>

    <section class="carte">
      ${sourtouLigne("Ma bibliothèque")}
      ${etat.recettes.length ? etat.recettes.map((r) => {
        if (modifier && modifier.id === r.id) return "";
        const nb = (r.ingredients ?? []).length;
        return `
        <article class="recette">
          <header>
            <b class="serif" style="font-size:1.05rem">${esc(r.titre)}</b>
            <div class="groupe-boutons">
              <button type="button" class="action-iconique" data-action="editer-recette" data-id="${r.id}"
                aria-label="Modifier « ${esc(r.titre)} »">${icone("crayon", 15)}</button>
              <button type="button" class="action-iconique danger" data-action="supprimer-recette"
                data-id="${r.id}" aria-label="Supprimer « ${esc(r.titre)} »">${icone("poubelle", 15)}</button>
            </div>
          </header>
          ${nb ? `<p class="texte-petit" style="margin:0.3rem 0 0.5rem">${nb} ingrédient(s)</p>` : ""}
          ${nb ? `
          <div class="rangee-boutons">
            ${bouton({ action: "planifier-recette", id: r.id, petit: true,
              texte: "Planifier cette semaine",
              libelleAria: `Planifier « ${r.titre} » dans le menu` })}
            ${bouton({ action: "courses-depuis-recette", id: r.id, petit: true,
              texte: "Ingrédients aux courses",
              libelleAria: `Ajouter les ingrédients de « ${r.titre} » à la liste de courses` })}
          </div>` : ""}
          <details ${etat.recettesOuvertes?.includes(r.id) ? "open" : ""}>
            <summary>Ingrédients et étapes</summary>
            <ul>
              ${(r.ingredients ?? []).map((i) => `<li>${esc(i)}</li>`).join("")}
            </ul>
            ${r.etapes ? `<p style="white-space:pre-line;margin:0.4rem 0 0">${esc(r.etapes)}</p>` : ""}
          </details>
        </article>`;
      }).join("")
        : videHTML("Aucune recette pour l'instant",
          "Compose ta bibliothèque : chaque recette pourra remplir le menu et la liste de courses.")}
    </section>
  `;
}
