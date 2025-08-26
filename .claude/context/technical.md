# Contexte Technique - EBP MCP v2

## Architecture Technique Actuelle

### Stack Choisi
```yaml
Runtime: Node.js 18+ (LTS)
Language: TypeScript 5.x
Framework MCP: @modelcontextprotocol/sdk
Database Client: mssql (TediousJS)
Build: tsc (TypeScript Compiler)
Module System: ESM (ECMAScript Modules)
```

### Décisions Architecturales

#### ADR-001: TypeScript avec ESM
**Date:** 05/02/2025  
**Décision:** Utiliser TypeScript avec modules ESM natifs  
**Raison:** Alignement avec standards modernes, meilleur support MCP SDK  
**Impact:** Configuration plus simple, imports directs  

#### ADR-002: Pas de Framework Web
**Date:** 05/02/2025  
**Décision:** MCP pur sans Express/Fastify  
**Raison:** MCP gère le transport, pas besoin de serveur HTTP  
**Impact:** Moins de dépendances, plus simple  

#### ADR-003: mssql sur tedious
**Date:** 05/02/2025  
**Décision:** Bibliothèque mssql (wrapper tedious)  
**Raison:** API moderne, promises natives, pooling intégré  
**Impact:** Code async/await propre  

### Structure Cible
```
ebp-mcp-v2/
├── src/
│   ├── index.ts          # Point d'entrée MCP
│   ├── server.ts         # Définition serveur et tools
│   ├── database/
│   │   ├── connection.ts # Pool de connexions
│   │   ├── queries.ts    # Requêtes SQL
│   │   └── validation.ts # Validation données
│   ├── tools/
│   │   ├── getActivities.ts
│   │   └── createActivity.ts
│   ├── utils/
│   │   ├── rtf.ts        # Conversion RTF ↔ Texte
│   │   └── auth.ts       # Mapping commerciaux
│   └── types/
│       └── ebp.ts        # Types TypeScript pour EBP
├── build/                # Sortie compilation
├── tests/
│   └── connection.test.ts
├── package.json
├── tsconfig.json
└── .env.example
```

### Configuration TypeScript
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "lib": ["ES2022"],
    "outDir": "./build",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "build", "tests"]
}
```

### Configuration Package.json
```json
{
  "name": "@jbg/ebp-mcp-server",
  "version": "2.0.0",
  "type": "module",
  "engines": {
    "node": ">=18.0.0"
  },
  "bin": {
    "ebp-mcp-server": "./build/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "start": "node build/index.js",
    "test": "node --test tests/",
    "clean": "rm -rf build"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.6.0",
    "mssql": "^11.0.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0"
  }
}
```

## Patterns Techniques Validés

### Pattern: Configuration Sécurisée
```typescript
// config/database.ts
export const dbConfig = {
  server: process.env.EBP_SERVER || 'SRVDEV2025\\EBP',
  database: process.env.EBP_DATABASE || 'JBG METAFIX_...',
  user: process.env.EBP_USER!,
  password: process.env.EBP_PASSWORD!,
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
```

### Pattern: Gestion Erreurs MCP
```typescript
// utils/errors.ts
export class MCPError extends Error {
  constructor(
    public code: 'CLIENT_NOT_FOUND' | 'UNAUTHORIZED' | 'DB_ERROR',
    message: string,
    public suggestions?: string[]
  ) {
    super(message);
  }
}

export function handleError(error: unknown): MCPErrorResponse {
  if (error instanceof MCPError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        suggestions: error.suggestions
      }
    };
  }
  
  // Jamais exposer les détails techniques
  return {
    success: false,
    error: {
      code: 'TECHNICAL_ERROR',
      message: 'Une erreur est survenue',
      suggestions: ['Réessayer', 'Contacter support']
    }
  };
}
```

### Pattern: Tool MCP Minimal
```typescript
// tools/base.ts
export function createTool<TInput, TOutput>(
  name: string,
  schema: ZodSchema<TInput>,
  handler: (input: TInput) => Promise<TOutput>
) {
  return server.tool(
    name,
    schema,
    async (input) => {
      try {
        const result = await handler(input);
        return { success: true, data: result };
      } catch (error) {
        return handleError(error);
      }
    }
  );
}
```

## Considérations Performance

### Pooling Connexions
- Pool size: 10 connexions max
- Idle timeout: 30 secondes
- Connection retry: 3 tentatives

### Limites Requêtes
- Max 50 activités par requête
- Timeout requête: 30 secondes
- Pagination pour gros résultats

### Optimisations SQL
- Index sur `CustomerId`, `ColleagueId`
- Requêtes avec `TOP` pour limiter
- Éviter `SELECT *` inutiles

## Sécurité

### Validation Entrées
- Zod schemas stricts
- Longueurs max définies
- Caractères spéciaux échappés

### SQL Injection
- Prepared statements uniquement
- Jamais de concaténation strings
- Validation IDs avant requête

### Secrets
- Variables environnement uniquement
- Jamais dans le code ou logs
- .env.example sans valeurs réelles

## Compatibilité

### Claude Desktop
- MCP SDK 0.6.0+
- Transport stdio
- JSON-RPC 2.0

### SQL Server
- Version 2019+ (testé)
- TCP/IP activé
- Port 1433
- Mixed mode auth

### Node.js
- Version 18+ (LTS)
- ESM natif
- Async/await

---

*Document auto-enrichi par apprentissages techniques*