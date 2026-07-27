# CareerPack Siham V2.4 — Mobile utilisable

## Corrections prioritaires

- Aperçu A4 automatiquement ajusté à la largeur disponible : la colonne droite n’est plus coupée en portrait ou en paysage.
- Bouton « Voir à 100 % » pour inspecter volontairement le document dans ses dimensions réelles ; « Adapter à l’écran » rétablit ensuite la vue complète.
- Fenêtre de résultat en plein écran sur mobile, avec marges internes réduites.
- Les six commandes du dossier sont regroupées dans un tiroir compact « Actions du dossier ».
- Le tiroir fermé occupe 44 px en portrait et 38 px en paysage au lieu de couvrir la majeure partie de la fenêtre.
- Le tiroir s’affiche au-dessus du contenu, ne le repousse pas et se referme après une action.
- Mise en page spécifique au paysage mobile jusqu’à 900 px de largeur lorsque la hauteur est réduite.
- Détection locale de l’entreprise renforcée : exclusion des types de contrat, horaires, localisations, salaires, libellés de plateforme et autres métadonnées.
- Validation de secours côté navigateur : une réponse IA telle que « Temps plein » est rejetée et remplacée par une entreprise plausible détectée dans l’offre.
- Contrat CareerBrain renforcé dans Google Apps Script : l’IA doit fournir l’employeur réel ou laisser le champ vide.
- Extraction de l’intitulé améliorée pour les lignes « Poste : … » et les annonces rédigées en phrase.
- Nettoyage des mots-clés locaux pour éviter que « temps », « plein », « CDI » ou une localisation deviennent des mots-clés ATS.
- Nouveau cache PWA V2.4.

## Périmètre volontaire

Cette version ne modifie ni le modèle A4 validé, ni le profil de Siham, ni les règles de contrôle qualité de la V2.3. Elle traite exclusivement l’ergonomie mobile du résultat et la fiabilité de l’analyse d’offre.
