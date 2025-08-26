# Analyse de Bug - Méthode Systématique

Analyser un bug en suivant une approche méthodique basée sur le contexte projet.

## Instructions

### 1. **Collecte du Contexte**
Avant d'analyser le bug, consulte obligatoirement :
- **`.claude/CLAUDE.md`** - État actuel du projet et composants
- **`.claude/context/patterns.md`** - Solutions validées similaires
- **`.claude/context/failures.md`** - Échecs passés à éviter
- **`.claude/logs/learnings.md`** - Apprentissages pertinents

### 2. **Reproduction du Bug**
Pour le bug : **$ARGUMENTS**

1. **Reproduire** le comportement exact
   - Créer un cas de test minimal
   - Identifier les conditions déclenchantes
   - Vérifier la cohérence (reproduit-il à chaque fois ?)

2. **Isoler** le composant fautif
   - Tester chaque composant individuellement
   - Utiliser les logs/debugging disponibles
   - Comparer avec les patterns dans `context/patterns.md`

### 3. **Diagnostic Rapide**
Vérifier d'abord les causes communes documentées dans `context/failures.md` :
- Configuration incorrecte
- Connexions/authentification
- Types/validation de données
- Gestion d'erreurs manquante

### 4. **Analyse Approfondie**
Si pas de solution évidente :
1. **Examiner le code** autour du symptôme
2. **Tracer l'exécution** pas à pas
3. **Comparer** avec du code similaire fonctionnel
4. **Rechercher** dans les patterns validés

### 5. **Solution et Documentation**
1. **Proposer une solution** basée sur les patterns existants
2. **Tester** la correction sur le cas minimal
3. **Documenter** dans `logs/learnings.md` :
   ```markdown
   ### Bug Fix: [Titre]
   **Date:** [Date]
   **Symptôme:** [Description]
   **Cause:** [Cause racine]
   **Solution:** [Ce qui a marché]
   **Pattern réutilisable:** [Oui/Non + description]
   ```

### 6. **Évolution du Contexte**
Si nouveau pattern identifié :
- Ajouter dans `context/patterns.md`
- Mettre à jour `CLAUDE.md` si nécessaire
- Proposer amélioration workflow si pertinent

## Principes
- **Utiliser l'historique** : Ne pas réinventer, réutiliser
- **Documenter systématiquement** : Chaque bug résolu enrichit le contexte
- **Tester minimalement** : Plus petit cas qui reproduit le problème
- **Éviter les suppositions** : Toujours vérifier avec des tests

## Anti-Patterns à Éviter
- ❌ Ne pas consulter le contexte existant
- ❌ Chercher sur internet avant les patterns locaux
- ❌ Proposer solution sans reproduire le bug
- ❌ Oublier de documenter la solution trouvée