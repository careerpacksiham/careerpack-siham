# CareerPack Siham V2.6.2 — Édition finale connectée

## Connexion centralisée
- branchement sur `https://ai.o-k.ma/api/v1/careerpack/` ;
- compatibilité AI Gateway Central V0.3.2 minimum ;
- actions `analyze` et `generate` conservées ;
- métadonnées techniques de la route utilisées uniquement pour le diagnostic ;
- aucune clé de fournisseur IA dans la PWA ou dans GitHub.

## Résilience
- délai maximal contrôlé ;
- erreur HTTP, réponse illisible, panne ou délai dépassé : fallback local silencieux ;
- badge temporaire indiquant le fournisseur ayant réellement répondu ;
- badge « Secours autonome » lorsque le moteur local prend le relais ;
- parcours, profil, CV, lettre, message, PDF et sauvegardes inchangés.

## PWA
- cache final renouvelé : `careerpack-siham-v2-6-2-final-connected` ;
- version des sauvegardes portée à `2.6.2` sans rupture du schéma existant.
