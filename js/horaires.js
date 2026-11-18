// Horaires de prière calculés localement, à partir des coordonnées de la ville.
// Méthode répandue (angles fixes) : Fajr à 18° sous l'horizon, Icha à 17°,
// lever et coucher à 0,833°. Ce sont des valeurs indicatives ; pour la
// prière en groupe, on se réfère toujours aux horaires de sa mosquée.

export const villes = [
  { nom: "Paris",         lat: 48.8566, lng: 2.3522,  fuseau: 1,  heureEte: "europe" },
  { nom: "Marseille",     lat: 43.2965, lng: 5.3698,  fuseau: 1,  heureEte: "europe" },
  { nom: "Lyon",          lat: 45.7640, lng: 4.8357,  fuseau: 1,  heureEte: "europe" },
  { nom: "Lille",         lat: 50.6292, lng: 3.0573,  fuseau: 1,  heureEte: "europe" },
  { nom: "Bordeaux",      lat: 44.8378, lng: -0.5792, fuseau: 1,  heureEte: "europe" },
  { nom: "Toulouse",      lat: 43.6046, lng: 1.4442,  fuseau: 1,  heureEte: "europe" },
  { nom: "Strasbourg",    lat: 48.5734, lng: 7.7521,  fuseau: 1,  heureEte: "europe" },
  { nom: "Bruxelles",     lat: 50.8503, lng: 4.3517,  fuseau: 1,  heureEte: "europe" },
  { nom: "Genève",        lat: 46.2044, lng: 6.1432,  fuseau: 1,  heureEte: "europe" },
  { nom: "Londres",       lat: 51.5074, lng: -0.1278, fuseau: 0,  heureEte: "europe" },
  { nom: "Montréal",      lat: 45.5017, lng: -73.5673, fuseau: -5, heureEte: "nord" },
  { nom: "Le Caire",      lat: 30.0444, lng: 31.2357, fuseau: 2,  heureEte: null },
  { nom: "Casablanca",    lat: 33.5731, lng: -7.5898, fuseau: 0,  heureEte: null },
  { nom: "Rabat",         lat: 34.0209, lng: -6.8416, fuseau: 0,  heureEte: null },
  { nom: "Alger",         lat: 36.7538, lng: 3.0588,  fuseau: 1,  heureEte: null },
  { nom: "Tunis",         lat: 36.8065, lng: 10.1815, fuseau: 1,  heureEte: null },
  { nom: "Dakar",         lat: 14.7167, lng: -17.4677, fuseau: 0, heureEte: null },
  { nom: "Istanbul",      lat: 41.0082, lng: 28.9784, fuseau: 3,  heureEte: null },
  { nom: "Dubaï",         lat: 25.2048, lng: 55.2708, fuseau: 4,  heureEte: null },
  { nom: "Riyad",         lat: 24.7136, lng: 46.6753, fuseau: 3,  heureEte: null },
];

export const prieres = [
  { cle: "fajr",    nom: "Fajr",    arabe: "الفجر" },
  { cle: "dhouhr",  nom: "Dhouhr",  arabe: "الظهر" },
  { cle: "asr",     nom: "Asr",     arabe: "العصر" },
  { cle: "maghrib", nom: "Maghrib", arabe: "المغرب" },
  { cle: "icha",    nom: "Icha",    arabe: "العشاء" },
];

const enRadians = (deg) => deg * Math.PI / 180;
const enDegres = (rad) => rad * 180 / Math.PI;
const remise = (angle) => angle - Math.floor(angle / 360) * 360;

// Passage à l'heure d'été : dernier dimanche de mars au dernier
// dimanche d'octobre en Europe, deuxième dimanche de mars au premier
// dimanche de novembre en Amérique du Nord. On néglige les heures
// exactes de bascule, l'écart ne dépasse jamais une minute ici.
function dernierDimanche(annee, mois) {
  const finDuMois = new Date(annee, mois + 1, 0);
  return finDuMois.getDate() - finDuMois.getDay();
}

function heureEteEurope(date) {
  const a = date.getFullYear();
  const debut = new Date(a, 2, dernierDimanche(a, 2), 2);
  const fin = new Date(a, 9, dernierDimanche(a, 9), 3);
  return date >= debut && date < fin;
}

