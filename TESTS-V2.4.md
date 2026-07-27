# Tests de validation — CareerPack V2.4

## Vérifications automatiques exécutées

- Syntaxe de `assets/app.js` : valide avec Node.js.
- Syntaxe de `service-worker.js` : valide avec Node.js.
- Syntaxe du fichier Google Apps Script : valide après contrôle JavaScript.
- Manifest PWA : JSON valide.
- Aucun incident JavaScript pendant le parcours complet de référence.
- Export CV autorisé sur le scénario de référence.

## Résultats responsive mesurés

### Mobile portrait — 360 × 740

- fenêtre de résultat : 360 × 740, plein écran ;
- largeur disponible de l’aperçu : 334 px ;
- largeur réellement rendue : 330 px ;
- largeur de défilement : 334 px ;
- résultat : aucune partie droite masquée en mode adapté ;
- tiroir fermé : 44 px de hauteur ;
- tiroir ouvert : six actions accessibles en deux colonnes ;
- mode 100 % : largeur de défilement volontaire d’environ 798 px.

### Mobile paysage — 740 × 360

- fenêtre de résultat : 740 × 360, plein écran ;
- largeur disponible de l’aperçu : 720 px ;
- largeur réellement rendue : 718 px ;
- largeur de défilement : 720 px ;
- résultat : aucune partie droite masquée en mode adapté ;
- tiroir fermé : 38 px de hauteur ;
- tiroir ouvert : panneau superposé, sans réduction durable de la zone de lecture.

### Ordinateur — 1280 × 720

- fenêtre de résultat élargie à 1180 px ;
- commandes classiques visibles directement ;
- tiroir mobile masqué ;
- aperçu A4 ajusté dans son panneau.

## Détection d’entreprise testée

Les cas suivants sont reconnus correctement :

- `Royal Mansour Marrakech` malgré les lignes `Marrakech, Maroc` et `Temps plein` ;
- `Mandarin Oriental Marrakech` avec `Entreprise :` et `Poste :` ;
- `Fairmont Royal Palm Marrakech` malgré `Temps plein` et `Sur site` ;
- `Selman Marrakech` dans la phrase « Nous recrutons chez Selman Marrakech un Manager des opérations ».

Une valeur IA erronée telle que `Temps plein` est rejetée avant remplissage du champ entreprise.

## Contrôle manuel après déploiement

1. Fermer complètement l’ancienne PWA et rouvrir CareerPack.
2. Coller une véritable annonce contenant l’entreprise et un type de contrat.
3. Vérifier le champ entreprise avant de continuer.
4. Générer le CV et contrôler l’aperçu en portrait puis en paysage.
5. Ouvrir « Actions du dossier », tester une commande, puis vérifier la fermeture du tiroir.
6. Tester « Voir à 100 % », puis « Adapter à l’écran ».
7. Vérifier l’export PDF et la lettre pour confirmer l’absence de régression.
