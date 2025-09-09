// Charger les variables d'environnement en premier
import 'dotenv/config';

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { connectDatabase, closeDatabase } from './database.js';
import { config } from './config.js';
import { logger } from './logger.js';

// Import des nouveaux tools
import { getClientSales } from './tools/sales.js';
import { getEnhancedClientActivities, getColleagueActivitiesSummary } from './tools/activities.js';
import { getProductFamiliesPerformance, getFamiliesGrowthComparison } from './tools/families.js';
import { searchCompanies, listCompanies } from './tools/search.js';

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
        name: 'ebp_get_client_sales',
        description: 'Récupère le chiffre d\'affaires d\'un client avec analyse des familles de produits',
        inputSchema: {
          type: 'object',
          properties: {
            customerId: {
              type: 'string',
              description: 'ID du client EBP (ex: "CAEROSPATIALE")'
            },
            period: {
              type: 'string',
              enum: ['week', 'month', 'quarter', 'year', 'ytd', 'custom'],
              description: 'Période d\'analyse (défaut: year)',
              default: 'year'
            },
            startDate: {
              type: 'string',
              description: 'Date de début pour période custom (format YYYY-MM-DD)'
            },
            endDate: {
              type: 'string', 
              description: 'Date de fin pour période custom (format YYYY-MM-DD)'
            },
            includeProductFamilies: {
              type: 'boolean',
              description: 'Inclure l\'analyse des familles de produits (défaut: true)',
              default: true
            },
            includeMonthlyTrend: {
              type: 'boolean',
              description: 'Inclure l\'évolution mensuelle (défaut: false)',
              default: false
            }
          },
          required: ['customerId']
        }
      },
      {
        name: 'ebp_get_client_activities',
        description: 'Recherche enrichie des activités commerciales avec filtres multiples',
        inputSchema: {
          type: 'object',
          properties: {
            customerId: {
              type: 'string',
              description: 'ID du client EBP pour filtrer les activités'
            },
            colleagueId: {
              type: 'string',
              description: 'ID du commercial (MATHIAS, DEBORAH, JULIE, CONSTANCE)'
            },
            period: {
              type: 'string',
              enum: ['week', 'month', 'quarter', 'year', 'ytd', 'custom'],
              description: 'Période de recherche'
            },
            startDate: {
              type: 'string',
              description: 'Date de début pour période custom (format YYYY-MM-DD)'
            },
            endDate: {
              type: 'string',
              description: 'Date de fin pour période custom (format YYYY-MM-DD)'
            },
            activityType: {
              type: 'string',
              description: 'Type d\'activité à rechercher (ex: "Visite", "Prospection")'
            },
            limit: {
              type: 'number',
              description: 'Nombre max d\'activités (défaut: 20)',
              default: 20
            }
          }
        }
      },
      {
        name: 'ebp_get_product_families_performance',
        description: 'Analyse des performances des familles de produits avec détails clients et croissance',
        inputSchema: {
          type: 'object',
          properties: {
            period: {
              type: 'string',
              enum: ['week', 'month', 'quarter', 'year', 'ytd', 'custom'],
              description: 'Période d\'analyse (défaut: month)',
              default: 'month'
            },
            startDate: {
              type: 'string',
              description: 'Date de début pour période custom (format YYYY-MM-DD)'
            },
            endDate: {
              type: 'string',
              description: 'Date de fin pour période custom (format YYYY-MM-DD)'
            },
            customerId: {
              type: 'string',
              description: 'Analyser les familles pour un client spécifique'
            },
            familyId: {
              type: 'string',
              description: 'Focus sur une famille spécifique (ex: "MICA")'
            },
            includeSubFamilies: {
              type: 'boolean',
              description: 'Inclure le détail des sous-familles (défaut: true)',
              default: true
            },
            limit: {
              type: 'number',
              description: 'Nombre max de familles (défaut: 10)',
              default: 10
            }
          }
        }
      },
      {
        name: 'ebp_get_colleague_activities_summary',
        description: 'Résumé des activités par commercial avec statistiques',
        inputSchema: {
          type: 'object',
          properties: {
            period: {
              type: 'string',
              enum: ['week', 'month', 'quarter', 'year', 'ytd', 'custom'],
              description: 'Période d\'analyse (défaut: month)',
              default: 'month'
            },
            startDate: {
              type: 'string',
              description: 'Date de début pour période custom (format YYYY-MM-DD)'
            },
            endDate: {
              type: 'string',
              description: 'Date de fin pour période custom (format YYYY-MM-DD)'
            }
          }
        }
      },
      {
        name: 'ebp_get_families_growth_comparison',
        description: 'Compare la croissance des familles de produits entre deux périodes',
        inputSchema: {
          type: 'object',
          properties: {
            currentPeriod: {
              type: 'string',
              enum: ['week', 'month', 'quarter', 'year'],
              description: 'Période actuelle à analyser (défaut: quarter)',
              default: 'quarter'
            },
            comparisonPeriod: {
              type: 'string',
              enum: ['week', 'month', 'quarter', 'year'],
              description: 'Période de comparaison (défaut: même période année précédente)'
            }
          }
        }
      },
      {
        name: 'ebp_search_companies',
        description: 'Recherche d\'entreprises par nom (recherche floue tolérante aux fautes)',
        inputSchema: {
          type: 'object',
          properties: {
            searchTerm: {
              type: 'string',
              description: 'Terme de recherche (ex: "CHAUVIN", "ASB", "AEROSPATIALE")'
            },
            limit: {
              type: 'number',
              description: 'Nombre max de résultats (défaut: 20)',
              default: 20
            },
            exactMatch: {
              type: 'boolean',
              description: 'Recherche exacte uniquement (défaut: false)',
              default: false
            }
          },
          required: ['searchTerm']
        }
      },
      {
        name: 'ebp_list_companies',
        description: 'Liste des entreprises par ordre alphabétique avec filtres',
        inputSchema: {
          type: 'object',
          properties: {
            startsWith: {
              type: 'string',
              description: 'Commençant par (ex: "A", "CH")'
            },
            limit: {
              type: 'number',
              description: 'Nombre max de résultats (défaut: 50)',
              default: 50
            },
            activeOnly: {
              type: 'boolean',
              description: 'Seulement les clients actifs (défaut: false)',
              default: false
            }
          }
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
      case 'ebp_get_client_sales':
        const salesResult = await getClientSales({
          customerId: args.customerId as string,
          period: args.period as any,
          startDate: args.startDate as string,
          endDate: args.endDate as string,
          includeProductFamilies: args.includeProductFamilies !== false,
          includeMonthlyTrend: args.includeMonthlyTrend === true
        });
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(salesResult, null, 2)
            }
          ]
        };

      case 'ebp_get_client_activities':
        const activitiesResult = await getEnhancedClientActivities({
          customerId: args.customerId as string,
          colleagueId: args.colleagueId as string,
          period: args.period as any,
          startDate: args.startDate as string,
          endDate: args.endDate as string,
          activityType: args.activityType as string,
          limit: args.limit as number
        });
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(activitiesResult, null, 2)
            }
          ]
        };

      case 'ebp_get_product_families_performance':
        const familiesResult = await getProductFamiliesPerformance({
          period: args.period as any,
          startDate: args.startDate as string,
          endDate: args.endDate as string,
          customerId: args.customerId as string,
          familyId: args.familyId as string,
          includeSubFamilies: args.includeSubFamilies !== false,
          limit: args.limit as number
        });
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(familiesResult, null, 2)
            }
          ]
        };

      case 'ebp_get_colleague_activities_summary':
        const summaryResult = await getColleagueActivitiesSummary(
          args.period as any,
          args.startDate as string,
          args.endDate as string
        );
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(summaryResult, null, 2)
            }
          ]
        };

      case 'ebp_get_families_growth_comparison':
        const growthResult = await getFamiliesGrowthComparison(
          args.currentPeriod as any,
          args.comparisonPeriod as any
        );
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(growthResult, null, 2)
            }
          ]
        };

      case 'ebp_search_companies':
        const searchResult = await searchCompanies({
          searchTerm: args.searchTerm as string,
          limit: args.limit as number,
          exactMatch: args.exactMatch as boolean
        });
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(searchResult, null, 2)
            }
          ]
        };

      case 'ebp_list_companies':
        const listResult = await listCompanies({
          startsWith: args.startsWith as string,
          limit: args.limit as number,
          activeOnly: args.activeOnly as boolean
        });
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(listResult, null, 2)
            }
          ]
        };
      
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
  
  logger.info('Serveur MCP EBP démarré avec 7 tools');
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