// Tools pour les ventes et chiffre d'affaires
import { getPool } from '../database.js';

export interface ClientSalesParams {
  customerId: string;
  year?: number;
  includeDetails?: boolean;
}

export interface ClientSalesResult {
  customerId: string;
  customerName: string;
  year: number;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  lastOrderDate?: Date;
  topProducts?: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    revenue: number;
  }>;
  monthlyRevenue?: Array<{
    month: number;
    revenue: number;
    orders: number;
  }>;
}

export async function getClientSales(params: ClientSalesParams): Promise<ClientSalesResult> {
  const pool = getPool();
  const year = params.year || new Date().getFullYear();
  
  // Requête principale pour le CA
  const salesResult = await pool.request()
    .input('customerId', params.customerId)
    .input('yearStart', `${year}-01-01`)
    .input('yearEnd', `${year}-12-31`)
    .query(`
      SELECT 
        c.Id as CustomerId,
        c.Name as CustomerName,
        COUNT(DISTINCT sd.Id) as TotalOrders,
        SUM(sd.AmountVatExcludedWithDiscount) as TotalRevenue,
        MAX(sd.DocumentDate) as LastOrderDate
      FROM Customer c
      LEFT JOIN SaleDocument sd ON c.Id = sd.CustomerId
        AND sd.DocumentDate >= @yearStart 
        AND sd.DocumentDate <= @yearEnd
        AND sd.DocumentType IN (6, 7) -- Factures et Avoirs
      WHERE c.Id = @customerId
      GROUP BY c.Id, c.Name
    `);
  
  if (!salesResult.recordset[0]) {
    throw new Error(`Client ${params.customerId} introuvable`);
  }
  
  const mainData = salesResult.recordset[0];
  const result: ClientSalesResult = {
    customerId: mainData.CustomerId,
    customerName: mainData.CustomerName,
    year,
    totalRevenue: mainData.TotalRevenue || 0,
    totalOrders: mainData.TotalOrders || 0,
    averageOrderValue: mainData.TotalRevenue ? mainData.TotalRevenue / mainData.TotalOrders : 0,
    lastOrderDate: mainData.LastOrderDate
  };
  
  // Si détails demandés, récupérer produits et évolution mensuelle
  if (params.includeDetails) {
    // Top produits vendus
    const productsResult = await pool.request()
      .input('customerId', params.customerId)
      .input('yearStart', `${year}-01-01`)
      .input('yearEnd', `${year}-12-31`)
      .query(`
        SELECT TOP 10
          sdl.ItemId,
          i.Caption as ItemName,
          SUM(sdl.Quantity) as TotalQuantity,
          SUM(sdl.NetAmountVatExcluded) as TotalRevenue
        FROM SaleDocumentLine sdl
        INNER JOIN SaleDocument sd ON sdl.DocumentId = sd.Id
        LEFT JOIN Item i ON sdl.ItemId = i.Id
        WHERE sd.CustomerId = @customerId
          AND sd.DocumentDate >= @yearStart
          AND sd.DocumentDate <= @yearEnd
          AND sd.DocumentType IN (6, 7)
          AND sdl.ItemId IS NOT NULL
        GROUP BY sdl.ItemId, i.Caption
        ORDER BY SUM(sdl.NetAmountVatExcluded) DESC
      `);
    
    result.topProducts = productsResult.recordset.map(row => ({
      itemId: row.ItemId,
      itemName: row.ItemName || 'Article non référencé',
      quantity: row.TotalQuantity,
      revenue: row.TotalRevenue
    }));
    
    // Evolution mensuelle
    const monthlyResult = await pool.request()
      .input('customerId', params.customerId)
      .input('yearStart', `${year}-01-01`)
      .input('yearEnd', `${year}-12-31`)
      .query(`
        SELECT 
          MONTH(sd.DocumentDate) as Month,
          COUNT(DISTINCT sd.Id) as Orders,
          SUM(sd.AmountVatExcludedWithDiscount) as Revenue
        FROM SaleDocument sd
        WHERE sd.CustomerId = @customerId
          AND sd.DocumentDate >= @yearStart
          AND sd.DocumentDate <= @yearEnd
          AND sd.DocumentType IN (6, 7)
        GROUP BY MONTH(sd.DocumentDate)
        ORDER BY MONTH(sd.DocumentDate)
      `);
    
    result.monthlyRevenue = monthlyResult.recordset.map(row => ({
      month: row.Month,
      revenue: row.Revenue || 0,
      orders: row.Orders || 0
    }));
  }
  
  return result;
}

