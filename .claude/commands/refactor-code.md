# Refactoring - Amélioration Continue

Refactoriser du code existant en préservant le fonctionnement et en améliorant la qualité.

## Instructions

### 1. **Analyse de l'Existant**
Pour le refactoring de : **$ARGUMENTS**

Consulte d'abord :
- **`.claude/context/patterns.md`** - Patterns à appliquer
- **`.claude/context/technical.md`** - Architecture cible
- **`.claude/logs/learnings.md`** - Apprentissages sur code similaire

### 2. **Évaluation du Code Actuel**
1. **Comprendre** le comportement exact
   - Tracer les inputs/outputs
   - Identifier les dépendances
   - Lister les tests existants

2. **Identifier les problèmes** :
   - Complexité excessive
   - Duplication de code
   - Manque de types/validation
   - Performance sous-optimale
   - Non-respect des patterns

### 3. **Plan de Refactoring**
1. **Définir l'objectif** :
   - Améliorer la lisibilité ?
   - Réduire la complexité ?
   - Appliquer un pattern validé ?
   - Optimiser les performances ?

2. **Stratégie progressive** :
   - Extraire fonctions/classes
   - Appliquer patterns existants
   - Améliorer types/validation
   - Optimiser si nécessaire

### 4. **Exécution Sécurisée**
1. **Tests de régression d'abord**
   - Créer tests qui capturent le comportement actuel
   - Vérifier que tous les tests passent
   - Sauvegarder état fonctionnel

2. **Refactoring par petites étapes** :
   - Une amélioration à la fois
   - Test après chaque modification
   - Commit fréquents avec messages clairs

### 5. **Patterns de Refactoring Courants**

#### Extract Function
```typescript
// Avant
function complexeFunction(data) {
  // 50 lignes de code
  const processed = /* logique complexe */;
  const validated = /* validation complexe */;
  return /* transformation complexe */;
}

// Après
function complexeFunction(data) {
  const processed = processData(data);
  const validated = validateData(processed);
  return transformData(validated);
}
```

#### Apply Pattern
```typescript
// Avant - Code spécifique
async function getClientData(id) {
  try {
    const result = await db.query(/* ... */);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Après - Pattern réutilisable
const getClientData = createDbTool(
  'client_data',
  ClientSchema,
  async (id) => await db.query(/* ... */)
);
```

### 6. **Vérification Post-Refactoring**
1. **Tests complets** :
   - Tous les tests existants passent
   - Nouveaux tests pour edge cases
   - Performance maintenue/améliorée

2. **Code review checklist** :
   - Lisibilité améliorée
   - Patterns appliqués correctement
   - Pas de régression fonctionnelle
   - Documentation mise à jour

### 7. **Documentation des Améliorations**
Documenter dans `logs/learnings.md` :
```markdown
### Refactoring: [Nom du code]
**Date:** [Date]
**Objectif:** [Ce qui était visé]
**Avant:** [État initial - problèmes]
**Après:** [État final - améliorations]
**Pattern appliqué:** [Pattern de context/patterns.md]
**Gain:** [Lisibilité/Performance/Maintenabilité]
**Temps investi:** [X heures]
```

### 8. **Évolution du Contexte**
Si nouveau pattern émerge du refactoring :
- Ajouter dans `context/patterns.md`
- Mettre à jour `context/technical.md` si architectural
- Proposer application sur code similaire

## Priorités de Refactoring
1. **Sécurité** - Failles ou gestion d'erreurs manquante
2. **Correctness** - Bugs ou comportements incorrects
3. **Patterns** - Application des patterns validés
4. **Lisibilité** - Code difficile à comprendre
5. **Performance** - Uniquement si problème mesuré

## Règles d'Or
- **Tests first** : Toujours créer tests avant de refactorer
- **Petites étapes** : Une amélioration à la fois
- **Préserver fonctionnement** : Pas de changement de comportement
- **Mesurer impact** : Performance, complexité, lisibilité

## Anti-Patterns à Éviter
- ❌ Refactorer sans tests
- ❌ Gros changements d'un coup
- ❌ Optimisation prématurée
- ❌ Changer le comportement existant
- ❌ Ignorer les patterns du projet
- ❌ Ne pas documenter les améliorations