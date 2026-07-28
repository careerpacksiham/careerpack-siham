# CareerPack Siham V2.6.0 — Logo officiel et parcours guidés

## Identité visuelle

- sélection du logo blanc/bleu/vert fourni dans la troisième proposition ;
- extraction de l’emblème bouclier + document + flèche pour conserver le nom CareerPack déjà présent dans l’interface ;
- intégration du logo dans le bandeau supérieur ;
- création d’un favicon et des icônes PWA 192 × 192 et 512 × 512 ;
- ajout des icônes au manifeste et au cache hors ligne.

Le sous-titre « Optimisateur de CV » du visuel source n’est pas repris dans le bandeau, car CareerPack produit aussi des lettres et des messages.

## Aide contextuelle

Ajout d’un bouton **Je ne sais pas par où commencer** sur l’accueil.

Six situations sont proposées :

1. employée épuisée par son travail ;
2. en poste et prête à changer ;
3. sans emploi avec besoin d’agir vite ;
4. reconversion professionnelle ;
5. reprise après une pause ;
6. candidature à un poste de direction.

Chaque situation possède :

- quatre étapes explicatives propres ;
- des contrôles adaptés au contexte ;
- une action finale cohérente : analyser une offre, préparer sans annonce, vérifier le profil ou reprendre un dossier ;
- des conseils contextuels affichés dans chacune des quatre étapes du générateur.

## Technique

- version applicative : `2.6.0` ;
- cache PWA : `careerpack-siham-v2-6-0-guided-help-logo` ;
- sauvegardes JSON exportées avec la version `2.6.0` ;
- aucune modification du contrat CareerBrain ou du Google Apps Script.