function heureEteNordamerique(date) {
  const a = date.getFullYear();
  const premierDimancheMars = 1 + ((7 - new Date(a, 2, 1).getDay()) % 7);
  const premierDimancheNov = 1 + ((7 - new Date(a, 10, 1).getDay()) % 7);
  return date >= new Date(a, 2, premierDimancheMars + 7, 2)
      && date < new Date(a, 10, premierDimancheNov, 2);
}

function decalage(ville, date) {
  if (ville.heureEte === "europe" && heureEteEurope(date)) return ville.fuseau + 1;
  if (ville.heureEte === "nord" && heureEteNordamerique(date)) return ville.fuseau + 1;
  return ville.fuseau;
}

export function calculeHoraires(date, ville) {
  const fuseau = decalage(ville, date);
  const j = date.getDate(), m = date.getMonth() + 1, a = date.getFullYear();

  // Date julienne (approximation suffisante, on reste sur des jours entiers)
  let annee = a, mois = m;
  if (m <= 2) { annee -= 1; mois += 12; }
  const siecle = Math.floor(annee / 100);
  const jj = Math.floor(365.25 * (annee + 4716))
           + Math.floor(30.6001 * (mois + 1))
           + j + 2 - siecle + Math.floor(siecle / 4) - 1524.5;
  const depuisJ2000 = jj - 2451545.0;

  const anomalie = remise(357.529 + 0.98560028 * depuisJ2000);
  const longitudeSoleil = remise(280.459 + 0.98564736 * depuisJ2000);
  const elliptique = remise(longitudeSoleil
      + 1.915 * Math.sin(enRadians(anomalie))
      + 0.020 * Math.sin(enRadians(2 * anomalie)));
  const obliquite = 23.439 - 0.00000036 * depuisJ2000;

  const ascension = remise(enDegres(Math.atan2(
      Math.cos(enRadians(obliquite)) * Math.sin(enRadians(elliptique)),
      Math.cos(enRadians(elliptique)))));
  let equation = longitudeSoleil / 15 - ascension / 15;
  if (equation > 12) equation -= 24;
  else if (equation < -12) equation += 24;

  const declinaison = enDegres(Math.asin(
      Math.sin(enRadians(obliquite)) * Math.sin(enRadians(elliptique))));

  const midi = 12 + fuseau - ville.lng / 15 - equation;

  // Écart horaire entre le midi vrai et un soleil à `angle` degrés sous
  // (ou au-dessus, si négatif) l'horizon.
  function ecart(angle) {
    const cosA = (-Math.sin(enRadians(angle))
        - Math.sin(enRadians(ville.lat)) * Math.sin(enRadians(declinaison)))
        / (Math.cos(enRadians(ville.lat)) * Math.cos(enRadians(declinaison)));
    if (cosA < -1 || cosA > 1) return NaN; // soleil qui ne descend jamais assez bas
    return enDegres(Math.acos(cosA)) / 15;
  }

  // Hauteur du soleil pour l'ombre de l'Asr (école majoritaire, ombre = 1)
  const hauteurAsr = enDegres(Math.atan(
      1 / (1 + Math.tan(enRadians(Math.abs(ville.lat - declinaison))))));
  const cosAsr = (Math.sin(enRadians(hauteurAsr))
      - Math.sin(enRadians(ville.lat)) * Math.sin(enRadians(declinaison)))
      / (Math.cos(enRadians(ville.lat)) * Math.cos(enRadians(declinaison)));
  const ecartAsr = (cosAsr < -1 || cosAsr > 1)
      ? NaN
      : enDegres(Math.acos(cosAsr)) / 15;

  const plie = (h) => isNaN(h) ? NaN : ((h % 24) + 24) % 24;

  return {
    fajr: plie(midi - ecart(18)),
    dhouhr: plie(midi),
    asr: plie(midi + ecartAsr),
    maghrib: plie(midi + ecart(0.833)),
    icha: plie(midi + ecart(17)),
  };
}

export function formatHeure(x) {
  if (isNaN(x)) return "--:--";
  let h = Math.floor(x);
  let mn = Math.round((x - h) * 60);
  if (mn === 60) { mn = 0; h += 1; }
  return `${String(h).padStart(2, "0")}:${String(mn).padStart(2, "0")}`;
}
