# 🚀 ROADMAP EBP MCP Server - Améliorations Progressive

## 📊 Analyse de l'existant

### Tables disponibles dans EBP
- **Activity**: 2332 activités (55 colonnes)
- **SaleDocument**: 7787 documents de vente (519 colonnes!)
- **SaleDocumentLine**: 34542 lignes de vente
- **Customer**: 213 colonnes d'infos clients
- **Item**: 374 colonnes pour les articles/produits

### Activité actuelle des commerciaux
- **MATHIAS** (champion): 140 activités, 85 clients
- **DEBORAH**: 17 activités, 15 clients
- **JULIE**: 13 activités, 8 clients
- **CONSTANCE**: Peu d'activité visible

## 🎯 Roadmap priorisée (Impact/Effort)

### 🟢 Phase 2.1 - Quick Wins (1-2 jours)
**Impact: Élevé | Effort: Faible**

#### 1. Enrichir `ebp_get_client_activities` existant
```typescript
// Nouveaux paramètres optionnels
{
  customerId?: string,      // Si absent = toutes activités
  colleagueId?: string,      // Filter par commercial
  startDate?: string,        // Date début (ISO)
  endDate?: string,          // Date fin (ISO)
  type?: string,             // Type d'activité
  limit?: number             // Défaut: 20
}
```
- **Avantage**: Réutilise la requête existante
- **Usage**: "Montre-moi mes activités de la semaine"

#### 2. Nouveau tool `ebp_get_client_sales`
```typescript
// CA et historique des ventes par client
{
  customerId: string,
  year?: number,             // Défaut: année courante
  includeDetails?: boolean   // Inclure le détail des lignes
}
// Retourne: CA total, nombre de commandes, produits achetés
```
- **Avantage**: Info cruciale pour les commerciaux
- **Usage**: "Quel est le CA de ce client cette année?"

### 🟡 Phase 2.2 - Valeur Ajoutée (3-4 jours)
**Impact: Élevé | Effort: Moyen**

#### 3. Tool `ebp_get_top_products`
```typescript
// Top produits vendus (global ou par client)
{
  customerId?: string,       // Si spécifié = pour ce client
  period?: 'month'|'quarter'|'year',
  limit?: number             // Top N produits
}
```
- **Usage**: "Quels sont les produits préférés de ce client?"

#### 4. Tool `ebp_search_customers`
```typescript
// Recherche multi-critères de clients
{
  query?: string,            // Recherche nom/ville
  colleagueId?: string,      // Mes clients
  minRevenue?: number,       // CA minimum
  hasRecentActivity?: boolean // Activité < 30 jours
}
```
- **Usage**: "Liste mes clients sans activité depuis 30 jours"

#### 5. Cache mémoire simple
- Cache LRU de 15 minutes pour:
  - Infos clients fréquemment consultés
  - CA et statistiques du jour
- **Gain**: Réponses instantanées pour questions répétées

### 🔵 Phase 2.3 - Bidirectionnel (5-7 jours)
**Impact: Très élevé | Effort: Élevé**

#### 6. Tool `ebp_create_activity`
```typescript
// Créer une nouvelle activité
{
  customerId: string,
  type: string,
  caption: string,
  notes: string,
  startDateTime?: string,    // Défaut: maintenant
  colleagueId?: string       // Défaut: depuis contexte
}
```
- **Validation**: Vérifier existence client, format dates
- **Usage**: "Ajoute une visite client chez X"

#### 7. Tool `ebp_update_activity`
```typescript
// Modifier une activité existante
{
  activityId: string,
  notes?: string,            // Ajouter des notes
  endDateTime?: string       // Clôturer l'activité
}
```

### 🟣 Phase 3 - Advanced (Future)
- Export PDF des rapports
- Intégration calendrier
- Notifications proactives
- Dashboard analytics

## 📋 Implémentation suggérée

### Commencer par Phase 2.1:
1. **Jour 1**: Enrichir `ebp_get_client_activities`
2. **Jour 2**: Ajouter `ebp_get_client_sales`
3. **Test** avec MATHIAS (champion user)

### Architecture évolutive:
```typescript
// Structure modulaire proposée
src/
  tools/
    activities.ts    // Tools activités
    sales.ts        // Tools ventes/CA
    customers.ts    // Tools clients
    products.ts     // Tools produits
  cache/
    lru-cache.ts    // Cache simple
  validation/
    schemas.ts      // Validation des inputs
```

## 💡 Recommandations

### Priorité immédiate:
1. **`ebp_get_client_sales`** - Info CA cruciale pour commerciaux
2. **Enrichir les recherches** - Filtres par date/type
3. **Cache simple** - Performance perçue

### Points d'attention:
- CustomerId est un string, pas un number
- Notes en RTF nécessitent conversion
- Validation stricte pour les écritures
- Logging détaillé pour debug

### Métriques de succès:
- Temps de réponse < 2s
- 0 erreur en production
- Adoption par les 4 commerciaux
- Réduction temps création rapport: -50%

## 🔧 Next Steps

1. Valider les priorités avec le client
2. Implémenter Phase 2.1 (2 jours)
3. Test avec MATHIAS
4. Déployer progressivement
5. Collecter feedback
6. Itérer

---

*Cette roadmap est conçue pour livrer de la valeur rapidement tout en construisant une base solide pour l'évolution future du MCP.*