# CareerPack Siham V2.1.5 — Stable Utilisable

## Priorité de cette version

Stabiliser l'écran d'accueil utilisé quotidiennement, sans ajouter de nouvelle fonction.

## Correction structurelle

- Suppression du bloc responsive V2.1.4 et de ses règles concurrentes.
- Une seule géométrie pour le bloc d'accueil.
- L'horloge reste visible mais devient un indicateur secondaire strictement plafonné.
- Dimensions de l'horloge :
  - ordinateur : 118 × 34 px ;
  - tablette : 108 × 30 px ;
  - mobile portrait : 96 × 26 px ;
  - mobile paysage : 102 × 28 px.
- Aucun agrandissement relatif de l'horloge avec `vw`, `clamp()` ou la hauteur d'écran.
- Le contenu principal reste immédiatement accessible en portrait et en paysage.
- Les actions restent en colonne sur mobile et en trois colonnes sur paysage bas.

## Cache PWA

Le cache est renouvelé sous l'identité `careerpack-siham-v2-1-5-stable`.

## Contrôles techniques

- syntaxe JavaScript validée avec Node.js ;
- équilibre syntaxique CSS contrôlé ;
- chemins des ressources principales contrôlés ;
- archive reconstruite depuis la version réellement déployée V2.1.4.
