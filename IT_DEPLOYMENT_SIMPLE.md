# Déploiement Serveur MCP EBP - Document Technique IT

## Objectif

Installer un serveur **Model Context Protocol (MCP)** permettant l'accès sécurisé aux données EBP via Claude Desktop pour analyses business en langage naturel.

## Architecture

```
Claude Desktop (local) → Serveur MCP (Node.js) → SQL Server EBP (SRVDEV2025\EBP)
```

## ⚠️ Points Importants AVANT Installation

### À Adapter À Votre Environnement
- **`SRVDEV2025\EBP`** : Nom de VOTRE serveur SQL Server EBP de production
- **`BIJOU_X3`** : Nom de VOTRE base de données EBP (exemple de test, à remplacer)
- **Compte de service** : Créer un compte dédié selon vos standards de sécurité

### Alternatives d'Installation
- **Mode Simple** : Claude Desktop lance automatiquement le serveur MCP quand nécessaire
- **Mode Service** : Installation comme service Windows pour démarrage automatique (optionnel)

### Prérequis Réseau
- Port **1433** accessible entre le poste et votre serveur SQL EBP
- **Authentification Windows** recommandée (pas de mots de passe dans les fichiers)

---

## 1. Installations Requises

### 1.1 Node.js LTS (Runtime JavaScript)
```bash
# Télécharger et installer
https://nodejs.org/fr/download/
# Version : v18 LTS ou supérieure
# Installation : Options par défaut

# Vérification
node --version  # Doit afficher v18.x.x ou plus
npm --version   # Doit afficher v9.x.x ou plus
```

### 1.2 Git for Windows
```bash
# Télécharger et installer
https://git-scm.com/download/win
# Installation : Options par défaut

# Vérification
git --version
```

### 1.3 Claude Desktop
```bash
# Télécharger et installer
https://claude.ai/desktop
# Version minimale : 0.7.0
# Installation standard Windows
```

### 1.4 Serveur MCP Sequential Thinking (OPTIONNEL - Améliore les analyses)
```bash
# Installation après Node.js
npm install -g @anthropic/mcp-sequential-thinking

# Sera ajouté à la configuration Claude Desktop
```

---

## 2. Installation du Serveur MCP EBP

### 2.1 Téléchargement du Code
```powershell
# Créer le répertoire
New-Item -ItemType Directory -Path "C:\Services\EBP-MCP-Server"
cd C:\Services\EBP-MCP-Server

# Cloner le repository
git clone [URL_REPOSITORY_GIT] .

# Installer les dépendances
npm install --production

# Compiler le code TypeScript
npm run build
```

### 2.2 Configuration Base de Données
Créer le fichier `.env` dans `C:\Services\EBP-MCP-Server\` :
```
DB_SERVER=SRVDEV2025\EBP
DB_DATABASE=BIJOU_X3
DB_TRUSTED_CONNECTION=true
DB_TRUST_SERVER_CERTIFICATE=true
```

**📝 NOTE IMPORTANTE - Paramétrage Base de Données :**
- `DB_SERVER` : Nom de votre serveur SQL Server EBP (adapter selon votre environnement)
- `DB_DATABASE` : Nom de la base de données EBP en production (BIJOU_X3 est un exemple, remplacer par le nom réel)
- `DB_TRUSTED_CONNECTION=true` : Utilise l'authentification Windows (compte de service)
- `DB_TRUST_SERVER_CERTIFICATE=true` : Accepte le certificat SSL auto-signé du serveur SQL

**⚠️ À ADAPTER :** Les valeurs ci-dessus sont des exemples. Utiliser les paramètres de VOTRE base de données de production EBP.

### 2.3 Test de Connexion (OPTIONNEL - Pour validation)
```powershell
# Tester le serveur
node dist/index.js

# Si OK, vous verrez : "MCP Server started"
# Ctrl+C pour arrêter
```

**📝 Note :** `dist/index.js` est le fichier JavaScript compilé depuis le code TypeScript par la commande `npm run build`. Cette étape permet de vérifier que la connexion à la base de données fonctionne avant de configurer Claude Desktop.

---

## 3. Configuration Claude Desktop

### 3.1 Localisation du Fichier Config
```
%APPDATA%\Claude\claude_desktop_config.json
```
Généralement : `C:\Users\[USERNAME]\AppData\Roaming\Claude\claude_desktop_config.json`

### 3.2 Configuration avec Sequential Thinking
Remplacer le contenu par :
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

### 3.3 Redémarrage Claude Desktop
1. Fermer complètement Claude Desktop
2. Rouvrir Claude Desktop
3. Les serveurs MCP se connectent automatiquement

---

## 4. Installation Service Windows (OPTIONNEL - Pour Production)

**📝 Qu'est-ce que NSSM ?**
NSSM (Non-Sucking Service Manager) est un utilitaire gratuit qui permet de transformer n'importe quel programme en service Windows. Cela permet au serveur MCP de :
- Démarrer automatiquement avec Windows
- Redémarrer automatiquement en cas de crash
- Fonctionner en arrière-plan sans console

**⚠️ NOTE :** Cette étape est OPTIONNELLE. Sans service Windows, le serveur MCP sera lancé automatiquement par Claude Desktop quand nécessaire.

### 4.1 Télécharger NSSM (Si vous voulez un service Windows)
```bash
# Non-Sucking Service Manager
http://nssm.cc/download
# Extraire nssm.exe dans C:\Services\EBP-MCP-Server\
```

### 4.2 Créer le Service
```powershell
cd C:\Services\EBP-MCP-Server

