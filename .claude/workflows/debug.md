# Workflow: Debug Intelligent

## Objectif
Résoudre les problèmes efficacement en utilisant l'historique des solutions.

## Processus de Debug

### 1. Identifier le Type d'Erreur
```yaml
Connexion SQL:
  - Check: TCP/IP activé ?
  - Check: Firewall ?
  - Check: Credentials ?
  - Historique: voir logs/failures.md#sql-connection

MCP Tool:
  - Check: Format de réponse ?
  - Check: Validation Zod ?
  - Check: Async/await ?
  - Historique: voir context/patterns.md#mcp-tools

Build/TypeScript:
  - Check: tsconfig.json ?
  - Check: Imports ESM ?
  - Check: Types manquants ?
  - Historique: voir logs/failures.md#typescript
```

### 2. Recherche dans l'Historique
```bash
# Avant de chercher sur internet
grep -r "error_pattern" .claude-v2/logs/
grep -r "similar_issue" .claude-v2/context/

# Si trouvé → Appliquer solution documentée
# Si non → Nouvelle recherche + documenter
```

### 3. Approche Systématique

#### Pour Erreurs de Connexion
1. Test connexion directe avec `sqlcmd`
2. Test avec script Node.js minimal
3. Ajouter logs détaillés
4. Documenter configuration qui marche

#### Pour Erreurs MCP
1. Isoler le tool problématique
2. Tester avec input minimal
3. Vérifier format de sortie
4. Comparer avec tools qui marchent

#### Pour Erreurs TypeScript
1. Commencer sans types stricts
2. Ajouter types progressivement
3. Utiliser `any` temporairement si bloqué
4. Refactorer une fois fonctionnel

### 4. Documentation Post-Debug

#### Si Succès → context/patterns.md
```markdown
## Pattern: [Nom du problème résolu]
**Symptôme:** [Description erreur]
**Cause:** [Cause racine]
**Solution:** [Étapes qui ont marché]
**Temps résolution:** [X minutes]
**Applicable à:** [Contextes similaires]
```

#### Si Échec → logs/failures.md
```markdown
## Échec: [Nom du problème]
**Date:** [Date]
**Symptôme:** [Description]
**Tentatives:** [Ce qui a été essayé]
**Blocage:** [Pourquoi ça ne marche pas]
**Prochaine piste:** [Idée pour plus tard]
```

## Outils de Debug

### SQL Server
```sql
-- Test connexion
SELECT @@VERSION;
SELECT DB_NAME();

-- Test permissions
SELECT * FROM sys.database_permissions WHERE grantee_principal_id = USER_ID();

-- Test tables
SELECT TOP 1 * FROM Activity;
```

### MCP
```typescript
// Mode debug
if (process.env.DEBUG) {
  console.error('[DEBUG]', message);
}

// Test tool isolé
async function testTool() {
  const result = await tool.handler({ param: 'test' });
  console.log(JSON.stringify(result, null, 2));
}
```

## Raccourcis Connus

### Problème: "Cannot connect to SQL Server"
→ Solution: Activer TCP/IP dans SQL Server Configuration Manager

### Problème: "Authentication failed"
→ Solution: Vérifier Mixed Mode Authentication activé

### Problème: "Tool not found in Claude"
→ Solution: Rebuild + restart Claude Desktop

### Problème: "TypeScript import errors"
→ Solution: Ajouter `"type": "module"` dans package.json

## Principe de Debug
1. **Reproduire** - Pouvoir déclencher l'erreur
2. **Isoler** - Trouver le composant fautif
3. **Simplifier** - Réduire au cas minimal
4. **Documenter** - Pour ne pas refaire
5. **Partager** - Enrichir le contexte commun