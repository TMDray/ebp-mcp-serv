// Tools pour la recherche d'entreprises
import { getPool } from '../database.js';

export interface CompanySearchParams {
  searchTerm: string;
  limit?: number;
  exactMatch?: boolean;
}

export interface CompanySearchResult {
  searchTerm: string;
  totalFound: number;
  companies: Array<{
    id: string;
    name: string;
    hasRecentActivity?: boolean;
    lastOrderDate?: Date;
    totalRevenue?: number;
  }>;
  suggestions?: string[];
}

export async function searchCompanies(params: CompanySearchParams): Promise<CompanySearchResult> {
  const pool = getPool();
  const limit = params.limit || 20;
  
  let searchQuery: string;
  let searchValue: string;
  
  // Recherche simplifiée (exacte ou floue)
  if (params.exactMatch) {
    searchQuery = `
      SELECT TOP (@limit)
        c.Id,
        c.Name
      FROM Customer c
      WHERE UPPER(c.Name) = UPPER(@searchTerm)
      ORDER BY c.Name
    `;
    searchValue = params.searchTerm;
  } else {
    searchQuery = `
      SELECT TOP (@limit)
        c.Id,
        c.Name
      FROM Customer c
      WHERE c.Name LIKE @searchTerm
      ORDER BY LEN(c.Name), c.Name
    `;
    searchValue = `%${params.searchTerm}%`;
  }
  
  const searchResult = await pool.request()
    .input('limit', limit)
    .input('searchTerm', searchValue)
    .query(searchQuery);
    
  // Compter le nombre total de résultats (sans limite)
  const countQuery = params.exactMatch 
    ? `SELECT COUNT(*) as total FROM Customer WHERE UPPER(Name) = UPPER(@searchTerm)`
    : `SELECT COUNT(*) as total FROM Customer WHERE Name LIKE @searchTerm`;
    
  const countResult = await pool.request()
    .input('searchTerm', searchValue)
    .query(countQuery);
    
  const totalFound = countResult.recordset[0].total;
  
  // Formater les résultats (version simplifiée)
  const companies = searchResult.recordset.map(row => ({
    id: row.Id,
    name: row.Name,
    hasRecentActivity: false, // Sera ajouté plus tard si nécessaire
    lastOrderDate: undefined,
    totalRevenue: 0
  }));
  
  // Suggestions simplifiées (désactivées pour l'instant)
  let suggestions: string[] | undefined;
  
  return {
    searchTerm: params.searchTerm,
    totalFound,
    companies,
    suggestions: suggestions?.length ? suggestions : undefined
  };
}

export interface CompanyListParams {
  startsWith?: string;
  limit?: number;
  activeOnly?: boolean; // Seulement les clients avec activité récente
}

export interface CompanyListResult {
  totalCompanies: number;
  companies: Array<{
    id: string;
    name: string;
    hasRecentActivity: boolean;
  }>;
}

export async function listCompanies(params: CompanyListParams = {}): Promise<CompanyListResult> {
  const pool = getPool();
  const limit = params.limit || 50;
  
  let whereClause = 'WHERE c.Name IS NOT NULL';
  const request = pool.request().input('limit', limit);
  
  if (params.startsWith) {
    whereClause += ' AND c.Name LIKE @startsWith';
    request.input('startsWith', `${params.startsWith.toUpperCase()}%`);
  }
  
  const query = `
    SELECT TOP (@limit)
      c.Id,
      c.Name
    FROM Customer c
    ${whereClause}
    ORDER BY c.Name
  `;
  
  const result = await request.query(query);
    
  // Compter le total (simplifié)
  const countQuery = `SELECT COUNT(*) as total FROM Customer c ${whereClause}`;
  const countResult = await pool.request()
    .input('startsWith', params.startsWith ? `${params.startsWith.toUpperCase()}%` : undefined)
    .query(countQuery);
  
  return {
    totalCompanies: countResult.recordset[0].total,
    companies: result.recordset.map(row => ({
      id: row.Id,
      name: row.Name,
      hasRecentActivity: false // Simplifié pour l'instant
    }))
  };
}