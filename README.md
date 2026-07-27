# CareerPack Siham V2.4 — Mobile utilisable

Version corrective fondée sur CareerPack V2.3.

## Apports V2.4

- aperçu A4 ajusté automatiquement à la largeur du téléphone ;
- inspection facultative à 100 % ;
- résultat en plein écran sur mobile ;
- six commandes regroupées dans un tiroir compact ;
- meilleure utilisation en portrait et en paysage ;
- détection du nom d’entreprise renforcée dans le navigateur et dans CareerBrain ;
- cache PWA renouvelé.

## Installation GitHub Pages

1. Conserver la valeur actuelle de `AI_ENDPOINT` dans l’ancien `config.js`.
2. Remplacer entièrement les fichiers applicatifs du dépôt par ceux de cette archive, en conservant `.git`, `.github` et éventuellement `CNAME`.
3. Reporter l’URL `/exec` dans le nouveau `config.js`.
4. Si Gemini est utilisé, remplacer `Code.gs` dans Google Apps Script puis créer une nouvelle version du déploiement Web.
5. Commit et push sur la branche `main`.
6. Après le déploiement, fermer puis rouvrir la PWA afin de charger le cache V2.4.

Aucune clé IA ne doit être enregistrée dans GitHub.
