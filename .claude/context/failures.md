# Échecs Instructifs - EBP MCP v2

> Documentation des échecs pour éviter de répéter les mêmes erreurs

## Échecs de Connexion SQL

### Échec: "Login failed for user 'sa'"
**Date:** Non testé encore  
**Symptômes:** 
- Erreur d'authentification
- Connection timeout possible
- Message générique SQL Server

**Causes probables:**
1. Mixed Mode Authentication désactivé
2. Compte 'sa' désactivé
3. Mot de passe incorrect
4. Instance SQL non démarrée

**Solutions tentées:** (à documenter lors du test)
- [ ] Vérifier instance active
- [ ] Tester avec SQL Server Management Studio
- [ ] Vérifier configuration authentification
- [ ] Tester avec Windows Authentication

**Apprentissage attendu:** Toujours tester connexion manuellement avant code

---

### Échec: "TCP/IP not enabled"
**Date:** Connu mais non rencontré  
**Symptômes:**
- Connection timeout
- "Could not open connection"
- Port 1433 injoignable

**Solution validée:**
1. SQL Server Configuration Manager
2. SQL Server Network Configuration
3. Protocols for [Instance]
4. Enable TCP/IP
5. Restart SQL Server Service

**Pattern résultant:** Checklist pré-développement à créer

---

## Échecs TypeScript/Build

### Échec: "Cannot use import statement outside a module"
**Date:** Pattern connu  
**Cause:** package.json sans `"type": "module"`  
**Solution:** Ajouter `"type": "module"` + imports .js dans TypeScript  

```json
// package.json - ✅ Solution
{
  "type": "module"
}
```

```typescript
// imports - ✅ Solution
import { db } from './database/connection.js'; // .js même en TypeScript!
```

**Temps perdu historique:** 30+ min par projet  
**Prévention:** Template projet avec configuration validée  

---

### Échec: "Top-level await not supported"
**Date:** Pattern connu  
**Solution:** Wrapper async ou configuration target ES2022  

```typescript
// ❌ Ne marche pas toujours
await initDatabase();

// ✅ Solution universelle
(async () => {
  await initDatabase();
  startMCPServer();
})();
```

---

## Échecs MCP

### Échec: "Unexpected token '✅', ... is not valid JSON"
**Date:** 05/02/2025  
**Durée:** 15 minutes  
**Contexte:** Premier test avec Claude Desktop

**Symptômes:**
- `MCP ebp-mcp: Unexpected token '✅', "✅ Connexio"... is not valid JSON`
- `MCP ebp-mcp: Unexpected token '�', "🚀 Serveur"... is not valid JSON`
- `upstream connect error or disconnect/reset before headers`

**Cause racine:**
Les serveurs MCP communiquent via JSON-RPC sur stdio. Tout `console.log()` ou `console.error()` est interprété comme une réponse JSON par le protocole MCP. Les emojis et messages de log cassent ce protocole.

**Solution finale:**
1. Remplacer tous les `console.log/error` par un logger fichier
2. Créer `logger.ts` qui écrit dans `ebp-mcp.log`
3. Activer avec `EBP_MCP_DEBUG=true` si besoin de debug

```typescript
// ❌ JAMAIS dans un serveur MCP
console.log('✅ Connexion réussie');

// ✅ Solution
logger.info('Connexion réussie');
```

**Prévention:**
- **RÈGLE D'OR:** Aucun output stdout/stderr dans un serveur MCP
- Toujours utiliser un logger fichier
- Tester avec Claude Desktop avant tout commit

---

### Échec: "Server not responding"
**Date:** À documenter  
**Causes probables:**
1. Serveur ne démarre pas
2. Transport stdio mal configuré
3. Erreur dans définition tool
4. Claude Desktop config incorrecte

**Debug prévu:**
```bash
# Test serveur isolé
node build/index.js --stdio

# Logs verbeux
EBP_MCP_DEBUG=true node build/index.js

# Vérifier les logs
tail -f ebp-mcp.log
```

---

### Échec: "Tool schema validation failed"  
**Date:** Pattern attendu  
**Cause:** Schema Zod incompatible avec attentes MCP  

