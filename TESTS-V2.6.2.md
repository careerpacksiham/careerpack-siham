# Tests CareerPack Siham V2.6.2

## Contrôles statiques exécutés
- syntaxe JavaScript de `assets/app.js`, `config.js` et `service-worker.js` ;
- endpoint central présent une seule fois dans `config.js` ;
- aucune clé fournisseur dans les sources ;
- cache PWA et numéros de version cohérents ;
- contrat client Gateway exécuté avec réponses simulées : succès distant, métadonnées, payload `analyze`, puis erreur 502 et fallback local ;
- archive ZIP testée après construction.

## Limite du laboratoire
Le navigateur Chromium du conteneur bloque administrativement les navigations locales. Le parcours DOM complet n’a donc pas pu être automatisé ici. La recette réelle GitHub Pages → `ai.o-k.ma` reste obligatoire avant le tag final.

## Recette de clôture sur GitHub Pages
1. Ouvrir CareerPack et vérifier le badge **IA centralisée**.
2. Coller une offre complète et lancer **Analyser l’offre**.
3. Vérifier l’apparition temporaire de **IA · fournisseur**.
4. Générer le CV, la lettre et le message.
5. Vérifier dans AI Gateway Central : requête réussie, action, modèle, latence et tokens.
6. Rendre temporairement la première route indisponible et confirmer la bascule vers une autre route.
7. Tester enfin le secours local en coupant momentanément l’endpoint dans une copie locale, sans toucher à la version publiée.

## Critère de gel
La branche Siham est clôturée lorsque les actions `analyze` et `generate` réussissent depuis GitHub Pages et qu’un fallback réel a été observé sans perte de dossier.

## Contrôle visuel de finition — 02/08/2026
- crédits affichés sur deux lignes distinctes ;
- police réduite et teinte gris clair ;
- séparation visuelle avec le bandeau de confiance ;
- rendu contrôlé en largeur bureau et mobile ;
- nouveau cache PWA détectable après redéploiement.
