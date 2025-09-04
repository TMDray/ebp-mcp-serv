# Guide de Déploiement Production - Serveur MCP EBP

## 📋 Sequential Thinking - Analyse du Projet

### 1. **Contexte et Problématique**
- **Besoin métier** : Accès simplifié aux données EBP pour analyses business via IA
- **Solution technique** : Serveur MCP (Model Context Protocol) connecté à SQL Server EBP
- **Interface utilisateur** : Claude Desktop pour requêtes en langage naturel
- **Environnement cible** : Ordinateur de travail en production

### 2. **Architecture Technique**
```
┌─────────────────┐    MCP    ┌─────────────────┐    SQL    ┌─────────────────┐
│   Claude        │  ←────→  │  Serveur MCP    │  ←────→  │  SQL Server     │
│   Desktop       │  Protocol │  (Node.js)     │  Queries  │  EBP (BIJOU_X3) │
│  (Interface)    │           │  (Port Local)   │           │  (Port 1433)    │
└─────────────────┘           └─────────────────┘           └─────────────────┘
```

### 3. **Flux de Données**
1. Utilisateur pose une question en français dans Claude Desktop
2. Claude Desktop envoie la requête au serveur MCP local
3. Le serveur MCP traduit la demande en requête SQL sécurisée
4. Exécution sur la base EBP et retour des résultats formatés
5. Claude Desktop présente l'analyse à l'utilisateur

---

## 🎯 Rôle et Fonctionnement du Serveur MCP

### Qu'est-ce que MCP ?

**Model Context Protocol** est un standard créé par Anthropic pour permettre aux IA de se connecter de manière sécurisée à des sources de données externes.

### Notre Serveur MCP EBP : Rôle Spécifique

| Aspect | Description |
|--------|-------------|
| **Traducteur IA-BDD** | Convertit les questions métier en requêtes SQL optimisées |
| **Couche de sécurité** | Limite l'accès aux seules requêtes prédéfinies (pas de SQL libre) |
| **Analyseur business** | Fournit des KPI, tendances, classements, analyses comparative |
| **Interface moderne** | Permet l'analyse de données via conversation naturelle |

### Fonctionnalités Métier Disponibles

#### 1. **Analyse des Ventes Client** (ebp_get_client_sales)
- CA par période (jour, semaine, mois, trimestre, année)
- Évolution temporelle et tendances
- Répartition par familles de produits
- Comparaisons inter-périodes

#### 2. **Suivi des Activités Commerciales** (ebp_get_client_activities)
- Historique des activités par client/commercial
- Statistiques de durée et fréquence
- Filtres par type d'activité et période
- Résumés par équipe commerciale

#### 3. **Performance Familles de Produits** (ebp_get_product_families_performance)
- Top familles par chiffre d'affaires
- Analyse des sous-familles
- Répartition par clients
- Évolution et croissance

---

## 🖥️ Claude Desktop : Interface Utilisateur

### Qu'est-ce que Claude Desktop ?

**Claude Desktop** est l'application de bureau d'Anthropic qui permet d'utiliser Claude (IA conversationnelle) en local avec des extensions via MCP.

### Intégration avec notre Serveur MCP

- **Configuration simple** via un fichier JSON
- **Connexion automatique** au démarrage de Claude Desktop
- **Interface chat familière** pour poser des questions métier
- **Réponses contextuelles** avec tableaux, graphiques, analyses

### Exemples d'Utilisation

```
Utilisateur : "Quel est le CA du client EXXELIA sur les 6 derniers mois ?"

Claude + MCP : Analyse automatiquement les données EBP et retourne :
- CA total et évolution mensuelle
- Répartition par familles de produits  
- Comparaison avec la période précédente
- Graphiques de tendance
```

---

## 🔧 Installation et Prérequis

### 1. Environnement Système Requis

| Composant | Specification | Notes |
|-----------|---------------|-------|
| **OS** | Windows 10/11 Pro | Ou Windows Server 2019+ |
| **RAM** | 8 Go minimum, 16 Go recommandé | Pour performances optimales |
| **Stockage** | 5 Go espace libre | Installation + logs + cache |
| **CPU** | Intel i5 ou AMD équivalent | 4 cœurs recommandés |
| **Réseau** | Accès SQL Server EBP | Port 1433 ouvert |

### 2. Logiciels à Installer

#### A. Node.js Runtime (Obligatoire)
```powershell
# Téléchargement et installation
# URL: https://nodejs.org/fr/download/
# Choisir: "LTS" version (actuellement v18.19.0)

# Vérification post-installation
node --version    # Doit afficher v18.x.x ou supérieur
npm --version     # Doit afficher 9.x.x ou supérieur
```

