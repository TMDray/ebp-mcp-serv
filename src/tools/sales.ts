// Tools pour les ventes et chiffre d'affaires
import { getPool } from '../database.js';
import { PredefinedPeriod, calculatePeriodDates } from '../utils/periods.js';
import { getClientProductFamilies, ProductFamily } from '../utils/families-helper.js';

export interface ClientSalesParams {
  customerId: string;
  period?: PredefinedPeriod;
  startDate?: string;
  endDate?: string;
  includeProductFamilies?: boolean;
  includeMonthlyTrend?: boolean;
}

export interface ClientSalesResult {
  customerId: string;
  customerName: string;
  period: string;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  lastOrderDate?: Date;
  productFamilies?: ProductFamily[];
  monthlyTrend?: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
}

export async function getClientSales(params: ClientSalesParams): Promise<ClientSalesResult> {
  const pool = getPool();
  
  // Calculer les dates de la période
  const period = params.period || 'year';
  const { startDate, endDate, label } = calculatePeriodDates(period, params.startDate, params.endDate);
  
  // Requête principale pour le CA
  const salesResult = await pool.request()
    .input('customerId', params.customerId)
    .input('startDate', startDate)
    .input('endDate', endDate)
    .query(`
      SELECT 
        c.Id as CustomerId,
        c.Name as CustomerName,
        COUNT(DISTINCT sd.Id) as TotalOrders,
        SUM(sd.AmountVatExcludedWithDiscount) as TotalRevenue,
        MAX(sd.DocumentDate) as LastOrderDate
      FROM Customer c
      LEFT JOIN SaleDocument sd ON c.Id = sd.CustomerId
        AND sd.DocumentDate >= @startDate 
        AND sd.DocumentDate <= @endDate
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
    period: label,
    totalRevenue: mainData.TotalRevenue || 0,
    totalOrders: mainData.TotalOrders || 0,
    averageOrderValue: mainData.TotalRevenue ? Math.round((mainData.TotalRevenue / mainData.TotalOrders) * 100) / 100 : 0,
    lastOrderDate: mainData.LastOrderDate
  };
  
  // Ajouter les familles de produits si demandé
  if (params.includeProductFamilies) {
    result.productFamilies = await getClientProductFamilies(
      params.customerId,
      startDate,
      endDate,
      true // inclure les sous-familles
    );
  }
  
  // Ajouter l'évolution mensuelle si demandé
  if (params.includeMonthlyTrend) {
    const monthlyResult = await pool.request()
      .input('customerId', params.customerId)
      .input('startDate', startDate)
      .input('endDate', endDate)
      .query(`
        SELECT 
          FORMAT(sd.DocumentDate, 'yyyy-MM') as MonthYear,
          COUNT(DISTINCT sd.Id) as Orders,
          SUM(sd.AmountVatExcludedWithDiscount) as Revenue
        FROM SaleDocument sd
        WHERE sd.CustomerId = @customerId
          AND sd.DocumentDate >= @startDate
          AND sd.DocumentDate <= @endDate
          AND sd.DocumentType IN (6, 7)
        GROUP BY FORMAT(sd.DocumentDate, 'yyyy-MM')
        ORDER BY FORMAT(sd.DocumentDate, 'yyyy-MM')
      `);
    
    result.monthlyTrend = monthlyResult.recordset.map(row => ({
      month: row.MonthYear,
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