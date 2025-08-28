// Utilitaires pour les familles de produits
import { getPool } from '../database.js';

export interface ProductFamily {
  id: string;
  name: string;
  revenue: number;
  percentage: number;
  itemCount: number;
  quantity?: number;
  subFamilies?: ProductSubFamily[];
}

export interface ProductSubFamily {
  id: string;
  name: string;
  familyId: string;
  revenue: number;
  percentage: number;
  itemCount: number;
  quantity?: number;
}

/**
 * Récupère les familles de produits avec leur CA pour un client et une période donnés
 */
export async function getClientProductFamilies(
  customerId: string,
  startDate: string,
  endDate: string,
  includeSubFamilies = false
): Promise<ProductFamily[]> {
  const pool = getPool();
  
  // Requête pour les familles avec CA
  const familiesQuery = `
    SELECT 
      COALESCE(f.Id, 'SANS_FAMILLE') as FamilyId,
      COALESCE(f.Caption, 'SANS FAMILLE') as FamilyName,
      COUNT(DISTINCT sdl.ItemId) as ItemCount,
      SUM(sdl.Quantity) as TotalQuantity,
      SUM(sdl.NetAmountVatExcluded) as TotalRevenue
    FROM SaleDocumentLine sdl
    INNER JOIN SaleDocument sd ON sdl.DocumentId = sd.Id
    LEFT JOIN Item i ON sdl.ItemId = i.Id
    LEFT JOIN ItemFamily f ON i.FamilyId = f.Id
    WHERE sd.CustomerId = @customerId
      AND sd.DocumentDate >= @startDate
      AND sd.DocumentDate <= @endDate
      AND sd.DocumentType IN (2, 3)  -- Factures et Avoirs (Types corrects)
      AND sd.ValidationState = 3  -- Seulement les documents comptabilisés
      AND sdl.NetAmountVatExcluded > 0
    GROUP BY f.Id, f.Caption
    ORDER BY SUM(sdl.NetAmountVatExcluded) DESC
  `;
  
  const result = await pool.request()
    .input('customerId', customerId)
    .input('startDate', startDate)
    .input('endDate', endDate)
    .query(familiesQuery);
  
  const totalRevenue = result.recordset.reduce((sum, row) => sum + (row.TotalRevenue || 0), 0);
  
  const families: ProductFamily[] = result.recordset.map(row => ({
    id: row.FamilyId,
    name: row.FamilyName,
    revenue: row.TotalRevenue || 0,
    percentage: totalRevenue > 0 ? Math.round((row.TotalRevenue / totalRevenue) * 100) : 0,
    itemCount: row.ItemCount || 0,
    quantity: row.TotalQuantity || 0
  }));
  
  // Si demandé, récupérer les sous-familles pour chaque famille
  if (includeSubFamilies) {
    for (const family of families) {
      if (family.id !== 'SANS_FAMILLE') {
        family.subFamilies = await getClientProductSubFamilies(customerId, family.id, startDate, endDate);
      }
    }
  }
  
  return families;
}

/**
 * Récupère les sous-familles pour une famille donnée
 */
async function getClientProductSubFamilies(
  customerId: string,
  familyId: string,
  startDate: string,
  endDate: string
): Promise<ProductSubFamily[]> {
  const pool = getPool();
  
  const subFamiliesQuery = `
    SELECT 
      COALESCE(sf.Id, 'SANS_SOUS_FAMILLE') as SubFamilyId,
      COALESCE(sf.Caption, 'SANS SOUS-FAMILLE') as SubFamilyName,
      COUNT(DISTINCT sdl.ItemId) as ItemCount,
      SUM(sdl.Quantity) as TotalQuantity,
      SUM(sdl.NetAmountVatExcluded) as TotalRevenue
    FROM SaleDocumentLine sdl
    INNER JOIN SaleDocument sd ON sdl.DocumentId = sd.Id
    LEFT JOIN Item i ON sdl.ItemId = i.Id
    LEFT JOIN ItemSubFamily sf ON i.SubFamilyId = sf.Id
    WHERE sd.CustomerId = @customerId
      AND sd.DocumentDate >= @startDate
      AND sd.DocumentDate <= @endDate
      AND sd.DocumentType IN (2, 3)
      AND sd.ValidationState = 3
      AND i.FamilyId = @familyId
      AND sdl.NetAmountVatExcluded > 0
    GROUP BY sf.Id, sf.Caption
    ORDER BY SUM(sdl.NetAmountVatExcluded) DESC
  `;
  
  const result = await pool.request()
    .input('customerId', customerId)
    .input('familyId', familyId)
    .input('startDate', startDate)
    .input('endDate', endDate)
    .query(subFamiliesQuery);
  
  // Calculer le total pour les pourcentages
  const familyRevenue = result.recordset.reduce((sum, row) => sum + (row.TotalRevenue || 0), 0);
  
  return result.recordset.map(row => ({
    id: row.SubFamilyId,
    name: row.SubFamilyName,
    familyId,
    revenue: row.TotalRevenue || 0,
    percentage: familyRevenue > 0 ? Math.round((row.TotalRevenue / familyRevenue) * 100) : 0,
    itemCount: row.ItemCount || 0,
    quantity: row.TotalQuantity || 0
  }));
}

/**
 * Récupère les top familles globales pour une période
 */
export async function getTopProductFamilies(
  startDate: string,
  endDate: string,
  limit = 10,
  customerId?: string
): Promise<ProductFamily[]> {
  const pool = getPool();
  
  const baseQuery = `
    SELECT 
      COALESCE(f.Id, 'SANS_FAMILLE') as FamilyId,
      COALESCE(f.Caption, 'SANS FAMILLE') as FamilyName,
      COUNT(DISTINCT sdl.ItemId) as ItemCount,
      COUNT(DISTINCT sd.CustomerId) as CustomerCount,
      SUM(sdl.Quantity) as TotalQuantity,
      SUM(sdl.NetAmountVatExcluded) as TotalRevenue
    FROM SaleDocumentLine sdl
    INNER JOIN SaleDocument sd ON sdl.DocumentId = sd.Id
    LEFT JOIN Item i ON sdl.ItemId = i.Id
    LEFT JOIN ItemFamily f ON i.FamilyId = f.Id
    WHERE sd.DocumentDate >= @startDate
      AND sd.DocumentDate <= @endDate
      AND sd.DocumentType IN (2, 3)
      AND sd.ValidationState = 3
      AND sdl.NetAmountVatExcluded > 0
      ${customerId ? 'AND sd.CustomerId = @customerId' : ''}
    GROUP BY f.Id, f.Caption
  `;
  
  const request = pool.request()
    .input('startDate', startDate)
    .input('endDate', endDate)
    .input('limit', limit);
  
  if (customerId) {
    request.input('customerId', customerId);
  }
  
  const result = await request.query(`
    SELECT TOP (@limit) * FROM (${baseQuery}) as families 
    ORDER BY families.TotalRevenue DESC
  `);
  
  const totalRevenue = result.recordset.reduce((sum, row) => sum + (row.TotalRevenue || 0), 0);
  
  return result.recordset.map(row => ({
    id: row.FamilyId,
    name: row.FamilyName,
    revenue: row.TotalRevenue || 0,
    percentage: totalRevenue > 0 ? Math.round((row.TotalRevenue / totalRevenue) * 100) : 0,
    itemCount: row.ItemCount || 0,
    quantity: row.TotalQuantity || 0
  }));
}