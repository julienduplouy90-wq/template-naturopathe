import { demo } from '../data/client.js';

// Tant que `demo` vaut true dans cabinet.json, le site entier est ferme aux
// robots : c'est le garde-fou qui evite qu'une praticienne fictive soit prise
// pour un vrai cabinet. L'espace d'edition reste ferme dans tous les cas.
export function GET() {
  const corps = demo
    ? ['User-agent: *', 'Disallow: /', ''].join('\n')
    : ['User-agent: *', 'Allow: /', 'Disallow: /admin/', ''].join('\n');

  return new Response(corps, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
