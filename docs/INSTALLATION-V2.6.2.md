# Déploiement CareerPack Siham V2.6.2 sur GitHub Pages

## Préconditions
- AI Gateway Central affiche au minimum **V0.3.2** ;
- l’application CareerPack est active dans la Gateway ;
- l’origine autorisée est exactement `https://careerpacksiham.github.io` sans chemin final ;
- les missions `analyze` et `generate` sont actives et disposent d’au moins une route testée opérationnelle.

## Mise à jour du dépôt
1. Faire une sauvegarde ou créer une branche de sécurité.
2. Décompresser l’archive V2.6.2.
3. Remplacer le contenu du dépôt en conservant `.git`, `.github` et `CNAME` s’ils existent.
4. Ne placer aucune clé Gemini, Cerebras, Groq, Mistral ou OpenRouter dans le dépôt.
5. Committer, pousser et attendre le déploiement GitHub Pages.
6. Fermer complètement la PWA puis la rouvrir deux fois pour renouveler le service worker.

## Commandes de gel après recette réussie
```bash
git status
git add -A
git commit -m "release: CareerPack Siham v2.6.2 final connected"
git push origin main
git tag -a v2.6.2-siham-final -m "CareerPack Siham V2.6.2 — édition finale connectée"
git push origin v2.6.2-siham-final
git branch archive/siham-v2.6.2-frozen
git push origin archive/siham-v2.6.2-frozen
```

## Diagnostic discret
Dans la console du navigateur :
```js
CAREERPACK_AI_DIAGNOSTICS()
```
La fonction retourne seulement l’endpoint, la version, le dernier fournisseur/modèle et la dernière erreur technique. Elle n’expose aucune clé.
