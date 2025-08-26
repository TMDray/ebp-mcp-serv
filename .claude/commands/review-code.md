# Review de Code - Assurance Qualité

Effectuer une review complète du code basée sur les standards du projet.

## Instructions

### 1. **Contexte de Review**
Pour le code : **$ARGUMENTS**

Consulte préalablement :
- **`.claude/context/technical.md`** - Standards et architecture
- **`.claude/context/patterns.md`** - Patterns attendus
- **`.claude/context/failures.md`** - Erreurs communes à éviter
- **Code similaire** dans le projet pour cohérence

### 2. **Checklist Fonctionnelle**

#### Correctness
- [ ] **Logique métier** correcte et complète
- [ ] **Gestion d'erreurs** appropriée et robuste
- [ ] **Validation des inputs** présente et stricte
- [ ] **Types TypeScript** corrects et précis
- [ ] **Cas limites** gérés (null, undefined, valeurs extrêmes)

#### Architecture
- [ ] **Patterns du projet** respectés
- [ ] **Séparation des responsabilités** claire
- [ ] **Dépendances** minimales et justifiées
- [ ] **Interface publique** cohérente avec l'existant
- [ ] **Configuration** externalisée (pas de hard-coding)

### 3. **Checklist Sécurité**

#### Données Sensibles
- [ ] **Pas de secrets** en dur dans le code
- [ ] **Validation stricte** des inputs utilisateur
- [ ] **Sanitization** des données avant stockage/affichage
- [ ] **Gestion des permissions** appropriée
- [ ] **Logs** ne contiennent pas d'infos sensibles

#### SQL/Database (si applicable)
- [ ] **Requêtes préparées** uniquement (pas de concaténation)
- [ ] **Validation des IDs** avant requêtes
- [ ] **Gestion des transactions** si nécessaire
- [ ] **Timeouts** appropriés

### 4. **Checklist Performance**

#### Optimisations
- [ ] **Algorithmes** appropriés pour la taille des données
- [ ] **Pas de boucles imbriquées** inutiles
- [ ] **Requêtes DB** optimisées (LIMIT, indexes utilisés)
- [ ] **Mémoire** - pas de fuites potentielles
- [ ] **Async/await** utilisé correctement

### 5. **Checklist Maintenabilité**

#### Lisibilité
- [ ] **Noms de variables/fonctions** explicites
- [ ] **Fonctions courtes** (< 20 lignes idéalement)
- [ ] **Commentaires** uniquement où nécessaire
- [ ] **Structure** logique et cohérente
- [ ] **Magic numbers/strings** évités

#### Tests
- [ ] **Tests unitaires** pour la logique critique
- [ ] **Tests d'intégration** si interactions externes
- [ ] **Coverage** des cas d'erreur
- [ ] **Tests lisibles** et maintenables

### 6. **Patterns Spécifiques EBP-MCP**

#### Tools MCP
- [ ] **Schema Zod** avec descriptions claires
- [ ] **Gestion d'erreurs** avec codes standardisés
- [ ] **Format de réponse** cohérent
- [ ] **Validation business** avant traitement

#### Database
- [ ] **Connexion pool** utilisée correctement
- [ ] **Retry logic** pour connexions temporairement échouées
- [ ] **Conversion RTF** testée sur cas réels
- [ ] **Attribution commercial** toujours renseignée

### 7. **Évaluation et Feedback**

#### Scoring
- **🟢 Excellent** : Respect tous les standards, patterns appliqués
- **🟡 Bon** : Fonctionnel avec améliorations mineures
- **🟠 Moyen** : Améliorations significatives nécessaires
- **🔴 Problématique** : Problèmes majeurs à corriger

#### Feedback Structure
```markdown
## Review: [Nom du code]

### Positifs ✅
- [Points forts identifiés]

### Améliorations suggérées 🔧
- [Améliorations mineures]

### Problèmes à corriger ❌
- [Problèmes bloquants]

### Patterns recommandés 📚
- [Références vers context/patterns.md]
```

### 8. **Documentation Post-Review**
Documenter dans `logs/learnings.md` :
```markdown
### Code Review: [Nom]
**Date:** [Date]
**Type:** [Nouveau/Refactoring/Bug fix]
**Qualité initiale:** [Score/10]
**Problèmes majeurs:** [Nombre]
**Patterns non respectés:** [Liste]
**Temps review:** [Minutes]
**Apprentissages:** [Ce qui a été appris]
```

## Niveaux de Criticité

### 🔴 Bloquant (Must Fix)
- Failles de sécurité
- Bugs fonctionnels
- Non-respect architecture critique
- Performance inacceptable

### 🟠 Important (Should Fix)
- Patterns non respectés
- Code difficile à maintenir
- Tests manquants
- Documentation insuffisante

### 🟡 Suggestion (Could Fix)
- Optimisations mineures
- Améliorations de lisibilité
- Refactoring opportuniste

## Principes de Review
- **Constructif** : Suggérer des solutions, pas juste critiquer
- **Éducatif** : Expliquer le "pourquoi" des suggestions
- **Cohérent** : Appliquer les mêmes standards partout
- **Pragmatique** : Balance entre qualité et délai

## Anti-Patterns de Review
- ❌ Critiquer le style sans justification
- ❌ Demander des changements non documentés dans les standards
- ❌ Ignorer les patterns existants du projet
- ❌ Review superficielle sans tests
- ❌ Bloquer sur des détails mineurs