// Tools pour l'analyse des familles de produits
import { getPool } from '../database.js';
import { PredefinedPeriod, calculatePeriodDates } from '../utils/periods.js';
import { getTopProductFamilies, ProductFamily } from '../utils/families-helper.js';

export interface ProductFamiliesPerformanceParams {
  period?: PredefinedPeriod;
  startDate?: string;
  endDate?: string;
  customerId?: string;
  familyId?: string;
  includeSubFamilies?: boolean;
  limit?: number;
}

export interface FamilyPerformance {
  id: string;
  name: string;
  revenue: number;
  percentage: number;
  growth?: number; // pourcentage de croissance vs période précédente
  itemCount: number;
  customerCount: number;
  avgOrderValue: number;
  topCustomers?: Array<{
    customerId: string;
    customerName: string;
    revenue: number;
    percentage: number;
  }>;
  subFamilies?: Array<{
    id: string;
    name: string;
    revenue: number;
    percentage: number;
  }>;
}

export interface ProductFamiliesPerformanceResult {
  period: string;
  summary: {
    totalRevenue: number;
    totalFamilies: number;
    topPerformingFamily: string;
    averageRevenuePerFamily: number;
  };
  families: FamilyPerformance[];
}

export async function getProductFamiliesPerformance(
  params: ProductFamiliesPerformanceParams
): Promise<ProductFamiliesPerformanceResult> {
  const pool = getPool();
  const limit = params.limit || 10;
  
  // Calculer les dates de la période
  const period = params.period || 'month';
  const { startDate, endDate, label } = calculatePeriodDates(period, params.startDate, params.endDate);
  
  // Construire la requête de base
  let baseQuery = `
    SELECT 
      COALESCE(f.Id, 'SANS_FAMILLE') as FamilyId,
      COALESCE(f.Caption, 'SANS FAMILLE') as FamilyName,
      COUNT(DISTINCT sdl.ItemId) as ItemCount,
      COUNT(DISTINCT sd.CustomerId) as CustomerCount,
      COUNT(DISTINCT sd.Id) as DocumentCount,
      SUM(sdl.Quantity) as TotalQuantity,
      SUM(sdl.NetAmountVatExcluded) as TotalRevenue,
      AVG(sdl.NetAmountVatExcluded) as AvgLineValue
    FROM SaleDocumentLine sdl
    INNER JOIN SaleDocument sd ON sdl.DocumentId = sd.Id
    LEFT JOIN Item i ON sdl.ItemId = i.Id
    LEFT JOIN ItemFamily f ON i.FamilyId = f.Id
    WHERE sd.DocumentDate >= @startDate
      AND sd.DocumentDate <= @endDate
      AND sd.DocumentType IN (6, 7)  -- Factures et Avoirs
      AND sdl.NetAmountVatExcluded > 0
  `;
  
  const request = pool.request()
    .input('startDate', startDate)
    .input('endDate', endDate)
    .input('limit', limit);
  
  // Ajouter filtres optionnels
  if (params.customerId) {
    baseQuery += ' AND sd.CustomerId = @customerId';
    request.input('customerId', params.customerId);
  }
  
  if (params.familyId) {
    baseQuery += ' AND f.Id = @familyId';
    request.input('familyId', params.familyId);
  }
  
  baseQuery += `
    GROUP BY f.Id, f.Caption
  `;
  
  // Exécuter la requête principale avec ORDER BY à l'extérieur
  const familiesQuery = `
    SELECT TOP (@limit) * FROM (${baseQuery}) as families 
    ORDER BY families.TotalRevenue DESC
  `;
  const result = await request.query(familiesQuery);
  
  const totalRevenue = result.recordset.reduce((sum, row) => sum + (row.TotalRevenue || 0), 0);
  
  // Mapper les familles
  const families: FamilyPerformance[] = [];
  
  for (const row of result.recordset) {
    const family: FamilyPerformance = {
      id: row.FamilyId,
      name: row.FamilyName,
      revenue: row.TotalRevenue || 0,
      percentage: totalRevenue > 0 ? Math.round((row.TotalRevenue / totalRevenue) * 100) : 0,
      itemCount: row.ItemCount || 0,
      customerCount: row.CustomerCount || 0,
      avgOrderValue: row.DocumentCount > 0 ? Math.round((row.TotalRevenue / row.DocumentCount) * 100) / 100 : 0
    };
    
    // Récupérer les top clients pour cette famille
    if (!params.customerId && family.id !== 'SANS_FAMILLE') {
      const topCustomersResult = await pool.request()
        .input('familyId', family.id)
        .input('startDate', startDate)
        .input('endDate', endDate)
        .query(`
          SELECT TOP 3
            sd.CustomerId,
            sd.CustomerName,
            SUM(sdl.NetAmountVatExcluded) as Revenue
          FROM SaleDocumentLine sdl
          INNER JOIN SaleDocument sd ON sdl.DocumentId = sd.Id
          LEFT JOIN Item i ON sdl.ItemId = i.Id
          WHERE i.FamilyId = @familyId
            AND sd.DocumentDate >= @startDate
            AND sd.DocumentDate <= @endDate
            AND sd.DocumentType IN (6, 7)
          GROUP BY sd.CustomerId, sd.CustomerName
          ORDER BY SUM(sdl.NetAmountVatExcluded) DESC
        `);
      
      const familyCustomerRevenue = topCustomersResult.recordset.reduce((sum, c) => sum + (c.Revenue || 0), 0);
      
      family.topCustomers = topCustomersResult.recordset.map(customer => ({
        customerId: customer.CustomerId,
        customerName: customer.CustomerName,
        revenue: customer.Revenue || 0,
        percentage: familyCustomerRevenue > 0 ? Math.round((customer.Revenue / familyCustomerRevenue) * 100) : 0
      }));
    }
    
    // Récupérer les sous-familles si demandé
    if (params.includeSubFamilies && family.id !== 'SANS_FAMILLE') {
      const subFamiliesResult = await pool.request()
        .input('familyId', family.id)
        .input('startDate', startDate)
        .input('endDate', endDate)
        .query(`
          SELECT TOP 5
            COALESCE(sf.Id, 'SANS_SOUS_FAMILLE') as SubFamilyId,
            COALESCE(sf.Caption, 'SANS SOUS-FAMILLE') as SubFamilyName,
            SUM(sdl.NetAmountVatExcluded) as Revenue
          FROM SaleDocumentLine sdl
          INNER JOIN SaleDocument sd ON sdl.DocumentId = sd.Id
          LEFT JOIN Item i ON sdl.ItemId = i.Id
          LEFT JOIN ItemSubFamily sf ON i.SubFamilyId = sf.Id
          WHERE i.FamilyId = @familyId
            AND sd.DocumentDate >= @startDate
            AND sd.DocumentDate <= @endDate
            AND sd.DocumentType IN (6, 7)
            AND sdl.NetAmountVatExcluded > 0
          GROUP BY sf.Id, sf.Caption
          ORDER BY SUM(sdl.NetAmountVatExcluded) DESC
        `);
      
      const subFamilyTotalRevenue = subFamiliesResult.recordset.reduce((sum, sf) => sum + (sf.Revenue || 0), 0);
      
      family.subFamilies = subFamiliesResult.recordset.map(sf => ({
        id: sf.SubFamilyId,
        name: sf.SubFamilyName,
        revenue: sf.Revenue || 0,
        percentage: subFamilyTotalRevenue > 0 ? Math.round((sf.Revenue / subFamilyTotalRevenue) * 100) : 0
      }));
    }
    
    families.push(family);
  }
  
  // Calculer les statistiques de résumé
  const topFamily = families.length > 0 ? families[0].name : 'Aucune';
  const averageRevenue = families.length > 0 ? totalRevenue / families.length : 0;
  
  return {
    period: label,
    summary: {
      totalRevenue,
      totalFamilies: families.length,
      topPerformingFamily: topFamily,
      averageRevenuePerFamily: Math.round(averageRevenue * 100) / 100
    },
    families
  };
}

