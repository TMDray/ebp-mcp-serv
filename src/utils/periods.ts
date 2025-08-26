// Utilitaires pour la gestion des périodes
export type PredefinedPeriod = 'week' | 'month' | 'quarter' | 'year' | 'ytd' | 'custom';

export interface PeriodDates {
  startDate: string;
  endDate: string;
  label: string;
}

export function calculatePeriodDates(period: PredefinedPeriod, customStart?: string, customEnd?: string): PeriodDates {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  switch (period) {
    case 'week':
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);
      return {
        startDate: weekStart.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0],
        label: '7 derniers jours'
      };
      
    case 'month':
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);
      return {
        startDate: monthStart.toISOString().split('T')[0],
        endDate: monthEnd.toISOString().split('T')[0],
        label: `${monthStart.toLocaleString('fr-FR', { month: 'long' })} ${year}`
      };
      
    case 'quarter':
      const quarter = Math.floor(month / 3);
      const quarterStart = new Date(year, quarter * 3, 1);
      const quarterEnd = new Date(year, quarter * 3 + 3, 0);
      return {
        startDate: quarterStart.toISOString().split('T')[0],
        endDate: quarterEnd.toISOString().split('T')[0],
        label: `Q${quarter + 1} ${year}`
      };
      
    case 'year':
      return {
        startDate: `${year}-01-01`,
        endDate: `${year}-12-31`,
        label: `Année ${year}`
      };
      
    case 'ytd':
      return {
        startDate: `${year}-01-01`,
        endDate: now.toISOString().split('T')[0],
        label: `Depuis le 1er janvier ${year}`
      };
      
    case 'custom':
      if (!customStart || !customEnd) {
        throw new Error('Les dates startDate et endDate sont requises pour la période "custom"');
      }
      return {
        startDate: customStart,
        endDate: customEnd,
        label: `Du ${new Date(customStart).toLocaleDateString('fr-FR')} au ${new Date(customEnd).toLocaleDateString('fr-FR')}`
      };
      
    default:
      throw new Error(`Période inconnue: ${period}`);
  }
}