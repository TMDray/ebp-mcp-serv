// Test des performances des familles de produits
import { connectDatabase, closeDatabase } from './database.js';
import { getProductFamiliesPerformance, getFamiliesGrowthComparison } from './tools/families.js';

async function testFamiliesPerformance() {
  console.log('🧪 Test du tool ebp_get_product_families_performance...\n');
  
  try {
    await connectDatabase();
    
    // 1. Test performance familles ce trimestre
    console.log('📊 Test 1: Performance familles ce trimestre');
    console.log('===========================================');
    const quarterPerf = await getProductFamiliesPerformance({
      period: 'quarter',
      includeSubFamilies: true,
      limit: 8
    });
    
    console.log(`• Période: ${quarterPerf.period}`);
    console.log(`• CA Total: ${quarterPerf.summary.totalRevenue?.toFixed(2)}€`);
    console.log(`• Familles actives: ${quarterPerf.summary.totalFamilies}`);
    console.log(`• Top famille: ${quarterPerf.summary.topPerformingFamily}`);
    console.log(`• CA moyen/famille: ${quarterPerf.summary.averageRevenuePerFamily?.toFixed(2)}€`);
    
    if (quarterPerf.families.length > 0) {
      console.log('\nTop familles du trimestre:');
      quarterPerf.families.slice(0, 5).forEach((family, i) => {
        console.log(`  ${i + 1}. ${family.name} (${family.percentage}%)`);
        console.log(`     CA: ${family.revenue?.toFixed(2)}€`);
        console.log(`     ${family.itemCount} articles | ${family.customerCount} clients`);
        console.log(`     Panier moyen: ${family.avgOrderValue?.toFixed(2)}€`);
        
        if (family.topCustomers && family.topCustomers.length > 0) {
          console.log(`     Top clients:`);
          family.topCustomers.slice(0, 3).forEach(customer => {
            console.log(`       → ${customer.customerName}: ${customer.revenue?.toFixed(0)}€ (${customer.percentage}%)`);
          });
        }
        
        if (family.subFamilies && family.subFamilies.length > 0) {
          console.log(`     Principales sous-familles:`);
          family.subFamilies.slice(0, 3).forEach(subFamily => {
            console.log(`       → ${subFamily.name}: ${subFamily.revenue?.toFixed(0)}€ (${subFamily.percentage}%)`);
          });
        }
        console.log('');
      });
    }
    
    // 2. Test performance familles pour client spécifique
    console.log('\n🏢 Test 2: Performance familles pour AEROSPATIALE (année)');
    console.log('========================================================');
    const aeroPerf = await getProductFamiliesPerformance({
      period: 'year',
      customerId: 'CAEROSPATIALE',
      includeSubFamilies: true,
      limit: 5
    });
    
    console.log(`• Client: AEROSPATIALE`);
    console.log(`• Période: ${aeroPerf.period}`);
    console.log(`• CA Total: ${aeroPerf.summary.totalRevenue?.toFixed(2)}€`);
    console.log(`• Familles achetées: ${aeroPerf.summary.totalFamilies}`);
    
    if (aeroPerf.families.length > 0) {
      console.log('\nFamilles achetées par AEROSPATIALE:');
      aeroPerf.families.forEach((family, i) => {
        console.log(`  ${i + 1}. ${family.name} (${family.percentage}%)`);
        console.log(`     CA: ${family.revenue?.toFixed(2)}€`);
        console.log(`     ${family.itemCount} articles différents`);
        
        if (family.subFamilies && family.subFamilies.length > 0) {
          console.log(`     Détail sous-familles:`);
          family.subFamilies.forEach(subFamily => {
            console.log(`       → ${subFamily.name}: ${subFamily.revenue?.toFixed(0)}€`);
          });
        }
        console.log('');
      });
    }
    
    // 3. Test performance mensuelle globale
    console.log('\n📈 Test 3: Performance familles ce mois (global)');
    console.log('==============================================');
    const monthPerf = await getProductFamiliesPerformance({
      period: 'month',
      limit: 6
    });
    
    console.log(`• Période: ${monthPerf.period}`);
    console.log(`• CA Total: ${monthPerf.summary.totalRevenue?.toFixed(2)}€`);
    console.log(`• Familles actives: ${monthPerf.summary.totalFamilies}`);
    
    if (monthPerf.families.length > 0) {
      console.log('\nTop familles du mois:');
      monthPerf.families.forEach((family, i) => {
        console.log(`  ${i + 1}. ${family.name}`);
        console.log(`     CA: ${family.revenue?.toFixed(0)}€ (${family.percentage}%) | ${family.customerCount} clients`);
        
        if (family.topCustomers && family.topCustomers.length > 0) {
          const topClient = family.topCustomers[0];
          console.log(`     Top client: ${topClient.customerName} (${topClient.revenue?.toFixed(0)}€)`);
        }
      });
    } else {
      console.log('  Aucune vente ce mois');
    }
    
    // 4. Test focus sur une famille spécifique
    console.log('\n🔍 Test 4: Focus famille "Mica et Dérivés" (trimestre)');
    console.log('====================================================');
    const micaPerf = await getProductFamiliesPerformance({
      period: 'quarter',
      familyId: 'MICA',
      includeSubFamilies: true
    });
    
    if (micaPerf.families.length > 0) {
      const mica = micaPerf.families[0];
      console.log(`• Famille: ${mica.name}`);
      console.log(`• CA trimestre: ${mica.revenue?.toFixed(2)}€`);
      console.log(`• Articles: ${mica.itemCount} | Clients: ${mica.customerCount}`);
      console.log(`• Panier moyen: ${mica.avgOrderValue?.toFixed(2)}€`);
      
      if (mica.topCustomers && mica.topCustomers.length > 0) {
        console.log('\nTop clients Mica:');
        mica.topCustomers.forEach((customer, i) => {
          console.log(`  ${i + 1}. ${customer.customerName}: ${customer.revenue?.toFixed(0)}€`);
        });
      }
      
      if (mica.subFamilies && mica.subFamilies.length > 0) {
        console.log('\nSous-familles Mica:');
        mica.subFamilies.forEach((subFamily, i) => {
          console.log(`  ${i + 1}. ${subFamily.name}: ${subFamily.revenue?.toFixed(0)}€ (${subFamily.percentage}%)`);
        });
      }
    } else {
      console.log('  Famille MICA non trouvée ou sans ventes');
    }
    
    // 5. Test comparaison croissance (trimestre vs trimestre précédent année)
    console.log('\n📊 Test 5: Comparaison croissance trimestre vs année précédente');
    console.log('==============================================================');
    const growth = await getFamiliesGrowthComparison('quarter');
    
    console.log(`• Période actuelle: ${growth.currentLabel}`);
    console.log(`• Période comparaison: ${growth.previousLabel}`);
    console.log(`• Familles analysées: ${growth.comparison.length}`);
    
    if (growth.comparison.length > 0) {
      console.log('\nÉvolution des familles:');
      growth.comparison.slice(0, 8).forEach((comp, i) => {
        const growthIcon = comp.growthLabel === 'Croissance' ? '📈' : 
                          comp.growthLabel === 'Déclin' ? '📉' : '➡️';
        const growthText = comp.growth > 0 ? `+${comp.growth}%` : `${comp.growth}%`;
        
        console.log(`  ${i + 1}. ${growthIcon} ${comp.familyName}`);
        console.log(`     ${comp.currentRevenue?.toFixed(0)}€ vs ${comp.previousRevenue?.toFixed(0)}€ (${growthText})`);
      });
    }
    
    // 6. Test période personnalisée (6 derniers mois)
    console.log('\n📅 Test 6: Performance familles - 6 derniers mois');
    console.log('=================================================');
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const customPerf = await getProductFamiliesPerformance({
      period: 'custom',
      startDate: sixMonthsAgo.toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      limit: 5
    });
    
    console.log(`• Période: ${customPerf.period}`);
    console.log(`• CA Total: ${customPerf.summary.totalRevenue?.toFixed(2)}€`);
    console.log(`• Top famille: ${customPerf.summary.topPerformingFamily}`);
    
    if (customPerf.families.length > 0) {
      console.log('\nTop familles sur 6 mois:');
      customPerf.families.forEach((family, i) => {
        console.log(`  ${i + 1}. ${family.name}: ${family.revenue?.toFixed(0)}€ (${family.percentage}%)`);
      });
    }
    
    console.log('\n✅ Tous les tests réussis !');
    console.log('\n🎯 Tool ebp_get_product_families_performance prêt pour intégration MCP');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await closeDatabase();
  }
}

testFamiliesPerformance();