# Analyse Debug - Problème CCHAUVIN

## 🎯 Problème identifié
Le client signale que pour CCHAUVIN :
- **Nombre de commandes très élevé** (225 selon notre MCP)
- **Montant moyen très faible** (225€ selon notre MCP)
- **Hypothèse** : Nous comptons les lignes d'articles au lieu des documents

## 🔍 Commandes SQL de vérification

### 1. Vérifier Documents vs Lignes pour CCHAUVIN
```sql
-- Compter les documents et lignes séparément
SELECT 
  COUNT(DISTINCT sd.Id) as NombreDocuments,
  COUNT(sdl.Id) as NombreLignes,
  SUM(sdl.RealNetAmountVatExcluded) as TotalCA
FROM SaleDocument sd
INNER JOIN SaleDocumentLine sdl ON sd.Id = sdl.DocumentId
WHERE sd.CustomerId = 'CCHAUVIN'
  AND sd.DocumentType IN (2, 3)
  AND sdl.LineType = 0; -- Lignes produits uniquement

-- Calculer les moyennes correctes
SELECT 
  COUNT(DISTINCT sd.Id) as NombreDocuments,
  COUNT(sdl.Id) as NombreLignes,
  SUM(sdl.RealNetAmountVatExcluded) as TotalCA,
  SUM(sdl.RealNetAmountVatExcluded) / COUNT(DISTINCT sd.Id) as MoyenneParDocument,
  SUM(sdl.RealNetAmountVatExcluded) / COUNT(sdl.Id) as MoyenneParLigne,
  CAST(COUNT(sdl.Id) AS FLOAT) / COUNT(DISTINCT sd.Id) as LignesParDocument
FROM SaleDocument sd
INNER JOIN SaleDocumentLine sdl ON sd.Id = sdl.DocumentId
WHERE sd.CustomerId = 'CCHAUVIN'
  AND sd.DocumentType IN (2, 3)
  AND sdl.LineType = 0;
```

### 2. Analyser notre code actuel (problème potentiel)
```sql
-- Vérifier ce que fait notre requête actuelle dans sales.ts
SELECT 
  COUNT(*) as TotalCount,
  SUM(sdl.RealNetAmountVatExcluded) as TotalRevenue
FROM SaleDocument sd
INNER JOIN SaleDocumentLine sdl ON sd.Id = sdl.DocumentId
WHERE sd.CustomerId = 'CCHAUVIN'
  AND sd.DocumentType IN (2, 3)
  AND sdl.LineType = 0;

-- Le problème : nous utilisons COUNT(*) qui compte les LIGNES !
-- Solution : utiliser COUNT(DISTINCT sd.Id) pour compter les DOCUMENTS
```

### 3. Identifier les champs manquants demandés

#### Tarifs appliqués (B, C, X, XX, Z, ZZ)
```sql
-- Vérifier le champ tarif dans SaleDocument
SELECT DISTINCT 
  PriceListCategory as Tarif,
  COUNT(*) as NombreDocuments
FROM SaleDocument 
WHERE CustomerId = 'CCHAUVIN'
  AND DocumentType IN (2, 3)
GROUP BY PriceListCategory;
```

#### Conditions de règlement (30j fdm, 60j, etc.)
```sql
-- Vérifier les conditions de règlement
SELECT 
  sd.SettlementModeId,
  sm.Caption as ConditionReglement,
  sm.Caption_Clear as ConditionReglementClear,
  COUNT(*) as NombreDocuments
FROM SaleDocument sd
LEFT JOIN SettlementMode sm ON sd.SettlementModeId = sm.Id
WHERE sd.CustomerId = 'CCHAUVIN'
  AND sd.DocumentType IN (2, 3)
GROUP BY sd.SettlementModeId, sm.Caption, sm.Caption_Clear;
```

#### Conditions de port (Franco, Franco à X€, Départ usine)
```sql
-- Vérifier les conditions de port
SELECT 
  sd.ShippingId,
  s.Caption as ConditionPort,
  s.Caption_Clear as ConditionPortClear,
  sd.ShippingAmountVatExcluded as MontantPort,
  COUNT(*) as NombreDocuments
FROM SaleDocument sd
LEFT JOIN Shipping s ON sd.ShippingId = s.Id
WHERE sd.CustomerId = 'CCHAUVIN'
  AND sd.DocumentType IN (2, 3)
GROUP BY sd.ShippingId, s.Caption, s.Caption_Clear, sd.ShippingAmountVatExcluded;
```

### 4. Requête complète pour analyse client enrichie
```sql
-- Analyse complète CCHAUVIN avec tous les champs demandés
SELECT 
  -- Données actuelles (corrigées)
  COUNT(DISTINCT sd.Id) as NombreCommandes,
  COUNT(sdl.Id) as NombreArticles,
  SUM(sdl.RealNetAmountVatExcluded) as ChiffreAffaires,
  SUM(sdl.RealNetAmountVatExcluded) / COUNT(DISTINCT sd.Id) as MoyenneParCommande,
  
  -- Données manquantes demandées
  sd.PriceListCategory as TarifApplique,
  sm.Caption_Clear as ConditionReglement,
  s.Caption_Clear as ConditionPort,
  AVG(sd.ShippingAmountVatExcluded) as MoyenMontantPort,
  
  -- Dates pour contexte
  MAX(sd.DocumentDate) as DerniereCommande,
  MIN(sd.DocumentDate) as PremiereCommande
  
FROM SaleDocument sd
INNER JOIN SaleDocumentLine sdl ON sd.Id = sdl.DocumentId
LEFT JOIN SettlementMode sm ON sd.SettlementModeId = sm.Id
LEFT JOIN Shipping s ON sd.ShippingId = s.Id
WHERE sd.CustomerId = 'CCHAUVIN'
  AND sd.DocumentType IN (2, 3)
  AND sdl.LineType = 0
GROUP BY sd.PriceListCategory, sm.Caption_Clear, s.Caption_Clear;
```

## 🛠️ Actions correctives nécessaires

### 1. Correction immédiate dans sales.ts
```typescript
// AVANT (incorrect) :
const ordersCount = await pool.request().query(`
  SELECT COUNT(*) as count FROM SaleDocument sd
  INNER JOIN SaleDocumentLine sdl ON sd.Id = sdl.DocumentId
  WHERE sd.CustomerId = '${customerId}'
`);

// APRÈS (correct) :
const ordersCount = await pool.request().query(`
  SELECT COUNT(DISTINCT sd.Id) as count FROM SaleDocument sd
  INNER JOIN SaleDocumentLine sdl ON sd.Id = sdl.DocumentId  
  WHERE sd.CustomerId = '${customerId}'
`);
```

### 2. Enrichissement avec les champs manquants
Ajouter dans la réponse MCP :
- `appliedRate` : Tarif appliqué (B, C, X, XX, Z, ZZ)
- `paymentTerms` : Conditions de règlement  
- `shippingTerms` : Conditions de port
- `articleCount` : Nombre d'articles commandés (distinct du nombre de commandes)

## 📊 Résultat attendu après correction
Pour CCHAUVIN, on devrait avoir :
- **Nombre de commandes** : ~7-15 (au lieu de 225)
- **Nombre d'articles** : 225 (ce qu'on affichait comme commandes)  
- **Montant moyen par commande** : ~3000-7000€ (au lieu de 225€)
- **Tarif, règlement, port** : Informations visibles

---
*Cette analyse doit être validée par les requêtes SQL avant correction du code*