/**
 * Obtenir une comparaison de performance entre deux périodes
 */
export interface FamilyGrowthComparison {
  familyId: string;
  familyName: string;
  currentRevenue: number;
  previousRevenue: number;
  growth: number; // pourcentage
  growthLabel: 'Croissance' | 'Déclin' | 'Stable';
}

export async function getFamiliesGrowthComparison(
  currentPeriod: PredefinedPeriod,
  comparisonPeriod?: PredefinedPeriod
): Promise<{ 
  currentLabel: string; 
  previousLabel: string; 
  comparison: FamilyGrowthComparison[] 
}> {
  // Période actuelle
  const current = calculatePeriodDates(currentPeriod);
  
  // Période précédente (par défaut, même période l'année précédente)
  let previous;
  if (comparisonPeriod) {
    previous = calculatePeriodDates(comparisonPeriod);
  } else {
    // Calculer la même période l'année précédente
    const prevStartDate = new Date(current.startDate);
    const prevEndDate = new Date(current.endDate);
    prevStartDate.setFullYear(prevStartDate.getFullYear() - 1);
    prevEndDate.setFullYear(prevEndDate.getFullYear() - 1);
    
    previous = {
      startDate: prevStartDate.toISOString().split('T')[0],
      endDate: prevEndDate.toISOString().split('T')[0],
      label: `${current.label} (année précédente)`
    };
  }
  
  // Récupérer les performances pour les deux périodes
  const currentFamilies = await getTopProductFamilies(current.startDate, current.endDate, 15);
  const previousFamilies = await getTopProductFamilies(previous.startDate, previous.endDate, 15);
  
  // Comparer les performances
  const comparison: FamilyGrowthComparison[] = [];
  
  for (const currentFamily of currentFamilies) {
    const previousFamily = previousFamilies.find(pf => pf.id === currentFamily.id);
    const previousRevenue = previousFamily?.revenue || 0;
    
    let growth = 0;
    let growthLabel: 'Croissance' | 'Déclin' | 'Stable' = 'Stable';
    
    if (previousRevenue > 0) {
      growth = Math.round(((currentFamily.revenue - previousRevenue) / previousRevenue) * 100);
      if (growth > 5) growthLabel = 'Croissance';
      else if (growth < -5) growthLabel = 'Déclin';
    } else if (currentFamily.revenue > 0) {
      growth = 100; // Nouvelle famille
      growthLabel = 'Croissance';
    }
    
    comparison.push({
      familyId: currentFamily.id,
      familyName: currentFamily.name,
      currentRevenue: currentFamily.revenue,
      previousRevenue,
      growth,
      growthLabel
    });
  }
  
  // Trier par croissance décroissante
  comparison.sort((a, b) => b.growth - a.growth);
  
  return {
    currentLabel: current.label,
    previousLabel: previous.label,
    comparison
  };
}