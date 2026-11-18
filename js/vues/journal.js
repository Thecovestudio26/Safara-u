// Journal personnel et gratitude : une entrée, un texte, une
// reconnaissance du jour. Navigation par mois.

import { esc, sourtouLigne, videHTML, texteJoli, dateISO } from "../base.js";
import { icone } from "../icone.js";

function formEntreeHTML(entree, edition) {
  const est = !!edition;
  return `
    <form class="formulaire colonne" data-module="journal">
      <label for="entree-date" class="texte-petit">Date</label>
      <input type="date" class="champ champ-large" id="entree-date" value="${est ? esc(entree.date) : dateISO()}"
        aria-label="Date de l'entrée">
      <label for="entree-texte" class="texte-petit">Ce qui s'est passé</label>
      <textarea class="champ" id="entree-texte" rows="4"
        placeholder="Quelques lignes suffisent…">${est ? esc(entree.texte) : ""}</textarea>
      <label for="entree-gratitude" class="texte-petit">Gratitude du jour</label>
      <input type="text" class="champ" id="entree-gratitude"
        placeholder="Une chose, même toute petite, pour laquelle je dis Alhamdulillâh"
        value="${est ? esc(entree.gratitude ?? "") : ""}">
      ${est
        ? `<div class="rangee-boutons">
            <button type="button" class="bouton" data-action="valider-edition-entree" data-id="${esc(entree.id)}">Enregistrer</button>
            <button type="button" class="bouton bouton-discret" data-action="annuler-edition">Annuler</button>
          </div>`
        : `<button type="button" class="bouton" data-action="ajouter-entree">Écrire</button>`}
    </form>`;
}

export function vueJournal(etat) {
  const mois = etat.journalMois;
  const [annee, numMois] = mois.split("-").map(Number);
  const libelleMois = new Date(annee, numMois - 1, 1)
    .toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  const entreesMois = etat.journal
    .filter((e) => e.date.slice(0, 7) === mois)
    .sort((a, b) => b.date.localeCompare(a.date));

  const modifier = etat.edition && etat.edition.module === "journal"
    ? etat.journal.find((e) => e.id === etat.edition.id) : null;

  return `
    <div class="entete-page">
      <p class="sourtou-ligne">Écrire pour avancer</p>
      <h2>Journal</h2>
      <p>${entreesMois.length} entrée(s) en ${esc(libelleMois)}</p>
    </div>

    <section class="carte">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem">
        <div class="groupe-boutons">
          <button type="button" class="action-iconique" data-action="reculer-journal-mois"
            aria-label="Mois précédent">${icone("chevronG", 16)}</button>
          <span class="serif" style="min-width:9rem;text-align:center;text-transform:capitalize">${esc(libelleMois)}</span>
          <button type="button" class="action-iconique" data-action="avancer-journal-mois"
            aria-label="Mois suivant">${icone("chevronD", 16)}</button>
        </div>
      </div>
    </section>

    <section class="carte">
      ${sourtouLigne(modifier ? "Modifier une entrée" : "Nouvelle entrée")}
      ${formEntreeHTML(modifier, !!modifier)}
    </section>

    <section class="carte">
      ${sourtouLigne("Mes écrits")}
      ${entreesMois.length ? entreesMois.map((e) => {
        if (modifier && modifier.id === e.id) return "";
        return `
        <article class="entree-journal">
          <header style="display:flex;justify-content:space-between;align-items:baseline;gap:0.5rem">
            <small class="sourtou-ligne" style="text-transform:capitalize">${esc(texteJoli(e.date))}</small>
            <span style="display:flex;gap:0.3rem">
              <button type="button" class="action-iconique" data-action="editer-entree" data-id="${e.id}"
                aria-label="Modifier l'entrée du ${esc(e.date)}">${icone("crayon", 15)}</button>
              <button type="button" class="action-iconique danger" data-action="supprimer-entree" data-id="${e.id}"
                aria-label="Supprimer l'entrée du ${esc(e.date)}">${icone("poubelle", 15)}</button>
            </span>
          </header>
          ${e.texte ? `<p style="margin:0.4rem 0 0.3rem;white-space:pre-line">${esc(e.texte)}</p>` : ""}
          ${e.gratitude ? `<p class="gratitude">Alhamdulillâh pour ${esc(e.gratitude)}</p>` : ""}
        </article>`;
      }).join("")
        : videHTML("Le mois est encore vierge", "Une ligne par jour suffit à voir le chemin parcouru.")}
    </section>
  `;
}
