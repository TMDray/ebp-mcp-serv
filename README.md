# EBP MCP Server

Serveur MCP pour exposer les données EBP Gestion Commerciale aux commerciaux via Copilot Studio.

## Objectif

Permettre aux 4 commerciaux (CONSTANCE, DEBORAH, JULIE, MATHIAS) d'interagir en langage naturel avec les données client EBP pour consulter l'historique et créer des comptes-rendus de visite.

## Usage

```bash
npm install
npm run build
npm start
```

## Status

- ✅ Phase 1 : Preuve de concept terminée !
- ✅ Connexion SQL Server fonctionnelle
- ✅ ebp_get_client_activities opérationnel
- ⏳ Phase 2 : MVP fonctionnel
- ❌ Production

## Configuration

Variables d'environnement (optionnelles) :
- `EBP_SERVER` : Serveur SQL (défaut: SRVDEV2025\EBP)
- `EBP_DATABASE` : Base EBP (défaut: JBG METAFIX_...)
- `EBP_USER` : Utilisateur SQL (défaut: sa)
- `EBP_PASSWORD` : Mot de passe (défaut: @ebp78EBP)

## Outils MCP

- `ebp_get_client_activities` : Historique activités client

## Phase 1 - Preuve de Concept ✅ TERMINÉE

### Apprentissages

**Ce qui a marché :**
- Stack Node.js + TypeScript + mssql parfaitement adaptée
- Structure EBP bien documentée (55 colonnes Activity)
- Connexion SQL Server stable (2332 activités accessibles)
- MATHIAS comme champion user idéal (140 activités)

**Ce qui a été découvert :**
- CustomerId en string, pas number (ex: "CAEROSPATIALE")
- Notes au format RTF dans `Notes`, texte clair dans `xx_Note_detaillee_Clear`
- Seulement 7% des activités ont un ColleagueId (170/2332)
- 4 commerciaux actifs : CONSTANCE, DEBORAH, JULIE, MATHIAS

**Métriques Phase 1 :**
- Temps : 2 heures
- LOC : ~200 lignes
- Tests : Connexion + requête réussies
- Dépendances : 4 essentielles

### Prochaines étapes Phase 2
- Ajouter `ebp_create_visit_report`
- Interface MCP avec Claude Desktop
- Gestion des erreurs robuste
- Conversion RTF vers texte