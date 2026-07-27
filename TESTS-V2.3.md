# Tests CareerPack V2.3

## Vérifications automatiques exécutées

- Syntaxe JavaScript : validée avec Node.js.
- Manifest PWA : JSON valide.
- Parcours complet sans IA : offre -> analyse -> secteur -> génération -> aperçu.
- Affichage accueil : 360 x 740, 740 x 360, 768 x 658 et 1280 x 720.
- Contrôle qualité CV : 100/100 sur le scénario de référence.
- Rendu A4 : une page, photo entière, aucun bloc coupé.
- Export PDF : document ouvrable, non chiffré, une page.
- Débordement volontaire : export bloqué lorsque le contenu ne tient plus.
- Fallback de sauvegarde : l’interface reste utilisable si le navigateur refuse le stockage local.

## Scénario de référence

Poste : Directrice des opérations.
Entreprise : Royal Atlas Marrakech.

Résultat :

- titre ciblé ;
- 70 mots dans le résumé exécutif ;
- 8 compétences vérifiées ;
- 5 expériences complètes ;
- 6 mots-clés sur 8 couverts ;
- une page A4 validée ;
- export autorisé.
