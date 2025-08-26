// Script pour vérifier le schéma exact des tables
import { connectDatabase, closeDatabase, getPool } from './database.js';

async function checkSchema() {
  try {
    await connectDatabase();
    const pool = getPool();
    
    console.log('🔍 Vérification schéma des tables...\n');
    
    // 1. Colonnes Item
    console.log('📊 TABLE ITEM - Top 30 colonnes:');
    console.log('================================');
    const itemColumns = await pool.request().query(`
      SELECT TOP 30
        COLUMN_NAME, 
        DATA_TYPE,
        CHARACTER_MAXIMUM_LENGTH,
        IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'Item'
      ORDER BY ORDINAL_POSITION
    `);
    
    itemColumns.recordset.forEach((col, i) => {
      const nullable = col.IS_NULLABLE === 'YES' ? '(NULL)' : '(NOT NULL)';
      const length = col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : '';
      console.log(`  ${i + 1}. ${col.COLUMN_NAME}: ${col.DATA_TYPE}${length} ${nullable}`);
    });
    
    // 2. Recherche colonnes famille
    console.log('\n🔍 Recherche colonnes contenant "Family":');
    const familyColumns = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, TABLE_NAME
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME IN ('Item', 'ItemFamily', 'ItemSubFamily')
      AND COLUMN_NAME LIKE '%Family%'
      ORDER BY TABLE_NAME, COLUMN_NAME
    `);
    
    if (familyColumns.recordset.length > 0) {
      familyColumns.recordset.forEach(col => {
        console.log(`  • ${col.TABLE_NAME}.${col.COLUMN_NAME} (${col.DATA_TYPE})`);
      });
    } else {
      console.log('  Aucune colonne "Family" trouvée');
    }
    
    // 3. Vérifier liaison possible via autre méthode
    console.log('\n🔗 Test liaison Item → ItemFamily:');
    const linkTest = await pool.request().query(`
      SELECT TOP 5
        i.Id as ItemId,
        i.Caption as ItemCaption,
        f.Id as FamilyId,
        f.Caption as FamilyCaption
      FROM Item i
      INNER JOIN ItemFamily f ON i.Id LIKE f.Id + '%'
      WHERE f.Caption IS NOT NULL
    `);
    
    if (linkTest.recordset.length > 0) {
      console.log('  Liaison possible par préfixe ID:');
      linkTest.recordset.forEach(row => {
        console.log(`    ${row.ItemId} → ${row.FamilyCaption}`);
      });
    } else {
      console.log('  Pas de liaison directe trouvée');
      
      // Test échantillon données
      const sampleItems = await pool.request().query(`
        SELECT TOP 5 Id, Caption FROM Item WHERE Caption IS NOT NULL
      `);
      const sampleFamilies = await pool.request().query(`
        SELECT TOP 5 Id, Caption FROM ItemFamily WHERE Caption IS NOT NULL
      `);
      
      console.log('\n📋 Échantillons pour analyser la structure:');
      console.log('Items:');
      sampleItems.recordset.forEach(item => console.log(`    ${item.Id}: ${item.Caption}`));
      console.log('Families:');
      sampleFamilies.recordset.forEach(family => console.log(`    ${family.Id}: ${family.Caption}`));
    }
    
    console.log('\n✅ Vérification terminée');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await closeDatabase();
  }
}

checkSchema();