# Installer le service
.\nssm.exe install "EBP-MCP-Server" "C:\Program Files\nodejs\node.exe"
.\nssm.exe set "EBP-MCP-Server" AppDirectory "C:\Services\EBP-MCP-Server"
.\nssm.exe set "EBP-MCP-Server" AppParameters "dist\index.js"
.\nssm.exe set "EBP-MCP-Server" DisplayName "EBP MCP Server"
.\nssm.exe set "EBP-MCP-Server" Start SERVICE_AUTO_START

# Démarrer le service
.\nssm.exe start "EBP-MCP-Server"

# Vérifier le statut
Get-Service "EBP-MCP-Server"
```

---

## 5. Prérequis Base de Données

### 5.1 Compte SQL Server
**📝 NOTE :** `BIJOU_X3` est un exemple de nom de base de données EBP. Remplacer par le nom réel de votre base de données EBP de production.

Créer un compte avec droits de lecture uniquement :

```sql
-- Sur le serveur SQL Server EBP
-- REMPLACER "BIJOU_X3" par le nom réel de votre base EBP
USE [NOM_DE_VOTRE_BASE_EBP];

-- Si authentification Windows
CREATE LOGIN [DOMAIN\svc_mcp_ebp] FROM WINDOWS;
CREATE USER [DOMAIN\svc_mcp_ebp] FOR LOGIN [DOMAIN\svc_mcp_ebp];

-- Droits de lecture seule
GRANT SELECT ON SaleDocument TO [DOMAIN\svc_mcp_ebp];
GRANT SELECT ON SaleDocumentLine TO [DOMAIN\svc_mcp_ebp];
GRANT SELECT ON Customer TO [DOMAIN\svc_mcp_ebp];
GRANT SELECT ON Item TO [DOMAIN\svc_mcp_ebp];
GRANT SELECT ON ItemFamily TO [DOMAIN\svc_mcp_ebp];
GRANT SELECT ON ItemSubFamily TO [DOMAIN\svc_mcp_ebp];
GRANT SELECT ON Activity TO [DOMAIN\svc_mcp_ebp];
GRANT SELECT ON Colleague TO [DOMAIN\svc_mcp_ebp];
```

### 5.2 Vérification Réseau
- Port **1433** ouvert entre le poste et le serveur SQL
- Test ping : `ping SRVDEV2025`
- Test telnet : `telnet SRVDEV2025 1433`

---

## 6. Tests de Validation

### 6.1 Test Serveur MCP
```powershell
cd C:\Services\EBP-MCP-Server
node dist/index.js
# Doit afficher : "MCP Server started"
```

### 6.2 Test Claude Desktop
1. Ouvrir Claude Desktop
2. Taper : "Quel est le CA de janvier 2025 ?"
3. Réponse attendue : CA avec montant en euros

### 6.3 Test Requête Spécifique
```
"Analyse les ventes du client EXXELIA"
# Doit retourner des données de vente
```

---

## 7. Sécurité

### Points de Sécurité Implémentés
- ✅ **Lecture seule** sur la base de données
- ✅ **Requêtes SQL prédéfinies** (pas d'injection possible)
- ✅ **Validation des paramètres** sur toutes les entrées
- ✅ **Timeout** de 30 secondes sur les requêtes
- ✅ **Pas de données sensibles** dans les logs

### Emplacements Importants
```
C:\Services\EBP-MCP-Server\.env          # Configuration (sensible)
C:\Services\EBP-MCP-Server\logs\         # Logs d'application
%APPDATA%\Claude\                        # Configuration Claude
```

---

## 8. Dépannage Rapide

### Le service ne démarre pas
```powershell
# Vérifier les logs Windows
Get-EventLog -LogName Application -Source "EBP-MCP-Server" -Newest 10

# Tester en mode console
cd C:\Services\EBP-MCP-Server
node dist/index.js
```

### Claude Desktop ne trouve pas le serveur
1. Vérifier le fichier `%APPDATA%\Claude\claude_desktop_config.json`
2. Redémarrer Claude Desktop
3. Vérifier que le chemin dans config.json est correct

### Erreur de connexion SQL
1. Vérifier le fichier `.env`
2. Tester la connexion : `sqlcmd -S SRVDEV2025\EBP -d BIJOU_X3 -Q "SELECT 1"`
3. Vérifier les droits du compte SQL

---

## Checklist Installation

- [ ] Node.js v18+ installé
- [ ] Git installé
- [ ] Claude Desktop installé
- [ ] Code source cloné et compilé
- [ ] Fichier .env configuré
- [ ] Configuration Claude Desktop créée
- [ ] Test de connexion SQL réussi
- [ ] Test dans Claude Desktop réussi
- [ ] Service Windows créé (si production)
- [ ] Documentation remise

---

## Contact Support

**Responsable Technique** : [Votre nom]  
**Email** : [Votre email]  
**Documentation complète** : https://github.com/[repository]/wiki

---

*Version 1.0 - 09/01/2025*