#### B. Git for Windows (Déploiement)
```powershell
# URL: https://git-scm.com/download/win
# Installation avec paramètres par défaut

# Vérification
git --version
```

#### C. Claude Desktop (Interface utilisateur)
```powershell
# URL: https://claude.ai/desktop
# Version minimale: 0.7.0
# Installation standard Windows
```

### 3. Accès Base de Données EBP

#### Prérequis Réseau et Sécurité
- **Serveur SQL** : `SRVDEV2025\EBP` (à adapter selon environnement)
- **Base de données** : `BIJOU_X3` (à adapter selon EBP)
- **Port réseau** : 1433 (SQL Server default)
- **Authentification** : Windows Authentication recommandée

#### Compte de Service Dédié (Recommandé)
```sql
-- Créer un compte dédié avec droits minimaux
CREATE LOGIN [DOMAIN\svc_mcp_ebp] FROM WINDOWS;
USE BIJOU_X3;
CREATE USER [DOMAIN\svc_mcp_ebp] FOR LOGIN [DOMAIN\svc_mcp_ebp];

-- Droits de lecture uniquement sur les tables nécessaires
GRANT SELECT ON SaleDocument TO [DOMAIN\svc_mcp_ebp];
GRANT SELECT ON SaleDocumentLine TO [DOMAIN\svc_mcp_ebp];
GRANT SELECT ON Customer TO [DOMAIN\svc_mcp_ebp];
GRANT SELECT ON Item TO [DOMAIN\svc_mcp_ebp];
GRANT SELECT ON ItemFamily TO [DOMAIN\svc_mcp_ebp];
GRANT SELECT ON ItemSubFamily TO [DOMAIN\svc_mcp_ebp];
GRANT SELECT ON Activity TO [DOMAIN\svc_mcp_ebp];
GRANT SELECT ON Colleague TO [DOMAIN\svc_mcp_ebp];
```

---

## 🚀 Processus de Mise en Production

### Phase 1 : Préparation et Tests (2-3 jours)

#### Jour 1 : Installation Environnement
```powershell
# 1. Créer le répertoire de production
New-Item -ItemType Directory -Path "C:\Services\EBP-MCP-Server"
Set-Location "C:\Services\EBP-MCP-Server"

# 2. Cloner le code source
git clone [URL_REPOSITORY] .

# 3. Installer les dépendances
npm install --production

# 4. Compilation TypeScript
npm run build
```

#### Jour 2 : Configuration et Tests
```powershell
# 1. Configuration base de données
@"
DB_SERVER=SRVDEV2025\EBP
DB_DATABASE=BIJOU_X3
DB_TRUSTED_CONNECTION=true
DB_TRUST_SERVER_CERTIFICATE=true
"@ | Out-File -FilePath ".env" -Encoding UTF8

# 2. Test de connectivité
node dist/index.js

# 3. Configuration Claude Desktop
$configPath = "$env:APPDATA\Claude\claude_desktop_config.json"
$config = @{
    mcpServers = @{
        "ebp-server" = @{
            command = "node"
            args = @("C:\Services\EBP-MCP-Server\dist\index.js")
            env = @{
                NODE_ENV = "production"
            }
        }
    }
} | ConvertTo-Json -Depth 3

$config | Out-File -FilePath $configPath -Encoding UTF8
```

#### Jour 3 : Validation Utilisateur
- **Tests métier** avec requêtes réelles
- **Validation des calculs** vs EBP direct
- **Tests de performance** (10-20 requêtes simultanées)
- **Formation utilisateur** (30 minutes)

### Phase 2 : Déploiement Production (1 jour)

#### Installation Service Windows (Optionnel)
```powershell
# Télécharger NSSM (Non-Sucking Service Manager)
# URL: http://nssm.cc/download

# Installation du service
nssm install "EBP-MCP-Server" "C:\Program Files\nodejs\node.exe"
nssm set "EBP-MCP-Server" AppDirectory "C:\Services\EBP-MCP-Server"
nssm set "EBP-MCP-Server" AppParameters "dist\index.js"
nssm set "EBP-MCP-Server" DisplayName "EBP MCP Server"
nssm set "EBP-MCP-Server" Description "Serveur MCP pour accès données EBP via Claude"
nssm set "EBP-MCP-Server" Start SERVICE_AUTO_START

# Démarrage du service
nssm start "EBP-MCP-Server"
```

