# Workflow: Setup Initial

## Objectif
Initialiser un environnement MCP fonctionnel de manière itérative et testable.

## Étapes

### 1. Test Connexion Base de Données (PRIORITÉ)
```bash
# Créer test-connection.js simple
node test-connection.js
# Si succès → logs/learnings.md
# Si échec → logs/failures.md + debug
```

### 2. Structure Projet MCP Minimale
```
ebp-mcp-v2/
├── src/
│   ├── index.ts      # Point d'entrée
│   ├── server.ts     # Serveur MCP
│   └── db.ts         # Connexion SQL
├── package.json      # Dépendances minimales
├── tsconfig.json     # Config TypeScript simple
└── .env.example      # Variables d'environnement
```

### 3. Premier Tool MCP
- Commencer par `ebp_test_connection`
- Puis `ebp_get_activities` (lecture seule)
- Documenter chaque succès/échec

### 4. Test avec Claude Desktop
```bash
# Build
npm run build

# Test local
node build/index.js

# Si OK, configurer dans Claude Desktop
```

## Checklist Pré-Setup
- [ ] Node.js 18+ installé
- [ ] SQL Server accessible
- [ ] Credentials EBP valides
- [ ] Claude Desktop installé

## Principes
1. **Un composant à la fois** - Ne pas tout faire d'un coup
2. **Tester immédiatement** - Chaque ajout doit être testé
3. **Documenter toujours** - Succès ET échecs dans logs/
4. **Itérer rapidement** - Petits pas fréquents

## Anti-patterns à éviter
- ❌ Créer toute la structure avant de tester
- ❌ Implémenter plusieurs tools sans tester le premier
- ❌ Complexifier la configuration initiale
- ❌ Ignorer les erreurs de connexion

## Métriques de Succès
- ✅ Connexion SQL réussie en < 5 min
- ✅ Premier tool fonctionnel en < 30 min
- ✅ Intégration Claude Desktop en < 1h
- ✅ Zéro dépendance inutile