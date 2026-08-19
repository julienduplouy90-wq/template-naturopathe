// ---------------------------------------------------------------------------
// ADAPTATEUR DE CONTENU
//
// Le contenu ne vit plus ici : il est dans `src/contenu/`, en JSON et en
// Markdown, pour que le CMS (/admin/) puisse l'editer. Ce fichier se contente
// de le relire et de l'exposer aux pages, plus quelques aides de lien.
//
// Ne rien ecrire en dur ici. Pour changer un texte, passer par le CMS ou par
// les fichiers de `src/contenu/`.
//
// DEMONSTRATION : Lea Cazaux est une praticienne fictive. Tant que
// `demo` vaut true dans cabinet.json, le site reste en noindex et affiche la
// mention « site de demonstration ».
// ---------------------------------------------------------------------------

import cabinet from '../contenu/cabinet.json';
import accueilJson from '../contenu/accueil.json';
import tarifsJson from '../contenu/tarifs.json';
import temoignagesJson from '../contenu/temoignages.json';

export const identite = cabinet.identite;
export const contact = cabinet.contact;
export const horaires = cabinet.horaires;
export const delaiReponse = cabinet.delaiReponse;
export const formation = cabinet.formation;
export const zone = cabinet.zone;
export const demo = cabinet.demo;

export const accueil = accueilJson;
export const bilan = accueilJson.bilan;
export const limites = accueilJson.limites;
export const parcours = accueilJson.parcours;

export const prestations = tarifsJson.prestations;
export const paiement = tarifsJson.paiement;

export const temoignages = temoignagesJson.liste;

// Un fichier par motif, pour que le CMS les traite comme des entrees
// separees. `ordre` fixe l'affichage, pas le nom du fichier.
// Le slug vient du NOM DU FICHIER, pas d'un champ : un motif cree depuis le
// CMS ne peut donc pas avoir une URL differente de son fichier.
const fichiersMotifs = import.meta.glob('../contenu/motifs/*.json', { eager: true });
export const motifs = Object.entries(fichiersMotifs)
  .map(([chemin, module]) => ({
    ...(module.default ?? module),
    slug: chemin.split('/').pop().replace(/\.json$/, ''),
  }))
  .sort((a, b) => (a.ordre ?? 99) - (b.ordre ?? 99));

// La navigation reste dans le code : elle depend des pages qui existent,
// pas du contenu, et une cliente n'a pas a pouvoir la casser.
export const navigation = [
  { libelle: 'La consultation', href: 'consultation/' },
  { libelle: 'Ce que j’accompagne', href: 'accompagnement/' },
  { libelle: 'Qui je suis', href: 'qui-je-suis/' },
  { libelle: 'Tarifs', href: 'tarifs/' },
  { libelle: 'Journal', href: 'journal/' },
];

// Construit une URL respectant le `base` d'Astro (sous-chemin eventuel).
export function lien(chemin = '') {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${String(chemin).replace(/^\//, '')}`;
}

// Bouton principal : agenda externe si renseigne, page contact sinon.
export function lienRdv() {
  return contact.agenda || lien('contact/');
}