#### Tests de Production
```powershell
# 1. Vérification du service
Get-Service "EBP-MCP-Server"

# 2. Test Claude Desktop
# - Ouvrir Claude Desktop
# - Poser question : "Quel est le CA de janvier 2025 ?"
# - Vérifier réponse cohérente

# 3. Monitoring initial
Get-Process -Name "node" | Where-Object {$_.CommandLine -like "*ebp*"}
```

---

## 🔒 Sécurité et Conformité

### Principe de Sécurité par Design

#### 1. **Isolation des Privilèges**
- Compte de service avec **droits minimaux** (SELECT uniquement)
- **Aucun accès en écriture** aux données EBP
- **Requêtes prédéfinies** uniquement (pas de SQL dynamique)

#### 2. **Protection des Données**
- **Communications chiffrées** (TLS 1.2+)
- **Logs sécurisés** (aucun mot de passe loggé)
- **Validation stricte** des paramètres d'entrée
- **Timeout des requêtes** (30 secondes max)

#### 3. **Audit et Traçabilité**
```powershell
# Emplacement des logs
Get-ChildItem "C:\Services\EBP-MCP-Server\logs" -Name

# Structure des logs :
# - access.log : Requêtes utilisateur (anonymisées)
# - error.log : Erreurs techniques
# - performance.log : Métriques de performance
```

### Conformité RGPD

- **Pas de données personnelles** exposées via le MCP
- **Anonymisation** des logs utilisateur
- **Accès contrôlé** aux seules données métier nécessaires
- **Durée de rétention** des logs : 30 jours maximum

---

## 🔧 Maintenance et Support

### Monitoring Quotidien

#### Indicateurs Clés
| Métrique | Seuil Normal | Seuil d'Alerte | Action |
|----------|--------------|----------------|---------|
| **Temps de réponse** | < 2 secondes | > 5 secondes | Optimiser requêtes |
| **Utilisation CPU** | < 50% | > 80% | Investiguer charge |
| **Utilisation RAM** | < 500 Mo | > 1 Go | Redémarrer si nécessaire |
| **Erreurs par heure** | < 5 | > 20 | Analyser logs d'erreur |
| **Connexions DB** | < 5 | > 10 | Optimiser pool de connexions |

#### Scripts de Monitoring
```powershell
# Vérification santé du service
function Test-EBPMCPHealth {
    $service = Get-Service "EBP-MCP-Server" -ErrorAction SilentlyContinue
    $process = Get-Process -Name "node" -ErrorAction SilentlyContinue | 
               Where-Object {$_.CommandLine -like "*ebp*"}
    
    if ($service.Status -eq "Running" -and $process) {
        Write-Host "✅ Service EBP MCP en fonctionnement" -ForegroundColor Green
        Write-Host "   Mémoire utilisée: $($process.WorkingSet64 / 1MB) Mo"
        Write-Host "   CPU: $($process.CPU)%"
    } else {
        Write-Warning "⚠️ Problème détecté avec le service EBP MCP"
    }
}
```

### Maintenance Préventive

#### Hebdomadaire
- **Nettoyage des logs** anciens (> 30 jours)
- **Vérification espace disque** disponible
- **Test de connectivité** base de données

#### Mensuelle  
- **Mise à jour des dépendances** Node.js (si disponibles)
- **Sauvegarde configuration** (.env, claude_desktop_config.json)
- **Analyse performance** des requêtes lentes

#### Trimestrielle
- **Mise à jour Node.js** vers version LTS récente
- **Review des logs d'erreur** pour optimisations
- **Formation utilisateur** sur nouvelles fonctionnalités

### Procédures d'Urgence

#### Redémarrage d'Urgence
```powershell
# Arrêt propre
Stop-Service "EBP-MCP-Server" -Force

# Attendre 10 secondes
Start-Sleep -Seconds 10

# Redémarrage
Start-Service "EBP-MCP-Server"

# Vérification
Test-EBPMCPHealth
```

#### Restauration de Configuration
```powershell
# Restaurer .env depuis sauvegarde
Copy-Item "C:\Services\EBP-MCP-Server\.env.backup" -Destination "C:\Services\EBP-MCP-Server\.env"

# Restaurer config Claude Desktop
$backupConfig = "C:\Services\EBP-MCP-Server\claude_desktop_config.json.backup"
$configPath = "$env:APPDATA\Claude\claude_desktop_config.json"
Copy-Item $backupConfig -Destination $configPath
```

---

## 📞 Support et Contacts

### Équipe Projet

