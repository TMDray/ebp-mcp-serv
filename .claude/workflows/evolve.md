# Workflow: Évolution du Contexte

## Objectif
Maintenir et enrichir automatiquement le contexte du projet basé sur les apprentissages.

## Processus d'Évolution

### 1. Collecte des Apprentissages (Quotidien)
```bash
# Commande pour l'IA
@gather_learnings

# Actions:
1. Lire logs/learnings.md (nouveaux apprentissages)
2. Lire logs/failures.md (échecs instructifs)
3. Lire logs/metrics.md (données de performance)
4. Identifier patterns récurrents
5. Proposer mises à jour du contexte
```

### 2. Analyse des Patterns (Hebdomadaire)
```yaml
Critères pour devenir un pattern:
  - Répétition: >= 3 occurrences
  - Succès: >= 80% de réussite
  - Impact: Gain temps >= 50%
  - Généralisation: Applicable à plusieurs contextes

Actions:
  - Extraire patterns des logs
  - Valider pertinence
  - Ajouter à context/patterns.md
  - Mettre à jour workflows si nécessaire
```

### 3. Mise à Jour du Contexte Principal
```markdown
## Sections à maintenir dans CLAUDE.md:

### État du Système
- Automatiquement mis à jour après chaque changement majeur
- Tableau de bord des composants
- Métriques clés

### Apprentissages Cumulatifs
- Top 5 patterns de succès
- Top 3 échecs à éviter
- Décisions architecturales validées

### Prochaines Étapes Intelligentes
- Basées sur l'état actuel
- Priorisées par impact
- Avec estimation temps
```

### 4. Archivage et Nettoyage
```bash
# Mensuel
1. Archiver logs > 30 jours dans logs/archive/
2. Consolider patterns similaires
3. Retirer informations obsolètes
4. Compresser historique

# Conserver toujours:
- Patterns validés
- Décisions majeures
- Échecs critiques
```

## Templates d'Évolution

### Pour un Nouveau Pattern Identifié
```markdown
## Pattern: [Nom descriptif]
**Découvert le:** [Date]
**Occurrences:** [Nombre]
**Catégorie:** [SQL|MCP|TypeScript|Debug|...]

**Problème résolu:**
[Description du problème récurrent]

**Solution:**
```[language]
[Code ou procédure]
```

**Gain estimé:** [X minutes par occurrence]
**Cas d'usage:** [Quand l'utiliser]
```

### Pour une Décision Architecturale
```markdown
## ADR-[Numéro]: [Titre]
**Date:** [Date]
**Statut:** [Proposé|Accepté|Obsolète]

**Contexte:**
[Pourquoi cette décision était nécessaire]

**Décision:**
[Ce qui a été décidé]

**Conséquences:**
- ✅ [Positif]
- ⚠️ [À surveiller]
- ❌ [Négatif accepté]

**Validation:**
[Métriques ou tests qui confirment]
```

### Pour une Mise à Jour d'État
```markdown
## Évolution: [Composant] - [Version]
**Date:** [Date]
**De:** [État précédent]
**Vers:** [Nouvel état]

**Changements:**
- [Liste des modifications]

**Impact:**
- Performance: [+X%|-X%|Stable]
- Fiabilité: [Améliorée|Dégradée|Stable]
- Complexité: [Réduite|Augmentée|Stable]

**Apprentissages:**
[Ce qu'on a appris de ce changement]
```

## Automatisation

### Script d'Évolution (à exécuter par l'IA)
```javascript
// evolve-context.js
async function evolveContext() {
  // 1. Charger tous les logs récents
  const learnings = await loadRecentLogs();
  
  // 2. Identifier patterns
  const patterns = extractPatterns(learnings);
  
  // 3. Calculer métriques
  const metrics = calculateMetrics();
  
  // 4. Générer suggestions
  const suggestions = {
    newPatterns: patterns.filter(p => p.occurrences >= 3),
    obsoleteInfo: findObsoleteInfo(),
    nextSteps: prioritizeNextSteps(metrics)
  };
  
  // 5. Proposer mises à jour
  return generateContextUpdate(suggestions);
}
```

### Triggers d'Évolution
1. **Immédiat:** Après chaque succès/échec majeur
2. **Quotidien:** Consolidation des apprentissages
3. **Hebdomadaire:** Analyse patterns et métriques
4. **Mensuel:** Archivage et refactoring contexte

## Métriques d'Évolution

### Indicateurs de Santé du Contexte
```yaml
Fraîcheur:
  - % infos < 7 jours: [Target: > 30%]
  - Dernière évolution: [Target: < 3 jours]

Utilité:
  - Patterns utilisés/total: [Target: > 80%]
  - Temps gagné/semaine: [Target: > 2h]

Qualité:
  - Ratio succès/échec: [Target: > 4:1]
  - Complexité réduite: [Target: oui]
```

## Règles d'Or

1. **Ne jamais perdre un apprentissage** - Tout échec ou succès doit enrichir le contexte
2. **Favoriser la simplicité** - Si un pattern complique, le rejeter
3. **Mesurer l'impact** - Pas de pattern sans métrique
4. **Rester actionnable** - Chaque info doit servir
5. **Évoluer != Accumuler** - Savoir retirer autant qu'ajouter

## Exemples d'Évolutions Réussies

### Exemple 1: Pattern Connexion SQL
```
Avant: 15 min de debug à chaque erreur connexion
Pattern identifié: Toujours vérifier TCP/IP d'abord
Après: 2 min de résolution
Impact: 13 min gagnées × 5 occurrences = 1h+ économisée
```

### Exemple 2: Structure MCP
```
Avant: Créer tous les tools d'un coup
Échecs: 3 tentatives ratées, 2h perdues
Nouveau pattern: 1 tool testé = 1 tool validé
Après: 100% succès en approche itérative
```

---

*Ce workflow s'auto-améliore. Chaque utilisation le rend plus efficace.*