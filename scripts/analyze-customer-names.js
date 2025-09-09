// Analyse des colonnes de noms d'entreprises pour améliorer la recherche
const { connectDatabase } = require('../dist/database.js');

(async () => {
  try {
    const pool = await connectDatabase();
    
    console.log('=== ANALYSE COLONNES NOMS ENTREPRISES ===');
    
    // 1. Structure table Customer
    const customerStructure = await pool.request().query('SELECT TOP 1 * FROM Customer');
    const customerColumns = Object.keys(customerStructure.recordset[0]);
    
    console.log('📋 Colonnes Customer liées aux noms:');
    const nameColumns = customerColumns.filter(col => 
      col.toLowerCase().includes('name') || 
      col.toLowerCase().includes('caption') ||
      col.toLowerCase().includes('company') ||
      col.toLowerCase().includes('label')
    );
    nameColumns.forEach(col => console.log('  -', col));
    
    // 2. Échantillon de données réelles
    console.log('\n📊 Échantillon de données (10 premiers clients):');
    const sampleData = await pool.request().query(`
      SELECT TOP 10
        Id,
        Name,
        MainInvoicingAddress_ThirdName
      FROM Customer 
      WHERE Name IS NOT NULL
      ORDER BY Name
    `);
    
    sampleData.recordset.forEach(row => {
      console.log(`  ${row.Id}: ${row.Name} | ${row.MainInvoicingAddress_ThirdName || 'null'}`);
    });
    
    // 3. Recherche spécifique CCHAUVIN
    console.log('\n🔍 Analyse spécifique CCHAUVIN:');
    const cchauvinData = await pool.request().query(`
      SELECT 
        Id,
        Name,
        MainInvoicingAddress_ThirdName,
        IntracommunityVatNumber
      FROM Customer 
      WHERE Id = 'CCHAUVIN'
    `);
    
    if (cchauvinData.recordset.length > 0) {
      const client = cchauvinData.recordset[0];
      console.log('  ID:', client.Id);
      console.log('  Name:', client.Name);
      console.log('  ThirdName:', client.MainInvoicingAddress_ThirdName);
      console.log('  VAT:', client.IntracommunityVatNumber);
    }
    
    // 4. Test recherche similaire à "CHAUVIN"
    console.log('\n🔎 Test recherche "CHAUVIN":');
    const searchResults = await pool.request()
      .input('searchTerm', '%CHAUVIN%')
      .query(`
        SELECT TOP 10
          Id,
          Name,
          MainInvoicingAddress_ThirdName
        FROM Customer 
        WHERE Name LIKE @searchTerm
           OR MainInvoicingAddress_ThirdName LIKE @searchTerm
        ORDER BY Name
      `);
      
    searchResults.recordset.forEach(row => {
      console.log(`  ${row.Id}: ${row.Name} (${row.MainInvoicingAddress_ThirdName || 'N/A'})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error.message);
    process.exit(1);
  }
})();