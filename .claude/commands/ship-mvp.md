# Ship MVP - Livraison Minimum Viable

Préparer et livrer un MVP de qualité production avec les garde-fous nécessaires.

## Instructions

### 1. **Audit de Preparedness**
Pour le MVP : **$ARGUMENTS**

#### Checklist Pre-Ship
- [ ] **Fonctionnalité principale** : Le use case #1 fonctionne end-to-end
- [ ] **Tests critiques** : Les cas d'usage principaux sont testés
- [ ] **Gestion d'erreurs** : Les erreurs courantes sont gérées proprement
- [ ] **Performance acceptable** : Temps de réponse < 5s pour actions principales
- [ ] **Sécurité de base** : Pas de failles évidentes, secrets externalisés

#### Red Flags (NE PAS SHIP)
- ❌ Crashes fréquents ou non gérés
- ❌ Perte de données possible
- ❌ Temps de réponse > 10s sur actions courantes
- ❌ Aucun test sur le happy path principal
- ❌ Secrets/passwords en dur dans le code

### 2. **Préparation Technique**

#### Documentation Minimale Requise
```markdown
# [Nom du MVP]

## Quick Start
\`\`\`bash
# Installation et premier démarrage en < 5 minutes
npm install
npm run build
npm start
\`\`\`

## Usage Principal
[Exemple concret du use case #1]

## Limitations Connues
- [Liste des features manquantes assumées]
- [Limitations performance connues]
- [Cas d'usage non supportés]

## Support
[Comment obtenir de l'aide]
```

#### Configuration Production
```typescript
// config/production.ts
export const productionConfig = {
  // Secrets externalisés
  dbUrl: process.env.DATABASE_URL!,
  apiKey: process.env.API_KEY!,
  
  // Timeouts conservateurs
  requestTimeout: 30000,
  dbTimeout: 10000,
  
  // Logging approprié
  logLevel: 'info', // pas 'debug' en prod
  
  // Monitoring de base
  healthCheckPath: '/health',
  metricsEnabled: true
};
```

#### Health Check Obligatoire
```typescript
// health.ts
export async function healthCheck(): Promise<HealthStatus> {
  const checks = await Promise.allSettled([
    checkDatabase(),
    checkExternalAPIs(),
    checkDiskSpace()
  ]);
  
  return {
    status: checks.every(c => c.status === 'fulfilled') ? 'healthy' : 'degraded',
    checks: checks.map(formatCheckResult),
    timestamp: new Date().toISOString()
  };
}
```

### 3. **Testing Strategy MVP**

#### Tests Indispensables
```typescript
// tests/critical.test.ts
describe('MVP Critical Path', () => {
  test('main use case works end-to-end', async () => {
    // Test du parcours utilisateur principal
    const result = await executeMainUseCase(typicalInput);
    expect(result.success).toBe(true);
  });
  
  test('handles common errors gracefully', async () => {
    // Test des erreurs les plus probables
    const result = await executeMainUseCase(invalidInput);
    expect(result.error).toBeDefined();
    expect(result.error.message).toBeUserFriendly();
  });
  
  test('performs within acceptable limits', async () => {
    const start = Date.now();
    await executeMainUseCase(typicalInput);
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(5000); // < 5s
  });
});
```

#### Smoke Tests pour Production
```bash
#!/bin/bash
# smoke-test.sh - Tests rapides post-déploiement

echo "🧪 Running production smoke tests..."

# Health check
curl -f http://localhost:3000/health || exit 1

# Main endpoint
curl -f -X POST http://localhost:3000/api/main \
  -H "Content-Type: application/json" \
  -d '{"test": true}' || exit 1

echo "✅ Smoke tests passed"
```

### 4. **Stratégie de Déploiement**

#### Phases de Rollout
```yaml
Phase 1 - Internal (Jour J):
  - Déploiement équipe dev
  - Tests internes pendant 24h
  - Fix des bugs bloquants immédiats

Phase 2 - Beta Users (J+1):
  - 10-20% utilisateurs cible
  - Monitoring intensif
  - Feedback collection active

Phase 3 - Full Rollout (J+7):
  - 100% utilisateurs
  - Monitoring continu
  - Support réactif
```

#### Rollback Plan
```bash
# rollback.sh - Plan de retour arrière rapide
echo "🔄 Rolling back to previous version..."

# Arrêter nouvelle version
pm2 stop ebp-mcp-v2

# Redémarrer ancienne version
pm2 start ebp-mcp-v1

# Vérifier santé
curl -f http://localhost:3000/health

echo "✅ Rollback completed"
```

### 5. **Monitoring et Alertes**

#### Métriques Critiques à Surveiller
```javascript
// monitoring.js
const criticalMetrics = {
  // Performance
  responseTime: { threshold: 5000, unit: 'ms' },
  errorRate: { threshold: 5, unit: '%' },
  
  // Usage
  requestsPerMinute: { min: 1, max: 1000 },
  activeUsers: { min: 1 },
  
  // System
  memoryUsage: { threshold: 512, unit: 'MB' },
  cpuUsage: { threshold: 80, unit: '%' }
};

function checkMetrics() {
  // Implémentation monitoring simple
  const current = getCurrentMetrics();
  const alerts = validateAgainstThresholds(current, criticalMetrics);
  
  if (alerts.length > 0) {
    sendAlerts(alerts);
  }
}
```

