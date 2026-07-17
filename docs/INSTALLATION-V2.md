# CareerPack V2.0 — installation complète

## A. Mise à jour de la PWA

1. Sauvegardez le dépôt actuel.
2. Décompressez le ZIP V2 à la racine de `careerpack-siham` et acceptez les remplacements.
3. Testez localement :

```bash
cd ~/WebStorming/Projects/careerpack-siham
python3 -m http.server 8080
```

4. Ouvrez `http://localhost:8080`.
5. Testez d'abord en **Mode autonome** : coller une offre, analyser, choisir le secteur, générer, imprimer le CV et la lettre en PDF.

## B. Activer Gemini sans carte bancaire ni serveur personnel

CareerPack utilise un petit Web App Google Apps Script comme passerelle. La clé ne se trouve ni dans GitHub ni dans la PWA.

1. Ouvrez `https://script.google.com` avec le compte dédié.
2. Créez un **Nouveau projet** nommé `CareerPack Siham AI`.
3. Remplacez le contenu de `Code.gs` par celui fourni dans `backend/google-apps-script/Code.gs`.
4. Dans **Paramètres du projet → Propriétés du script**, ajoutez :
   - `GEMINI_API_KEY` = votre clé Gemini dédiée ;
   - `GEMINI_MODEL` = `gemini-2.5-flash` (ou un modèle disponible sur votre compte).
5. Cliquez **Déployer → Nouveau déploiement → Application Web**.
6. Paramètres :
   - Exécuter en tant que : **Moi** ;
   - Qui a accès : **Toute personne**.
7. Autorisez le script et copiez l'URL terminant par `/exec`.
8. Dans `config.js`, collez cette URL :

```js
AI_ENDPOINT: "https://script.google.com/macros/s/...../exec",
```

9. Rechargez CareerPack. Le badge doit afficher **IA connectée**.

## C. Publication GitHub

```bash
git add .
git commit -m "CareerPack V2.0 CareerBrain AI Generation"
git push origin main
```

GitHub Pages republie automatiquement la PWA. Le Service Worker V2 supprime l'ancien cache ; sur un téléphone déjà installé, la mise à jour apparaît au prochain chargement ou au redémarrage suivant de l'application.

## D. Génération PDF

Dans l'écran final :
- `Enregistrer le CV en PDF` ouvre l'impression A4 ; choisir **Enregistrer au format PDF** ;
- `Enregistrer la lettre en PDF` fait la même chose.

Cette méthode est locale, fonctionne sur PC et sur Android selon les capacités d'impression du navigateur, et ne transmet pas les documents à un service tiers.

## E. Résilience

Si Gemini, le modèle ou la passerelle ne répond pas :
- CareerPack bascule automatiquement vers CareerBrain local ;
- le parcours reste utilisable ;
- aucune erreur technique n'est montrée à Siham ;
- les quatre PDF premium restent disponibles dans la bibliothèque.
