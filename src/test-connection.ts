// Script de test pour valider la connexion EBP
import { connectDatabase, closeDatabase, getPool } from './database.js';

async function testConnection() {
  console.log('🧪 Test de connexion EBP SQL Server...');
  
  try {
    // Test connexion
    await connectDatabase();
    const pool = getPool();
    
    // Test requête simple
    console.log('📊 Test requête basique...');
    const result = await pool.request().query('SELECT COUNT(*) as count FROM Activity');
    console.log(`✅ Nombre d'activités dans la base: ${result.recordset[0].count}`);
    
    // Test requête MATHIAS (champion user)
    console.log('👤 Test données MATHIAS...');
    const mathiasResult = await pool.request().query(`
      SELECT TOP 5
        a.Id,
        a.Title,
        a.Date,
        c.Name as ColleagueName,
        cu.Name as CustomerName
      FROM Activity a
      LEFT JOIN Colleague c ON a.ColleagueId = c.Id
      LEFT JOIN Customer cu ON a.CustomerId = cu.Id
      WHERE c.Name = 'MATHIAS'
      ORDER BY a.Date DESC
    `);
    
    console.log(`✅ ${mathiasResult.recordset.length} dernières activités MATHIAS:`);
    mathiasResult.recordset.forEach((row: any, i: number) => {
      console.log(`  ${i+1}. ${row.Title} - ${row.CustomerName} (${row.Date.toISOString().split('T')[0]})`);
    });
    
    // Test structure tables
    console.log('🗂️  Test structure tables...');
    const tablesResult = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME IN ('Activity', 'Customer', 'Colleague')
      ORDER BY TABLE_NAME
    `);
    
    console.log('✅ Tables EBP disponibles:');
    tablesResult.recordset.forEach((row: any) => {
      console.log(`  - ${row.TABLE_NAME}`);
    });
    
    console.log('🎉 Tous les tests de connexion réussis !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
}

testConnection();