// Budget : revenus et dépenses du mois, épargne en enveloppes,
// bilan mensuel libre. Aucun montant ne quitte l'appareil.

import {
  esc, sourtouLigne, videHTML, euros, barreHTML, bouton, MOIS_COURTS,
} from "../base.js";
import { icone } from "../icone.js";

const CATEGORIES_DEPENSE = ["Alimentation", "Maison", "Transport", "Factures",
  "Santé", "Éducation", "Sorties", "Cadeaux", "Autre"];

export function vueBudget(etat) {
  const mois = etat.budgetMois;
  const [annee, numMois] = mois.split("-").map(Number);
  const libelleMois = new Date(annee, numMois - 1, 1)
    .toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  const lignesMois = etat.budget.filter((l) => l.mois === mois);
  const revenus = lignesMois.filter((l) => l.type === "revenu");
  const depenses = lignesMois.filter((l) => l.type === "depense");
  const totalRevenus = revenus.reduce((s, l) => s + (Number(l.montant) || 0), 0);
  const totalDepenses = depenses.reduce((s, l) => s + (Number(l.montant) || 0), 0);
  const solde = totalRevenus - totalDepenses;

  // Répartition par catégorie de dépense.
  const parCategorie = new Map();
  depenses.forEach((l) => {
    const cle = l.categorie || "Autre";
    parCategorie.set(cle, (parCategorie.get(cle) ?? 0) + (Number(l.montant) || 0));
  });
  const categoriesTriees = [...parCategorie.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);

  const ligneBudget = (l) => `
    <div class="ligne">
      <div class="principale">
        <b>${esc(l.libelle || l.categorie || (l.type === "revenu" ? "Revenu" : "Dépense"))}</b>
        <small>${esc(l.categorie || "")}${l.note ? " · " + esc(l.note) : ""}</small>
      </div>
      <span class="potentiel ${l.type === "revenu" ? "positif" : ""}">${euros(Number(l.montant) || 0)}</span>
      <button type="button" class="action-iconique danger" data-action="supprimer-ligne-budget"
        data-id="${l.id}" aria-label="Supprimer « ${esc(l.libelle || l.categorie)} »">${icone("poubelle", 15)}</button>
    </div>`;

  return `
    <div class="entete-page">
      <p class="sourtou-ligne">Comptes Clair</p>
      <h2>Budget</h2>
      <p>${lignesMois.length} écriture(s) sur ${esc(libelleMois)}</p>
    </div>

    <section class="carte">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem">
        <div class="groupe-boutons">
          <button type="button" class="action-iconique" data-action="reculer-budget-mois"
            aria-label="Mois précédent">${icone("chevronG", 16)}</button>
          <span class="serif" style="min-width:9rem;text-align:center;text-transform:capitalize">${esc(libelleMois)}</span>
          <button type="button" class="action-iconique" data-action="avancer-budget-mois"
            aria-label="Mois suivant">${icone("chevronD", 16)}</button>
        </div>
        <span class="etiquette">${solde >= 0 ? "solde positif" : "solde négatif"}</span>
      </div>
      <div class="bilan-chiffres">
        <div><small>Revenus</small><b class="positif">${euros(totalRevenus)}</b></div>
        <div><small>Dépenses</small><b>${euros(totalDepenses)}</b></div>
        <div><small>Reste</small><b class="${solde >= 0 ? "positif" : "texte-alerte"}">${euros(solde)}</b></div>
      </div>
    </section>

    <section class="carte">
      ${sourtouLigne("Nouvelle écriture")}
      <form class="formulaire" data-module="budget">
        <select class="champ champ-tres-large" id="budget-type" aria-label="Type d'écriture">
          <option value="depense">Dépense</option>
          <option value="revenu">Revenu</option>
        </select>
        <input type="text" class="champ champ-tres-large" id="budget-categorie"
          placeholder="Catégorie" list="budget-categories" aria-label="Catégorie">
        <datalist id="budget-categories">
          ${CATEGORIES_DEPENSE.map((c) => `<option value="${esc(c)}"></option>`).join("")}
        </datalist>
        <input type="number" class="champ champ-tres-large" id="budget-montant" inputmode="decimal"
          step="0.01" min="0" placeholder="Montant" aria-label="Montant en euros">
        <input type="text" class="champ" id="budget-libelle" placeholder="Libellé (facultatif)" aria-label="Libellé">
        <button type="button" class="bouton" data-action="ajouter-ligne-budget">Ajouter</button>
      </form>
    </section>

    <section class="carte">
      ${sourtouLigne("Mouvements du mois")}
      ${lignesMois.length
        ? revenus.map(ligneBudget).join("") + depenses.map(ligneBudget).join("")
        : videHTML("Aucune écriture ce mois-ci", "Note un reçu ou une dépense : le bilan se met à jour tout seul.")}
    </section>

    ${categoriesTriees.length ? `
    <section class="carte">
      ${sourtouLigne("Où part l'argent")}
      ${categoriesTriees.map(([cat, montant]) => `
        <div style="margin-bottom:0.6rem">
          <div style="display:flex;justify-content:space-between;font-size:0.85rem;margin-bottom:0.2rem">
            <span>${esc(cat)}</span><span>${euros(montant)}</span>
          </div>
          ${barreHTML(montant, totalDepenses, "")}
        </div>`).join("")}
    </section>` : ""}

    <section class="carte">
      ${sourtouLigne("Épargne")}
      ${etat.epargne.map((env) => {
        const pct = env.cible ? Math.min(100, Math.round((env.solde / env.cible) * 100)) : 0;
        return `
        <div class="ligne">
          <div class="principale" style="flex:1">
            <b>${esc(env.nom)}</b>
            <small>${euros(env.solde)}${env.cible ? " sur " + euros(env.cible) : ""}</small>
            ${barreHTML(env.solde, env.cible || 1, "")}
          </div>
          <form class="formulaire mini" data-module="budget" style="margin:0">
            <input type="number" class="champ champ-etroit" inputmode="decimal" step="0.01"
              id="versement-${esc(env.id)}" placeholder="0,00" aria-label="Montant à verser sur ${esc(env.nom)}">
            <button type="button" class="bouton bouton-mini" data-action="verser-enveloppe"
              data-id="${env.id}">Verser</button>
            <button type="button" class="bouton bouton-mini bouton-discret" data-action="retirer-enveloppe"
              data-id="${env.id}" aria-label="Retirer depuis ${esc(env.nom)}">−</button>
          </form>
          <button type="button" class="action-iconique danger" data-action="supprimer-enveloppe"
            data-id="${env.id}" aria-label="Supprimer l'enveloppe « ${esc(env.nom)} »">${icone("poubelle", 15)}</button>
        </div>`;
      }).join("")}
      <form class="formulaire" data-module="budget">
        <input type="text" class="champ" id="enveloppe-nom" placeholder="Projet d'épargne (OMRA, voiture…)"
          aria-label="Nom du projet d'épargne">
        <input type="number" class="champ champ-tres-large" id="enveloppe-cible" inputmode="decimal"
          step="0.01" min="0" placeholder="Objectif (€)" aria-label="Montant visé">
        <button type="button" class="bouton" data-action="ajouter-enveloppe">Créer</button>
      </form>
    </section>

    <section class="carte">
      ${sourtouLigne("Bilan du mois")}
      <form class="formulaire colonne" data-module="budget">
        <textarea class="champ" id="bilan-texte" rows="4" placeholder="Ce qui a bien marché, ce que je ajuste le mois prochain…"
          aria-label="Bilan du mois">${esc(etat.bilans[mois] ?? "")}</textarea>
        <button type="button" class="bouton" data-action="enregistrer-bilan"
          data-valeur="${esc(mois)}">Enregistrer le bilan</button>
      </form>
    </section>
  `;
}
