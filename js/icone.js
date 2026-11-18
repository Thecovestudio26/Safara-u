// Jeu d'icônes maison : traits fins, terminaisons rondes, grille 24.
// Un seul fichier pour garantir des icônes vraiment homogènes.

const CHEMINS = {
  accueil: `<path d="M4 11.6 12 4.5l8 7.1"/><path d="M6.2 10.4V19.5h11.6V10.4"/>`,
  prieres: `<path d="M6 20.5V11a6 6 0 0 1 12 0v9.5"/><path d="M3.5 20.5h17"/>`,
  coran: `<path d="M12 6.4C10.2 5 7.8 4.4 5 4.4v13.2c2.8 0 5.2.6 7 2 1.8-1.4 4.2-2 7-2V4.4c-2.8 0-5.2.6-7 2Z"/><path d="M12 6.4v13.2"/>`,
  agenda: `<rect x="4" y="5.5" width="16" height="14" rx="1.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>`,
  taches: `<path d="m4.5 7 2 2 3-3M4.5 16l2 2 3-3"/><path d="M12.5 8h7M12.5 17h7"/>`,
  repas: `<path d="M6 3.5V10c0 1.6 1 2.6 2.2 2.6V20.5"/><path d="M8 3.5V9"/><path d="M16 20.5V3.5c1.9 2.8 2.4 6 2.4 8.5 0 2-.9 3.5-2.4 3.5"/>`,
  budget: `<path d="M15.5 8.3c-2.5-1.9-6-.8-6.9 1.9M15.5 15.7c-2.5 1.9-6 .8-6.9-1.9"/><path d="M7.7 10.2h6.4M7.7 13.8h6.4"/><circle cx="12" cy="12" r="8.4"/>`,
  dhikr: `<path d="M4.5 15.5C7 9.5 17 9.5 19.5 15.5"/><circle cx="7" cy="17.6" r="1"/><circle cx="12" cy="18.6" r="1"/><circle cx="17" cy="17.6" r="1"/>`,
  objectifs: `<circle cx="12" cy="12" r="8.2"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>`,
  bienetre: `<path d="M12 3.5c5.5 3.8 5.5 9.7 0 17-5.5-7.3-5.5-13.2 0-17Z"/><path d="M12 9v11.5"/>`,
  journal: `<path d="m4.5 19.5 1-3.6L16.6 4.8a1.9 1.9 0 0 1 2.7 2.7L8.1 18.6l-3.6 1Z"/><path d="m14.5 6.8 2.8 2.8"/>`,
  recettes: `<path d="M4 10h16"/><path d="M5.5 10a6.5 6 0 0 0 13 0"/><path d="M12 10V8.6"/><circle cx="12" cy="7.8" r=".4"/><path d="M14.5 3.4c.6 1 .6 1.8 0 2.6"/>`,
  defis: `<path d="M6 21V3.8"/><path d="M6 4.8c3-1.4 6 1.2 9 0 2-1 3-.8 3-.8v8.4s-1-.2-3 .8c-3 1.4-6-1.2-9 0"/>`,
  bienetreEffort: `<path d="M6.5 9.5h11M6.5 9.5 10 6m-3.5 3.5L10 13"/><circle cx="18" cy="9.5" r="2"/>`,
  reglages: `<path d="M4 8.2h9M17.5 8.2H20M4 15.8h4M12.5 15.8H20"/><circle cx="15" cy="8.2" r="2"/><circle cx="9" cy="15.8" r="2"/>`,
  plus: `<path d="M12 5.5v13M5.5 12h13"/>`,
  moins: `<path d="M5.5 12h13"/>`,
  croix: `<path d="M6 6l12 12M18 6 6 18"/>`,
  chevronG: `<path d="M14.5 5.5 8 12l6.5 6.5"/>`,
  chevronD: `<path d="M9.5 5.5 16 12l-6.5 6.5"/>`,
  flecheD: `<path d="M4.5 12h14"/><path d="m13.5 7 5 5-5 5"/>`,
  exporter: `<path d="M12 4v10"/><path d="m8.5 10.5 3.5 3.5 3.5-3.5"/><path d="M5 14.8v3.7h14v-3.7"/>`,
  importer: `<path d="M12 13.5V3.8"/><path d="m8.5 7.2 3.5-3.4 3.5 3.4"/><path d="M5 14.8v3.7h14v-3.7"/>`,
  eau: `<path d="M12 3.8C8.4 9 6.6 11.8 6.6 14.6a5.4 5.4 0 0 0 10.8 0c0-2.8-1.8-5.6-5.4-10.8Z"/>`,
  horloge: `<circle cx="12" cy="12" r="8.2"/><path d="M12 7.5V12l3.2 2"/>`,
  lieu: `<path d="M12 20.8s6.8-7 6.8-11.6a6.8 6.8 0 1 0-13.6 0C5.2 13.8 12 20.8 12 20.8Z"/><circle cx="12" cy="9" r="2.4"/>`,
  crayon: `<path d="m5 20 1-3.5L16.9 6.6a1.9 1.9 0 0 1 2.6 2.6L8.5 19l-3.5 1Z"/>`,
  poubelle: `<path d="M4.5 6.8h15M9.5 6.8V4h5v2.8M6.8 6.8l1 13.2h8.4l1-13.2M10 10.5v6M14 10.5v6"/>`,
  check: `<path d="m5 12.5 4.5 4.5L19 7.5"/>`,
  bloquee: `<circle cx="12" cy="12" r="8.2"/><path d="M8.5 8.5l7 7M15.5 8.5l-7 7"/>`,
};

export function icone(nom, taille = 20) {
  const chemins = CHEMINS[nom] || CHEMINS.bloquee;
  const dimension = `${taille}`;
  return (
    `<svg class="icone" width="${dimension}" height="${dimension}" viewBox="0 0 24 24"` +
    ` fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"` +
    ` stroke-linejoin="round" aria-hidden="true" focusable="false">${chemins}</svg>`
  );
}

// Logo : un cercle (l'unité) traversé par un arc (le lever du jour,
// rappel discret de la mihrab). Rien de plus : il doit rester lisible
// en 16 pixels sur une app comme imprimé sur un planner papier.
export function marqueSVG(taille = 26) {
  return (
    `<svg width="${taille}" height="${taille}" viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">` +
    `<circle cx="16" cy="16" r="12.4" stroke="#49352F" stroke-width="1.4"/>` +
    `<path d="M16 8.4a7.6 7.6 0 0 1 0 15.2" stroke="#B69A72" stroke-width="2.2" stroke-linecap="round"/>` +
    `</svg>`
  );
}
