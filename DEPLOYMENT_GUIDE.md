# 🚀 Guide de Déploiement - EBP MCP Server

## ✅ **Étape 1: Préparer le Serveur**

```bash
# Dans le dossier du projet
npm run build
```
> ✅ **Vérifier**: Pas d'erreurs de compilation TypeScript

---

## ✅ **Étape 2: Configurer Claude Desktop**

### **Localiser votre fichier de config Claude Desktop:**
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`

### **Ajouter cette configuration:**
```json
{
  "mcpServers": {
    "ebp-mcp": {
      "command": "node",
      "args": ["C:\\Users\\Tanguy\\Documents\\Projets\\ebp-mcp-serv\\dist\\index.js"],
      "env": {
        "EBP_SERVER": "SRVDEV2025\\EBP",
        "EBP_DATABASE": "JBG METAFIX_0895452f-b7c1-4c00-a316-c6a6d0ea4bf4",
        "EBP_USER": "sa",
        "EBP_PASSWORD": "VOTRE_MOT_DE_PASSE"
      }
    }
  }
}
```

> ⚠️ **Important**: Adapter le chemin Windows à votre installation

---

## ✅ **Étape 3: Redémarrer Claude Desktop**

1. **Fermer complètement Claude Desktop**
2. **Relancer Claude Desktop**
3. **Vérifier dans une conversation**: Les 5 tools EBP doivent apparaître

---

## 🎯 **Étape 4: Test de Validation**

### **Prompt de test rapide:**
```
Utilise les tools EBP pour me montrer le CA d'AEROSPATIALE en 2025.
```

### **Réponse attendue:**
- Tool `ebp_get_client_sales` se lance automatiquement
- Données CA AEROSPATIALE ~217K€ 
- Familles de produits avec "Mica et Dérivés" en tête

---

## 🛠️ **Diagnostics en cas de Problème**

### **Problème: "Aucun tool EBP visible"**
```bash
# Vérifier la compilation
npm run build

# Tester le serveur directement
npm start
# → Doit afficher "Serveur MCP EBP démarré avec 5 tools"
```

### **Problème: "Erreur de connexion EBP"**
- Vérifier la connectivité réseau vers `SRVDEV2025\EBP`
- Valider les identifiants de base de données
- Tester avec: `npx tsx src/test-enhanced-sales.ts`

### **Problème: "Tool se lance mais erreur"**
```bash
# Tester les tools individuellement
npx tsx src/test-enhanced-sales.ts
npx tsx src/test-enhanced-activities.ts  
npx tsx src/test-families-performance.ts
```

---

## 📊 **5 Tools Déployés**

| Tool | Description | Usage Principal |
|------|-------------|-----------------|
| `ebp_get_client_sales` | CA client + familles produits | *"CA AEROSPATIALE 2025"* |
| `ebp_get_client_activities` | Activités commerciales enrichies | *"Activités MATHIAS ce mois"* |
| `ebp_get_product_families_performance` | Performance familles | *"Top familles ce trimestre"* |
| `ebp_get_colleague_activities_summary` | Résumé équipe commerciale | *"Activité équipe"* |
| `ebp_get_families_growth_comparison` | Comparaison croissance | *"Croissance vs année précédente"* |

---

## 🎭 **Utilisation en Mode Démo**

### **Ouvrir une nouvelle conversation Claude Desktop et tester:**

```
Analyse complète d'AEROSPATIALE : CA 2025, familles de produits principales, et activités récentes avec l'équipe commerciale.
```

**Claude utilisera automatiquement les 3 tools principaux pour construire une réponse complète !**

---

## 🚨 **Points d'Attention**

- ✅ **Serveur local**: Fonctionne seulement sur votre machine
- ✅ **Connexion VPN**: Nécessaire si EBP n'est pas en local
- ✅ **Performance**: ~2-3 secondes par requête (normal)
- ✅ **Données temps réel**: Directement depuis la base EBP

---

## 🎉 **Serveur Prêt pour Démo POC !**

**5 tools EBP intégrés • Période flexible • Familles de produits • Activités commerciales • Comparaisons temporelles**

Le serveur MCP transforme votre base EBP en assistant IA conversationnel complet ! 🚀