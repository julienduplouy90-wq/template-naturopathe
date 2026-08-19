const format = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function dateLisible(date) {
  return format.format(date instanceof Date ? date : new Date(date));
}

export function dateIso(date) {
  return (date instanceof Date ? date : new Date(date)).toISOString().slice(0, 10);
}
