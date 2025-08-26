// Test des activités commerciales enrichies
import { connectDatabase, closeDatabase } from './database.js';
import { getEnhancedClientActivities, getColleagueActivitiesSummary } from './tools/activities.js';

async function testEnhancedActivities() {
  console.log('🧪 Test du tool ebp_get_client_activities enrichi...\n');
  
  try {
    await connectDatabase();
    
    // 1. Test toutes les activités récentes (limite)
    console.log('📊 Test 1: Activités récentes (toutes)');
    console.log('=====================================');
    const recentActivities = await getEnhancedClientActivities({
      limit: 10
    });
    
    console.log(`• Total activités trouvées: ${recentActivities.summary.totalActivities}`);
    console.log(`• Clients uniques: ${recentActivities.summary.uniqueCustomers}`);
    console.log(`• Commerciaux uniques: ${recentActivities.summary.uniqueColleagues}`);
    console.log(`• Durée moyenne: ${recentActivities.summary.averageDuration} minutes`);
    
    if (recentActivities.activities.length > 0) {
      console.log('\nDernières activités:');
      recentActivities.activities.slice(0, 5).forEach((activity, i) => {
        const date = new Date(activity.startDate).toLocaleDateString('fr-FR');
        const duration = activity.duration ? ` (${activity.duration}min)` : '';
        console.log(`  ${i + 1}. ${date} - ${activity.type}${duration}`);
        console.log(`     ${activity.colleague} → ${activity.customer}`);
        console.log(`     "${activity.caption}"`);
        if (activity.notes && activity.notes.length > 0) {
          const shortNotes = activity.notes.substring(0, 80).replace(/[\r\n]/g, ' ');
          console.log(`     Notes: ${shortNotes}...`);
        }
        console.log('');
      });
    }
    
    // 2. Test activités MATHIAS ce mois
    console.log('\n👤 Test 2: Activités MATHIAS ce mois');
    console.log('====================================');
    const mathiasMonth = await getEnhancedClientActivities({
      colleagueId: 'MATHIAS',
      period: 'month',
      limit: 15
    });
    
    console.log(`• Période: ${mathiasMonth.summary.periodLabel}`);
    console.log(`• Activités MATHIAS: ${mathiasMonth.summary.totalActivities}`);
    console.log(`• Clients différents: ${mathiasMonth.summary.uniqueCustomers}`);
    console.log(`• Durée moyenne: ${mathiasMonth.summary.averageDuration} minutes`);
    
    if (mathiasMonth.activities.length > 0) {
      console.log('\nActivités MATHIAS du mois:');
      mathiasMonth.activities.slice(0, 5).forEach((activity, i) => {
        const date = new Date(activity.startDate).toLocaleDateString('fr-FR');
        console.log(`  ${i + 1}. ${date} - ${activity.customer}`);
        console.log(`     Type: ${activity.type}`);
        console.log(`     "${activity.caption}"`);
      });
    }
    
    // 3. Test activités client AEROSPATIALE trimestre
    console.log('\n🏢 Test 3: Activités AEROSPATIALE ce trimestre');
    console.log('=============================================');
    const aeroActivities = await getEnhancedClientActivities({
      customerId: 'CAEROSPATIALE',
      period: 'quarter',
      limit: 10
    });
    
    console.log(`• Client: AEROSPATIALE`);
    console.log(`• Période: ${aeroActivities.summary.periodLabel}`);
    console.log(`• Activités: ${aeroActivities.summary.totalActivities}`);
    console.log(`• Commerciaux impliqués: ${aeroActivities.summary.uniqueColleagues}`);
    
    if (aeroActivities.activities.length > 0) {
      console.log('\nActivités AEROSPATIALE:');
      aeroActivities.activities.forEach((activity, i) => {
        const date = new Date(activity.startDate).toLocaleDateString('fr-FR');
        console.log(`  ${i + 1}. ${date} - ${activity.colleague}`);
        console.log(`     ${activity.type}: "${activity.caption}"`);
      });
    }
    
    // 4. Test recherche par type d'activité
    console.log('\n📋 Test 4: Activités de type "Visite" ce trimestre');
    console.log('=================================================');
    const visites = await getEnhancedClientActivities({
      period: 'quarter',
      activityType: 'Visite',
      limit: 8
    });
    
    console.log(`• Période: ${visites.summary.periodLabel}`);
    console.log(`• Visites trouvées: ${visites.summary.totalActivities}`);
    console.log(`• Clients visités: ${visites.summary.uniqueCustomers}`);
    console.log(`• Commerciaux: ${visites.summary.uniqueColleagues}`);
    
    if (visites.activities.length > 0) {
      console.log('\nVisites du trimestre:');
      visites.activities.forEach((activity, i) => {
        const date = new Date(activity.startDate).toLocaleDateString('fr-FR');
        console.log(`  ${i + 1}. ${date} - ${activity.colleague} chez ${activity.customer}`);
        console.log(`     "${activity.caption}"`);
      });
    }
    
    // 5. Test résumé par commercial
    console.log('\n📈 Test 5: Résumé activités par commercial (trimestre)');
    console.log('======================================================');
    const summary = await getColleagueActivitiesSummary('quarter');
    
    console.log(`• Période: ${summary.period}`);
    console.log(`• Nombre de commerciaux actifs: ${summary.colleagues.length}`);
    
    console.log('\nRésumé par commercial:');
    summary.colleagues.forEach((colleague, i) => {
      const firstDate = new Date(colleague.firstActivity).toLocaleDateString('fr-FR');
      const lastDate = new Date(colleague.lastActivity).toLocaleDateString('fr-FR');
      console.log(`  ${i + 1}. ${colleague.colleagueName}`);
      console.log(`     ${colleague.totalActivities} activités | ${colleague.uniqueCustomers} clients`);
      console.log(`     Durée moyenne: ${colleague.averageDuration}min`);
      console.log(`     Période: ${firstDate} → ${lastDate}`);
      console.log('');
    });
    
    // 6. Test période personnalisée (derniers 30 jours)
    console.log('\n📅 Test 6: Période personnalisée (30 derniers jours)');
    console.log('===================================================');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const customPeriod = await getEnhancedClientActivities({
      period: 'custom',
      startDate: thirtyDaysAgo.toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      limit: 5
    });
    
    console.log(`• Période: ${customPeriod.summary.periodLabel}`);
    console.log(`• Activités: ${customPeriod.summary.totalActivities}`);
    console.log(`• Clients: ${customPeriod.summary.uniqueCustomers}`);
    console.log(`• Commerciaux: ${customPeriod.summary.uniqueColleagues}`);
    
    console.log('\n✅ Tous les tests réussis !');
    console.log('\n🎯 Tool ebp_get_client_activities enrichi prêt pour intégration MCP');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await closeDatabase();
  }
}

testEnhancedActivities();