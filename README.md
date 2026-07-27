# CareerPack Siham V2.3 — CV contrôlé

PWA de préparation de candidatures centrée sur la génération d’un CV professionnel, modifiable et exportable en A4.

## V2.3
- modèle Executive Signature aligné sur le CV étalon validé ;
- analyse d’offre avec fallback local ;
- adaptation contrôlée sans invention de dates, fonctions ou entreprises ;
- édition du titre, du résumé, des compétences, de la valeur ajoutée et des descriptions ;
- réorganisation et masquage des expériences ;
- contrôle qualité et couverture ATS ;
- ajustement automatique à une page ;
- sauvegarde locale et reprise des candidatures ;
- PWA hors ligne.

## Déploiement
Remplacer entièrement les fichiers du dépôt par le contenu de cette archive, puis laisser GitHub Pages reconstruire le site. Après déploiement, fermer et rouvrir la PWA pour charger le cache V2.3.

## IA
Le mode autonome fonctionne sans configuration. Pour Gemini, renseigner `AI_ENDPOINT` dans `config.js` et redéployer le Google Apps Script fourni dans `backend/google-apps-script`.
