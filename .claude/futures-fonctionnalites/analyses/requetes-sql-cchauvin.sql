-- REQUÊTES SQL VALIDATION PROBLÈME CCHAUVIN
-- Date: 08/09/2025

-- ===========================================
-- 1. DIAGNOSTIC PRINCIPAL : Documents vs Lignes
-- ===========================================
SELECT 
  COUNT(DISTINCT sd.Id) as NombreCommandes,
  COUNT(sdl.Id) as NombreArticles,
  SUM(sdl.RealNetAmountVatExcluded) as ChiffreAffaires,
  SUM(sdl.RealNetAmountVatExcluded) / COUNT(DISTINCT sd.Id) as MoyenneParCommande,
  CAST(COUNT(sdl.Id) AS FLOAT) / COUNT(DISTINCT sd.Id) as ArticlesParCommande
FROM SaleDocument sd
INNER JOIN SaleDocumentLine sdl ON sd.Id = sdl.DocumentId
WHERE sd.CustomerId = 'CCHAUVIN'
  AND sd.DocumentType IN (2, 3);

-- RÉSULTAT ATTENDU BASÉ SUR NOTRE TEST :
-- NombreCommandes: 316 (vraies commandes)
-- NombreArticles: 1889 (lignes d'articles) 
-- Notre MCP affiche probablement 1889 commandes au lieu de 316 !

-- ===========================================
-- 2. CHAMPS MANQUANTS : Tarifs appliqués
-- ===========================================
SELECT DISTINCT 
  PriceListCategory as TarifApplique,
  COUNT(*) as NombreDocuments
FROM SaleDocument 
WHERE CustomerId = 'CCHAUVIN'
  AND DocumentType IN (2, 3)
GROUP BY PriceListCategory
ORDER BY NombreDocuments DESC;

-- RÉSULTAT CONFIRMÉ : Tarif Z sur 316 documents

-- ===========================================
-- 3. CHAMPS MANQUANTS : Conditions de règlement  
-- ===========================================
SELECT 
  sd.SettlementModeId,
  sm.Caption as ConditionReglement,
  COUNT(*) as NombreDocuments
FROM SaleDocument sd
LEFT JOIN SettlementMode sm ON sd.SettlementModeId = sm.Id
WHERE sd.CustomerId = 'CCHAUVIN'
  AND sd.DocumentType IN (2, 3)
GROUP BY sd.SettlementModeId, sm.Caption
ORDER BY NombreDocuments DESC;

-- ===========================================
-- 4. CHAMPS MANQUANTS : Conditions de port
-- ===========================================
SELECT 
  sd.ShippingId,
  s.Caption as ConditionPort,
  AVG(sd.ShippingAmountVatExcluded) as MontantPortMoyen,
  COUNT(*) as NombreDocuments
FROM SaleDocument sd
LEFT JOIN Shipping s ON sd.ShippingId = s.Id
WHERE sd.CustomerId = 'CCHAUVIN'
  AND sd.DocumentType IN (2, 3)
GROUP BY sd.ShippingId, s.Caption
ORDER BY NombreDocuments DESC;

-- ===========================================
-- 5. ANALYSE COMPLÈTE ENRICHIE
-- ===========================================
SELECT 
  -- Données corrigées
  COUNT(DISTINCT sd.Id) as NombreCommandes,
  COUNT(sdl.Id) as NombreArticles,
  SUM(sdl.RealNetAmountVatExcluded) as ChiffreAffaires,
  SUM(sdl.RealNetAmountVatExcluded) / COUNT(DISTINCT sd.Id) as MoyenneParCommande,
  
  -- Informations manquantes demandées par le client
  MAX(sd.PriceListCategory) as TarifApplique,  -- B, C, X, XX, Z, ZZ
  MAX(sm.Caption) as ConditionReglement,       -- 30j fdm, 60j, etc.
  MAX(s.Caption) as ConditionPort,             -- Franco, Départ usine, etc.
  AVG(sd.ShippingAmountVatExcluded) as MontantPortMoyen,
  
  -- Contexte temporel
  MIN(sd.DocumentDate) as PremiereCommande,
  MAX(sd.DocumentDate) as DerniereCommande,
  
  -- Répartition par période
  COUNT(CASE WHEN sd.DocumentDate >= '2025-01-01' THEN 1 END) as Commandes2025
  
FROM SaleDocument sd
INNER JOIN SaleDocumentLine sdl ON sd.Id = sdl.DocumentId
LEFT JOIN SettlementMode sm ON sd.SettlementModeId = sm.Id
LEFT JOIN Shipping s ON sd.ShippingId = s.Id
WHERE sd.CustomerId = 'CCHAUVIN'
  AND sd.DocumentType IN (2, 3);

-- ===========================================
-- 6. VÉRIFICATION DE NOTRE CODE ACTUEL
-- ===========================================
-- Cette requête simule ce que fait probablement notre MCP actuellement
SELECT 
  COUNT(*) as TotalAffiché,  -- ← PROBLÈME : Compte les lignes !
  SUM(sdl.RealNetAmountVatExcluded) as ChiffreAffaires,
  SUM(sdl.RealNetAmountVatExcluded) / COUNT(*) as MoyenneAffichée
FROM SaleDocument sd
INNER JOIN SaleDocumentLine sdl ON sd.Id = sdl.DocumentId
WHERE sd.CustomerId = 'CCHAUVIN'
  AND sd.DocumentType IN (2, 3);

-- CORRECTION NÉCESSAIRE :
-- Remplacer COUNT(*) par COUNT(DISTINCT sd.Id) dans notre code MCP

-- ===========================================
-- RÉSUMÉ DES CORRECTIONS À APPORTER
-- ===========================================
-- 1. Bug COUNT : Utiliser COUNT(DISTINCT sd.Id) au lieu de COUNT(*)
-- 2. Ajouter nb articles : COUNT(sdl.Id) distinct du nb commandes  
-- 3. Ajouter tarif : sd.PriceListCategory
-- 4. Ajouter règlement : sm.Caption depuis SettlementMode
-- 5. Ajouter port : s.Caption depuis Shipping + sd.ShippingAmountVatExcluded