#### Alertes Simples
```bash
# alert.sh - Alertes basiques par email/slack
if [ "$ERROR_RATE" -gt 10 ]; then
  echo "🚨 ALERT: Error rate > 10% in production" | mail -s "EBP-MCP Alert" admin@company.com
fi
```

### 6. **User Onboarding**

#### Documentation Utilisateur
```markdown
# Getting Started - [MVP Name]

## Ce que fait cette version
[Description en 1 phrase du bénéfice principal]

## Premier usage
1. [Étape 1 - < 2 minutes]
2. [Étape 2 - < 2 minutes]  
3. [Étape 3 - < 2 minutes]

✅ **Résultat attendu:** [Ce que l'utilisateur doit voir]

## Cas d'usage supportés
- ✅ [Use case 1]
- ✅ [Use case 2]
- ❌ [Use case pas encore supporté]

## Obtenir de l'aide
- 🐛 Bug: [Lien ou contact]
- ❓ Question: [Lien ou contact]
- 💡 Suggestion: [Lien ou contact]
```

#### Support Framework
```typescript
// support.ts - Support structure pour MVP
interface SupportRequest {
  type: 'bug' | 'question' | 'feature';
  priority: 'low' | 'medium' | 'high';
  user: string;
  description: string;
  context: any; // logs, config, etc.
}

function handleSupportRequest(request: SupportRequest) {
  // Log structured pour follow-up
  console.log({
    timestamp: new Date().toISOString(),
    support: request,
    version: getVersion()
  });
  
  // Response automatique
  return {
    ticketId: generateTicketId(),
    expectedResponse: calculateResponseTime(request.priority),
    workaround: suggestWorkaround(request)
  };
}
```

### 7. **Communication du Launch**

#### Annonce Interne
```markdown
Objet: 🚀 EBP-MCP v2 MVP Live - Ready for Testing

Team,

Notre MVP EBP-MCP v2 est maintenant déployé et prêt pour vos tests !

**Quoi de neuf:**
- [Feature principale]
- [Amélioration clé]
- [Bénéfice utilisateur]

**Comment tester:**
[Lien + instructions 2 minutes]

**Feedback attendu:**
- ✅ Ça marche / ❌ Ça ne marche pas
- 🐛 Bugs rencontrés
- 💡 Suggestions d'amélioration

**Limitations assumées:** [Liste courte]

Go test! 🧪
```

#### Communication Utilisateurs
```markdown
Objet: Nouvelle version EBP disponible - Test pilote

Bonjour [Utilisateur],

Nous avons le plaisir de vous proposer de tester notre nouvelle interface EBP qui simplifie la création d'activités commerciales.

**Bénéfice:** Créer vos comptes-rendus en langage naturel au lieu de formulaires complexes.

**Durée test:** 2 semaines
**Support:** Réponse < 24h garantie

Intéressé ? Répondez à ce mail pour recevoir les instructions.

Merci pour votre collaboration !
```

### 8. **Post-Launch Checklist**

#### Premières 24h
- [ ] **Monitoring actif** : Vérifier métriques toutes les 2h
- [ ] **Smoke tests** : Exécuter après chaque déploiement
- [ ] **User feedback** : Collecter premiers retours
- [ ] **Bug fixes** : Prioriser et corriger bugs bloquants

#### Première semaine
- [ ] **Usage analytics** : Analyser patterns d'utilisation
- [ ] **Performance review** : Identifier goulots d'étranglement
- [ ] **User interviews** : 3-5 sessions de feedback approfondi
- [ ] **Roadmap next** : Planifier améliorations prioritaires

### 9. **Success Metrics**

#### Définition du Succès MVP
```yaml
Adoption:
  - 50%+ des utilisateurs cible testent dans les 2 semaines
  - 80%+ complètent le premier use case avec succès

Quality:
  - <5% taux d'erreur sur actions principales
  - <3s temps de réponse moyen
  - <24h temps de résolution support

Satisfaction:
  - 70%+ satisfaction générale (sondage)
  - 60%+ préfèrent nouvelle version vs ancienne
```

#### Métriques de Validation Hypothèses
```markdown
Hypothèse: "Simplifier la création d'activités augmente l'usage"
Métrique: Nombre d'activités créées/jour/utilisateur
Baseline: 3-5 activités/jour pour 4 commerciaux
Target: 10+ activités/jour pour 4 commerciaux
```

### 10. **Évolution Post-MVP**

#### Documentation Continue
Documenter dans `logs/learnings.md` :
```markdown
### MVP Launch: [Date]
**Version:** [Version number]
**Features shipped:** [Liste]
**Users:** [Nombre d'utilisateurs]

**Week 1 Results:**
- Adoption: [%]
- Error rate: [%]
- Performance: [avg response time]
- Top user feedback: [3 points principaux]

**Validated hypotheses:**
- [Hypothèse 1]: ✅/❌ + données
- [Hypothèse 2]: ✅/❌ + données

**Next iteration priorities:**
1. [Fix #1 basé sur feedback]
2. [Feature #1 la plus demandée]
3. [Optimisation #1 la plus impactante]
```

## Principe du Ship

> **"Done is better than perfect"**
> 
> Un MVP imparfait qui apporte de la valeur > Un produit parfait qui ne sort jamais

Le succès d'un MVP se mesure à sa capacité à :
1. **Valider** les hypothèses principales
2. **Apprendre** des vrais utilisateurs 
3. **Itérer** rapidement basé sur les données réelles