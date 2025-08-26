# Contextualisation Générale - Workflow Universel

Collecter et synthétiser tout le contexte pertinent avant d'aborder une tâche.

## Instructions

### 1. **Analyse de la Demande**
Pour la tâche : **$ARGUMENTS**

Identifier le type de travail :
- 🐛 **Bug/Debug** → Utiliser `/analyze-bug` ou `/debug-issue`
- 💻 **Nouveau code** → Utiliser `/create-code`
- 🔧 **Refactoring** → Utiliser `/refactor-code`
- 👀 **Code review** → Utiliser `/review-code`
- 📊 **Autre** → Continuer avec ce workflow général

### 2. **Collecte Systématique du Contexte**

#### Contexte Principal
- **`.claude/CLAUDE.md`** - État actuel du projet et vision d'ensemble
- **README.md** ou documentation principale
- **package.json / tsconfig.json** - Configuration technique

#### Contexte Spécialisé selon la Tâche
- **`.claude/context/technical.md`** - Architecture et décisions techniques
- **`.claude/context/patterns.md`** - Solutions validées réutilisables
- **`.claude/context/failures.md`** - Erreurs à éviter
- **`.claude/logs/learnings.md`** - Apprentissages récents

#### Contexte Code (si applicable)
- **Fichiers similaires** dans le projet
- **Tests existants** pour comprendre l'usage
- **Configuration** liée à la tâche

### 3. **Synthèse du Contexte**

#### Évaluation des Ressources
- **Patterns applicables** : Y a-t-il une solution similaire documentée ?
- **Contraintes techniques** : Architecture, stack, standards à respecter
- **Pièges connus** : Erreurs documentées à éviter
- **Apprentissages pertinents** : Expérience récente applicable

#### Plan d'Action Personnalisé
Basé sur le contexte collecté :
1. **Approche recommandée** (pattern existant ou nouvelle approche)
2. **Ressources à utiliser** (code existant, libraries, outils)
3. **Points d'attention** (pièges à éviter, tests nécessaires)
4. **Métriques de succès** (comment savoir que c'est réussi)

### 4. **Workflow Adaptatif**

#### Si Pattern Clair Identifié
- Appliquer le pattern documenté
- Adapter aux spécificités de la tâche
- Tester et valider l'adaptation

#### Si Territoire Inexploré
- Rechercher solutions similaires externes
- Commencer par approche minimale
- Documenter les découvertes pour futures utilisations

#### Si Problème Complexe
- Décomposer en sous-tâches plus simples
- Traiter chaque sous-tâche avec son propre contexte
- Assembler les solutions partielles

### 5. **Vérifications Pre-Action**

#### Checklist Universelle
- [ ] **Contexte technique** compris (stack, architecture, patterns)
- [ ] **Contraintes** identifiées (performance, sécurité, conventions)
- [ ] **Ressources disponibles** listées (code existant, outils, docs)
- [ ] **Définition de "terminé"** claire
- [ ] **Plan de test** défini

#### Questions de Validation
- Ai-je consulté tous les contextes pertinents ?
- Y a-t-il une solution similaire déjà documentée ?
- Quels sont les pièges potentiels à éviter ?
- Comment vais-je valider que la solution fonctionne ?

### 6. **Exécution Contextuelle**

#### Pendant le Travail
- **Référencer** les patterns utilisés
- **Documenter** les adaptations nécessaires
- **Tester** fréquemment contre les critères de succès
- **Noter** les découvertes pour enrichir le contexte

#### Gestion des Blocages
Si bloqué > 15 minutes :
1. **Consulter** `context/failures.md` pour problèmes similaires
2. **Rechercher** dans `logs/learnings.md` des solutions passées
3. **Décomposer** le problème en parties plus petites
4. **Demander aide** avec contexte complet si nécessaire

### 7. **Post-Action : Enrichissement du Contexte**

#### Documentation Obligatoire
```markdown
### Action: [Nom de la tâche]
**Date:** [Date]
**Type:** [Bug/Code/Refactor/Review/Autre]
**Contexte utilisé:** [Quels fichiers ont été utiles]
**Approche:** [Pattern utilisé ou nouvelle approche]
**Durée:** [Temps investi]
**Résultat:** [Succès/Échec/Partiel]

**Apprentissages:**
- [Ce qui a été appris]
- [Ce qui a bien marché]
- [Ce qui pourrait être amélioré]

**Nouveau pattern identifié:** [Oui/Non + description]
```

#### Évolution du Contexte
- **Nouveau pattern réussi** → Ajouter dans `context/patterns.md`
- **Échec instructif** → Documenter dans `context/failures.md`
- **Amélioration workflow** → Mettre à jour les workflows concernés
- **Changement architectural** → Mettre à jour `context/technical.md`

### 8. **Méta-Apprentissage**

#### Évaluation du Processus
Après chaque utilisation :
- Le contexte collecté était-il suffisant ?
- Y a-t-il des sources manquantes à ajouter ?
- Le workflow pourrait-il être optimisé ?
- Les apprentissages sont-ils bien capturés ?

## Principe Fondamental

> **"Context First, Action Second"**
> 
> Investir 10 minutes dans la collecte de contexte peut économiser 1 heure de tâtonnement

## Adaptation selon l'Expérience

### Nouvel Utilisateur du Projet
- Lire **TOUT** le contexte disponible
- Commencer par des tâches simples
- Documenter abondamment

### Utilisateur Expérimenté
- Focus sur les apprentissages récents
- Recherche ciblée dans le contexte
- Documentation des nouveaux patterns

## Anti-Patterns Universels
- ❌ Commencer à coder sans consulter le contexte
- ❌ Ignorer les patterns existants
- ❌ Ne pas documenter les apprentissages
- ❌ Réinventer des solutions déjà trouvées
- ❌ Travailler sans critères de succès clairs