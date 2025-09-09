# Tableau des Fonctionnalités EBP MCP Server - Roadmap

*Date : 08/09/2025*

## 📊 Vue d'ensemble des fonctionnalités proposées

| #  | Fonctionnalité | Type | Description | Technologie | Complexité | Priorité | Temps Dev | Statut | Notes |
|----|----------------|------|-------------|-------------|------------|----------|-----------|--------|-------|
| **1** | **Recherche entreprises par nom** | Custom | Permettre la recherche par nom d'entreprise au lieu de l'ID uniquement. Recherche floue, ordre alphabétique, suggestions | SQL Server (lecture) | ⭐⭐ Faible | 🔴 **HAUTE** | 2-3 jours | 🟢 Faisable | Impact UX majeur, amélioration immédiate de l'expérience |
| **2** | **Croisement Factures/Paiements** | Custom | Croiser les factures commerciales avec les paiements comptables pour voir le statut de règlement | SQL Server (2 BDD) | ⭐⭐⭐ Moyenne | 🔴 **HAUTE** | 5-7 jours | 🟡 Accès BDD requis | Nécessite accès base comptabilité. Forte valeur business |
| **3** | **Microsoft 365 MCP** | **Existant** | Intégration avec Outlook, Teams, SharePoint, OneDrive | API Microsoft Graph | ⭐⭐ Faible | 🟠 **MOYENNE** | 1 jour config | ✅ Disponible | [MCP officiel Microsoft](https://github.com/microsoft/mcp-servers) |
| **4** | **Brave Search MCP** | **Existant** | Recherche web privée directement dans Claude | API Brave | ⭐ Très faible | 🟠 **MOYENNE** | 2h config | ✅ Disponible | [brave-search-mcp](https://github.com/mcp-servers/brave-search) |
| **5** | **Tavily Search MCP** | **Existant** | Recherche web avec synthèse IA | API Tavily | ⭐ Très faible | 🟡 **BASSE** | 2h config | ✅ Disponible | Alternative à Brave, [tavily-mcp](https://github.com/tavily-ai/mcp) |
| **6** | **LinkedIn Scraper MCP** | **Existant/Custom** | Extraction de profils et données entreprises LinkedIn | Web Scraping | ⭐⭐⭐⭐ Élevée | 🟡 **BASSE** | 3-5 jours | 🔴 Risqué | Problèmes légaux potentiels avec ToS LinkedIn |
| **7** | **Amazon Seller MCP** | À rechercher | Recherche produits et données marketplace Amazon | API Amazon MWS/SP | ⭐⭐⭐ Moyenne | 🟡 **BASSE** | 2-3 jours | 🟡 À vérifier | Nécessite compte vendeur Amazon |
| **8** | **Gestion Contacts & Notes** | Custom | Créer/modifier contacts et ajouter notes dans EBP | **SDK EBP** ⚠️ | ⭐⭐⭐⭐ Élevée | 🟠 **MOYENNE** | 10-15 jours | 🟡 SDK requis | Nécessite formation SDK EBP + tests approfondis |
| **9** | **Création Activités** | Custom | Créer des activités commerciales dans EBP | **SDK EBP** ⚠️ | ⭐⭐⭐⭐⭐ Très élevée | 🔵 **FAIBLE** | 10-15 jours | 🔴 **WARNING** | ⛔ Politique DB interdit écriture directe. SDK obligatoire |

## 🎯 Légende et Critères

### Types de MCP
- **Custom** : Développement spécifique pour EBP
- **Existant** : MCP disponible sur GitHub/communauté
- **À rechercher** : Existence à vérifier

### Technologies
- **SQL Server** : Lecture seule via requêtes SQL
- **SDK EBP** : API officielle EBP (écriture autorisée)
- **API externe** : Services tiers (Microsoft, Brave, etc.)

### Complexité (⭐)
- ⭐ **Très faible** : Configuration simple
- ⭐⭐ **Faible** : Développement basique
- ⭐⭐⭐ **Moyenne** : Développement standard
- ⭐⭐⭐⭐ **Élevée** : Développement complexe + tests
- ⭐⭐⭐⭐⭐ **Très élevée** : Architecture complexe + risques

### Priorité
- 🔴 **HAUTE** : Impact business immédiat
- 🟠 **MOYENNE** : Amélioration significative
- 🟡 **BASSE** : Nice to have
- 🔵 **TRÈS BASSE** : À reconsidérer

## 📈 Recommandations de déploiement

### Phase 1 - Quick Wins (Semaine 1-2)
1. **Recherche entreprises** (#1) - Impact UX immédiat
2. **Configuration MCP existants** (#3, #4) - ROI rapide

### Phase 2 - Valeur Business (Semaine 3-4)
3. **Croisement Factures/Paiements** (#2) - Si accès BDD obtenu
4. **Test Tavily** (#5) - Si Brave insuffisant

### Phase 3 - Extensions (Mois 2)
5. **Gestion Contacts** (#8) - Après formation SDK EBP
6. **Évaluation Amazon MCP** (#7) - Selon besoins

### ⚠️ À éviter/reporter
- **LinkedIn Scraper** (#6) - Risques légaux
- **Création Activités** (#9) - Complexité vs bénéfice

## 💰 Estimation budgétaire

| Phase | Jours Dev | Coût estimé | ROI attendu |
|-------|-----------|-------------|-------------|
| Phase 1 | 3-4 jours | 2-3k€ | Immédiat (UX) |
| Phase 2 | 5-7 jours | 3-5k€ | Court terme (efficacité) |
| Phase 3 | 15-20 jours | 10-15k€ | Moyen terme (automatisation) |
| **TOTAL** | **23-31 jours** | **15-23k€** | **ROI 6 mois** |

## 🚨 Points d'attention

1. **SDK EBP** : Formation nécessaire avant développements #8 et #9
2. **Base comptabilité** : Accès à demander pour #2
3. **LinkedIn** : Vérifier légalité avant implémentation
4. **Politique écriture** : Aucune écriture directe en base, SDK obligatoire

## ✅ Prochaines actions

1. **Immédiat** : Développer recherche entreprises (#1)
2. **Semaine 1** : Installer MCP Microsoft 365 et Brave Search
3. **Semaine 2** : Obtenir accès base comptabilité
4. **Mois 1** : Former équipe sur SDK EBP

---

*Ce document est à présenter au client pour validation des priorités*