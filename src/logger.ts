import * as fs from 'fs';
import * as path from 'path';

// Logger silencieux pour MCP - écrit dans un fichier au lieu de stdout/stderr
export class MCPLogger {
  private logFile: string;
  private enabled: boolean;

  constructor() {
    this.enabled = process.env.EBP_MCP_DEBUG === 'true';
    this.logFile = path.join(process.cwd(), 'ebp-mcp.log');
  }

  private writeLog(level: string, message: string, data?: any) {
    if (!this.enabled) return;

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data: data || undefined
    };

    try {
      fs.appendFileSync(this.logFile, JSON.stringify(logEntry) + '\n');
    } catch (error) {
      // Silently fail - we can't log errors about logging
    }
  }

  info(message: string, data?: any) {
    this.writeLog('INFO', message, data);
  }

  error(message: string, error?: any) {
    this.writeLog('ERROR', message, {
      error: error?.message || error,
      stack: error?.stack
    });
  }

  debug(message: string, data?: any) {
    this.writeLog('DEBUG', message, data);
  }
}

export const logger = new MCPLogger();