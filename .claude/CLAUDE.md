# Serveur MCP EBP - Documentation Projet

> **Projet :** Serveur MCP pour connexion Claude/Copilot Studio ↔ EBP Gestion Commerciale  
> **Version :** 1.3.0 - Corrections majeures feedback client  
> **Statut :** Production stable - Corrections CCHAUVIN intégrées ✅  
> **Dernière MAJ :** 08 septembre 2025  
> **Approche :** Feedback-driven improvements

## 🎯 Vue d'ensemble

### Mission
Permettre aux 4 commerciaux (CONSTANCE, DEBORAH, JULIE, MATHIAS) d'interagir en langage naturel avec EBP pour :
1. Consulter l'historique des activités client
2. Créer des comptes-rendus de visite
3. Augmenter le taux d'attribution (7% → 100%)
4. Passer de 3-5 à 15-20 activités/jour

### Architecture Actuelle
```
État: Phase 1 - Preuve de concept ✅
Fonctionnalités: 1/2 (ebp_get_client_activities)
Connexion DB: ✅ Testée et fonctionnelle
Serveur MCP: ✅ Compilé et prêt
Tests: ✅ Validés avec données MATHIAS
```

## 📋 Principes Directeurs

### 1. **Simplicité d'abord** 
- Toujours commencer par la solution la plus simple qui fonctionne
- Complexifier uniquement quand c'est validé nécessaire
- Une fonctionnalité qui marche > Dix fonctionnalités partielles

### 2. **Test-Learn-Iterate**
- Tester chaque composant isolément d'abord
- Apprendre de chaque test (succès ET échec)
- Itérer basé sur les apprentissages réels, pas les suppositions

### 3. **Context-Aware**
- Le contexte s'enrichit automatiquement
- Chaque session ajoute de la valeur
- Les patterns de succès deviennent des templates

### 4. **Auto-documentation**
- Chaque décision est documentée avec sa raison
- Les apprentissages sont capturés automatiquement
- Le contexte évolue sans intervention manuelle

## 🔄 Workflows Actifs

### @gather_context
Collecte et synthétise tout le contexte pertinent avant chaque tâche

### @evolve_context  
Met à jour ce fichier et les patterns basés sur les nouveaux apprentissages

### @debug_smart
Utilise l'historique des solutions pour résoudre les problèmes plus rapidement

### @minimal_test
Teste la plus petite unité possible avant de construire dessus

## 📊 État du Système

### Composants
| Composant | État | Confiance | Dernière Action |
|-----------|------|-----------|-----------------|
| Structure projet | ✅ Créé | 100% | Setup TypeScript complet |
| Connexion SQL | ✅ Testé | 100% | 2332 activités accessibles |
| Serveur MCP | ✅ Compilé | 100% | Build sans erreur |
| Tool lecture | ✅ Créé | 100% | ebp_get_client_activities |
| Tool écriture | ⏳ Phase 2 | 0% | ebp_create_visit_report |
| Test MATHIAS | ✅ Réussi | 100% | 5 clients, 140 activités |

### Métriques Clés
- Tests réussis : 3/3
- Activités accessibles : 2332
- Commerciaux identifiés : 4
- Taux attribution actuel : 7% (170/2332)
- Champion user : MATHIAS (140 activités)

## 🧠 Apprentissages Phase 1

### Patterns de Succès
- Stack Node.js + TypeScript + mssql parfaitement adaptée
- Structure EBP bien documentée (55 colonnes Activity)
- MATHIAS comme champion user idéal pour tests
- Notes texte dans `xx_Note_detaillee_Clear` (évite parsing RTF)

### Découvertes Importantes
- CustomerId en string, pas number (ex: "CAEROSPATIALE")
- Seulement 7% des activités ont un ColleagueId
- STAGIARE = compte d'import historique (1584 activités)
- Types principaux : "Compte Rendu Visite" (40%), "Suivi Commercial" (20%)

### Décisions Architecturales
1. **05/02/2025** - Approche "start-simple-project" validée
2. **05/02/2025** - Utilisation des champs `_Clear` pour éviter RTF
3. **05/02/2025** - CustomerID string dans toutes les requêtes

## 🎯 Prochaines Étapes

### Phase 1 ✅ TERMINÉE
1. ✅ Structure projet TypeScript
2. ✅ Connexion SQL Server testée
3. ✅ ebp_get_client_activities fonctionnel
4. ✅ Tests avec données MATHIAS

### Phase 2 - MVP (En cours)
1. [ ] Tester avec Claude Desktop
2. [ ] Ajouter ebp_create_visit_report
3. [ ] Validation attribution ColleagueId
4. [ ] Interface avec les 4 commerciaux

### Phase 3 - Production
1. [ ] Intégration Copilot Studio
2. [ ] Authentification commerciaux
3. [ ] Monitoring et logs
4. [ ] Objectif : 15-20 activités/jour

## 🔧 Configuration Technique

### Base de données ✅
```yaml
Server: SRVDEV2025\EBP
Database: JBG METAFIX_0895452f-b7c1-4c00-a316-c6a6d0ea4bf4
Auth: SQL (sa/VOTRE_MOT_DE_PASSE)
Port: 1433
État: ✅ Testé - 2332 activités accessibles
```

### Stack Technique
```yaml
Runtime: Node.js 18+ TypeScript
Framework: @modelcontextprotocol/sdk 0.6.0
Database: mssql 11.0.1
Build: tsc
Structure: src/ → dist/
```

### Tables Principales
- **Activity** : 2332 entrées, 55 colonnes
- **Customer** : ~100 clients (CustomerId string)
- **Colleague** : 4 commerciaux (IsSalesperson=1)

## 📝 Configuration Claude Desktop

Pour tester avec Claude Desktop, ajouter dans le fichier de config :

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

---

*Phase 1 terminée le 05/02/2025 - Prêt pour tests Claude Desktop*