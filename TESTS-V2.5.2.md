# Tests de validation — CareerPack Siham V2.5.2

## Vérifications statiques

- Syntaxe `assets/app.js` : valide avec Node.js 22.
- Syntaxe `service-worker.js` : valide avec Node.js 22.
- Syntaxe du Google Apps Script : valide après contrôle JavaScript.
- `manifest.webmanifest` : JSON valide.
- Archive finale : contrôle d’intégrité ZIP prévu avant livraison.

## Parcours fonctionnel automatisé

Scénario : candidature au poste de Directrice des opérations chez Royal Mansour Marrakech.

Résultats obtenus sur 360 × 740, 740 × 360 et 1280 × 720 :

- ouverture de l’écran profil ;
- ouverture du parcours d’analyse ;
- détection du poste : `Directrice des opérations` ;
- détection de l’entreprise : `Royal Mansour Marrakech` ;
- choix du secteur recommandé ;
- génération complète sans IA distante ;
- contrôle CV : une page A4 validée ;
- sélection manuelle de deux pages : deux pages A4 validées ;
- contrôle lettre : 209 mots, export autorisé ;
- tiroir mobile accessible en portrait et en paysage ;
- adaptation du message au canal WhatsApp ;
- aucune erreur JavaScript pendant ces parcours.

## Matrice de détection d’entreprise

Valeurs reconnues :

- `Royal Mansour Marrakech` ;
- `Mandarin Oriental Marrakech` ;
- `Fairmont Royal Palm Marrakech` ;
- `Selman Marrakech`.

Les lignes `Temps plein`, `CDI`, `Sur site`, `Marrakech, Maroc` ne sont pas retenues comme employeur.

## Profil et sauvegarde

Avec un stockage local simulé :

- modification et sauvegarde du titre du profil : validées ;
- création automatique d’une candidature enregistrée : validée ;
- génération fondée sur le profil local modifié : validée ;
- génération du HTML CV avec puces de phrases : validée ;
- génération du HTML lettre non vide : validée ;
- génération de deux pages distinctes : validée.

## Validation PDF

PDF produits avec Chromium headless à partir du moteur final :

- CV une page : 1 page, format A4 ;
- CV deux pages : 2 pages, format A4 ;
- lettre : 1 page, format A4.

## Contrôles terrain restant à effectuer après GitHub Pages

- conserver puis reporter l’`AI_ENDPOINT` existant ;
- mettre à jour le Google Apps Script si Gemini est utilisé ;
- vérifier la photo réelle après modification du cadrage ;
- générer une candidature réelle en portrait et en paysage ;
- exporter un CV d’une page, un CV de deux pages et une lettre ;
- fermer puis rouvrir la PWA ;
- exporter une sauvegarde JSON avant tout effacement manuel des données du site.
