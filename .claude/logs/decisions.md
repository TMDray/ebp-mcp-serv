# Journal des Décisions - EBP MCP v2

> Historique chronologique des décisions architecturales et stratégiques

## Février 2025

### 05/02/2025 - Redémarrage v2 avec Approche Évolutive

**Décision:** Recommencer avec architecture évolutive vs complexité upfront v1  
**Contexte:** v1 trop ambitieux, blocages multiples, temps perdu  
**Alternative considérée:** Continuer v1 et débugger  
**Justification:** 
- Meilleure compréhension MCP patterns maintenant
- Approche itérative moins risquée
- Contexte auto-améliorant réduira erreurs futures
- v1 comme référence fonctionnelle, pas code

**Impact attendu:**
- ✅ Développement plus rapide
- ✅ Moins d'erreurs bloquantes  
- ✅ Apprentissages cumulatifs
- ⚠️ Temps investi v1 "perdu" (mais apprentissage)

**Validation:** Première fonctionnalité livrée dans les 48h

---

### 05/02/2025 - Structure .claude-v2/ Séparée

**Décision:** Créer .claude-v2/ distinct de .claude/ existant  
**Contexte:** Besoin de distinguer ancien et nouveau contexte  
**Alternative:** Remplacer .claude/ directement  
**Justification:**
- Comparaison possible ancien/nouveau
- Sécurité (rollback possible)
- Clarté pour utilisateur

**Impact:** Double espace disque acceptable pour traçabilité

---

### 05/02/2025 - TypeScript + ESM natif

**Décision:** TypeScript avec modules ESM, pas CommonJS  
**Contexte:** MCP SDK moderne, standards actuels  
**Alternative:** CommonJS (plus simple historiquement)  
**Justification:**
- Alignement avec SDK MCP
- Standards futurs
- Meilleure intégration Claude Desktop
- Imports .js explicites (clarté)

**Risque accepté:** Configuration légèrement plus complexe au début

---

### 05/02/2025 - mssql sur tedious vs alternatives

**Décision:** Bibliothèque `mssql` (wrapper tedious)  
**Contexte:** Connexion SQL Server depuis Node.js  
**Alternatives considérées:**
- tedious (direct, plus bas niveau)
- node-mssql (deprecated)
- odbc (complexe)

**Justification:**
- API moderne async/await
- Pooling intégré
- Communauté active
- Documentation claire
- Compatible SQL Server 2019

---

### 05/02/2025 - Pas de Framework Web

**Décision:** MCP pur sans Express/Fastify/etc.  
**Contexte:** Serveur MCP ne nécessite pas HTTP  
**Alternative:** Express "au cas où"  
**Justification:**
- MCP gère le transport (stdio)
- Moins de dépendances
- Plus simple
- Focus sur business logic

**Évolution possible:** Ajouter HTTP plus tard si besoin Copilot Studio

---

### 05/02/2025 - Un tool par fonctionnalité

**Décision:** `ebp_get_activities` et `ebp_create_activity` séparés  
**Alternative:** `ebp_manage_activities` avec paramètre action  
**Justification:**
- Interface utilisateur plus claire
- Debugging plus facile
- Permissions granulaires possibles
- Évolution indépendante

---

### 05/02/2025 - Tests simples (Node natif)

**Décision:** Tests avec `node --test` natif, pas Jest/Mocha  
**Contexte:** Besoin de tests mais stack simple  
**Alternative:** Jest (plus de features)  
**Justification:**
- Dépendance en moins
- Suffisant pour MVP
- API stable Node.js 18+
- Démarrage rapide

**Évolution:** Migrer vers Jest si tests complexes plus tard

---

## Décisions en Attente

### Auth: Copilot User → EBP Commercial
**Question:** Comment récupérer l'identité utilisateur de Copilot Studio ?  
**Options:**
1. Variable environnement (simple mais statique)
2. Paramètre tool (flexible mais UX dégradée)
3. MCP resource avec mapping (propre mais complexe)

**Deadline:** Avant test avec vrais commerciaux  
**Recherche needed:** Documentation Copilot Studio + MCP

---

### Déploiement: Local vs Serveur
**Question:** Chaque commercial installe local ou serveur centralisé ?  
**Options:**
1. Installation locale (plus simple, plus privé)
2. Serveur centralisé (maintenance plus facile)
3. Hybride (choix par commercial)

**Facteurs:** 
- Sécurité données EBP
- Maintenance IT
- Performance réseau
- Adoption utilisateur

**Deadline:** Avant phase pilote

---

### RTF: Parser custom vs bibliothèque
**Question:** Parser RTF fait maison ou dépendance ?  
**État:** Parser simple prévu, à valider sur données réelles  
**Alternative:** `rtf-parser` npm (dépendance supplémentaire)  
**Test:** Conversion round-trip sur échantillon EBP

---

## Templates de Décision Future

### Template Décision Technique
```markdown
### [Date] - [Titre de la décision]

**Décision:** [Ce qui a été décidé]
**Contexte:** [Pourquoi cette décision était nécessaire]
**Alternatives considérées:** 
- Option A: [Pros/Cons]
- Option B: [Pros/Cons]
**Justification:** [Critères de choix]
**Impact attendu:** [Conséquences positives/négatives]
**Validation:** [Comment savoir si c'était bon]
**Rollback possible:** [Oui/Non + comment]
```

### Template Décision Business
```markdown
### [Date] - [Décision UX/Métier]

**Décision:** [Ce qui a été décidé]
**Utilisateurs impactés:** [Commercial/IT/Client]
**Problème résolu:** [Pain point adressé]
**Trade-offs:** [Ce qu'on sacrifie pour ce gain]
**Métriques:** [Comment mesurer le succès]
**Timeline:** [Quand l'implémenter]
```

---

## Métriques des Décisions

### Qualité Décisionnelle
- Décisions reversées: 0 (target: < 10%)
- Temps moyen prise décision: N/A (target: < 2 jours)
- Décisions validées par métriques: 0% (target: > 80%)

### Pattern Émergents
- Préférence simplicité vs features: 100%
- Choix standards vs custom: 80% standards
- Tests early vs late: 100% early

---

*Journal maintenu chronologiquement. Chaque décision doit être traçable et justifiée.*