# Itération Feature - Amélioration Continue

Faire évoluer une fonctionnalité existante de manière itérative basée sur feedback et données.

## Instructions

### 1. **État Actuel de la Feature**
Pour la feature : **$ARGUMENTS**

#### Audit de l'Existant
- **Fonctionnement actuel** : Que fait la feature aujourd'hui ?
- **Métriques d'usage** : Comment est-elle utilisée ? (fréquence, patterns)
- **Points de friction** : Où les utilisateurs rencontrent des difficultés ?
- **Feedback collecté** : Qu'est-ce qui remonte des utilisateurs ?

#### Consultation du Contexte
- **`.claude/logs/learnings.md`** - Apprentissages sur cette feature
- **`.claude/context/patterns.md`** - Patterns appliqués précédemment
- **`.claude/logs/metrics.md`** - Performance et usage historique

### 2. **Identification des Améliorations**

#### Priorisation par Impact/Effort
```yaml
Impact HIGH + Effort LOW:
  - Quick wins à implémenter immédiatement
  - Messages d'erreur plus clairs
  - Validation d'inputs améliorée
  - Performance simple à optimiser

Impact HIGH + Effort HIGH:
  - Fonctionnalités majeures à planifier
  - Refonte architecture si nécessaire
  - Intégrations complexes

Impact LOW + Effort LOW:
  - Améliorations UX mineures
  - Optimisations de confort
  - Polish interface

Impact LOW + Effort HIGH:
  - À éviter ou repousser
```

#### Sources d'Amélioration
- **Feedback utilisateur direct** (le plus important)
- **Données d'usage** (points de friction observés)
- **Évolution technique** (nouvelles possibilités)
- **Patterns émergents** (meilleures pratiques)

### 3. **Approche Itérative**

#### Cycle d'Itération (1-2 semaines)
1. **Choisir 1-3 améliorations** de même priorité
2. **Implémenter** version minimale
3. **Tester** avec un sous-ensemble d'utilisateurs
4. **Mesurer** l'impact réel
5. **Ajuster** basé sur les résultats

#### Principe de l'Amélioration Graduelle
> Mieux vaut 5 petites améliorations validées qu'1 grosse refonte risquée

### 4. **Patterns d'Amélioration Éprouvés**

#### Pattern : User Journey Optimization
```markdown
1. **Mapper** le parcours utilisateur actuel
2. **Identifier** les étapes frustrantes (abandon, erreurs)
3. **Simplifier** une étape à la fois
4. **Mesurer** l'amélioration du taux de succès
```

#### Pattern : Error Experience Improvement
```typescript
// Avant - Erreur cryptique
throw new Error('Validation failed');

// Après - Guidage utilisateur
throw new ValidationError(
  'Le nom du client est requis',
  { 
    field: 'clientName',
    suggestion: 'Essayez "Dupont" ou "Martin"',
    examples: ['Jean Dupont', 'Société Martin SARL']
  }
);
```

#### Pattern : Progressive Enhancement
```typescript
// V1 - Fonctionnalité de base
function searchClients(name: string): Client[] {
  return clients.filter(c => c.name.includes(name));
}

// V2 - Recherche approximative
function searchClients(name: string): Client[] {
  const exact = clients.filter(c => c.name.includes(name));
  if (exact.length > 0) return exact;
  
  // Fallback: recherche fuzzy
  return clients.filter(c => 
    similarity(c.name, name) > 0.7
  ).sort((a, b) => similarity(b.name, name) - similarity(a.name, name));
}
```

### 5. **Méthodologie A/B Testing Simple**

#### Pour Features avec Usage Mesurable
```typescript
// Feature flag simple
const FEATURE_IMPROVEMENTS = {
  enhanced_search: process.env.ENHANCED_SEARCH === 'true',
  better_errors: process.env.BETTER_ERRORS === 'true'
};

// Implémentation conditionnelle
function processRequest(input: Input) {
  if (FEATURE_IMPROVEMENTS.enhanced_search) {
    return enhancedSearch(input);
  }
  return originalSearch(input);
}
```

#### Métriques à Tracker
- **Taux de succès** des actions utilisateur
- **Temps d'exécution** des tâches communes  
- **Fréquence d'erreurs** et types d'erreurs
- **Feedback qualitatif** (satisfaction, frustrations)

