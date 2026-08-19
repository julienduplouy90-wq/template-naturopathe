// @ts-check
import { defineConfig } from 'astro/config';

// `base` doit correspondre au sous-chemin de publication.
// GitHub Pages sur un dépôt de projet : '/nom-du-depot/'. Domaine dédié : '/'.
export default defineConfig({
  site: 'https://julienduplouy90-wq.github.io',
  base: '/',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
