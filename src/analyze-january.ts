// Analyse du CA Janvier 2025 - Tous clients
import { connectDatabase, closeDatabase, getPool } from './database.js';

async function calculateJanuaryRevenue() {
  await connectDatabase();
  const pool = getPool();
  
  console.log('💰 CALCUL CA TOTAL - JANVIER 2025 (TOUS CLIENTS)\n');
  console.log('='.repeat(50) + '\n');
  
  // 1. CA TOTAL via les lignes de documents
  const totalResult = await pool.request().query(`
    SELECT 
      COUNT(DISTINCT sd.CustomerId) as NbClients,
      COUNT(DISTINCT sd.Id) as NbFactures,
      COUNT(*) as NbLignes,
      SUM(sdl.NetAmountVatExcluded) as CA_Total
    FROM SaleDocumentLine sdl
    INNER JOIN SaleDocument sd ON sdl.DocumentId = sd.Id
    WHERE sd.DocumentDate >= '2025-01-01'
      AND sd.DocumentDate < '2025-02-01'
      AND sd.DocumentType IN (6, 7)  -- Factures et Avoirs
  `);
  
  const stats = totalResult.recordset[0];
  console.log('📈 RÉSUMÉ GLOBAL JANVIER 2025:');
  console.log(`  • Nombre de clients actifs: ${stats.NbClients}`);
  console.log(`  • Nombre de factures/avoirs: ${stats.NbFactures}`);
  console.log(`  • Nombre de lignes: ${stats.NbLignes}`);
  console.log(`  • CA TOTAL: ${parseFloat(stats.CA_Total || 0).toFixed(2)}€\n`);
  
  // 2. Détail par type de document
  console.log('📋 RÉPARTITION PAR TYPE DE DOCUMENT:\n');
  const typeResult = await pool.request().query(`
    SELECT 
      CASE 
        WHEN sd.DocumentType = 6 THEN 'Factures'
        WHEN sd.DocumentType = 7 THEN 'Avoirs'
      END as TypeDoc,
      COUNT(DISTINCT sd.Id) as Nombre,
      SUM(sdl.NetAmountVatExcluded) as Montant
    FROM SaleDocumentLine sdl
    INNER JOIN SaleDocument sd ON sdl.DocumentId = sd.Id
    WHERE sd.DocumentDate >= '2025-01-01'
      AND sd.DocumentDate < '2025-02-01'
      AND sd.DocumentType IN (6, 7)
    GROUP BY sd.DocumentType
  `);
  
  typeResult.recordset.forEach(row => {
    console.log(`  • ${row.TypeDoc}: ${row.Nombre} documents = ${parseFloat(row.Montant || 0).toFixed(2)}€`);
  });
  
  // 3. TOP 10 clients de janvier
  console.log('\n🏆 TOP 10 CLIENTS - JANVIER 2025:\n');
  const topClientsResult = await pool.request().query(`
    SELECT TOP 10
      sd.CustomerId,
      sd.CustomerName,
      COUNT(DISTINCT sd.Id) as NbFactures,
      SUM(sdl.NetAmountVatExcluded) as CA_Client
    FROM SaleDocumentLine sdl
    INNER JOIN SaleDocument sd ON sdl.DocumentId = sd.Id
    WHERE sd.DocumentDate >= '2025-01-01'
      AND sd.DocumentDate < '2025-02-01'
      AND sd.DocumentType IN (6, 7)
    GROUP BY sd.CustomerId, sd.CustomerName
    ORDER BY SUM(sdl.NetAmountVatExcluded) DESC
  `);
  
  topClientsResult.recordset.forEach((row, i) => {
    const ca = parseFloat(row.CA_Client || 0);
    const percent = (ca / parseFloat(stats.CA_Total) * 100).toFixed(1);
    console.log(`  ${i+1}. ${row.CustomerName}: ${ca.toFixed(2)}€ (${percent}% du CA) - ${row.NbFactures} factures`);
  });
  
  // 4. Répartition par famille de produits
  console.log('\n📦 RÉPARTITION PAR FAMILLE DE PRODUITS - JANVIER 2025:\n');
  const familyResult = await pool.request().query(`
    SELECT 
      COALESCE(f.Caption, 'SANS FAMILLE') as Famille,
      COUNT(DISTINCT sdl.ItemId) as NbArticles,
      COUNT(DISTINCT sd.CustomerId) as NbClients,
      SUM(sdl.NetAmountVatExcluded) as CA
    FROM SaleDocumentLine sdl
    INNER JOIN SaleDocument sd ON sdl.DocumentId = sd.Id
    LEFT JOIN Item i ON sdl.ItemId = i.Id
    LEFT JOIN ItemFamily f ON i.FamilyId = f.Id
    WHERE sd.DocumentDate >= '2025-01-01'
      AND sd.DocumentDate < '2025-02-01'
      AND sd.DocumentType IN (6, 7)
    GROUP BY f.Caption
    ORDER BY SUM(sdl.NetAmountVatExcluded) DESC
  `);
  
  familyResult.recordset.forEach(row => {
    const ca = parseFloat(row.CA || 0);
    const percent = (ca / parseFloat(stats.CA_Total) * 100).toFixed(1);
    console.log(`  • ${row.Famille}: ${ca.toFixed(2)}€ (${percent}%) - ${row.NbArticles} articles, ${row.NbClients} clients`);
  });
  
  console.log('\n' + '='.repeat(50));
  console.log(`✅ CA TOTAL JANVIER 2025: ${parseFloat(stats.CA_Total || 0).toFixed(2)}€`);
  
  await closeDatabase();
}

calculateJanuaryRevenue();