### 6. **Feedback Loop Efficace**

#### Collection Feedback
```typescript
// Logging des actions utilisateur
function logUserAction(action: string, success: boolean, duration: number) {
  console.log({
    timestamp: new Date().toISOString(),
    action,
    success,
    duration,
    user: getCurrentUser()
  });
}

// Feedback explicite
function promptForFeedback(action: string) {
  // Après action réussie, demander feedback occasionnel
  if (Math.random() < 0.1) { // 10% des cas
    console.log(`Comment s'est passé "${action}" ? (1-5 étoiles)`);
  }
}
```

#### Analyse des Patterns d'Usage
```sql
-- Requêtes d'analyse (exemple)
-- Actions les plus fréquentes
SELECT action, COUNT(*) as frequency 
FROM user_actions 
WHERE timestamp > DATEADD(day, -7, GETDATE())
GROUP BY action 
ORDER BY frequency DESC;

-- Taux d'erreur par feature
SELECT action, 
  COUNT(*) as total,
  SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as errors
FROM user_actions 
GROUP BY action;
```

### 7. **Validation des Améliorations**

#### Critères de Succès
Définir AVANT l'implémentation :
- **Métrique principale** : Qu'est-ce qui doit s'améliorer ?
- **Seuil de succès** : De combien ? (ex: réduction erreurs 30%)
- **Période de test** : Combien de temps pour valider ?
- **Critères d'échec** : Quand abandonner l'amélioration ?

#### Template de Validation
```markdown
## Amélioration: [Nom]
**Hypothèse:** [Ce qu'on pense que ça va améliorer]
**Métrique:** [Comment on va le mesurer]
**Baseline:** [Situation actuelle]
**Target:** [Objectif quantifié]
**Durée test:** [X jours/semaines]

### Résultats après [Période]
- Métrique: [Valeur] (vs [Baseline])
- Feedback: [Résumé qualitatif]
- **Décision:** [Garder/Ajuster/Abandonner]
```

### 8. **Documentation Continue**

#### Après Chaque Itération
Documenter dans `logs/learnings.md` :
```markdown
### Itération: [Feature] - [Date]
**Améliorations tentées:**
- [Liste des changements]

**Résultats mesurés:**
- [Métriques avant/après]
- [Feedback utilisateur]

**Apprentissages:**
- [Ce qui a marché]
- [Ce qui n'a pas marché]
- [Hypothèses invalidées]

**Prochaine itération:**
- [3 améliorations prioritaires suivantes]
```

#### Évolution des Patterns
Si pattern d'amélioration émerge :
- Ajouter dans `context/patterns.md`
- Documenter le processus reproductible
- Identifier les contextes d'application

### 9. **Éviter les Pièges Classiques**

#### 🚫 Feature Creep
```markdown
❌ "Tant qu'on y est, ajoutons aussi..."
✅ Focus sur 1-3 améliorations max par itération
```

#### 🚫 Optimisation sans Données
```markdown
❌ "Je pense que ça sera plus rapide"
✅ Mesurer d'abord, optimiser ensuite
```

#### 🚫 Changement sans Validation
```markdown
❌ Déployer et espérer que c'est mieux
✅ Tester avec utilisateurs représentatifs
```

### 10. **Méta-Amélioration**

#### Améliorer le Processus d'Amélioration
Questions à se poser après chaque cycle :
- Les métriques choisies étaient-elles pertinentes ?
- Le feedback était-il suffisant pour décider ?
- Le cycle était-il de la bonne durée ?
- Comment accélérer les itérations suivantes ?

#### Automation Progressive
- Scripts de déploiement d'améliorations
- Collection automatique de métriques
- Alertes sur dégradation de performance
- Dashboard de santé des features

## Principe Central

> **"Mesure, Améliore, Valide, Répète"**
> 
> Chaque itération doit être mesurable et validable.  
> Les améliorations non validées sont des illusions.

## Success Pattern

Les features qui évoluent le mieux sont celles qui :
1. Ont des métriques claires dès le début
2. Reçoivent du feedback utilisateur régulier
3. Changent par petits incréments validés
4. Documentent leurs apprentissages pour l'équipe