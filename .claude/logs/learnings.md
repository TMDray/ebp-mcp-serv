# Apprentissages Cumulatifs - EBP MCP v2

> Documentation des leçons apprises pour évolution du contexte

## Apprentissages MCP

### À documenter après premiers tests...

*Ce fichier s'enrichira automatiquement avec chaque succès/échec documenté*

---

## Apprentissages SQL Server

### À venir...

*Première connexion EBP documentera les patterns découverts*

---

## Apprentissages TypeScript/Build

### Pattern: Configuration ESM + TypeScript
**Appris le:** 05/02/2025 (préventif)  
**Contexte:** Éviter erreur "Cannot use import statement"  

**Configuration validée:**
```json
// package.json
{
  "type": "module",
  "engines": { "node": ">=18.0.0" }
}

// tsconfig.json  
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16"
  }
}
```

**Piège évité:** Imports sans .js en TypeScript ESM  
**Solution:** `import { db } from './db.js'` même pour fichier .ts  
**Temps économisé:** ~30 min de debug  

---

## Apprentissages Architecture

### Leçon: Commencer Simple Toujours
**Appris le:** 05/02/2025 (rétrospective v1)  
**Contexte:** v1 trop complexe d'emblée, blocages multiples  

**Anti-pattern identifié:**
- Créer plusieurs tools sans tester le premier
- Implémenter auth complexe avant connexion de base
- Optimiser avant que ça marche

**Pattern validé:**
1. Test connexion seule
2. Un tool minimal qui marche  
3. Complexifier progressivement
4. Documenter chaque étape

**Application:** Workflow setup.md avec checkpoints obligatoires

---

### Leçon: Contexte Évolutif > Documentation Statique  
**Appris le:** 05/02/2025 (design v2)  
**Contexte:** Besoin de capitaliser sur chaque apprentissage  

**Découverte:** Documentation qui ne s'enrichit pas = obsolescence rapide  
**Solution:** 
- Fichiers qui évoluent automatiquement
- Templates pour capturer learnings
- Métriques pour valider patterns
- IA qui met à jour contexte

**Validation attendue:** Temps de résolution problèmes similaires divisé par 3

---

## Apprentissages Processus

### Leçon: Todo List Critique pour Projets Complexes
**Appris le:** 05/02/2025  
**Contexte:** Suivi structure de nombreuses tâches  

**Problème:** Sans todo, perte de focus et oublis  
**Solution:** TodoWrite systématique avec statuts  
**Bénéfice:** Visibilité progrès + pas d'oubli tâches  

**Pattern:** Marquer completed immédiatement, pas en batch

---

## Apprentissages Techniques

### À venir: Patterns Connexion SQL
*Sera documenté après premier test connexion*

### À venir: Patterns RTF
*Sera documenté après tests conversion caractères spéciaux*

### À venir: Patterns MCP Tools
*Sera documenté après premier tool fonctionnel*

---

## Apprentissages Business

### Leçon: Mathias = Champion User à Privilégier
**Appris le:** Analyse données existantes  
**Contexte:** 140 activités vs 0-17 pour autres commerciaux  

**Insight:** Utilisateur expérimenté = meilleur feedback qualité  
**Application:** Tests pilote avec Mathias en premier  
**Hypothèse:** Si Mathias adopte v2, autres suivront  

### Leçon: 93% Activités Sans Attribution = Problème Majeur
**Appris le:** Analyse base EBP  
**Contexte:** ColleagueId NULL sur majorité historique  

**Impact:** Perte d'informations commerciales critiques  
**Solution v2:** TOUJOURS remplir ColleagueId, jamais null  
**Validation:** 100% attribution sur nouvelles activités  

---

## Apprentissages UX

### À documenter après tests utilisateurs...

---

## Méta-apprentissages

### Leçon: Documenter Échecs = Actif Précieux
**Appris le:** 05/02/2025  
**Contexte:** Création context/failures.md  

**Réalisation:** Échecs non documentés = répétition inévitable  
**Solution:** Template systématique pour capturer échecs  
**ROI:** Temps économisé sur problèmes similaires  

### Leçon: Recherche MCP Patterns = Gain x10  
**Appris le:** 05/02/2025  
**Contexte:** Recherche projets MCP existants  

**Découverte:** Beaucoup de patterns validés disponibles  
**Application:** Toujours rechercher avant d'inventer  
**Économie:** Heures de tâtonnement évitées  

---

## Templates d'Apprentissage

### Template Learning Technique
```markdown
### Leçon: [Titre]
**Appris le:** [Date]
**Contexte:** [Situation qui a mené à cet apprentissage]
**Problème original:** [Ce qui ne marchait pas]
**Solution trouvée:** [Ce qui marche]
**Pattern généralisable:** [Comment réutiliser]
**Temps économisé:** [Estimation]
**Applicable à:** [Contextes similaires]
```

### Template Learning Business
```markdown
### Insight: [Titre]
**Découvert le:** [Date]
**Source:** [Données/Tests/Feedback]
**Constat:** [Ce qu'on a compris]
**Impact sur produit:** [Comment ça change l'approche]
**Validation:** [Comment tester cette hypothèse]
**Métrique:** [Comment mesurer l'amélioration]
```

### Template Learning Process  
```markdown
### Amélioration: [Process concerné]
**Identifiée le:** [Date]
**Inefficacité observée:** [Ce qui prenait du temps]
**Optimisation:** [Nouvelle façon de faire]
**Gain:** [Temps/Qualité économisé]
**Adoption:** [Comment systématiser]
```

---

## Scoring des Apprentissages

### Impact Business
- **Critique (9-10):** Change la stratégie produit
- **Important (7-8):** Améliore significativement UX
- **Utile (5-6):** Optimise processus développement  
- **Mineur (1-4):** Détail technique ponctuel

### Réutilisabilité
- **Universelle:** Tous projets MCP
- **Domaine:** Projets base de données  
- **Projet:** EBP MCP uniquement
- **Ponctuelle:** Situation spécifique

### Validation
- **Prouvée:** Métriques confirment
- **Testée:** Appliquée avec succès 1x
- **Théorique:** Logique mais non testée
- **Hypothèse:** À valider

---

## Évolution des Apprentissages

### Hebdomadaire
- Synthèse nouveaux patterns
- Validation hypothèses en cours
- Mise à jour priorités

### Mensuel  
- Archivage apprentissages obsolètes
- Consolidation patterns similaires
- Métriques ROI formation contexte

---

*"Learning is not compulsory... neither is survival."*  
*Ce fichier transforme chaque échec en actif pour l'équipe*