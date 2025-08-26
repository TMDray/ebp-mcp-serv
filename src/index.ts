import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { connectDatabase, closeDatabase, getPool } from './database.js';
import { config } from './config.js';
import { logger } from './logger.js';

// Types pour EBP
interface ClientActivity {
  Id: number;
  Title: string;
  Date: string;
  ColleagueId: number;
  CustomerId: number;
  Note: string;
}

const server = new Server(
  {
    name: config.mcp.name,
    version: config.mcp.version,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Liste des outils disponibles
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'ebp_get_client_activities',
        description: 'Récupère l\'historique des activités commerciales pour un client',
        inputSchema: {
          type: 'object',
          properties: {
            customerId: {
              type: 'string',
              description: 'ID du client EBP (ex: "2SP ELECTRONIC")'
            },
            limit: {
              type: 'number',
              description: 'Nombre max d\'activités (défaut: 10)',
              default: 10
            }
          },
          required: ['customerId']
        }
      }
    ]
  };
});

// Exécution des outils
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (!args) {
      throw new Error('Arguments manquants');
    }

    switch (name) {
      case 'ebp_get_client_activities':
        const customerId = args.customerId as string;
        const limit = (args.limit as number) || 10;
        return await getClientActivities(customerId, limit);
      
      default:
        throw new Error(`Outil inconnu: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
        }
      ]
    };
  }
});

async function getClientActivities(customerId: string, limit: number) {
  const pool = getPool();
  
  const result = await pool.request()
    .input('customerId', customerId)
    .input('limit', limit)
    .query(`
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
        c.Contact_Name + ' ' + ISNULL(c.Contact_FirstName, '') as ColleagueName
      FROM Activity a
      LEFT JOIN Colleague c ON a.ColleagueId = c.Id
      WHERE a.CustomerId = @customerId
      ORDER BY a.StartDateTime DESC
    `);

  const activities = result.recordset.map((row: any) => ({
    id: row.Id,
    caption: row.Caption,
    type: row.xx_Type_d_activite,
    startDate: row.StartDateTime,
    endDate: row.EndDateTime,
    colleague: row.ColleagueName || 'Non assigné',
    customer: row.CustomerName,
    notes: row.xx_Note_detaillee_Clear || row.Notes?.substring(0, 300) || '',
    colleagueId: row.ColleagueId
  }));

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          customerId,
          customerName: activities[0]?.customer || 'Client introuvable',
          totalActivities: activities.length,
          activities
        }, null, 2)
      }
    ]
  };
}

async function main() {
  // Connexion à la base EBP
  try {
    await connectDatabase();
  } catch (error) {
    logger.error('Impossible de se connecter à EBP. Vérifiez la configuration.');
    process.exit(1);
  }

  // Démarrage du serveur MCP
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  logger.info('Serveur MCP EBP démarré');
}

// Nettoyage à la fermeture
process.on('SIGINT', async () => {
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDatabase();
  process.exit(0);
});

main().catch((error) => {
  logger.error('Erreur critique', error);
  process.exit(1);
});