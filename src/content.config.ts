import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Les articles du journal vivent en Markdown dans src/contenu/articles/,
// avec le CMS comme editeur. Le schema echoue au build si un champ manque,
// ce qui evite qu'une publication depuis /admin/ casse le site sans bruit.
const journal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/contenu/articles' }),
  schema: z.object({
    titre: z.string(),
    chapo: z.string(),
    date: z.date(),
    lecture: z.string(),
    motif: z.string(),
    brouillon: z.boolean().optional().default(false),
  }),
});

export const collections = { journal };
