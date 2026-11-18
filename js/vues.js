// Les différentes sections de l'application. Chaque vue reçoit
// l'état courant et renvoie du HTML. Les actions des boutons passent
// par data-action="..." et sont centralisées dans app.js : aucun
// script n'est injecté dans le HTML rendu.

import { formatHeure, prieres, villes } from "./horaires.js";

export function esc(t) {
  return String(t).replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

const jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const momentsRepas = ["Petit-déjeuner", "Déjeuner", "Dîner"];
const categories = ["Alimentation", "Maison", "Transport", "Soins", "Loisirs", "Cadeaux", "Autre"];
const couleursCategories = ["#d98a9e", "#c98f3d", "#7fa06b", "#9a8c98", "#b78e41", "#c77b5a", "#a9a094"];

const rappels = [
  "« Les actions les plus aimées d'Allah sont les plus régulières, même petites. »",
  "« Et quand Mes serviteurs t'interrogent sur Moi : Je suis tout proche. » (Coran, 2:186)",
  "« Si vous êtes reconnaissants, Je vous donnerai davantage. » (Coran, 14:7)",
  "« Sourire à son frère est une aumône. »",
  "« La douceur embellit toute chose. »",
  "Un pas après l'autre : la régularité vaut mieux que la performance.",
  "Prends cinq minutes pour ton dhikr, même débordée.",
];

export function barreHTML(valeur, total, legende) {
  const pct = Math.min(100, Math.round((valeur / Math.max(total, 1)) * 100));
  const l = legende === undefined ? `${valeur} / ${total} (${pct} %)` : legende;
  return `
    <div class="barre" role="img" aria-label="${pct} % atteints">
      <span style="width:${pct}%"></span>
    </div>
    ${l === "" ? "" : `<p class="barre-legende">${esc(l)}</p>`}`;
}

function optionsVilles(selection) {
  return villes
    .map((v, i) => `<option value="${i}"${i === selection ? " selected" : ""}>${esc(v.nom)}</option>`)
    .join("");
}

function selectionVille(etat, id) {
  return `<select id="${id}" class="champ choix-ville" aria-label="Choisir une ville">
    ${optionsVilles(etat.ville)}
  </select>`;
}

const euros = (n) =>
  n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

/* ================= Accueil ================= */

export function vueAccueil(etat) {
  const maintenant = new Date();
  const dateFr = maintenant.toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  let dateHegire = "";
  try {
    dateHegire = new Intl.DateTimeFormat("fr-FR-u-ca-islamic-umalqura",
      { day: "numeric", month: "long", year: "numeric" }).format(maintenant);
  } catch (_e) {
    // calendrier hégirien indisponible sur ce navigateur
  }
  const rappel = rappels[Math.floor(maintenant / 86400000) % rappels.length];

  const lignes = prieres.map((p) => {
    const faite = !!etat.prieres[p.cle];
    return `
      <div class="element${faite ? " fait" : ""}">
        <button type="button" class="case${faite ? " cochee" : ""}"
          data-action="cocher-priere" data-priere="${p.cle}"
          aria-pressed="${faite}" aria-label="Marquer ${p.nom} comme faite">✓</button>
        <span class="contenu">${p.nom}</span>
        <strong>${formatHeure(etat.horaires[p.cle])}</strong>
      </div>`;
  }).join("");

  const coranLus = etat.coran.filter(Boolean).length;
  const tachesOuvertes = etat.taches.filter((t) => !t.fait).length;
  const coursesRestantes = etat.courses.filter((c) => !c.fait).length;

  return `
    <section class="carte bandeau" aria-labelledby="titre-jour">
      <h2 id="titre-jour">Assalamou 'alaykoum 🌸</h2>
      <p>${esc(dateFr)}${dateHegire ? ` — ${esc(dateHegire)}` : ""}</p>
      <p>${selectionVille(etat, "ville-accueil")}</p>
      <p class="info">💡 ${esc(rappel)}</p>
    </section>

    <section class="carte" aria-labelledby="titre-prochaine">
      <h2 id="titre-prochaine">Prochaine prière</h2>
      <p><span id="prochaine-nom">${etat.prochaine.nom}</span> à
         <strong>${etat.prochaine.heure}</strong></p>
      <p class="decompte" id="decompte" aria-live="polite">${etat.decompte}</p>
    </section>

    <section class="carte" aria-labelledby="titre-prieres-jour">
      <h2 id="titre-prieres-jour">Mes prières du jour</h2>
      ${lignes || ""}
    </section>

    <div class="grille-stats">
      <div class="stat">📖 <b>${coranLus}</b> jour(s) de Coran sur 30</div>
      <div class="stat stat-hauteur">✅ <b>${tachesOuvertes}</b> tâche(s) en attente</div>
      <div class="stat">🛒 <b>${coursesRestantes}</b> article(s) à acheter</div>
    </div>`;
}

/* ================= Prières ================= */

export function vuePrieres(etat) {
  const faites = prieres.filter((p) => etat.prieres[p.cle]).length;
  const lignes = prieres.map((p) => {
    const faite = !!etat.prieres[p.cle];
    return `
      <div class="element${faite ? " fait" : ""}">
        <button type="button" class="case${faite ? " cochee" : ""}"
          data-action="cocher-priere" data-priere="${p.cle}"
          aria-pressed="${faite}" aria-label="Marquer ${p.nom} comme faite">✓</button>
        <span class="contenu">${p.nom} <small>${p.arabe}</small></span>
        <strong>${formatHeure(etat.horaires[p.cle])}</strong>
      </div>`;
  }).join("");

  return `
    <section class="carte">
      <h2>Horaires de prière</h2>
      <p class="ligne-saisie">
        <label class="info" for="ville-prieres">Ville :</label>
        ${selectionVille(etat, "ville-prieres")}
      </p>
      ${lignes}
      ${barreHTML(faites, 5)}
      <span class="note-mosquee">Horaires calculés avec la méthode des angles
      (Fajr 18°, Icha 17°). Ils restent indicatifs : pour la prière en groupe,
      référez-vous à votre mosquée.</span>
    </section>`;
}

/* ================= Coran ================= */

export function vueCoran(etat) {
  const joursLus = etat.coran.filter(Boolean).length;
  const cases = etat.coran.map((lu, i) => `
    <button type="button" class="jour-coran${lu ? " lu" : ""}"
      data-action="basculer-jour-coran" data-jour="${i}"
      aria-pressed="${lu}">
      <b>Jour ${i + 1}</b>
      <small>Juz ${i + 1}${lu ? " — lu ✓" : ""}</small>
    </button>`).join("");

  return `
    <section class="carte">
      <h2>Lecture du Coran — 30 jours</h2>
      ${barreHTML(joursLus, 30)}
      <div class="grille-jours">${cases}</div>
      <p class="ligne-saisie">
        <button type="button" class="bouton bouton-discret" data-action="reinitialiser-coran">
          Recommencer les 30 jours
        </button>
      </p>
    </section>`;
}

/* ================= Agenda ================= */

export function vueAgenda(etat) {
  const tries = [...etat.evenements].sort((a, b) => a.date.localeCompare(b.date));
  const parDate = new Map();
  for (const ev of tries) {
    if (!parDate.has(ev.date)) parDate.set(ev.date, []);
    parDate.get(ev.date).push(ev);
  }
  const blocs = [...parDate.entries()].map(([date, evs]) => {
    const joliDate = new Date(date + "T12:00:00")
      .toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
    const lignes = evs.map((ev) => `
      <div class="element">
        <span class="contenu">• ${esc(ev.titre)}</span>
        <button type="button" class="supprimer" data-action="supprimer-evenement"
          data-id="${ev.id}" aria-label="Supprimer « ${esc(ev.titre)} »">✕</button>
      </div>`).join("");
    return `<section class="carte"><p class="info" style="font-style:normal;font-weight:600">${esc(joliDate)}</p>${lignes}</section>`;
  }).join("");

  return `
    <section class="carte">
      <h2>Mon agenda</h2>
      <div class="ligne-saisie">
        <input type="date" id="nouvel-evenement-date" class="champ champ-etroit"
          aria-label="Date de l'événement">
        <input type="text" id="nouvel-evenement-titre" class="champ"
          placeholder="Rendez-vous, anniversaire, cours…"
          aria-label="Titre de l'événement">
        <button type="button" class="bouton" data-action="ajouter-evenement">Ajouter</button>
      </div>
      ${blocs || "<p class='info'>Aucun événement pour l'instant. 🌷</p>"}
    </section>`;
}

/* ================= Tâches ================= */

export function vueTaches(etat) {
  const priorites = { haute: 2, normale: 1, basse: 0 };
  let visibles = etat.taches;
  if (etat.filtreTaches === "a-faire") visibles = visibles.filter((t) => !t.fait);
  if (etat.filtreTaches === "finies") visibles = visibles.filter((t) => t.fait);
  visibles = [...visibles].sort((a, b) => priorites[b.prio] - priorites[a.prio]);

  const boutonsFiltre = [["toutes", "Toutes"], ["a-faire", "À faire"], ["finies", "Terminées"]]
    .map(([cle, libelle]) => `
      <button type="button" class="bouton bouton-mini ${etat.filtreTaches === cle ? "" : "bouton-discret"}"
        data-action="filtrer-taches" data-filtre="${cle}">${libelle}</button>`).join(" ");

  const lignes = visibles.map((t) => `
    <div class="element${t.fait ? " fait" : ""}">
      <button type="button" class="case${t.fait ? " cochee-verte" : ""}"
        data-action="basculer-tache" data-id="${t.id}"
        aria-pressed="${t.fait}" aria-label="Terminer la tâche « ${esc(t.texte)} »">✓</button>
      <span class="contenu">${esc(t.texte)}</span>
      <span class="etiquette prio-${t.prio}">${t.prio}</span>
      <button type="button" class="supprimer" data-action="supprimer-tache" data-id="${t.id}"
        aria-label="Supprimer la tâche">✕</button>
    </div>`).join("");

  return `
    <section class="carte">
      <h2>Ma to-do list</h2>
      <div class="ligne-saisie">
        <input type="text" id="nouvelle-tache" class="champ"
          placeholder="Quoi de prévu aujourd'hui ?" aria-label="Nouvelle tâche">
        <select id="nouvelle-tache-prio" class="champ champ-etroit" aria-label="Priorité">
          <option value="haute">Haute</option>
          <option value="normale" selected>Normale</option>
          <option value="basse">Basse</option>
        </select>
        <button type="button" class="bouton" data-action="ajouter-tache">Ajouter</button>
      </div>
      <p>${boutonsFiltre}</p>
      ${lignes || "<p class='info'>Rien ici pour le moment. 🌙</p>"}
    </section>`;
}

/* ================= Repas et courses ================= */

export function vueRepas(etat) {
  const menus = jours.map((j) => {
    const items = etat.repas.filter((r) => r.jour === j);
    if (!items.length) return "";
    const lignes = items.map((r) => `
      <div class="element">
        <span class="contenu"><small class="info">${esc(r.moment)} · </small>${esc(r.plat)}</span>
        <button type="button" class="supprimer" data-action="supprimer-repas" data-id="${r.id}"
          aria-label="Supprimer le repas">✕</button>
      </div>`).join("");
    return `<p class="info" style="font-style:normal;margin:0.6rem 0 0.2rem;font-weight:600">${j}</p>${lignes}`;
  }).join("");

  const courses = etat.courses.map((c) => `
    <div class="element${c.fait ? " fait" : ""}">
      <button type="button" class="case${c.fait ? " cochee-verte" : ""}"
        data-action="basculer-course" data-id="${c.id}"
        aria-pressed="${c.fait}" aria-label="Cocher l'article « ${esc(c.nom)} »">✓</button>
      <span class="contenu">${c.qte ? `<strong>${esc(c.qte)} </strong>` : ""}${esc(c.nom)}</span>
      <button type="button" class="supprimer" data-action="supprimer-course" data-id="${c.id}"
        aria-label="Supprimer l'article">✕</button>
    </div>`).join("");

  return `
    <section class="carte">
      <h2>Menus de la semaine</h2>
      <div class="ligne-saisie">
        <select id="nouveau-repas-jour" class="champ champ-etroit" aria-label="Jour">
          ${jours.map((j) => `<option>${j}</option>`).join("")}
        </select>
        <select id="nouveau-repas-moment" class="champ champ-etroit" aria-label="Moment du repas">
          ${momentsRepas.map((m) => `<option>${m}</option>`).join("")}
        </select>
        <input type="text" id="nouveau-repas-nom" class="champ"
          placeholder="Ex : tajine poulet olives" aria-label="Nom du plat">
        <button type="button" class="bouton" data-action="ajouter-repas">Ok</button>
      </div>
      ${menus || "<p class='info'>Planifiez vos menus 🍲</p>"}
    </section>

    <section class="carte">
      <h2>Liste de courses</h2>
      <div class="ligne-saisie">
        <input type="text" id="nouvelle-course-qte" class="champ champ-etroit"
          placeholder="Qté" aria-label="Quantité">
        <input type="text" id="nouvelle-course-nom" class="champ"
          placeholder="Article à acheter" aria-label="Nom de l'article">
        <button type="button" class="bouton" data-action="ajouter-course">Ok</button>
      </div>
      ${courses || "<p class='info'>Liste vide 🧺</p>"}
      ${etat.courses.length ? `
        <button type="button" class="bouton bouton-discret bouton-mini" data-action="rayer-courses">
          Rayer les articles cochés
        </button>` : ""}
    </section>`;
}

/* ================= Budget ================= */

export function vueBudget(etat) {
  // Mois local, pas UTC : on ne veut pas changer de page de budget
  // quelques heures avant minuit.
  const maintenant = new Date();
  const moisCourant = `${maintenant.getFullYear()}-${String(maintenant.getMonth() + 1).padStart(2, "0")}`;
  const mois = etat.budget.filter((l) => l.mois === moisCourant);
  const recettes = mois.filter((l) => l.type === "recette").reduce((s, l) => s + l.montant, 0);
  const depenses = mois.filter((l) => l.type === "depense").reduce((s, l) => s + l.montant, 0);
  const solde = recettes - depenses;

  const parCategorie = new Map();
  for (const l of mois.filter((l) => l.type === "depense")) {
    parCategorie.set(l.categorie, (parCategorie.get(l.categorie) || 0) + l.montant);
  }
  const maximale = Math.max(1, ...parCategorie.values());
  const graphique = [...parCategorie.entries()].map(([cat, montant]) => {
    const couleur = couleursCategories[categories.indexOf(cat)] || "#a9a094";
    return `
      <div class="graph-barre">
        <span><span class="pastille-jour" style="background:${couleur}"></span> ${esc(cat)}</span>
        <span class="graph-cadre">
          <span class="graph-valeur" style="width:${Math.round(montant / maximale * 100)}%"></span>
        </span>
        <strong>${euros(montant)}</strong>
      </div>`;
  }).join("");

  const lignes = etat.budget.map((l) => `
    <div class="element">
      <span class="contenu">${esc(l.libelle)} <small class="info">(${esc(l.categorie)})</small></span>
      <strong class="${l.type === "recette" ? "solde-positif" : "solde-negatif"}">
        ${l.type === "recette" ? "+" : "−"}${euros(l.montant)}
      </strong>
      <button type="button" class="supprimer" data-action="supprimer-ligne-budget" data-id="${l.id}"
        aria-label="Supprimer la ligne">✕</button>
    </div>`).join("");

  return `
    <div class="totaux">
      <div class="total total-recettes">Recettes du mois<b>${euros(recettes)}</b></div>
      <div class="total total-depenses">Dépenses du mois<b>${euros(depenses)}</b></div>
      <div class="total total-solde">Solde<b class="${solde >= 0 ? "solde-positif" : "solde-negatif"}">${euros(solde)}</b></div>
    </div>

    <section class="carte">
      <h2>Dépenses et recettes</h2>
      <div class="ligne-saisie">
        <input type="text" id="budget-libelle" class="champ" placeholder="Libellé"
          aria-label="Libellé de l'opération">
        <input type="text" inputmode="decimal" id="budget-montant" class="champ champ-etroit"
          placeholder="Montant" aria-label="Montant en euros">
        <select id="budget-categorie" class="champ champ-etroit" aria-label="Catégorie">
          ${categories.map((c) => `<option>${c}</option>`).join("")}
        </select>
        <select id="budget-type" class="champ champ-etroit" aria-label="Type d'opération">
          <option value="depense">Dépense</option>
          <option value="recette">Recette</option>
        </select>
        <button type="button" class="bouton" data-action="ajouter-ligne-budget">Ok</button>
      </div>
      ${graphique || ""}
      ${lignes || "<p class='info'>Suivez vos dépenses ici 💫</p>"}
    </section>`;
}

/* ================= Dhikr ================= */

const dhikrs = [
  { cle: "soubhan", texte: "SoubhanAllah", cible: 33 },
  { cle: "hamdoulil", texte: "Alhamdoulillah", cible: 33 },
  { cle: "akbar", texte: "Allahou Akbar", cible: 33 },
  { cle: "tahlil", texte: "La ilaha illa Allah", cible: 100 },
  { cle: "istighfar", texte: "Astaghfirullah", cible: 100 },
  { cle: "salat", texte: "Salat 'ala an-Nabi", cible: 100 },
];

export function vueDhikr(etat) {
  const cartes = dhikrs.map((d) => {
    const n = etat.dhikr[d.cle] || 0;
    return `
      <div class="dhikr-carte${n >= d.cible ? " termine" : ""}">
        <strong>${esc(d.texte)}</strong> <small class="info">(cible : ${d.cible})</small>
        <div>
          <button type="button" class="dhikr-compteur" data-action="compter-dhikr" data-id="${d.cle}"
            aria-label="Compter un ${esc(d.texte)}">${n}</button>
        </div>
        ${barreHTML(Math.min(n, d.cible), d.cible, "")}
        <button type="button" class="bouton bouton-discret bouton-mini" data-action="remettre-dhikr"
          data-id="${d.cle}">repartir de zéro</button>
      </div>`;
  }).join("");
  return `
    <section class="carte">
      <h2>Mes adhkar du jour</h2>
      <div>
        <button type="button" class="bouton bouton-discret bouton-mini" data-action="remettre-tous-dhikr">
          tout remettre à zéro
        </button>
      </div>
      <div class="grille-stats" style="grid-template-columns:repeat(auto-fit,minmax(11rem,1fr))">
        ${cartes}
      </div>
      <p class="info">Les compteurs repartent de zéro chaque nouveau jour.</p>
    </section>`;
}

/* ================= Objectifs ================= */

export function vueObjectifs(etat) {
  const cartes = etat.objectifs.map((o) => `
    <section class="carte">
      <h3 style="margin:0 0 .4rem; font-family:Georgia,serif">${esc(o.titre)}</h3>
      ${barreHTML(o.avancement, o.etapes, `${o.avancement} / ${o.etapes} étapes`)}
      <p style="margin:.6rem 0 0">
        <button type="button" class="bouton bouton-discret bouton-mini" data-action="reculer-objectif"
          data-id="${o.id}" aria-label="Retirer une étape">−</button>
        <button type="button" class="bouton bouton-mini" data-action="avancer-objectif"
          data-id="${o.id}" aria-label="Ajouter une étape">+</button>
        <button type="button" class="bouton bouton-danger bouton-mini" data-action="supprimer-objectif"
          data-id="${o.id}">supprimer</button>
        ${o.avancement >= o.etapes ? " <strong>mabrouk ! 🎉</strong>" : ""}
      </p>
    </section>`).join("");

  return `
    <section class="carte">
      <h2>Mes objectifs</h2>
      <div class="ligne-saisie">
        <input type="text" id="nouvel-objectif-titre" class="champ"
          placeholder="Ex : mémoriser une sourate" aria-label="Titre de l'objectif">
        <input type="number" id="nouvel-objectif-etapes" class="champ champ-etroit" min="1"
          value="10" aria-label="Nombre d'étapes">
        <button type="button" class="bouton" data-action="ajouter-objectif">Ajouter</button>
      </div>
    </section>
    ${cartes || "<p class='info'>Fixe-toi un bel objectif 🌱</p>"}`;
}

/* ================= Bien-être ================= */

const routines = {
  soin: { titre: "Prendre soin de moi", items: ["Boire 1,5 L d'eau", "Soin visage ou corps", "Dix minutes de détente", "Quelques pages de lecture"] },
  sport: { titre: "Sport", items: ["Trente minutes de marche", "Une séance de sport", "Étirements du soir"] },
  menage: { titre: "Ménage", items: ["Faire les lits", "Cuisine propre", "Balayer ou aspirer", "Une machine de linge", "Ranger une zone"] },
};

export function vueBienEtre(etat) {
  const blocs = Object.entries(routines).map(([cle, r]) => {
    const coches = r.items.map((item, i) => {
      const id = `${cle}-${i}`;
      const fait = !!etat.routines[id];
      return `
        <button type="button" class="element${fait ? " fait" : ""}" style="width:100%"
          data-action="basculer-routine" data-id="${id}" aria-pressed="${fait}">
          <span class="case${fait ? " cochee-verte" : ""}">✓</span>
          <span class="contenu" style="text-align:left">${esc(item)}</span>
        </button>`;
    }).join("");
    const faites = r.items.filter((_, i) => etat.routines[`${cle}-${i}`]).length;
    return `
      <section class="carte">
        <h2>${r.titre}</h2>
        ${barreHTML(faites, r.items.length)}
        <div style="margin-top:.6rem">${coches}</div>
      </section>`;
  }).join("");

  return `
    <p class="info" style="margin:.2rem 0 .8rem">Petits pas chaque jour. Les cases
    repartent à zéro chaque matin ✨</p>
    <div style="display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(16rem,1fr))">
      ${blocs}
    </div>`;
}

/* ================= Réglages ================= */

export function vueReglages(etat) {
  return `
    <section class="carte">
      <h2>Réglages</h2>
      <p class="ligne-saisie">
        <label class="info" for="ville-reglages">Ville pour les horaires :</label>
        ${selectionVille(etat, "ville-reglages")}
      </p>
    </section>

    <section class="carte">
      <h2>Mes données</h2>
      <p class="info">Tout est enregistré uniquement sur cet appareil, dans le
      stockage local du navigateur. Aucune donnée n'est envoyée sur un réseau.</p>
      <p class="ligne-saisie">
        <button type="button" class="bouton bouton-vert" data-action="exporter-donnees">
          Exporter mes données (JSON)
        </button>
        <button type="button" class="bouton bouton-danger" data-action="effacer-donnees">
          Tout effacer
        </button>
      </p>
      <p class="info">L'export permet de garder une copie ou de changer d'appareil.
      « Tout effacer » supprime définitivement toutes les données de l'application.</p>
    </section>

    <section class="carte">
      <h2>À propos</h2>
      <p>Safara'u Planner, version 1.0.</p>
      <p class="info">Application sans compte, sans publicité et sans statistiques.
      Code source et mentions légales : voir le dépôt GitHub et le fichier
      CONFIDENTIALITE.md.</p>
    </section>`;
}
