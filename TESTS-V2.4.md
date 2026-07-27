# Tests de validation — CareerPack V2.4

## Mobile portrait

- Ouvrir une candidature jusqu’au résultat.
- Vérifier que la totalité de la largeur du CV est visible dans l’aperçu réduit.
- Vérifier qu’aucun texte n’est coupé à droite.
- Ouvrir puis refermer « Actions du dossier ».
- Vérifier que le tiroir n’occupe pas l’écran lorsqu’il est fermé.

## Mobile paysage

- Vérifier que l’aperçu reste ajusté à la largeur.
- Vérifier que le tiroir d’actions reste accessible sans masquer durablement le document.

## Aperçu

- Appuyer sur « Voir à 100 % » : le document doit repasser en dimensions A4 et devenir navigable horizontalement.
- Appuyer sur « Ajuster à la largeur » : la page entière doit revenir dans la largeur disponible.

## Analyse d’offre

Tester une offre contenant successivement :
- le nom de l’entreprise ;
- « Temps plein » ;
- « CDI » ;
- une localisation ;
- un salaire.

Le champ entreprise ne doit jamais reprendre ces métadonnées. Si le nom est incertain, CareerPack doit laisser le champ vide et permettre sa saisie manuelle.

## Non-régression

- génération du CV ;
- contrôle qualité ;
- export PDF ;
- lettre ;
- sauvegarde locale ;
- réouverture d’un dossier ;
- mode autonome sans endpoint IA.