**Solutions connues:**
- Descriptions explicites pour tous paramètres
- Types simples (string, number, boolean)
- Éviter unions complexes
- Tester avec inputs minimaux

---

## Échecs Business Logic

### Échec: "Client not found" - Trop strict
**Date:** À anticiper  
**Problème:** Recherche exacte vs fuzzy search  
**Impact:** UX dégradée, commerciaux frustrés  

**Solution prévue:** Recherche approximative avec suggestions  
```sql
-- Au lieu de WHERE Name = @exact
-- Utiliser WHERE Name LIKE '%' + @partial + '%'
-- Avec scoring par pertinence
```

---

### Échec: "RTF conversion broken"
**Date:** Risque élevé  
**Problème:** Caractères spéciaux français mal convertis  
**Impact:** Notes illisibles dans EBP  

**Test prévu:**
```javascript
const testCases = [
  'Réunion chez Dupont à 14h',
  'Budget confirmé : 50 000€',
  'Client très intéressé !',
  'Décision prévue en mars'
];

testCases.forEach(text => {
  const rtf = RTFConverter.toRTF(text);
  const back = RTFConverter.toText(rtf);
  assert(text === back, `Failed: ${text} != ${back}`);
});
```

---

## Échecs de Déploiement

### Échec: "Permission denied" sur build/
**Date:** Pattern Windows connu  
**Cause:** Build précédent avec fichiers locked  
**Solution:** `rm -rf build/` ou redémarrer VS Code  

---

### Échec: "Claude Desktop not finding server"
**Date:** À anticiper  
**Causes probables:**
1. Chemin incorrect dans .mcp.json
2. Permissions fichier
3. Node.js version incompatible
4. Dépendances manquantes

**Debug prévu:**
```json
// Test avec chemin absolu d'abord
{
  "mcpServers": {
    "ebp-sql": {
      "command": "C:\\Program Files\\nodejs\\node.exe",
      "args": ["C:\\chemin\\complet\\build\\index.js"]
    }
  }
}
```

---

## Méta-échecs (Processus)

### Échec: "Trying to do everything at once"
**Date:** Risque permanent  
**Symptômes:**
- Plusieurs tools implémentés sans test
- Configuration complexe d'emblée
- Debug difficile car trop de variables

**Prévention:** Workflow setup.md strict  
**Mantra:** "One thing working before two things broken"

---

### Échec: "Not documenting the failure"
**Date:** Méta-risque  
**Impact:** Répéter les mêmes erreurs  
**Solution:** Ce fichier + discipline  

**Règle:** Chaque erreur > 10 min doit être documentée  

---

## Templates de Documentation d'Échec

### Template Échec Technique
```markdown
### Échec: [Titre descriptif]
**Date:** [Date de l'échec]
**Durée:** [Temps perdu]
**Contexte:** [Ce qui était tenté]

**Symptômes:**
- [Message d'erreur exact]
- [Comportement observé]

**Cause racine:**
[Ce qui causait vraiment le problème]

**Solution finale:**
[Ce qui a marché]

**Prévention:**
[Comment éviter à l'avenir]
```

### Template Échec UX
```markdown
### Échec: [Problème utilisateur]
**Date:** [Date]
**Utilisateur:** [Commercial ou test]
**Impact:** [Frustration, abandon, etc.]

**Problème:**
[Description du point de friction]

**Feedback utilisateur:**
"[Citation exacte si possible]"

**Solution appliquée:**
[Changement fait]

**Validation:**
[Test que ça marche mieux]
```

---

## Indicateurs d'Échec Précoce

### 🚨 Signaux d'alarme
- Build qui prend > 30 secondes
- Plus de 3 erreurs TypeScript persistantes  
- Besoin de redémarrer Claude Desktop souvent
- Connexion SQL instable (retry constant)
- Messages d'erreur pas compréhensibles par commercial

### 📊 Métriques à surveiller
- Temps de résolution erreur (target: < 15 min)
- Erreurs répétitives (target: 0)
- Tests manuels nécessaires (minimiser)

---

*"Failure is success in progress" - Mais seulement si on apprend*  
*Ce document grandit avec nos erreurs pour qu'elles servent*