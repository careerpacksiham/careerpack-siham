# CareerPack Siham V2.5.4 — Édition finale figée

PWA de préparation de candidatures personnalisée pour Siham Felchou.

Cette version clôture le cycle fonctionnel de l’édition Siham. Elle regroupe l’analyse d’offre, CareerBrain, le CV contrôlé, la lettre, le message, le profil local, la bibliothèque, la sauvegarde et l’utilisation mobile.

## Fonctions principales

- analyse d’une annonce avec fallback autonome ;
- détection et confirmation de l’entreprise et du poste ;
- choix parmi quatre positionnements métier ;
- génération d’un CV modifiable fondé sur le profil validé ;
- contrôle qualité et couverture ATS ;
- CV automatique, une page ou deux pages ;
- descriptions d’expériences affichées en phrases et puces lisibles ;
- lettre modifiable, contrôlée et exportable en A4 ;
- message adapté à Email, LinkedIn ou WhatsApp ;
- profil professionnel et cadrage photo modifiables localement ;
- candidatures enregistrées et rouvertes ;
- historique des exports ;
- sauvegarde et restauration JSON ;
- PWA hors ligne, responsive portrait et paysage.

## Installation sur GitHub Pages

1. Sauvegarder la valeur actuelle de `AI_ENDPOINT` dans l’ancien `config.js`.
2. Décompresser l’archive.
3. Remplacer les fichiers applicatifs du dépôt par le contenu décompressé, en conservant `.git`, `.github` et éventuellement `CNAME`.
4. Reporter l’URL Google Apps Script `/exec` dans le nouveau `config.js`.
5. Si Gemini est utilisé, remplacer `backend/google-apps-script/Code.gs` dans le projet Google Apps Script, puis créer une nouvelle version du déploiement Web.
6. Commit et push sur la branche `main`.
7. Attendre la fin du déploiement GitHub Pages.
8. Fermer complètement la PWA puis la rouvrir pour charger le cache V2.5.4.

Aucune clé IA ne doit être enregistrée dans GitHub.

## Protection des données

Les données sont conservées dans le navigateur de l’appareil. Avant d’effacer les données du site ou de désinstaller la PWA, ouvrir la bibliothèque et utiliser **Exporter une sauvegarde**.

Une mise à jour normale des fichiers GitHub Pages et du cache PWA ne supprime pas le stockage local.

## Documentation

- `CHANGELOG-V2.5.4.md` : correctif final de positionnement de l’horloge ;
- `TESTS-V2.5.4.md` : validations du bandeau et des tailles d’écran ;
- `CHANGELOG-V2.5.2.md` et `TESTS-V2.5.2.md` : consolidation fonctionnelle précédente ;
- `EDITION-FIGEE.md` : règles de maintenance après clôture ;
- `docs/INSTALLATION-V2.5.4.md` : procédure de déploiement détaillée.


## Correctif V2.5.4

L’horloge est intégrée au bandeau supérieur, juste à gauche de « Mon profil ». Le bloc de bienvenue est libéré de toute hauteur ou colonne réservée à l’heure.

## V2.5.4 — Correctif photo
La photo d'accueil conserve désormais strictement son ratio carré sur tous les formats d'écran. Aucun étirement horizontal n'est possible.
