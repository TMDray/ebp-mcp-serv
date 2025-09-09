#!/usr/bin/env node

/**
 * EBP MCP Server v2 - Point d'entrée
 * 
 * Serveur MCP minimal pour connexion EBP SQL Server
 * Architecture évolutive avec système de contexte auto-améliorant
 * 
 * Usage:
 *   node server.js                 # Mode production
 *   DEBUG=true node server.js      # Mode debug
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import sql from 'mssql';
import { z } from 'zod';

// Configuration base de données
const dbConfig = {
  server: process.env.EBP_SERVER || 'SRVDEV2025\\EBP',
  database: process.env.EBP_DATABASE || 'JBG METAFIX_0895452f-b7c1-4c00-a316-c6a6d0ea4bf4',
  user: process.env.EBP_USER || 'sa',
  password: process.env.EBP_PASSWORD || 'CHANGEZ_MOI',
  options: {
    encrypt: false, // Pour SQL Server local
    trustServerCertificate: true,
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// Pool de connexions global
let pool = null;

/**
 * Obtenir une connexion à la DB avec retry automatique
 */
async function getConnection(retries = 3) {
  if (pool?.connected) return pool;
  
  for (let i = 0; i < retries; i++) {
    try {
      pool = new sql.ConnectionPool(dbConfig);
      await pool.connect();
      logDebug('✅ Connexion SQL Server établie');
      return pool;
    } catch (error) {
      logDebug(`❌ Tentative connexion ${i + 1}/${retries} échouée:`, error.message);
      if (i === retries - 1) throw error;
      await sleep(1000 * (i + 1)); // Backoff progressif
    }
  }
}

/**
 * Gestion d'erreurs standardisée
 */
function handleError(error, context = '') {
  logDebug(`Erreur ${context}:`, error);
  
  if (error instanceof sql.ConnectionError) {
    throw new McpError(
      ErrorCode.InternalError,
      `Connexion base de données impossible. Vérifiez que SQL Server est accessible.`
    );
  }
  
  if (error instanceof sql.RequestError) {
    throw new McpError(
      ErrorCode.InvalidRequest,
      `Erreur lors de la requête SQL. Vérifiez les paramètres.`
    );
  }
  
  // Erreur générique (ne pas exposer les détails)
  throw new McpError(
    ErrorCode.InternalError,
    `Une erreur technique est survenue. Contactez le support.`
  );
}

/**
 * Logging conditionnel
 */
function logDebug(...args) {
  if (process.env.DEBUG === 'true') {
    console.error('[EBP-MCP DEBUG]', new Date().toISOString(), ...args);
  }
}

/**
 * Utilitaire sleep
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Conversion RTF simple (version MVP)
 */
class RTFConverter {
  static toText(rtf) {
    if (!rtf || !rtf.startsWith('{\\rtf')) {
      return rtf; // Déjà en texte
    }
    
    return rtf
      .replace(/\\par\\s*/g, '\\n')           // Retours ligne
      .replace(/\\\\'([0-9a-f]{2})/gi, (m, hex) => 
        String.fromCharCode(parseInt(hex, 16))) // Caractères spéciaux
      .replace(/\\\\[a-z]+\\d*\\s*/g, '')      // Commandes RTF
      .replace(/[{}]/g, '')                   // Accolades
      .trim();
  }
  
  static toRTF(text) {
    const header = '{\\\\rtf1\\\\ansi\\\\deff0{\\\\fonttbl{\\\\f0 Arial;}}\\\\f0\\\\fs20 ';
    const escaped = text.replace(/\\n/g, '\\\\par ');
    return header + escaped + '}';
  }
}

/**
 * Mapping commerciaux Copilot → EBP
 */
const COPILOT_TO_EBP = {
  'constance.subtil@jbg-metafix.com': 'CONSTANCE',
  'deborah.maclet@jbg-metafix.com': 'DEBORAH', 
  'julie.pinel@jbg-metafix.com': 'JULIE',
  'mathias.dray@jbg-metafix.com': 'MATHIAS'
};

