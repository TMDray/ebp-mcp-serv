// Test spécifique avec les données de MATHIAS (champion user)
import { connectDatabase, closeDatabase, getPool } from './database.js';

async function testMathiasActivities() {
  console.log('🧪 Test activités MATHIAS (champion user)...');
  
  try {
    await connectDatabase();
    const pool = getPool();
    
    // 1. Trouver un client avec activités de MATHIAS
    console.log('🔍 Recherche client avec activités MATHIAS...');
    const clientsResult = await pool.request().query(`
      SELECT TOP 5
        a.CustomerId,
        a.CustomerName,
        COUNT(*) as NbActivites
      FROM Activity a
      WHERE a.ColleagueId = 'MATHIAS'
        AND a.CustomerId IS NOT NULL
      GROUP BY a.CustomerId, a.CustomerName
      ORDER BY COUNT(*) DESC
    `);
    
    if (clientsResult.recordset.length === 0) {
      console.log('❌ Aucun client trouvé pour MATHIAS');
      return;
    }
    
    console.log('✅ Clients principaux de MATHIAS:');
    clientsResult.recordset.forEach((row: any, i: number) => {
      console.log(`  ${i+1}. ${row.CustomerName} (${row.CustomerId}) - ${row.NbActivites} activités`);
    });
    
    // 2. Tester avec le premier client
    const testClient = clientsResult.recordset[0];
    console.log(`\n📋 Test ebp_get_client_activities pour: ${testClient.CustomerName}`);
    
    const activitiesResult = await pool.request()
      .input('customerId', testClient.CustomerId)
      .input('limit', 5)
      .query(`
        SELECT TOP (@limit)
          a.Id,
          a.Caption,
          a.StartDateTime,
          a.EndDateTime,
          a.xx_Type_d_activite,
          a.ColleagueId,
          a.CustomerId,
          a.CustomerName,
          a.Notes,
          a.xx_Note_detaillee_Clear,
          c.Contact_Name + ' ' + ISNULL(c.Contact_FirstName, '') as ColleagueName
        FROM Activity a
        LEFT JOIN Colleague c ON a.ColleagueId = c.Id
        WHERE a.CustomerId = @customerId
        ORDER BY a.StartDateTime DESC
      `);
    
    console.log(`✅ ${activitiesResult.recordset.length} activités trouvées:`);
    activitiesResult.recordset.forEach((row: any, i: number) => {
      const startDate = new Date(row.StartDateTime).toLocaleDateString('fr-FR');
      const colleague = row.ColleagueName || 'Non assigné';
      const type = row.xx_Type_d_activite || 'Non spécifié';
      const caption = row.Caption || '(sans titre)';
      
      console.log(`  ${i+1}. ${startDate} - ${type}`);
      console.log(`     Titre: ${caption}`);
      console.log(`     Commercial: ${colleague}`);
      
      // Afficher un extrait des notes (nettoyer le RTF)
      const notes = row.xx_Note_detaillee_Clear || row.Notes || '';
      if (notes) {
        let cleanNotes = notes.replace(/[{}\\]/g, '').substring(0, 100);
        if (cleanNotes.length === 100) cleanNotes += '...';
        console.log(`     Notes: ${cleanNotes}`);
      }
      console.log('');
    });
    
    // 3. Statistiques générales
    console.log('📊 Statistiques EBP:');
    const statsResult = await pool.request().query(`
      SELECT 
        COUNT(*) as TotalActivites,
        COUNT(CASE WHEN ColleagueId IS NOT NULL THEN 1 END) as ActivitesAvecCommercial,
        COUNT(CASE WHEN ColleagueId = 'MATHIAS' THEN 1 END) as ActivitesMathias,
        COUNT(DISTINCT CustomerId) as TotalClients
      FROM Activity
    `);
    
    const stats = statsResult.recordset[0];
    console.log(`  • Total activités: ${stats.TotalActivites}`);
    console.log(`  • Avec commercial: ${stats.ActivitesAvecCommercial} (${Math.round(stats.ActivitesAvecCommercial/stats.TotalActivites*100)}%)`);
    console.log(`  • MATHIAS: ${stats.ActivitesMathias} (${Math.round(stats.ActivitesMathias/stats.TotalActivites*100)}%)`);
    console.log(`  • Clients uniques: ${stats.TotalClients}`);
    
    console.log('\n🎉 Test MATHIAS réussi ! Prêt pour Phase 2.');
    
  } catch (error) {
    console.error('❌ Erreur test MATHIAS:', error);
  } finally {
    await closeDatabase();
  }
}

testMathiasActivities();