export interface TopProductsParams {
  customerId?: string;
  period?: 'month' | 'quarter' | 'year';
  limit?: number;
}

export interface TopProductsResult {
  period: string;
  products: Array<{
    itemId: string;
    itemName: string;
    totalQuantity: number;
    totalRevenue: number;
    customerCount: number;
  }>;
}

export async function getTopProducts(params: TopProductsParams): Promise<TopProductsResult> {
  const pool = getPool();
  const limit = params.limit || 10;
  
  // Calcul de la période
  const now = new Date();
  let startDate: string;
  let periodLabel: string;
  
  switch (params.period || 'month') {
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      periodLabel = `${now.toLocaleString('fr-FR', { month: 'long' })} ${now.getFullYear()}`;
      break;
    case 'quarter':
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1).toISOString().split('T')[0];
      periodLabel = `Q${quarter + 1} ${now.getFullYear()}`;
      break;
    case 'year':
      startDate = `${now.getFullYear()}-01-01`;
      periodLabel = `${now.getFullYear()}`;
      break;
  }
  
  const query = params.customerId ? `
    -- Top produits pour un client spécifique
    SELECT TOP (@limit)
      sdl.ItemId,
      i.Caption as ItemName,
      SUM(sdl.Quantity) as TotalQuantity,
      SUM(sdl.NetAmountVatExcluded) as TotalRevenue,
      1 as CustomerCount
    FROM SaleDocumentLine sdl
    INNER JOIN SaleDocument sd ON sdl.DocumentId = sd.Id
    LEFT JOIN Item i ON sdl.ItemId = i.Id
    WHERE sd.CustomerId = @customerId
      AND sd.DocumentDate >= @startDate
      AND sd.DocumentType IN (6, 7)
      AND sdl.ItemId IS NOT NULL
    GROUP BY sdl.ItemId, i.Caption
    ORDER BY SUM(sdl.NetAmountVatExcluded) DESC
  ` : `
    -- Top produits tous clients confondus
    SELECT TOP (@limit)
      sdl.ItemId,
      i.Caption as ItemName,
      SUM(sdl.Quantity) as TotalQuantity,
      SUM(sdl.NetAmountVatExcluded) as TotalRevenue,
      COUNT(DISTINCT sd.CustomerId) as CustomerCount
    FROM SaleDocumentLine sdl
    INNER JOIN SaleDocument sd ON sdl.DocumentId = sd.Id
    LEFT JOIN Item i ON sdl.ItemId = i.Id
    WHERE sd.DocumentDate >= @startDate
      AND sd.DocumentType IN (6, 7)
      AND sdl.ItemId IS NOT NULL
    GROUP BY sdl.ItemId, i.Caption
    ORDER BY SUM(sdl.NetAmountVatExcluded) DESC
  `;
  
  const request = pool.request()
    .input('limit', limit)
    .input('startDate', startDate);
  
  if (params.customerId) {
    request.input('customerId', params.customerId);
  }
  
  const result = await request.query(query);
  
  return {
    period: periodLabel,
    products: result.recordset.map(row => ({
      itemId: row.ItemId,
      itemName: row.ItemName || 'Article non référencé',
      totalQuantity: row.TotalQuantity,
      totalRevenue: row.TotalRevenue,
      customerCount: row.CustomerCount
    }))
  };
}