// Création du serveur MCP
const server = new Server(
  {
    name: 'ebp-sql-mcp',
    version: '2.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool 1: Test de connexion
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'ebp_test_connection',
        description: 'Test la connexion à la base de données EBP',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'ebp_get_client_activities',
        description: 'Récupère les dernières activités d\\'un client',
        inputSchema: {
          type: 'object',
          properties: {
            clientName: {
              type: 'string',
              description: 'Nom du client (recherche approximative supportée)'
            },
            limit: {
              type: 'number',
              description: 'Nombre maximum d\\'activités à récupérer (défaut: 10, max: 50)',
              default: 10
            }
          },
          required: ['clientName'],
        },
      }
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    switch (name) {
      case 'ebp_test_connection':
        return await handleTestConnection();
        
      case 'ebp_get_client_activities':
        return await handleGetClientActivities(args);
        
      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Tool inconnu: ${name}`
        );
    }
  } catch (error) {
    handleError(error, `tool ${name}`);
  }
});

/**
 * Handler: Test de connexion
 */
async function handleTestConnection() {
  try {
    const pool = await getConnection();
    
    // Test simple
    const result = await pool.request().query('SELECT @@VERSION as version, DB_NAME() as database');
    const info = result.recordset[0];
    
    logDebug('✅ Test connexion réussi:', info);
    
    return {
      content: [
        {
          type: 'text',
          text: `✅ Connexion EBP réussie !
          
**Base de données:** ${info.database}
**Version SQL Server:** ${info.version.split('\\n')[0]}
**Statut:** Opérationnel

Le serveur MCP peut accéder à la base EBP.`
        }
      ]
    };
    
  } catch (error) {
    logDebug('❌ Test connexion échoué:', error);
    throw new McpError(
      ErrorCode.InternalError,
      `Impossible de se connecter à EBP: ${error.message}`
    );
  }
}

/**
 * Handler: Récupération activités client
 */
async function handleGetClientActivities(args) {
  // Validation des paramètres
  const schema = z.object({
    clientName: z.string().min(1).max(60),
    limit: z.number().min(1).max(50).default(10)
  });
  
  const { clientName, limit } = schema.parse(args);
  
  try {
    const pool = await getConnection();
    
    // Recherche du client (approximative)
    const clientResult = await pool.request()
      .input('search', sql.NVarChar, `%${clientName}%`)
      .query(`
        SELECT TOP 5 Id, Name
        FROM Customer 
        WHERE Name LIKE @search
        ORDER BY 
          CASE 
            WHEN Name LIKE '${clientName}%' THEN 1
            WHEN Name LIKE '%${clientName}%' THEN 2
            ELSE 3
          END,
          Name
      `);
    
    const clients = clientResult.recordset;
    
    if (clients.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Aucun client trouvé pour "${clientName}".
            
Vérifiez l'orthographe ou essayez avec un nom partiel.`
          }
        ]
      };
    }
    
    // Si plusieurs clients, prendre le premier (meilleur match)
    const client = clients[0];
    let response = '';
    
    if (clients.length > 1) {
      response += `⚠️ Plusieurs clients trouvés, utilisation de "${client.Name}"\\n\\n`;
    }
    
    // Récupération des activités
    const activitiesResult = await pool.request()
      .input('clientId', sql.NVarChar, client.Id)
      .input('limit', sql.Int, limit)
      .query(`
        SELECT TOP (@limit)
          Id,
          Caption,
          Notes,
          StartDateTime,
          xx_Type_d_activite as ActivityType,
          ColleagueId
        FROM Activity 
        WHERE CustomerId = @clientId
        ORDER BY StartDateTime DESC
      `);
    
    const activities = activitiesResult.recordset;
    
    if (activities.length === 0) {
      response += `📋 **Client:** ${client.Name}\\n\\n❌ Aucune activité trouvée pour ce client.`;
    } else {
      response += `📋 **Client:** ${client.Name}\\n`;
      response += `📊 **${activities.length} dernière(s) activité(s):**\\n\\n`;
      
      activities.forEach((activity, index) => {
        const date = new Date(activity.StartDateTime).toLocaleDateString('fr-FR');
        const notes = RTFConverter.toText(activity.Notes || '').substring(0, 150);
        const commercial = activity.ColleagueId || 'Non attribué';
        
        response += `**${index + 1}. ${activity.Caption}**\\n`;
        response += `📅 ${date} | 👤 ${commercial} | 🏷️ ${activity.ActivityType || 'N/A'}\\n`;
        if (notes) {
          response += `📝 ${notes}${notes.length >= 150 ? '...' : ''}\\n`;
        }
        response += '\\n';
      });
    }
    
    return {
      content: [
        {
          type: 'text',
          text: response
        }
      ]
    };
    
  } catch (error) {
    logDebug('❌ Erreur récupération activités:', error);
    handleError(error, 'récupération activités');
  }
}

// Démarrage du serveur
async function main() {
  logDebug('🚀 Démarrage EBP MCP Server v2...');
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  logDebug('✅ EBP MCP Server démarré et connecté');
}

// Gestion propre de l'arrêt
process.on('SIGINT', async () => {
  logDebug('🛑 Arrêt du serveur...');
  if (pool) {
    await pool.close();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logDebug('🛑 Arrêt du serveur...');
  if (pool) {
    await pool.close();
  }
  process.exit(0);
});

// Point d'entrée
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });
}

export { server };