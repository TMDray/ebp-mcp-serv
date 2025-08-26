// Exploration des familles et sous-familles de produits
import { connectDatabase, closeDatabase, getPool } from './database.js';

async function exploreProductFamilies() {
  console.log('🔍 Exploration des familles de produits EBP...\n');
  
  try {
    await connectDatabase();
    const pool = getPool();
    
    // 1. Explorer la structure ItemFamily
    console.log('📊 STRUCTURE TABLE ITEMFAMILY:');
    console.log('==============================');
    const familyColumns = await pool.request().query(`
      SELECT TOP 10
        COLUMN_NAME,
        DATA_TYPE,
        CHARACTER_MAXIMUM_LENGTH
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'ItemFamily'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('Colonnes principales:');
    familyColumns.recordset.forEach((col: any) => {
      const type = col.CHARACTER_MAXIMUM_LENGTH 
        ? `${col.DATA_TYPE}(${col.CHARACTER_MAXIMUM_LENGTH})`
        : col.DATA_TYPE;
      console.log(`  • ${col.COLUMN_NAME}: ${type}`);
    });
    
    // 2. Compter les familles
    console.log('\n📈 STATISTIQUES FAMILLES:');
    console.log('=========================');
    const familyStats = await pool.request().query(`
      SELECT 
        COUNT(*) as NbFamilies,
        COUNT(CASE WHEN Id IS NOT NULL THEN 1 END) as FamiliesWithId
      FROM ItemFamily
    `);
    
    console.log(`• Nombre total de familles: ${familyStats.recordset[0].NbFamilies}`);
    
    // 3. Exemples de familles
    console.log('\n📋 EXEMPLES FAMILLES:');
    console.log('=====================');
    const familyExamples = await pool.request().query(`
      SELECT TOP 10
        Id,
        Caption,
        Description
      FROM ItemFamily
      WHERE Caption IS NOT NULL
      ORDER BY Caption
    `);
    
    familyExamples.recordset.forEach((family: any, i: number) => {
      console.log(`${i + 1}. ${family.Caption} (${family.Id})`);
      if (family.Description) {
        console.log(`   Description: ${family.Description.substring(0, 80)}...`);
      }
    });
    
    // 4. Explorer ItemSubFamily
    console.log('\n📊 STRUCTURE TABLE ITEMSUBFAMILY:');
    console.log('=================================');
    const subFamilyStats = await pool.request().query(`
      SELECT COUNT(*) as count FROM ItemSubFamily
    `);
    console.log(`• Nombre de sous-familles: ${subFamilyStats.recordset[0].count}`);
    
    if (subFamilyStats.recordset[0].count > 0) {
      const subFamilyExamples = await pool.request().query(`
        SELECT TOP 5
          sf.Id,
          sf.Caption,
          f.Caption as FamilyCaption
        FROM ItemSubFamily sf
        LEFT JOIN ItemFamily f ON sf.ItemFamilyId = f.Id
        WHERE sf.Caption IS NOT NULL
      `);
      
      console.log('\nExemples sous-familles:');
      subFamilyExamples.recordset.forEach((sf: any, i: number) => {
        console.log(`  ${i + 1}. ${sf.Caption} → Famille: ${sf.FamilyCaption || 'Non liée'}`);
      });
    }
    
    // 5. Lien Items → Familles avec ventes
    console.log('\n💰 FAMILLES AVEC CHIFFRE D\'AFFAIRES:');
    console.log('====================================');
    const familySales = await pool.request().query(`
      SELECT TOP 10
        f.Id,
        f.Caption as FamilyCaption,
        COUNT(DISTINCT i.Id) as NbItems,
        COUNT(DISTINCT sdl.DocumentId) as NbDocuments,
        SUM(sdl.NetAmountVatExcluded) as TotalCA
      FROM ItemFamily f
      LEFT JOIN Item i ON f.Id = i.ItemFamilyId
      LEFT JOIN SaleDocumentLine sdl ON i.Id = sdl.ItemId
      LEFT JOIN SaleDocument sd ON sdl.DocumentId = sd.Id
      WHERE sd.DocumentType IN (6, 7)  -- Factures
        AND sd.DocumentDate >= DATEADD(YEAR, -1, GETDATE())  -- Dernière année
        AND f.Caption IS NOT NULL
      GROUP BY f.Id, f.Caption
      HAVING SUM(sdl.NetAmountVatExcluded) > 1000  -- Minimum 1000€ de CA
      ORDER BY SUM(sdl.NetAmountVatExcluded) DESC
    `);
    
    console.log('Top familles par CA (dernière année):');
    familySales.recordset.forEach((family: any, i: number) => {
      const ca = family.TotalCA ? parseFloat(family.TotalCA).toFixed(0) : '0';
      console.log(`  ${i + 1}. ${family.FamilyCaption}`);
      console.log(`     CA: ${ca}€ | ${family.NbItems} articles | ${family.NbDocuments} documents`);
    });
    
    // 6. Test liaison Item → Family
    console.log('\n🔗 TEST LIAISONS ITEM → FAMILY:');
    console.log('===============================');
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
    
    // 7. Exemple concret avec le client test
    console.log('\n🧪 EXEMPLE CONCRET - CLIENT AEROSPATIALE:');
    console.log('=========================================');
    const clientFamilyExample = await pool.request().query(`
      SELECT TOP 5
        f.Caption as FamilyCaption,
        sf.Caption as SubFamilyCaption,
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
        AND f.Caption IS NOT NULL
      GROUP BY f.Caption, sf.Caption
      ORDER BY SUM(sdl.NetAmountVatExcluded) DESC
    `);
    
    console.log('Familles achetées par AEROSPATIALE:');
    clientFamilyExample.recordset.forEach((row: any, i: number) => {
      const ca = parseFloat(row.TotalCA).toFixed(0);
      console.log(`  ${i + 1}. ${row.FamilyCaption}`);
      if (row.SubFamilyCaption) {
        console.log(`     Sous-famille: ${row.SubFamilyCaption}`);
      }
      console.log(`     CA: ${ca}€ | ${row.NbDistinctItems} articles | Qté: ${row.TotalQuantity}`);
    });
    
    console.log('\n✅ Exploration terminée!');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await closeDatabase();
  }
}

exploreProductFamilies();