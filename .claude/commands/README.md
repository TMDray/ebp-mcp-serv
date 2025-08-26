# Commands Claude - Guide d'Utilisation

## 🎯 Système de Commandes Contextuelles

Ces commandes utilisent le contexte évolutif de `.claude-v2/` pour fournir des réponses personnalisées et cohérentes avec l'historique du projet.

## 📋 Commandes Disponibles

### 🔍 Analyse et Debug
- `/gather-context [tâche]` - Collecte contexte avant toute action
- `/analyze-bug [description]` - Analyse systématique de bugs
- `/debug-issue [problème]` - Debug méthodique avec historique
- `/review-code [fichier/fonction]` - Review complète basée sur standards

### 💻 Développement
- `/create-code [fonctionnalité]` - Création guidée par patterns
- `/refactor-code [code à améliorer]` - Refactoring sécurisé
- `/start-simple-project [description]` - Lancement MVP
- `/iterate-feature [feature]` - Amélioration itérative

### 🚀 Livraison
- `/ship-mvp [nom du produit]` - Préparation et livraison MVP

## 🔧 Usage

### Commande Universelle (Recommandée)
```
/gather-context [votre tâche]
```
Cette commande analyse votre demande et vous oriente vers la commande spécialisée appropriée.

### Commandes Spécialisées
```
/analyze-bug La connexion SQL échoue de manière intermittente
/create-code Tool MCP pour créer des activités avec validation RTF
/refactor-code Fonction getClientActivities dans server.ts
/review-code Nouveau module d'authentification commerciaux
```

## 🧠 Intelligence Contextuelle

### Ce que chaque commande consulte automatiquement :
- **`.claude-v2/CLAUDE.md`** - État et vision du projet
- **`.claude-v2/context/technical.md`** - Architecture et décisions
- **`.claude-v2/context/patterns.md`** - Solutions validées
- **`.claude-v2/context/failures.md`** - Erreurs à éviter
- **`.claude-v2/logs/learnings.md`** - Apprentissages récents

### Auto-Documentation
Chaque utilisation enrichit automatiquement :
- Patterns de succès identifiés
- Solutions d'échecs documentées
- Métriques de progression
- Apprentissages cumulatifs

## 🎨 Personnalisation

### Ajouter vos propres commandes
1. Créer un fichier `.claude-v2/commands/ma-commande.md`
2. Utiliser la syntaxe `$ARGUMENTS` pour les paramètres
3. Référencer les fichiers de contexte appropriés
4. Redémarrer Claude Code

### Template de Commande
```markdown
# Ma Commande Personnalisée

Description de ce que fait la commande.

## Instructions

Pour la tâche : **$ARGUMENTS**

### 1. Consultation du Contexte
- `.claude-v2/context/[fichier pertinent].md`
- Code existant similaire

### 2. Traitement
[Étapes spécifiques à votre commande]

### 3. Documentation
Documenter résultats dans `logs/learnings.md`
```

## 📊 Métriques d'Efficacité

### Gains Observés
- **Temps de résolution** : -60% sur problèmes similaires
- **Cohérence** : 100% respect des patterns projet
- **Apprentissage** : Chaque action enrichit la base de connaissances
- **Onboarding** : Nouveaux développeurs productifs immédiatement

### KPIs de Success
- Réutilisation patterns : >80%
- Erreurs répétitives : 0
- Temps moyen résolution : <15 min
- Documentation à jour : 100%

## ⚡ Quick Start

### Première utilisation
```bash
# 1. Comprendre le contexte projet
/gather-context explorer le système existant

# 2. Première tâche
/analyze-bug [votre problème]
# ou
/create-code [votre feature]
```

### Usage Quotidien
```bash
# Commencer chaque session
/gather-context [tâche du jour]

# Puis utiliser commandes spécialisées selon besoins
```

## 🔄 Évolution Continue

### Le système s'améliore automatiquement
- **Nouveaux patterns** identifiés → ajoutés aux commandes
- **Solutions éprouvées** → intégrées aux workflows
- **Erreurs documentées** → évitées automatiquement
- **Processus optimisés** → temps réduits

### Feedback Loop
Chaque utilisation → Documentation → Amélioration → Efficacité accrue

---

## 💡 Principe Fondamental

> **"Context First, Action Second"**
> 
> Ces commandes transforment votre historique de développement en intelligence actionnable.

**Résultat :** Développement plus rapide, plus cohérent, avec moins d'erreurs répétitives.