// Tools pour les activités commerciales
import { getPool } from '../database.js';
import { PredefinedPeriod, calculatePeriodDates } from '../utils/periods.js';

export interface EnhancedClientActivitiesParams {
  customerId?: string;
  colleagueId?: string;
  period?: PredefinedPeriod;
  startDate?: string;
  endDate?: string;
  activityType?: string;
  limit?: number;
}

export interface ClientActivity {
  id: string;
  caption: string;
  type: string;
  startDate: Date;
  endDate: Date;
  colleague: string;
  colleagueId: string;
  customer: string;
  customerId: string;
  notes: string;
  duration?: number; // en minutes
}

export interface ClientActivitiesResult {
  filters: {
    period?: string;
    customerId?: string;
    colleagueId?: string;
    activityType?: string;
  };
  summary: {
    totalActivities: number;
    uniqueCustomers: number;
    uniqueColleagues: number;
    averageDuration: number;
    periodLabel?: string;
  };
  activities: ClientActivity[];
}

export async function getEnhancedClientActivities(params: EnhancedClientActivitiesParams): Promise<ClientActivitiesResult> {
  const pool = getPool();
  const limit = params.limit || 20;
  
  // Calculer les dates si période spécifiée
  let startDate = params.startDate;
  let endDate = params.endDate;
  let periodLabel: string | undefined;
  
  if (params.period) {
    const periodData = calculatePeriodDates(params.period, params.startDate, params.endDate);
    startDate = periodData.startDate;
    endDate = periodData.endDate;
    periodLabel = periodData.label;
  }
  
  // Construction de la requête dynamique
  let whereConditions: string[] = [];
  const request = pool.request().input('limit', limit);
  
  if (params.customerId) {
    whereConditions.push('a.CustomerId = @customerId');
    request.input('customerId', params.customerId);
  }
  
  if (params.colleagueId) {
    whereConditions.push('a.ColleagueId = @colleagueId');
    request.input('colleagueId', params.colleagueId);
  }
  
  if (startDate) {
    whereConditions.push('a.StartDateTime >= @startDate');
    request.input('startDate', startDate);
  }
  
  if (endDate) {
    whereConditions.push('a.StartDateTime <= @endDate');
    request.input('endDate', endDate);
  }
  
  if (params.activityType) {
    whereConditions.push('a.xx_Type_d_activite LIKE @activityType');
    request.input('activityType', `%${params.activityType}%`);
  }
  
  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
  
  // Requête principale
  const query = `
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
      c.Contact_Name + ' ' + ISNULL(c.Contact_FirstName, '') as ColleagueName,
      DATEDIFF(MINUTE, a.StartDateTime, a.EndDateTime) as DurationMinutes
    FROM Activity a
    LEFT JOIN Colleague c ON a.ColleagueId = c.Id
    ${whereClause}
    ORDER BY a.StartDateTime DESC
  `;
  
  const result = await request.query(query);
  
  // Mapper les résultats
  const activities: ClientActivity[] = result.recordset.map((row: any) => ({
    id: row.Id,
    caption: row.Caption,
    type: row.xx_Type_d_activite || 'Non spécifié',
    startDate: row.StartDateTime,
    endDate: row.EndDateTime,
    colleague: row.ColleagueName || 'Non assigné',
    colleagueId: row.ColleagueId || '',
    customer: row.CustomerName,
    customerId: row.CustomerId,
    notes: row.xx_Note_detaillee_Clear || row.Notes?.substring(0, 300) || '',
    duration: row.DurationMinutes
  }));
  
  // Calculer les statistiques de résumé
  const uniqueCustomers = new Set(activities.map(a => a.customerId).filter(Boolean)).size;
  const uniqueColleagues = new Set(activities.map(a => a.colleagueId).filter(Boolean)).size;
  const durations = activities.filter(a => a.duration && a.duration > 0).map(a => a.duration!);
  const averageDuration = durations.length > 0 ? 
    Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length) : 0;
  
  return {
    filters: {
      period: periodLabel,
      customerId: params.customerId,
      colleagueId: params.colleagueId,
      activityType: params.activityType
    },
    summary: {
      totalActivities: activities.length,
      uniqueCustomers,
      uniqueColleagues,
      averageDuration,
      periodLabel
    },
    activities
  };
}

/**
 * Obtenir un résumé des activités par commercial
 */
export async function getColleagueActivitiesSummary(period?: PredefinedPeriod, customStartDate?: string, customEndDate?: string) {
  const pool = getPool();
  
  // Calculer les dates
  let startDate = customStartDate;
  let endDate = customEndDate;
  let periodLabel = 'Toutes périodes';
  
  if (period) {
    const periodData = calculatePeriodDates(period, customStartDate, customEndDate);
    startDate = periodData.startDate;
    endDate = periodData.endDate;
    periodLabel = periodData.label;
  }
  
  const request = pool.request();
  let dateFilter = '';
  
  if (startDate && endDate) {
    dateFilter = 'AND a.StartDateTime >= @startDate AND a.StartDateTime <= @endDate';
    request.input('startDate', startDate).input('endDate', endDate);
  }
  
  const result = await request.query(`
    SELECT 
      a.ColleagueId,
      c.Contact_Name + ' ' + ISNULL(c.Contact_FirstName, '') as ColleagueName,
      COUNT(*) as TotalActivities,
      COUNT(DISTINCT a.CustomerId) as UniqueCustomers,
      AVG(DATEDIFF(MINUTE, a.StartDateTime, a.EndDateTime)) as AvgDurationMinutes,
      MIN(a.StartDateTime) as FirstActivity,
      MAX(a.StartDateTime) as LastActivity
    FROM Activity a
    LEFT JOIN Colleague c ON a.ColleagueId = c.Id
    WHERE a.ColleagueId IS NOT NULL
    ${dateFilter}
    GROUP BY a.ColleagueId, c.Contact_Name, c.Contact_FirstName
    ORDER BY COUNT(*) DESC
  `);
  
  return {
    period: periodLabel,
    colleagues: result.recordset.map((row: any) => ({
      colleagueId: row.ColleagueId,
      colleagueName: row.ColleagueName || row.ColleagueId,
      totalActivities: row.TotalActivities,
      uniqueCustomers: row.UniqueCustomers,
      averageDuration: Math.round(row.AvgDurationMinutes || 0),
      firstActivity: row.FirstActivity,
      lastActivity: row.LastActivity
    }))
  };
}