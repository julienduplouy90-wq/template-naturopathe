// @ts-check
import { defineConfig } from 'astro/config';

// `base` doit correspondre au sous-chemin de publication.
// GitHub Pages sur un dépôt de projet : '/nom-du-depot/'. Domaine dédié : '/'.
export default defineConfig({
  // Renseigne par la variable de depot SITE_URL au moment du build.
  // La valeur de repli ne sert qu'en local : elle n'apparait sur aucune page
  // tant qu'on ne genere pas d'URL absolue.
  site: process.env.SITE_URL || 'http://localhost:4350',
  base: '/',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
