# Installation CareerPack Siham V2.6.0

## 1. Sauvegarder la configuration IA

Avant de remplacer les fichiers, copier la valeur actuelle de :

```js
AI_ENDPOINT: "https://script.google.com/macros/s/.../exec"
```

dans l’ancien `config.js`.

Aucune clé Gemini ne doit être envoyée sur GitHub.

## 2. Remplacer les fichiers

1. Décompresser l’archive V2.6.0.
2. Dans le dépôt local CareerPack, conserver :
   - `.git/`
   - `.github/`
   - `CNAME`, s’il existe.
3. Remplacer tous les autres fichiers par ceux du package.

## 3. Restaurer l’endpoint

Reporter l’URL `/exec` dans le nouveau `config.js`.

La version doit rester :

```js
APP_VERSION: "2.6.0"
```

Le Google Apps Script n’a pas changé dans cette version. Il n’est pas nécessaire de le redéployer si celui de la V2.5.5 fonctionne déjà.

## 4. Envoyer sur GitHub

```bash
git add -A
git status
git commit -m "release: CareerPack Siham V2.6.0 parcours guides"
git push origin main
```

Attendre que le build et le déploiement GitHub Pages soient verts.

## 5. Charger la nouvelle PWA

1. Fermer complètement CareerPack.
2. Rouvrir l’adresse GitHub Pages en étant connecté.
3. Attendre quelques secondes.
4. Fermer puis rouvrir une seconde fois.

Le nouveau cache est :

```text
careerpack-siham-v2-6-0-guided-help-logo
```

## 6. Vérifications rapides

- le nouveau bouclier CareerPack apparaît dans l’en-tête ;
- l’horloge reste à l’extrémité droite ;
- le bouton **Je ne sais pas par où commencer** apparaît sous les trois actions ;
- six situations sont proposées ;
- le parcours « épuisée par le travail » comporte quatre étapes ;
- le bouton final ouvre bien l’analyse d’offre ;
- les dossiers existants sont toujours présents.

Effacer les données du site uniquement en dernier recours, car cette opération supprimerait les dossiers locaux non exportés.
