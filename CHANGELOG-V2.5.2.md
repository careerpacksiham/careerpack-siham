# CareerPack Siham V2.5.2 — Édition finale figée

## Statut

Release consolidée de clôture de l’édition Siham. Le périmètre fonctionnel est figé après cette version, hors correction critique ou retour terrain final.

## Générateur de CV finalisé

- Mise en page Executive Signature conservée comme modèle étalon.
- Descriptions d’expériences transformées en phrases distinctes et en puces lisibles.
- Résumé exécutif réparti en paragraphes courts lorsque sa longueur le justifie.
- Protection renforcée contre les lignes isolées et les blocs coupés.
- Choix explicite entre mode automatique, CV d’une page et CV de deux pages.
- En mode automatique, CareerPack tente successivement les rendus normal, compact et dense, puis bascule sur deux pages si une page n’est plus lisible.
- Rendu deux pages construit comme deux véritables pages A4, et non comme une page allongée.
- Prévisualisation et export reposent sur le même moteur documentaire.
- Historique local des exports CV et lettre rattaché à chaque candidature.
- Indication visible du nombre de zones modifiées depuis la proposition CareerBrain.

## Profil professionnel local

- Ajout d’un écran « Mon profil ».
- Coordonnées, titre, résumé, compétences, leadership, langues, formation, valeur ajoutée et expériences modifiables.
- Le profil enregistré devient la source de vérité des prochaines candidatures.
- Ajout du cadrage photo : changement de photo, zoom, position horizontale et position verticale.
- Photo utilisée de façon identique dans la prévisualisation et l’export PDF.
- Validation des informations essentielles avant sauvegarde.
- Les données restent locales à l’appareil.

## Analyse d’offre consolidée

- Détection de l’entreprise renforcée pour les annonces présentant des lignes mêlant employeur, localisation et type de contrat.
- Rejet maintenu des faux employeurs tels que « Temps plein », « CDI », une ville, un salaire ou un libellé de plateforme.
- Affichage d’un message de confirmation ou d’incertitude sous le champ entreprise.
- Correction manuelle explicitement reconnue par l’interface.
- Le profil envoyé à CareerBrain n’inclut jamais le contenu binaire de la photo.

## Lettre et message

- Lettre locale de secours réécrite en version complète et professionnelle.
- Contrôle de la lettre avant export : longueur, paragraphes, entreprise et poste.
- Export bloqué si la lettre est vide ou manifestement incomplète.
- Mise en page de la lettre stabilisée sur une page A4, sans pied de page superposé au texte.
- Choix du canal du message : Email, LinkedIn ou WhatsApp.
- Adaptation locale du ton et de la longueur au canal sélectionné.

## Mobile et ergonomie

- En mode « Adapter à l’écran », l’aperçu ne capture plus le geste tactile : le scroll vertical reste celui de la page.
- En mode « Voir à 100 % », le déplacement interne horizontal et vertical est volontairement réactivé.
- Bouton « Actions du dossier » rendu semi-transparent avec flou d’arrière-plan afin de laisser percevoir le contenu situé derrière.
- Tiroir d’actions maintenu en portrait et en paysage sans réduction permanente de la zone utile.

## Sauvegarde et continuité

- Sauvegarde locale et reprise des candidatures conservées.
- Ajout d’un export global de sauvegarde au format JSON : profil et candidatures.
- Ajout d’un import de sauvegarde avec validation du format et confirmation avant remplacement.
- Nouveau cache PWA `careerpack-siham-v2-5-2-final-frozen`.
- Une mise à jour normale de la PWA ne supprime pas les données locales.

## Hors périmètre figé

- Pas de compte multi-utilisateur.
- Pas de synchronisation cloud ou multiappareil.
- Pas d’administration générale.
- Pas de routeur multi-fournisseurs IA.
- Pas de transformation de cette édition en produit générique.

Ces fonctions appartiendront à une future branche CareerPack Core, séparée de l’édition Siham.
