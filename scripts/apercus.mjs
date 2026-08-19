// Fabrique un fichier autonome par identite, pour comparer les quatre univers
// sur la meme page d'accueil.
//
//   node scripts/apercus.mjs            les quatre
//   node scripts/apercus.mjs silex      une seule
//
// Chaque fichier embarque son CSS, ses polices et ses images : il s'ouvre
// n'importe ou, sans serveur.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const base = path.join(racine, 'src/layouts/Base.astro');
const dist = path.join(racine, 'dist');
const sortie = path.join(racine, 'apercus');

const IDENTITES = ['silex', 'seve', 'gres', 'chaume'];
const DEFAUT = 'silex'; // identite remise en place a la fin

const demandees = process.argv.slice(2).filter((a) => IDENTITES.includes(a));
const liste = demandees.length ? demandees : IDENTITES;

const poserIdentite = (nom) => {
  const src = fs.readFileSync(base, 'utf8');
  const suivant = src.replace(
    /import '\.\.\/styles\/identites\/[a-z]+\.css';/,
    `import '../styles/identites/${nom}.css';`,
  );
  if (suivant === src && !src.includes(`identites/${nom}.css`)) {
    throw new Error("ligne d'import d'identite introuvable dans Base.astro");
  }
  fs.writeFileSync(base, suivant);
};

const b64 = (p, mime) => `data:${mime};base64,${fs.readFileSync(p).toString('base64')}`;

const rendreAutonome = () => {
  let html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
  html = html.replace(/<link rel="stylesheet" href="([^"]+\.css)"\s*\/?>/g, (_, href) => {
    let css = fs.readFileSync(path.join(dist, href.replace(/^\//, '')), 'utf8');
    css = css.replace(/url\(\/?(_astro\/[^)"']+\.woff2)\)/g, (__, f) =>
      `url(${b64(path.join(dist, f), 'font/woff2')})`);
    return `<style>${css}</style>`;
  });
  html = html.replace(/src="\/?(images\/[^"]+\.svg)"/g, (_, f) =>
    `src="${b64(path.join(dist, f), 'image/svg+xml')}"`);
  return html;
};

fs.mkdirSync(sortie, { recursive: true });

for (const nom of liste) {
  poserIdentite(nom);
  execFileSync(process.execPath, ['./node_modules/astro/astro.js', 'build'], {
    cwd: racine,
    stdio: 'pipe',
  });
  const html = rendreAutonome();
  const cible = path.join(sortie, `apercu-${nom}.html`);
  fs.writeFileSync(cible, html);
  const restes = [...html.matchAll(/(?:src|href)="(\/_astro\/[^"]+|\/images\/[^"]+)"/g)];
  console.log(
    `${nom.padEnd(7)} ${String(Math.round(fs.statSync(cible).size / 1024)).padStart(4)} Ko` +
    (restes.length ? `  ATTENTION ${restes.length} reference(s) externe(s)` : '  autonome'),
  );
}

poserIdentite(DEFAUT);
console.log(`\nBase.astro remis sur « ${DEFAUT} ».`);
