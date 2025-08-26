// Test des nouvelles fonctionnalités de vente
import { connectDatabase, closeDatabase } from './database.js';
import { getClientSales, getTopProducts } from './tools/sales.js';

async function testSalesFeatures() {
  console.log('🧪 Test des nouvelles fonctionnalités CA et Produits...\n');
  
  try {
    await connectDatabase();
    
    // 1. Trouver un client avec des ventes
    console.log('🔍 Recherche d\'un client test avec des ventes...');
    const pool = (await import('./database.js')).getPool();
    
    const testClientResult = await pool.request().query(`
      SELECT TOP 1
        c.Id,
        c.Name,
        COUNT(sd.Id) as NbDocuments
      FROM Customer c
      INNER JOIN SaleDocument sd ON c.Id = sd.CustomerId
      WHERE sd.DocumentType IN (6, 7)
        AND YEAR(sd.DocumentDate) = YEAR(GETDATE())
      GROUP BY c.Id, c.Name
      HAVING COUNT(sd.Id) > 5
      ORDER BY COUNT(sd.Id) DESC
    `);
    
    if (testClientResult.recordset.length === 0) {
      console.log('❌ Aucun client avec suffisamment de ventes trouvé');
      return;
    }
    
    const testClient = testClientResult.recordset[0];
    console.log(`✅ Client test: ${testClient.Name} (${testClient.Id})`);
    console.log(`   ${testClient.NbDocuments} documents de vente\n`);
    
    // 2. Test getClientSales sans détails
    console.log('💰 Test 1: CA du client (sans détails)');
    console.log('=====================================');
    const salesBasic = await getClientSales({
      customerId: testClient.Id,
      year: new Date().getFullYear(),
      includeDetails: false
    });
    
    console.log(`• Client: ${salesBasic.customerName}`);
    console.log(`• Année: ${salesBasic.year}`);
    console.log(`• CA Total: ${salesBasic.totalRevenue?.toFixed(2) || 0} €`);
    console.log(`• Nombre de commandes: ${salesBasic.totalOrders}`);
    console.log(`• Panier moyen: ${salesBasic.averageOrderValue?.toFixed(2) || 0} €`);
    if (salesBasic.lastOrderDate) {
      console.log(`• Dernière commande: ${new Date(salesBasic.lastOrderDate).toLocaleDateString('fr-FR')}`);
    }
    
    // 3. Test getClientSales avec détails
    console.log('\n💰 Test 2: CA du client (avec détails)');
    console.log('=======================================');
    const salesDetailed = await getClientSales({
      customerId: testClient.Id,
      year: new Date().getFullYear(),
      includeDetails: true
    });
    
    if (salesDetailed.topProducts && salesDetailed.topProducts.length > 0) {
      console.log('\nTop 5 produits achetés:');
      salesDetailed.topProducts.slice(0, 5).forEach((product, i) => {
        console.log(`  ${i + 1}. ${product.itemName}`);
        console.log(`     Quantité: ${product.quantity} | CA: ${product.revenue?.toFixed(2) || 0} €`);
      });
    }
    
    if (salesDetailed.monthlyRevenue && salesDetailed.monthlyRevenue.length > 0) {
      console.log('\nÉvolution mensuelle:');
      salesDetailed.monthlyRevenue.forEach(month => {
        const monthName = new Date(2024, month.month - 1).toLocaleString('fr-FR', { month: 'long' });
        console.log(`  • ${monthName}: ${month.revenue?.toFixed(2) || 0} € (${month.orders} commandes)`);
      });
    }
    
    // 4. Test getTopProducts global
    console.log('\n📊 Test 3: Top produits du mois (tous clients)');
    console.log('===============================================');
    const topProductsMonth = await getTopProducts({
      period: 'month',
      limit: 5
    });
    
    console.log(`Période: ${topProductsMonth.period}\n`);
    topProductsMonth.products.forEach((product, i) => {
      console.log(`${i + 1}. ${product.itemName}`);
      console.log(`   CA: ${product.totalRevenue?.toFixed(2) || 0} € | Qté: ${product.totalQuantity} | ${product.customerCount} clients`);
    });
    
    // 5. Test getTopProducts pour le client
    console.log('\n📊 Test 4: Top produits du client ce trimestre');
    console.log('===============================================');
    const topProductsClient = await getTopProducts({
      customerId: testClient.Id,
      period: 'quarter',
      limit: 3
    });
    
    console.log(`Client: ${testClient.Name}`);
    console.log(`Période: ${topProductsClient.period}\n`);
    topProductsClient.products.forEach((product, i) => {
      console.log(`${i + 1}. ${product.itemName}`);
      console.log(`   CA: ${product.totalRevenue?.toFixed(2) || 0} € | Quantité: ${product.totalQuantity}`);
    });
    
    console.log('\n✅ Tous les tests réussis !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await closeDatabase();
  }
}

testSalesFeatures();