export const config = {
  // Base de données EBP
  database: {
    server: process.env.EBP_SERVER || 'SRVDEV2025\\EBP',
    database: process.env.EBP_DATABASE || 'JBG METAFIX_0895452f-b7c1-4c00-a316-c6a6d0ea4bf4',
    user: process.env.EBP_USER || 'sa',
    password: process.env.EBP_PASSWORD || '@ebp78EBP',
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