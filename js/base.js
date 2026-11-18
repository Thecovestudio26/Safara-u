// Briques partagées par toutes les vues : échappement, dates, montants,
// barres de progression, états vides, champs de formulaire.

export function esc(t) {
  return String(t).replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

export const deuxChiffres = (n) => String(n).padStart(2, "0");

export function dateISO(d = new Date()) {
  return `${d.getFullYear()}-${deuxChiffres(d.getMonth() + 1)}-${deuxChiffres(d.getDate())}`;
}

export const moisISO = (d = new Date()) => dateISO(d).slice(0, 7);

export function texteJoli(dateISOchaine) {
  return new Date(dateISOchaine + "T12:00:00")
    .toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

export const euros = (n) =>
  n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

export function barreHTML(valeur, total, legende) {
  const pct = Math.min(100, Math.round((valeur / Math.max(total, 1)) * 100));
  const l = legende === undefined ? `${valeur} / ${total}` : legende;
  return `
    <div class="barre" role="img" aria-label="${pct} % atteints">
      <span style="width:${pct}%"></span>
    </div>
    ${l === "" ? "" : `<p class="barre-legende"><span>${esc(l)}</span><span>${pct} %</span></p>`}`;
}

// État vide élégant : une ligne de titre en serif, une phrase de conseil.
export function videHTML(titre, conseil) {
  return `
    <div class="vide">
      <span class="serif">${esc(titre)}</span>
      <p>${esc(conseil)}</p>
    </div>`;
}

export function sourtouLigne(texte) {
  return `<span class="sourtou-ligne">${esc(texte)}</span>`;
}

export function bouton(opts) {
  const classes = ["bouton"];
  if (opts.style === "discret") classes.push("bouton-discret");
  if (opts.style === "texte") classes.push("bouton-texte");
  if (opts.style === "danger") classes.push("bouton-danger");
  if (opts.petit) classes.push("bouton-mini");
  const attributs = [
    `type="button"`,
    `class="${classes.join(" ")}"`,
    `data-action="${opts.action}"`,
  ];
  if (opts.id) attributs.push(`data-id="${opts.id}"`);
  if (opts.valeur !== undefined) attributs.push(`data-valeur="${esc(opts.valeur)}"`);
  if (opts.libelleAria) attributs.push(`aria-label="${esc(opts.libelleAria)}"`);
  if (opts.desactive) attributs.push("disabled");
  return `<button ${attributs.join(" ")}>${opts.contenu ?? esc(opts.texte)}</button>`;
}

// Ligne cliquable générique des listes (tâches, événements, repas…).
export function ligneHTML({ principale = "", actionsHTML = "", etat = "", coche = null, id = "" }) {
  const caseHTML = coche
    ? `<button type="button" class="case-cocher${coche.fait ? " fait" : ""}"
         data-action="${coche.action}" data-id="${id}"
         aria-pressed="${coche.fait}" aria-label="${esc(coche.libelleAria)}">${coche.glyphe ?? "✓"}</button>`
    : "";
  return `
    <div class="ligne${etat ? " " + etat : ""}">
      ${caseHTML}
      <div class="principale">${principale}</div>
      ${actionsHTML}
    </div>`;
}

// Sélecteur de ville partagé (accueil, prières, réglages).
export function selectVillesHTML(villes, choix, identifiant) {
  const options = villes
    .map((v, i) => `<option value="${i}"${i === choix ? " selected" : ""}>${esc(v.nom)}</option>`)
    .join("");
  return `<select id="${identifiant}" class="champ choix-ville" aria-label="Choisir une ville">${options}</select>`;
}

export const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
export const MOMENTS_REPAS = ["Petit-déjeuner", "Déjeuner", "Dîner"];
export const MOIS_COURTS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
