import { ConnectionPool, config as SqlConfig } from 'mssql';
import { config } from './config.js';
import { logger } from './logger.js';

let pool: ConnectionPool | null = null;

export async function connectDatabase(): Promise<ConnectionPool> {
  if (pool) {
    return pool;
  }

  try {
    const sqlConfig: SqlConfig = {
      server: config.database.server,
      database: config.database.database,
      user: config.database.user,
      password: config.database.password,
      port: config.database.port,
      options: config.database.options
    };

    pool = new ConnectionPool(sqlConfig);
    await pool.connect();
    
    logger.info('Connexion EBP SQL Server établie');
    return pool;
  } catch (error) {
    logger.error('Erreur connexion EBP', error);
    throw error;
  }
}

export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.close();
    pool = null;
    logger.info('Connexion EBP fermée');
  }
}

export function getPool(): ConnectionPool {
  if (!pool) {
    throw new Error('Database not connected. Call connectDatabase() first.');
  }
  return pool;
}