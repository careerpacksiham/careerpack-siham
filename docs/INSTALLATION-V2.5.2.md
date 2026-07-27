# Installation CareerPack Siham V2.5.2

## 1. Sauvegarde avant mise à jour

Dans la version actuellement en ligne :

1. ouvrir **Consulter mes dossiers** ;
2. utiliser **Exporter une sauvegarde** si cette commande est déjà disponible ;
3. conserver la valeur `AI_ENDPOINT` de l’ancien `config.js`.

## 2. Remplacement des fichiers

Décompresser l’archive puis recopier son contenu à la racine du dépôt GitHub Pages.

Ne pas supprimer :

- `.git/` ;
- `.github/` ;
- `CNAME`, lorsqu’il existe.

## 3. Configuration IA

Dans `config.js`, remettre l’URL du Web App Google Apps Script :

```js
window.CAREERPACK_CONFIG = {
  AI_ENDPOINT: "https://script.google.com/macros/s/.../exec",
  AI_TIMEOUT_MS: 35000,
  APP_VERSION: "2.5.2"
};
```

La clé Gemini reste dans les propriétés du Google Apps Script et ne doit jamais apparaître dans GitHub.

## 4. Mise à jour Google Apps Script

Lorsque Gemini est utilisé :

1. ouvrir le projet Google Apps Script existant ;
2. remplacer `Code.gs` par `backend/google-apps-script/Code.gs` ;
3. créer une nouvelle version du déploiement Web ;
4. vérifier que l’URL `/exec` reste correcte dans `config.js`.

## 5. Git

```bash
git add -A
git status
git commit -m "release: CareerPack Siham V2.5.2 edition finale figee"
git push origin main
```

## 6. Après déploiement

1. vérifier que GitHub Actions affiche `build` et `deploy` en vert ;
2. fermer entièrement CareerPack ;
3. rouvrir la PWA avec une connexion active ;
4. attendre quelques secondes ;
5. fermer puis rouvrir une seconde fois si l’ancien cache reste visible.

## 7. Validation minimale

- ouvrir **Mon profil** ;
- vérifier la photo et les coordonnées ;
- analyser une annonce réelle ;
- confirmer entreprise et poste ;
- générer le dossier ;
- contrôler le CV en portrait et en paysage ;
- tester une page et deux pages ;
- exporter le CV et la lettre ;
- fermer puis rouvrir la candidature depuis la bibliothèque ;
- exporter une sauvegarde JSON.
