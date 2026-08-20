# Mettre un site en ligne

Procédure à suivre pour chaque nouveau site client. La partie **A** est à refaire à chaque fois,
la partie **B** une seule fois pour toute l'agence.

---

## A. Publier le site chez Hostinger

### 1. Créer le site (hPanel)

`Sites web` → `Ajouter un site web` → domaine temporaire. Hostinger fournit une adresse en
`xxxxx.hostingersite.com`. Pour un vrai client, utiliser son domaine à la place.

### 2. Créer un compte FTP (hPanel)

`Fichiers` → `Comptes FTP`. Noter l'hôte, l'identifiant, le mot de passe et le dossier racine
(en général `/public_html`).

### 3. Renseigner le dépôt GitHub

`Settings` → `Secrets and variables` → `Actions`.

Onglet **Secrets** :

| Nom | Valeur |
|---|---|
| `HOSTINGER_FTP_HOTE` | l'hôte FTP |
| `HOSTINGER_FTP_UTILISATEUR` | l'identifiant |
| `HOSTINGER_FTP_MOTDEPASSE` | le mot de passe |
| `HOSTINGER_FTP_DOSSIER` | `/public_html/` |

Onglet **Variables** :

| Nom | Valeur |
|---|---|
| `SITE_URL` | l'adresse publique, par exemple `https://xxxxx.hostingersite.com` |

`SITE_URL` n'est pas un secret : elle sert à calculer les URL canoniques et `og:url`.

### 4. Publier

`Actions` → `Déploiement Hostinger` → `Run workflow`. Tant que les secrets manquent, le workflow
construit le site et saute l'envoi avec un message explicite, au lieu d'échouer.

### 5. Vérifier

- Les pages répondent, y compris `/consultation/` et `/journal/petit-dejeuner/`.
- Une adresse inexistante tombe sur la page 404 du site, pas sur celle d'Apache.
- Le `http://` bascule en `https://` sans boucler.
- `/robots.txt` interdit tout tant que `demo` vaut `true` dans le CMS.
- `/admin/` affiche l'écran de connexion.

---

## B. L'authentification du CMS, une fois pour l'agence

Le même authentificateur sert tous les sites clients. À monter une seule fois, puis à réutiliser
en recopiant une ligne.

**L'ordre compte** : le worker d'abord, l'application OAuth ensuite, parce que l'URL de rappel de
l'application dépend de l'adresse du worker.

### 1. Déployer le worker

[`sveltia/sveltia-cms-auth`](https://github.com/sveltia/sveltia-cms-auth), gratuit sur Cloudflare
Workers. Bouton « Deploy » du dépôt, ou `wrangler deploy` en local. Cloudflare renvoie une adresse
du type `https://sveltia-cms-auth.julien-duplouy90.workers.dev`.

Un domaine personnalisé, par exemple `auth.elyostudio.fr`, est facultatif. Il rend l'écran de
connexion plus rassurant pour une cliente et permet de changer d'hébergeur du worker sans toucher
aux sites.

### 2. Créer l'application OAuth GitHub

<https://github.com/settings/applications/new>, sur le compte de l'agence.

- **Authorization callback URL** : l'adresse du worker suivie de `/callback`.
- Récupérer l'**identifiant client** et générer un **secret client**.

### 3. Renseigner le worker

Passer par la ligne de commande plutôt que par le tableau de bord : c'est vérifiable, et le
tableau de bord perd silencieusement une variable de temps en temps.

```bash
npx wrangler versions secret put GITHUB_CLIENT_ID --name sveltia-cms-auth
npx wrangler versions secret put GITHUB_CLIENT_SECRET --name sveltia-cms-auth
npx wrangler versions secret put ALLOWED_DOMAINS --name sveltia-cms-auth
```

Chaque commande demande la valeur, puis **crée une version sans la publier**. Il faut ensuite
déployer la dernière :

```bash
npx wrangler versions deploy --name sveltia-cms-auth
```

Pièges rencontrés :

- `wrangler secret put` (sans `versions`) échoue quand une version non déployée traîne. Utiliser
  `wrangler versions secret put`, toujours.
- Une variable ajoutée dans le tableau de bord **peut ne pas être enregistrée** sans message
  d'erreur. Vérifier avec `npx wrangler secret list --name sveltia-cms-auth`, qui doit lister les
  trois noms.

`ALLOWED_DOMAINS` est le garde-fou : sans lui, n'importe quel site pourrait se servir de ton
authentificateur sous ton application OAuth. Valeur actuelle :

```
localhost,*.elyostudio.fr,naturo-template-dhq.pages.dev,*.naturo-template-dhq.pages.dev
```

**Y ajouter chaque nouveau domaine client**, sinon la connexion est refusée avec
`UNSUPPORTED_DOMAIN`. Ne jamais y mettre `*.hostingersite.com` : ça ouvrirait l'authentificateur à
tous les clients d'Hostinger.

### Vérifier le worker sans navigateur

```bash
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" \
  "https://sveltia-cms-auth.julien-duplouy90.workers.dev/auth?provider=github&site_id=localhost"
```

Un `302` vers `github.com/login/oauth/authorize` signifie que tout est en place. Un `200` cache une
erreur dans le corps de la réponse : `MISCONFIGURED_CLIENT` pour des identifiants absents,
`UNSUPPORTED_DOMAIN` pour un domaine hors liste.

### 4. Brancher le site

Dans `public/admin/config.yml`, sous `backend` :

```yaml
base_url: https://sveltia-cms-auth.julien-duplouy90.workers.dev
```

C'est la seule ligne à recopier dans chaque nouveau site client.

### 5. Donner l'accès à la cliente

1. Elle crée un compte GitHub gratuit.
2. L'inviter en collaboratrice sur **son dépôt à elle** uniquement.
3. Lui envoyer [le guide](guide-cliente.md), après y avoir mis son adresse et son nom.

---

## Recetter le CMS sans rien installer

`npm run dev`, puis `http://localhost:4350/admin/index.html` dans Chrome ou Edge, et
« Travailler avec un dépôt local » en désignant ce dossier. Sveltia écrit directement dans les
fichiers, sans jeton ni worker. C'est la façon de vérifier les six sections avant de livrer.

En développement, `/admin/` renvoie 404 : le serveur Astro ne résout pas les dossiers, il faut
`/admin/index.html`. En ligne, Apache s'en charge et `/admin/` fonctionne.

---

## Publication actuelle : Cloudflare Pages

Le site de démonstration est en ligne sur **<https://naturo-template-dhq.pages.dev>**, publié
depuis le compte Cloudflare de l'agence. C'est une solution de domaine temporaire qui ne demande
ni FTP ni hPanel.

Republier après une modification :

```bash
SITE_URL=https://naturo-template-dhq.pages.dev npm run build
npx wrangler pages deploy dist --project-name naturo-template --branch main --commit-dirty=true
```

Cloudflare Pages sert nativement `404.html` avec le bon code de statut et force le HTTPS : le
`.htaccess` du dossier `public/` ne sert que sur Hostinger, il est simplement ignoré ici.

Le domaine est déclaré dans `ALLOWED_DOMAINS` du worker, apex et sous-domaines, pour que les
déploiements de prévisualisation acceptent aussi la connexion au CMS.

La bascule vers Hostinger reste possible sans rien changer au dépôt : créer le site et le compte
FTP dans hPanel, poser les quatre secrets, et le workflow prend le relais.
