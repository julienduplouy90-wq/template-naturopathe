# Template naturopathe — ElyoStudio

Squelette Astro pour les sites de naturopathes du Pack Visibilité. Le site est identique d'une
cliente à l'autre ; seuls changent **un fichier de données** et **un fichier d'identité**.

Démonstration en cours : Léa Cazaux, praticienne **fictive** à Juillan (65).

## Lancer

```bash
npm install
npm run dev
```

Aperçu sur `http://localhost:4350` (entrée `naturo-template` dans `.claude/launch.json`).

## Décliner sur une nouvelle cliente

1. **`src/data/client.js`** — la seule source de vérité. Nom, initiales (elles génèrent le
   monogramme, il n'y a pas de fichier de logo), coordonnées, horaires, tarifs, motifs, parcours,
   témoignages. Tous les champs marqués `REMPLACER` doivent changer.
2. **`src/layouts/Base.astro`** — l'import de l'identité, juste après celui du socle. Quatre univers
   disponibles : `silex`, `seve`, `gres`, `chaume`. Une identité ne définit que des variables et ses
   `@font-face`, jamais de règle. **L'ordre compte** : l'identité doit être importée *après* le
   socle, sinon ses rayons et son corps de texte sont écrasés par les valeurs par défaut.
3. **`public/images/`** — remplacer les deux SVG d'attente par les photos de la cliente. Le
   traitement (recadrage, voile chaud, désaturation, arrondi, inclinaison) est appliqué par la
   classe `.photo` : trois photos prises au téléphone suffisent, elles ressortent cohérentes.
4. **`contact.agenda`** — l'URL TidyCal ou Calendly. Tant que le champ est vide, tous les boutons
   de rendez-vous basculent sur `/contact/`.
5. **`demo`** — repasser à `false` retire le `noindex` et la mention de démonstration du pied de
   page. À ne faire qu'une fois les données réelles en place.
6. **`astro.config.mjs`** — `base` doit valoir `/nom-du-depot/` pour GitHub Pages sur un dépôt de
   projet, `/` pour un domaine dédié. Tous les liens passent par `lien()`, donc le sous-chemin est
   géré automatiquement.

Compter deux heures, photos comprises.

## Les quatre identités

Même squelette, même code, même rythme. Seuls changent les variables, les deux polices et la
matière. Chaque identité embarque ses propres `@font-face`, donc **un site ne télécharge que les
polices de son identité**.

| Identité | Dominante | Accent | Display / Texte | Rayons | Pour qui |
|---|---|---|---|---|---|
| `silex` | bleu ardoise `#1B2830` | orange brûlé `#A4471A` | Erode / Supreme | 16 / 22 px | factuel, sportifs, praticienne qui veut être prise au sérieux |
| `seve` | vert forêt `#16352B` | ambre `#8C5210` | Sentient / Switzer | 20 / 28 px | polyvalent, terrain, plantes |
| `gres` | brun chaud `#35251E` | vert amande `#59653A` | Boska / General Sans | 24 / 32 px | périnatalité, cycle féminin, registre enveloppant |
| `chaume` | prune `#33232F` | prune `#7A3A5C` | Zodiak / Switzer | 18 / 24 px | seniors, prévention. Seule identité qui relève le corps de texte à 1,13 rem |

Pour comparer les quatre sur la même page d'accueil :

```bash
node scripts/apercus.mjs
```

Le script écrit un fichier autonome par identité dans `apercus/` (CSS, polices et images
embarqués, aucune requête externe) puis remet `Base.astro` sur `silex`.

## Les pages

Seize routes : accueil, la consultation, ce que j'accompagne (plus une page par motif), qui je
suis, tarifs, journal (plus trois articles), contact, mentions légales, confidentialité, 404.

Les trois articles du journal sont dans `src/data/articles.js`, sous forme de HTML rendu dans un
conteneur `.prose`. Ce sont des modèles réutilisables, un par motif.

## Le CMS

L'espace d'édition est sur **`/admin/`** (en développement : `/admin/index.html`, le serveur Astro
ne résout pas les dossiers). Il tourne sur **Sveltia CMS 0.193.1, auto-hébergé et épinglé** dans
`public/admin/sveltia-cms.js` : pas de CDN, donc pas de mise à jour surprise qui casse l'édition
chez une cliente.

### La connexion

Le CMS est destiné aux clientes. Elles cliquent sur **« Se connecter avec GitHub »** et ne voient
jamais de jeton. Cela demande une infrastructure d'authentification, **à installer une seule fois
pour toute l'agence** puis réutilisée par tous les sites clients.

**Le montage, une fois pour toutes :**

1. **Une application OAuth GitHub**, sur le compte de l'agence :
   `Settings` → `Developer settings` → `OAuth Apps` → `New OAuth App`.
   URL de rappel : `https://auth.elyostudio.fr/callback` (l'adresse du worker ci-dessous).
   Garder l'identifiant client et le secret client.
2. **L'authentificateur** [`sveltia/sveltia-cms-auth`](https://github.com/sveltia/sveltia-cms-auth),
   un worker Cloudflare gratuit. Le déployer, y déclarer `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
   et `ALLOWED_DOMAINS`, puis lui donner un sous-domaine stable, par exemple `auth.elyostudio.fr`.
3. **Décommenter `base_url`** dans `public/admin/config.yml`. C'est la seule ligne à recopier dans
   chaque nouveau site client.

Tant que `base_url` est absent, seule la connexion par jeton personnel fonctionne : pratique pour
toi, inutilisable par une cliente. Le jeton à utiliser est un **fine-grained token** limité au seul
dépôt du site, permission `Contents: Read and write`, jamais un jeton classique de portée `repo`.

**Pour travailler sans aucun identifiant** (recette et démonstration) : `npm run dev`, puis ouvrir
`http://localhost:4350/admin/index.html` dans Chrome ou Edge et cliquer sur « Travailler avec un
dépôt local ». Sveltia passe par l'API File System Access du navigateur, il n'y a pas de serveur
mandataire à lancer.

**L'accès de la cliente.** Le CMS écrit dans le dépôt GitHub de son site. Il lui faut donc un
compte GitHub gratuit, invité en collaboratrice sur son dépôt à elle. C'est une inscription de cinq
minutes, à faire au moment de la livraison, et c'est le seul point de friction du dispositif : avec
un CMS adossé à git, il n'y a pas de contournement. En échange, elle n'a ni base de données à
sauvegarder, ni extension à mettre à jour, ni surface d'attaque.

`ALLOWED_DOMAINS` du worker doit lister les domaines autorisés à s'authentifier. Y ajouter chaque
nouveau site client, sinon le bouton renvoie une erreur.

**Ce qu'elle peut modifier** : les articles du journal, les pages de motif, les informations du
cabinet, les textes de l'accueil, les tarifs, les témoignages. **Ce qu'elle ne peut pas casser** :
la navigation, la mise en page, les identités, le code.

**Le circuit.** Elle enregistre → le CMS commite sur `main` → GitHub Actions reconstruit → le site
part chez Hostinger. Compter deux à trois minutes.

### Où vit le contenu

| Fichier | Contenu |
|---|---|
| `src/contenu/cabinet.json` | Coordonnées, horaires, formation, zone, drapeau `demo` |
| `src/contenu/accueil.json` | Tous les textes de l'accueil, le bilan, les limites, le parcours |
| `src/contenu/tarifs.json` | Prestations et modalités de règlement |
| `src/contenu/temoignages.json` | Les avis, avec un drapeau « afficher sur l'accueil » |
| `src/contenu/motifs/*.json` | Un fichier par motif. **Le nom du fichier fait l'adresse de la page** |
| `src/contenu/articles/*.md` | Un fichier par article, texte en Markdown |

`src/data/client.js` ne fait que relire ces fichiers et les exposer aux pages. Rien n'y est écrit
en dur : pour changer un texte, passer par le CMS ou par `src/contenu/`.

Le schéma des articles est validé au build (`src/content.config.ts`) : une publication à laquelle
il manque un champ fait échouer la construction plutôt que de casser le site en silence.

## Le déploiement

GitHub Actions construit le site à chaque poussée sur `main` et l'envoie chez Hostinger en FTPS
(`.github/workflows/deploiement.yml`).

**Côté Hostinger (hPanel), une seule fois :**

1. Créer le site sur le domaine temporaire (`Sites web` → `Ajouter un site web`). Hostinger donne
   une adresse en `*.hostingersite.com`.
2. `Fichiers` → `Comptes FTP` : créer un utilisateur FTP et noter l'hôte, l'identifiant et le
   dossier racine (en général `/public_html`).

**Côté GitHub, une seule fois :** `Settings` → `Secrets and variables` → `Actions`, ajouter les
quatre secrets `HOSTINGER_FTP_HOTE`, `HOSTINGER_FTP_UTILISATEUR`, `HOSTINGER_FTP_MOTDEPASSE`,
`HOSTINGER_FTP_DOSSIER`.

Tant que ces secrets n'existent pas, le workflow construit le site et **saute l'envoi** avec un
message explicite, au lieu d'échouer.

Le site est un ensemble de fichiers statiques : aucun PHP, aucune base de données, rien à
configurer sur le serveur.

## Ce qui structure le design

- **La fiche du bilan de vitalité**, dans le hero, est l'élément signature. Elle répond
  immédiatement à « qu'est-ce que je paie 75 € », et elle ne dépend d'aucune photo.
- **Les yeux de section sont des questions** (« Qu'est-ce qui vous amène ? »), pas des étiquettes.
  La naturopathie commence par une heure et demie de questions : la structure le dit.
- **La seule numérotation du site** est celle du parcours en quatre étapes, parce que l'ordre y
  porte une information. Ne pas numéroter ailleurs.
- **Le panneau sombre du parcours** est la seule grande surface en `--encre` du corps de page.
  C'est le point de bascule visuel : en ajouter un second l'affaiblit.

## Garde-fous techniques

- Contraste vérifié à 4,5:1 minimum sur tout le texte, sur les seize pages et dans les quatre
  identités. `--accent` ne passe pas sur les cartes teintées : utiliser `--accent-fonce`. Une
  section entièrement teintée bascule la variable d'un coup
  (`--accent: var(--accent-fonce)`), comme le fait `EnTetePage` quand on lui passe une teinte.
- Sans JavaScript, aucun contenu n'est masqué (`html:not(.js)`).
- `prefers-reduced-motion` neutralise la séquence d'ouverture, les apparitions et l'inclinaison
  des photos.
- Le menu mobile est fermé par le CSS, pas par un attribut posé au chargement.
- Polices Erode et Supreme auto-hébergées (Fontshare, licence commerciale gratuite) : aucune
  requête externe, aucun coût par client.

## Contenu de démonstration

Léa Cazaux n'existe pas. Le nom, l'adresse, le téléphone, le SIRET, la formation, les tarifs et
les témoignages sont des marqueurs, et `demo = true` maintient le site en `noindex, nofollow`.
La voix, le positionnement et les règles de rédaction viennent des compétences du dépôt
`lea-cazaux-naturopathe` (`.claude/skills/`) : voix, anti-IA, persona, témoignages.
