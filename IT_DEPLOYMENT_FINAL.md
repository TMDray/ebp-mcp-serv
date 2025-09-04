# Installation Serveur MCP EBP - Guide IT

## Objectif
Installer un serveur Model Context Protocol (MCP) pour accès sécurisé aux données EBP via Claude Desktop.

## Architecture
```
Claude Desktop (local) → Serveur MCP (Node.js) → SQL Server EBP
```

## Paramètres à Adapter
- **Serveur SQL** : Remplacer par votre instance EBP
- **Base de données** : Remplacer `NOMDB` par votre base EBP
- **Compte service** : Créer selon vos standards

---

## 1. Installations Requises

### Node.js LTS v18+
```
https://nodejs.org/fr/download/
# Vérification : node --version && npm --version
```

### Git for Windows
```
https://git-scm.com/download/win
# Vérification : git --version
```

### Claude Desktop v0.7.0+
```
https://claude.ai/desktop
```

### MCP Sequential Thinking (optionnel)
```
npm install -g @anthropic/mcp-sequential-thinking
```

---

## 2. Installation Serveur MCP

### Code Source
```powershell
mkdir C:\Services\EBP-MCP-Server
cd C:\Services\EBP-MCP-Server
git clone [URL_REPOSITORY] .
npm install --production
npm run build
```

### Configuration Base
Créer `.env` :
```
DB_SERVER=VOTRE_SERVEUR\INSTANCE
DB_DATABASE=NOMDB
DB_TRUSTED_CONNECTION=true
DB_TRUST_SERVER_CERTIFICATE=true
```

### Test
```powershell
node dist/index.js
# Attendu: "MCP Server started"
# Ctrl+C pour arrêter
```

---

## 3. Configuration Claude Desktop

Fichier : `%APPDATA%\Claude\claude_desktop_config.json`
```json
{
  "mcpServers": {
    "ebp-server": {
      "command": "node",
      "args": ["C:\\Services\\EBP-MCP-Server\\dist\\index.js"],
      "env": {
        "NODE_ENV": "production"
      }
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-sequential-thinking"]
    }
  }
}
```

---

## 4. Service Windows (optionnel)

### NSSM
```
http://nssm.cc/download
# Extraire nssm.exe dans C:\Services\EBP-MCP-Server\
```

### Installation Service
```powershell
cd C:\Services\EBP-MCP-Server
.\nssm.exe install "EBP-MCP-Server" "C:\Program Files\nodejs\node.exe"
.\nssm.exe set "EBP-MCP-Server" AppDirectory "C:\Services\EBP-MCP-Server"
.\nssm.exe set "EBP-MCP-Server" AppParameters "dist\index.js"
.\nssm.exe set "EBP-MCP-Server" Start SERVICE_AUTO_START
.\nssm.exe start "EBP-MCP-Server"
```

---

## 5. Base de Données

### Compte SQL (lecture seule)
```sql
USE [NOMDB];
CREATE LOGIN [DOMAIN\svc_mcp_ebp] FROM WINDOWS;
CREATE USER [DOMAIN\svc_mcp_ebp] FOR LOGIN [DOMAIN\svc_mcp_ebp];

GRANT SELECT ON SaleDocument TO [DOMAIN\svc_mcp_ebp];
GRANT SELECT ON SaleDocumentLine TO [DOMAIN\svc_mcp_ebp];
GRANT SELECT ON Customer TO [DOMAIN\svc_mcp_ebp];
GRANT SELECT ON Item TO [DOMAIN\svc_mcp_ebp];
GRANT SELECT ON ItemFamily TO [DOMAIN\svc_mcp_ebp];
GRANT SELECT ON ItemSubFamily TO [DOMAIN\svc_mcp_ebp];
GRANT SELECT ON Activity TO [DOMAIN\svc_mcp_ebp];
GRANT SELECT ON Colleague TO [DOMAIN\svc_mcp_ebp];
```

### Réseau
- Port 1433 ouvert
- Test : `telnet VOTRE_SERVEUR 1433`

---

## 6. Validation

### Test Serveur
```powershell
Get-Service "EBP-MCP-Server"  # Si service installé
# OU
node C:\Services\EBP-MCP-Server\dist\index.js  # Test console
```

### Test Claude Desktop
1. Ouvrir Claude Desktop
2. Question test : `"Quel est le CA de janvier 2025 ?"`
3. Vérifier réponse avec montant

---

## Checklist Installation

- [ ] Node.js v18+ installé
- [ ] Code source déployé et compilé
- [ ] Fichier .env configuré (adapté à votre environnement)
- [ ] Configuration Claude Desktop créée
- [ ] Compte SQL créé avec droits minimaux
- [ ] Connectivité réseau validée
- [ ] Test fonctionnel réussi
- [ ] Service Windows installé (si souhaité)

---

## Support Technique
**Contact** : [Votre nom/équipe]  
**Documentation** : Repository Git du projet

---

*Version 1.1 - 09/01/2025*