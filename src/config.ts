export const config = {
  // Base de données EBP - Configuration via .env OBLIGATOIRE
  database: {
    server: process.env.EBP_SERVER || (() => { throw new Error('EBP_SERVER manquant dans .env'); })(),
    database: process.env.EBP_DATABASE || (() => { throw new Error('EBP_DATABASE manquant dans .env'); })(),
    user: process.env.EBP_USER || (() => { throw new Error('EBP_USER manquant dans .env'); })(),
    password: process.env.EBP_PASSWORD || (() => { throw new Error('EBP_PASSWORD manquant dans .env'); })(),
    port: parseInt(process.env.EBP_PORT || '1433'),
    options: {
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true
    }
  },
  
  // Configuration MCP
  mcp: {
    name: 'ebp-mcp-server',
    version: '0.1.0'
  }
};