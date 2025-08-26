// Exploration corrigée des familles de produits
import { connectDatabase, closeDatabase, getPool } from './database.js';

async function exploreProductFamilies() {
  console.log('🔍 Exploration des familles de produits EBP...\n');
  
  try {
    await connectDatabase();
    const pool = getPool();
    
    // 1. Exemples de familles (sans Description)
    console.log('📋 EXEMPLES FAMILLES:');
    console.log('=====================');
    const familyExamples = await pool.request().query(`
      SELECT TOP 10
        Id,
        Caption
      FROM ItemFamily
      WHERE Caption IS NOT NULL
      ORDER BY Caption
    `);
    
    familyExamples.recordset.forEach((family: any, i: number) => {
      console.log(`${i + 1}. ${family.Caption} (${family.Id})`);
    });
    
    // 2. Sous-familles
    console.log('\n📊 SOUS-FAMILLES:');
    console.log('=================');
    const subFamilyStats = await pool.request().query(`
      SELECT COUNT(*) as count FROM ItemSubFamily
    `);
    console.log(`• Nombre de sous-familles: ${subFamilyStats.recordset[0].count}`);
    
    if (subFamilyStats.recordset[0].count > 0) {
      const subFamilyExamples = await pool.request().query(`
        SELECT TOP 8
          sf.Id,
          sf.Caption,
          f.Caption as FamilyCaption
        FROM ItemSubFamily sf
        LEFT JOIN ItemFamily f ON sf.ItemFamilyId = f.Id
        WHERE sf.Caption IS NOT NULL
      `);
      
      console.log('\nExemples sous-familles:');
      subFamilyExamples.recordset.forEach((sf: any, i: number) => {
        console.log(`  ${i + 1}. ${sf.Caption} → ${sf.FamilyCaption || 'Non liée'}`);
      });
    }
    
    // 3. Familles avec CA
    console.log('\n💰 FAMILLES AVEC CHIFFRE D\'AFFAIRES:');
    console.log('====================================');
    const familySales = await pool.request().query(`
      SELECT TOP 8
        f.Id,
        f.Caption as FamilyCaption,
        COUNT(DISTINCT i.Id) as NbItems,
        COUNT(DISTINCT sdl.DocumentId) as NbDocuments,
        SUM(sdl.NetAmountVatExcluded) as TotalCA
      FROM ItemFamily f
      LEFT JOIN Item i ON f.Id = i.ItemFamilyId
      LEFT JOIN SaleDocumentLine sdl ON i.Id = sdl.ItemId
      LEFT JOIN SaleDocument sd ON sdl.DocumentId = sd.Id
      WHERE sd.DocumentType IN (6, 7)
        AND sd.DocumentDate >= DATEADD(YEAR, -1, GETDATE())
        AND f.Caption IS NOT NULL
      GROUP BY f.Id, f.Caption
      HAVING SUM(sdl.NetAmountVatExcluded) > 100
      ORDER BY SUM(sdl.NetAmountVatExcluded) DESC
    `);
    
    console.log('Top familles par CA (dernière année):');
    familySales.recordset.forEach((family: any, i: number) => {
      const ca = family.TotalCA ? parseFloat(family.TotalCA).toFixed(0) : '0';
      console.log(`  ${i + 1}. ${family.FamilyCaption}`);
      console.log(`     CA: ${ca}€ | ${family.NbItems} articles | ${family.NbDocuments} documents`);
    });
    
    // 4. Statistiques de liaison
    console.log('\n🔗 LIAISONS ITEM → FAMILY:');
    console.log('==========================');
    const itemFamilyTest = await pool.request().query(`
      SELECT 
        COUNT(*) as TotalItems,
        COUNT(CASE WHEN ItemFamilyId IS NOT NULL THEN 1 END) as ItemsWithFamily,
        COUNT(CASE WHEN ItemSubFamilyId IS NOT NULL THEN 1 END) as ItemsWithSubFamily
      FROM Item
    `);
    
    const stats = itemFamilyTest.recordset[0];
    const familyPercent = Math.round((stats.ItemsWithFamily / stats.TotalItems) * 100);
    const subFamilyPercent = Math.round((stats.ItemsWithSubFamily / stats.TotalItems) * 100);
    
    console.log(`• Total articles: ${stats.TotalItems}`);
    console.log(`• Avec famille: ${stats.ItemsWithFamily} (${familyPercent}%)`);
    console.log(`• Avec sous-famille: ${stats.ItemsWithSubFamily} (${subFamilyPercent}%)`);
    
    // 5. Exemple AEROSPATIALE par familles
    console.log('\n🧪 EXEMPLE - CLIENT AEROSPATIALE PAR FAMILLES:');
    console.log('==============================================');
    const clientFamilyExample = await pool.request().query(`
      SELECT TOP 5
        COALESCE(f.Caption, 'SANS FAMILLE') as FamilyCaption,
        COALESCE(sf.Caption, 'SANS SOUS-FAMILLE') as SubFamilyCaption,
        COUNT(DISTINCT sdl.ItemId) as NbDistinctItems,
        SUM(sdl.Quantity) as TotalQuantity,
        SUM(sdl.NetAmountVatExcluded) as TotalCA
      FROM SaleDocumentLine sdl
      INNER JOIN SaleDocument sd ON sdl.DocumentId = sd.Id
      LEFT JOIN Item i ON sdl.ItemId = i.Id
      LEFT JOIN ItemFamily f ON i.ItemFamilyId = f.Id
      LEFT JOIN ItemSubFamily sf ON i.ItemSubFamilyId = sf.Id
      WHERE sd.CustomerId = 'CAEROSPATIALE'
        AND sd.DocumentType IN (6, 7)
        AND YEAR(sd.DocumentDate) = YEAR(GETDATE())
      GROUP BY f.Caption, sf.Caption
      ORDER BY SUM(sdl.NetAmountVatExcluded) DESC
    `);
    
    console.log('Achats AEROSPATIALE par famille (2025):');
    clientFamilyExample.recordset.forEach((row: any, i: number) => {
      const ca = parseFloat(row.TotalCA || 0).toFixed(0);
      console.log(`  ${i + 1}. ${row.FamilyCaption}`);
      if (row.SubFamilyCaption && row.SubFamilyCaption !== 'SANS SOUS-FAMILLE') {
        console.log(`     → ${row.SubFamilyCaption}`);
      }
      console.log(`     CA: ${ca}€ | ${row.NbDistinctItems} articles | Qté: ${row.TotalQuantity}`);
    });
    
    // 6. Test du concept période
    console.log('\n📅 TEST CONCEPT PÉRIODES:');
    console.log('=========================');
    const periodTest = await pool.request().query(`
      SELECT 
        'Q1 2025' as Periode,
        SUM(CASE WHEN MONTH(sd.DocumentDate) IN (1,2,3) THEN sd.AmountVatExcludedWithDiscount ELSE 0 END) as CA
      FROM SaleDocument sd
      WHERE sd.CustomerId = 'CAEROSPATIALE'
        AND YEAR(sd.DocumentDate) = 2025
        AND sd.DocumentType IN (6, 7)
      UNION ALL
      SELECT 
        'Q2 2025' as Periode,
        SUM(CASE WHEN MONTH(sd.DocumentDate) IN (4,5,6) THEN sd.AmountVatExcludedWithDiscount ELSE 0 END) as CA
      FROM SaleDocument sd
      WHERE sd.CustomerId = 'CAEROSPATIALE'
        AND YEAR(sd.DocumentDate) = 2025
        AND sd.DocumentType IN (6, 7)
      UNION ALL
      SELECT 
        'Q3 2025' as Periode,
        SUM(CASE WHEN MONTH(sd.DocumentDate) IN (7,8,9) THEN sd.AmountVatExcludedWithDiscount ELSE 0 END) as CA
      FROM SaleDocument sd
      WHERE sd.CustomerId = 'CAEROSPATIALE'
        AND YEAR(sd.DocumentDate) = 2025
        AND sd.DocumentType IN (6, 7)
    `);
    
    console.log('CA AEROSPATIALE par trimestre:');
    periodTest.recordset.forEach((row: any) => {
      const ca = parseFloat(row.CA || 0).toFixed(0);
      console.log(`  • ${row.Periode}: ${ca}€`);
    });
    
    console.log('\n✅ Exploration terminée!');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await closeDatabase();
  }
}

exploreProductFamilies();