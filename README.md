# Widget Tâche 13BK

Petit widget "post-it" (notes, tâches, rappels) à intégrer en iframe dans le tableau de bord GoHighLevel. Deux interfaces identiques mais indépendantes, une par personne :

- `/stephan` — thème bleu
- `/caroline` — thème rose

Chaque interface a sa propre liste (aucune donnée partagée entre les deux). Fonctionnalités : ajouter une note / tâche / rappel, sélecteur de date (aujourd'hui par défaut), texte en couleur, surlignage, cocher une tâche comme faite, supprimer.

## 1. Base de données (Supabase)

Le projet Supabase existant (`cqrbbndanoozuhpedfxp`) est déjà prêt à recevoir ce widget. Va dans **SQL Editor** sur https://supabase.com/dashboard/project/cqrbbndanoozuhpedfxp et exécute le contenu de [`supabase.sql`](./supabase.sql). Ça crée la table `widget_items` avec les policies nécessaires (le widget n'a pas d'authentification, donc les policies autorisent la clé publique "anon" à lire/écrire seulement dans cette table isolée).

## 2. Déploiement sur Vercel

1. Sur [vercel.com](https://vercel.com), "Add New Project" → importe le repo `widget-tache-13bk`.
2. Dans les "Environment Variables", ajoute :

   | Nom | Valeur |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://cqrbbndanoozuhpedfxp.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (la clé "anon/public" du projet Supabase, Project Settings → API) |

3. Déploie. Tu obtiens un domaine du genre `widget-tache-13bk.vercel.app`.
4. Les deux URLs à utiliser dans GHL sont :
   - `https://widget-tache-13bk.vercel.app/stephan`
   - `https://widget-tache-13bk.vercel.app/caroline`

## 3. Intégration dans GoHighLevel

Dans le dashboard GHL (`app.synccrm.ca`), ajoute un widget personnalisé de type iframe/HTML avec, pour chaque personne, un `<iframe>` pointant vers l'URL correspondante, par exemple :

```html
<iframe
  src="https://widget-tache-13bk.vercel.app/stephan"
  style="width:100%; min-height:600px; border:0;"
></iframe>
```

Répète avec `/caroline` pour le deuxième widget.

## Accès restreint à GHL

Le widget vérifie qu'il est bien chargé dans une iframe (et non visité directement) avant d'afficher son contenu, et un en-tête `Content-Security-Policy: frame-ancestors` limite les domaines autorisés à intégrer le widget à `synccrm.ca`. Si quelqu'un visite l'URL Vercel directement dans un navigateur, un message s'affiche à la place de l'interface. Attention : ce n'est pas une sécurité par authentification — un utilisateur techniquement outillé pourrait contourner cette protection. Elle empêche seulement un accès normal/accidentel hors GHL.

## Développement local

```bash
npm install
cp .env.local.example .env.local   # puis remplis les valeurs Supabase
npm run dev
```
