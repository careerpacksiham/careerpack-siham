# Tests CareerPack Siham V2.6.0

## Contrôles automatiques exécutés

- syntaxe JavaScript de `assets/app.js` validée avec Node.js ;
- syntaxe JavaScript du service worker validée ;
- manifeste PWA JSON valide ;
- aucun identifiant HTML dupliqué ;
- toutes les ressources du cache PWA existent ;
- équilibre des accolades CSS validé ;
- logo, favicon et icônes 192/512 présents ;
- références locales principales vérifiées.

## Matrice de l’aide contextuelle

Les six cas contiennent chacun quatre étapes :

- employée épuisée ;
- changement en étant en poste ;
- recherche urgente sans emploi ;
- reconversion ;
- reprise après une pause ;
- poste de direction.

Pour chaque cas, les éléments suivants sont vérifiés dans le code :

- titre et description ;
- quatre contenus progressifs ;
- liste d’actions concrètes ;
- conseil propre à chaque étape du générateur ;
- destination finale vers une fonction existante de CareerPack.

## Non-régression attendue au test terrain

À vérifier après déploiement GitHub Pages :

1. logo visible dans le bandeau sur ordinateur ;
2. emblème seul visible sur petit mobile ;
3. horloge toujours calée à droite ;
4. ouverture de **Je ne sais pas par où commencer** ;
5. déroulé complet du cas **Je suis épuisée par mon travail** ;
6. lancement d’une analyse d’offre depuis la dernière étape ;
7. présence du bandeau contextuel dans les étapes 1 à 4 ;
8. accès normal à Analyser une offre, Préparer sans annonce, Bibliothèque et Profil ;
9. PWA réinstallable avec la nouvelle icône ;
10. données locales et candidatures existantes conservées.
