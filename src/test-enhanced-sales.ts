// Test des nouvelles fonctionnalités de ventes avec familles de produits
import { connectDatabase, closeDatabase } from './database.js';
import { getClientSales } from './tools/sales.js';

async function testEnhancedSalesFeatures() {
  console.log('🧪 Test du tool ebp_get_client_sales amélioré...\n');
  
  try {
    await connectDatabase();
    
    const testCustomerId = 'CAEROSPATIALE';
    console.log(`🎯 Test avec le client: ${testCustomerId}\n`);
    
    // 1. Test période année courante avec familles
    console.log('📊 Test 1: CA année courante avec familles de produits');
    console.log('=====================================================');
    const yearSales = await getClientSales({
      customerId: testCustomerId,
      period: 'year',
      includeProductFamilies: true
    });
    
    console.log(`• Client: ${yearSales.customerName}`);
    console.log(`• Période: ${yearSales.period}`);
    console.log(`• CA Total: ${yearSales.totalRevenue?.toFixed(2) || 0}€`);
    console.log(`• Commandes: ${yearSales.totalOrders}`);
    console.log(`• Panier moyen: ${yearSales.averageOrderValue?.toFixed(2) || 0}€`);
    
    if (yearSales.productFamilies && yearSales.productFamilies.length > 0) {
      console.log('\nTop 5 familles de produits:');
      yearSales.productFamilies.slice(0, 5).forEach((family, i) => {
        console.log(`  ${i + 1}. ${family.name}`);
        console.log(`     CA: ${family.revenue?.toFixed(2)}€ (${family.percentage}%)`);
        console.log(`     ${family.itemCount} articles | Qté: ${family.quantity}`);
        
        if (family.subFamilies && family.subFamilies.length > 0) {
          console.log(`     Sous-familles principales:`);
          family.subFamilies.slice(0, 3).forEach(subFamily => {
            console.log(`       → ${subFamily.name}: ${subFamily.revenue?.toFixed(0)}€ (${subFamily.percentage}%)`);
          });
        }
        console.log('');
      });
    }
    
    // 2. Test période trimestre avec évolution
    console.log('\n📈 Test 2: CA trimestre courant avec évolution mensuelle');
    console.log('========================================================');
    const quarterSales = await getClientSales({
      customerId: testCustomerId,
      period: 'quarter',
      includeMonthlyTrend: true
    });
    
    console.log(`• Période: ${quarterSales.period}`);
    console.log(`• CA: ${quarterSales.totalRevenue?.toFixed(2)}€`);
    console.log(`• Commandes: ${quarterSales.totalOrders}`);
    
    if (quarterSales.monthlyTrend && quarterSales.monthlyTrend.length > 0) {
      console.log('\nÉvolution mensuelle:');
      quarterSales.monthlyTrend.forEach(month => {
        const monthLabel = new Date(month.month + '-01').toLocaleDateString('fr-FR', { 
          year: 'numeric', 
          month: 'long' 
        });
        console.log(`  • ${monthLabel}: ${month.revenue?.toFixed(2)}€ (${month.orders} commandes)`);
      });
    }
    
    // 3. Test période personnalisée (6 derniers mois)
    console.log('\n📅 Test 3: Période personnalisée (6 derniers mois)');
    console.log('==================================================');
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const customSales = await getClientSales({
      customerId: testCustomerId,
      period: 'custom',
      startDate: sixMonthsAgo.toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      includeProductFamilies: true,
      includeMonthlyTrend: true
    });
    
    console.log(`• Période: ${customSales.period}`);
    console.log(`• CA: ${customSales.totalRevenue?.toFixed(2)}€`);
    console.log(`• Commandes: ${customSales.totalOrders}`);
    console.log(`• Panier moyen: ${customSales.averageOrderValue?.toFixed(2)}€`);
    
    if (customSales.productFamilies) {
      console.log(`\nTop 3 familles sur la période:`);
      customSales.productFamilies.slice(0, 3).forEach((family, i) => {
        console.log(`  ${i + 1}. ${family.name}: ${family.revenue?.toFixed(0)}€ (${family.percentage}%)`);
      });
    }
    
    // 4. Test périodes prédéfinies rapides
    console.log('\n⚡ Test 4: Périodes prédéfinies rapides');
    console.log('======================================');
    
    const periods = ['week', 'month'] as const;
    for (const period of periods) {
      const quickTest = await getClientSales({
        customerId: testCustomerId,
        period
      });
      
      console.log(`• ${quickTest.period}: ${quickTest.totalRevenue?.toFixed(0)}€ (${quickTest.totalOrders} commandes)`);
    }
    
    console.log('\n✅ Tous les tests réussis !');
    console.log('\n🎯 Tool ebp_get_client_sales prêt pour intégration MCP');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await closeDatabase();
  }
}

testEnhancedSalesFeatures();