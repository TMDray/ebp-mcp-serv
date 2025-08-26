// Script pour explorer les tables EBP et leurs structures
import { connectDatabase, closeDatabase, getPool } from './database.js';

async function exploreTables() {
  console.log('🔍 Exploration des tables EBP...\n');
  
  try {
    await connectDatabase();
    const pool = getPool();
    
    // 1. Lister toutes les tables
    console.log('📋 TABLES DISPONIBLES:');
    console.log('=====================');
    const tablesResult = await pool.request().query(`
      SELECT 
        TABLE_NAME,
        (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = t.TABLE_NAME) as NB_COLUMNS
      FROM INFORMATION_SCHEMA.TABLES t
      WHERE TABLE_TYPE = 'BASE TABLE'
      AND TABLE_NAME NOT LIKE 'sys%'
      ORDER BY TABLE_NAME
    `);
    
    const interestingTables = [
      'Activity', 'Customer', 'Colleague', 
      'Document', 'DocumentLine', 'DocumentDetail',
      'Item', 'Product', 'Sale', 'SaleLine',
      'Invoice', 'InvoiceLine', 'Order', 'OrderLine'
    ];
    
    console.log('\nTables potentiellement intéressantes:');
    tablesResult.recordset.forEach((row: any) => {
      if (interestingTables.some(t => row.TABLE_NAME.toLowerCase().includes(t.toLowerCase()))) {
        console.log(`  ✓ ${row.TABLE_NAME} (${row.NB_COLUMNS} colonnes)`);
      }
    });
    
    // 2. Explorer la structure de Activity
    console.log('\n\n📊 STRUCTURE TABLE ACTIVITY:');
    console.log('============================');
    const activityColumns = await pool.request().query(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        CHARACTER_MAXIMUM_LENGTH,
        IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'Activity'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('Colonnes principales:');
    activityColumns.recordset.slice(0, 20).forEach((col: any) => {
      const type = col.CHARACTER_MAXIMUM_LENGTH 
        ? `${col.DATA_TYPE}(${col.CHARACTER_MAXIMUM_LENGTH})`
        : col.DATA_TYPE;
      console.log(`  • ${col.COLUMN_NAME}: ${type} ${col.IS_NULLABLE === 'NO' ? '[REQUIRED]' : ''}`);
    });
    
    // 3. Explorer les tables de documents/ventes
    console.log('\n\n💰 TABLES DOCUMENTS/VENTES:');
    console.log('===========================');
    
    // Chercher les tables liées aux documents
    const documentTables = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME LIKE '%Document%' 
         OR TABLE_NAME LIKE '%Invoice%' 
         OR TABLE_NAME LIKE '%Sale%'
         OR TABLE_NAME LIKE '%Order%'
      ORDER BY TABLE_NAME
    `);
    
    for (const table of documentTables.recordset) {
      const countResult = await pool.request().query(
        `SELECT COUNT(*) as count FROM [${table.TABLE_NAME}]`
      );
      if (countResult.recordset[0].count > 0) {
        console.log(`\n📄 ${table.TABLE_NAME}: ${countResult.recordset[0].count} enregistrements`);
        
        // Afficher quelques colonnes clés
        const columns = await pool.request().query(`
          SELECT TOP 10 COLUMN_NAME, DATA_TYPE 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_NAME = '${table.TABLE_NAME}'
          AND (
            COLUMN_NAME LIKE '%Customer%' OR 
            COLUMN_NAME LIKE '%Amount%' OR 
            COLUMN_NAME LIKE '%Total%' OR
            COLUMN_NAME LIKE '%Date%' OR
            COLUMN_NAME LIKE '%Item%' OR
            COLUMN_NAME LIKE '%Product%'
          )
        `);
        
        if (columns.recordset.length > 0) {
          console.log('  Colonnes intéressantes:');
          columns.recordset.forEach((col: any) => {
            console.log(`    - ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
          });
        }
      }
    }
    
    // 4. Test rapide sur Customer
    console.log('\n\n👥 TABLE CUSTOMER:');
    console.log('==================');
    const customerSample = await pool.request().query(`
      SELECT TOP 5 * FROM Customer
    `);
    
    if (customerSample.recordset.length > 0) {
      const firstCustomer = customerSample.recordset[0];
      console.log('Colonnes disponibles:');
      Object.keys(firstCustomer).slice(0, 15).forEach(key => {
        const value = firstCustomer[key];
        const type = typeof value;
        console.log(`  • ${key}: ${type} ${value ? `(ex: "${String(value).substring(0, 30)}...")` : '(null)'}`);
      });
    }
    
    // 5. Statistiques commerciaux
    console.log('\n\n📈 STATISTIQUES COMMERCIAUX:');
    console.log('============================');
    const statsResult = await pool.request().query(`
      SELECT 
        ColleagueId,
        COUNT(*) as NbActivities,
        COUNT(DISTINCT CustomerId) as NbClients,
        MIN(StartDateTime) as FirstActivity,
        MAX(StartDateTime) as LastActivity
      FROM Activity
      WHERE ColleagueId IN ('CONSTANCE', 'DEBORAH', 'JULIE', 'MATHIAS')
      GROUP BY ColleagueId
      ORDER BY COUNT(*) DESC
    `);
    
    statsResult.recordset.forEach((row: any) => {
      const first = new Date(row.FirstActivity).toLocaleDateString('fr-FR');
      const last = new Date(row.LastActivity).toLocaleDateString('fr-FR');
      console.log(`\n${row.ColleagueId}:`);
      console.log(`  • ${row.NbActivities} activités`);
      console.log(`  • ${row.NbClients} clients uniques`);
      console.log(`  • Période: ${first} → ${last}`);
    });
    
    console.log('\n✅ Exploration terminée!');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await closeDatabase();
  }
}

exploreTables();