| Rôle | Responsable | Contact | Responsabilités |
|------|-------------|---------|-----------------|
| **Chef de Projet** | [Nom] | [Email/Tel] | Coordination générale, validation métier |
| **Développeur Lead** | [Nom] | [Email/Tel] | Code, architecture, bugs techniques |
| **Admin Base de Données** | [Nom] | [Email/Tel] | Accès SQL, performance requêtes |
| **Admin Système** | [Nom] | [Email/Tel] | Infrastructure, monitoring, sécurité |
| **Utilisateur Métier** | [Nom] | [Email/Tel] | Tests, formation, feedback |

### Procédure d'Escalade

#### Niveau 1 - Problèmes Mineurs
- **Délai de réponse** : 4 heures ouvrées
- **Types** : Questions utilisation, requêtes lentes occasionnelles
- **Contact** : Utilisateur métier référent

#### Niveau 2 - Problèmes Majeurs  
- **Délai de réponse** : 2 heures ouvrées
- **Types** : Service indisponible, erreurs fréquentes
- **Contact** : Développeur Lead + Admin Système

#### Niveau 3 - Problèmes Critiques
- **Délai de réponse** : 30 minutes
- **Types** : Sécurité compromise, perte de données
- **Contact** : Chef de Projet + tous référents

---

## 📊 Métriques de Succès

### KPI Techniques

- **Disponibilité** : > 99% (objectif : 99.5%)
- **Temps de réponse moyen** : < 2 secondes
- **Taux d'erreur** : < 1% des requêtes
- **Temps de résolution incident** : < 4 heures

### KPI Métier

- **Adoption utilisateur** : > 80% des demandes d'analyse via MCP
- **Gain de temps** : -50% vs requêtes SQL manuelles
- **Satisfaction utilisateur** : > 4/5
- **Nouvelles analyses** : +30% de KPI business découverts

---

## ✅ Checklist de Validation Production

### Pré-Déploiement
- [ ] **Node.js v18+** installé et testé
- [ ] **Git** installé et configuré  
- [ ] **Claude Desktop** installé et fonctionnel
- [ ] **Accès SQL Server EBP** validé avec compte de service
- [ ] **Code source** cloné et compilé sans erreur
- [ ] **Configuration .env** créée et testée
- [ ] **Configuration Claude Desktop** créée et testée

### Tests Fonctionnels
- [ ] **Test CA janvier 2025** : résultat = 111,315.03€
- [ ] **Test requête client** avec données réelles
- [ ] **Test analyse familles produits** avec résultats cohérents
- [ ] **Test activités commerciales** avec filtres
- [ ] **Test performance** : < 3 secondes pour requêtes standards

### Sécurité
- [ ] **Compte de service** avec privilèges minimaux
- [ ] **Logs sécurisés** sans données sensibles
- [ ] **Validation paramètres** sur toutes les entrées
- [ ] **Timeout requêtes** configuré (30s max)
- [ ] **Chiffrement communications** TLS activé

### Production
- [ ] **Service Windows** installé et configuré
- [ ] **Démarrage automatique** activé
- [ ] **Monitoring** scripts en place
- [ ] **Procédures maintenance** documentées
- [ ] **Contacts support** définis et communiqués
- [ ] **Formation utilisateur** effectuée
- [ ] **Documentation** remise à l'équipe IT

---

## 🎓 Formation Utilisateur (30 minutes)

### Module 1 : Concepts de Base (10 minutes)
- Qu'est-ce que Claude Desktop + MCP ?
- Différence avec les requêtes SQL traditionnelles
- Types d'analyses disponibles

### Module 2 : Utilisation Pratique (15 minutes)
```
Exemples de questions à poser :

Business Intelligence :
- "Quel est notre CA du mois dernier ?"
- "Qui sont nos top 10 clients de l'année ?"
- "Quelle famille de produits performe le mieux ?"

Analyses Clients :
- "Analyse des ventes de EXXELIA sur 6 mois"
- "Évolution du CA de notre client ASB"
- "Quels produits achète principalement RHONA ?"

Suivi Commercial :
- "Activités commerciales de janvier"
- "Quel commercial a le plus d'activités ?"
- "Résumé des rendez-vous de la semaine"
```

### Module 3 : Bonnes Pratiques (5 minutes)
- Formuler des questions claires et précises
- Spécifier les périodes souhaitées  
- Demander des précisions si besoin
- Signaler les anomalies détectées

---

**Document créé le** : 2025-01-09  
**Version** : 1.0  
**Statut** : PRÊT POUR VALIDATION IT  
**Prochaine révision** : 2025-04-09

---

*Ce document est confidentiel et destiné exclusivement à l'équipe IT et aux parties prenantes du projet. Toute diffusion externe doit être approuvée par le chef de projet.*