# Debug d'Issue - Résolution Méthodique

Débugger un problème en utilisant l'historique des solutions et une approche systématique.

## Instructions

### 1. **Collecte de Contexte**
Pour l'issue : **$ARGUMENTS**

Consulte obligatoirement avant de débugger :
- **`.claude/context/failures.md`** - Problèmes similaires déjà résolus
- **`.claude/workflows/debug.md`** - Méthodologie de debug
- **`.claude/logs/learnings.md`** - Solutions qui ont fonctionné
- **`.claude/context/patterns.md`** - Patterns de résolution

### 2. **Classification du Problème**

#### Type d'Issue
- [ ] **Connexion/Network** - Base de données, API, réseau
- [ ] **Configuration** - Variables env, settings, paths
- [ ] **Build/Compilation** - TypeScript, dépendances, modules
- [ ] **Runtime** - Erreurs à l'exécution, exceptions
- [ ] **Performance** - Lenteur, timeouts, mémoire
- [ ] **Logique Métier** - Comportement incorrect
- [ ] **Intégration** - Interface entre composants

#### Urgence
- 🔴 **Critique** - Bloque complètement le développement
- 🟠 **Haute** - Impact majeur sur fonctionnalité
- 🟡 **Moyenne** - Gêne mais contournement possible
- 🟢 **Basse** - Amélioration souhaitée

### 3. **Debug Systématique**

#### Étape 1: Reproduction
1. **Reproduire** le problème de manière consistante
2. **Cas minimal** qui déclenche l'issue
3. **Conditions** exactes (OS, version, config)
4. **Logs/erreurs** complètes et précises

#### Étape 2: Recherche dans l'Historique
Vérifier si problème similaire dans :
```bash
# Recherche dans les patterns de solutions
grep -r "mot_clé_erreur" .claude-v2/context/failures.md
grep -r "type_problème" .claude-v2/logs/learnings.md
```

#### Étape 3: Diagnostic
1. **Isoler** le composant fautif
2. **Vérifier** les prérequis (connexions, permissions, config)
3. **Tracer** l'exécution étape par étape
4. **Comparer** avec code fonctionnel similaire

### 4. **Solutions par Type d'Issue**

#### Connexion SQL
```javascript
// Debug connexion
const testConnection = async () => {
  try {
    console.log('Config:', { server, database, user });
    const pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log('✅ Connexion OK');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    // Vérifier: TCP/IP, firewall, credentials
  }
};
```

#### Build TypeScript
```bash
# Debug compilation
npx tsc --noEmit  # Vérifier erreurs sans build
npm ls            # Vérifier dépendances
node --version    # Vérifier version Node
```

#### MCP Tools
```javascript
// Debug tool MCP
const debugTool = {
  name: 'debug_test',
  schema: z.object({ test: z.string() }),
  handler: async ({ test }) => {
    console.log('Input:', test);
    return { success: true, debug: test };
  }
};
```

### 5. **Méthodes de Debug Avancées**

#### Logging Ciblé
```javascript
const DEBUG = process.env.DEBUG === 'true';
const log = (message, data) => {
  if (DEBUG) {
    console.error(`[DEBUG ${new Date().toISOString()}]`, message, data);
  }
};
```

#### Tests d'Isolation
```javascript
// Tester composant isolément
async function testComponent() {
  const minimal = createMinimalExample();
  const result = await processComponent(minimal);
  console.log('Résultat isolation:', result);
}
```

### 6. **Escalade et Assistance**

#### Si Bloqué après 30 min
1. **Documenter** tout ce qui a été essayé
2. **Créer** un exemple minimal reproductible
3. **Chercher** solutions externes (GitHub issues, Stack Overflow)
4. **Demander aide** avec contexte complet

#### Préparer la Question
- Environnement exact (OS, versions)
- Code minimal qui reproduit
- Messages d'erreur complets
- Ce qui a déjà été essayé

### 7. **Résolution et Documentation**

#### Une fois résolu
1. **Valider** que la solution marche dans tous les cas
2. **Tester** les cas limites
3. **Documenter** dans `logs/learnings.md` :

```markdown
### Debug: [Titre du problème]
**Date:** [Date]
**Durée résolution:** [X minutes]
**Type:** [Classification]

**Symptômes:**
[Description exacte du problème]

**Cause racine:**
[Ce qui causait vraiment le problème]

**Solution:**
[Étapes exactes pour résoudre]

**Prévention:**
[Comment éviter à l'avenir]

**Pattern réutilisable:** [Oui/Non]
```

#### Si Pattern Réutilisable
Ajouter dans `context/patterns.md` :
```markdown
### Pattern Debug: [Type d'issue]
**Problème:** [Description générique]
**Solution type:** [Approche qui marche]
**Temps typique:** [X minutes]
**Applicable à:** [Contextes similaires]
```

### 8. **Méta-Debug : Améliorer le Processus**

#### Après chaque debug, se demander :
- La solution était-elle déjà documentée ?
- Le problème aurait-il pu être évité ?
- Y a-t-il un pattern à extraire ?
- Le workflow de debug peut-il être amélioré ?

## Outils de Debug

### Commandes Utiles
```bash
# Logs système
tail -f logs/app.log

# État des processus
ps aux | grep node

# État réseau
netstat -an | grep 1433

# Variables environnement
printenv | grep EBP
```

### Scripts de Debug
Créer des scripts de test pour les composants critiques :
- `test-db-connection.js`
- `test-mcp-tools.js`
- `test-rtf-conversion.js`

## Principes de Debug
- **Méthodique** : Suivre un processus, pas du tâtonnement
- **Documentation** : Chaque solution enrichit la base de connaissances
- **Isolation** : Tester les composants séparément
- **Minimal** : Plus petit exemple qui reproduit le problème

## Anti-Patterns de Debug
- ❌ Essayer des solutions au hasard
- ❌ Ne pas documenter ce qui a été tenté
- ❌ Ignorer les solutions précédemment documentées
- ❌ Ne pas reproduire le problème de manière consistante
- ❌ Oublier de tester la solution sur différents cas