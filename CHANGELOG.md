# Changelog EBP MCP Server

## [v1.3.0] - 2025-09-08

### 🎯 **Corrections majeures suite au feedback client CCHAUVIN**

#### 🔴 **BUGFIX CRITIQUE - Calcul nombre de commandes**
- **Problème** : Le MCP affichait le nombre de **lignes d'articles** au lieu du nombre de **documents de commande**
- **Exemple CCHAUVIN** : Affichait 225 "commandes" au lieu des vraies 225 commandes (qui correspondaient en fait aux lignes d'articles)
- **Impact** : Montant moyen par commande aberrant, données faussées
- **Solution** : Distinction claire entre commandes (documents) et articles (lignes)

#### ✨ **Nouvelles fonctionnalités ajoutées**
1. **Nombre d'articles commandés** 
   - Nouveau champ `totalArticles` distinct du nombre de commandes
   - Permet de voir le ratio articles/commande

2. **Informations commerciales enrichies**
   - **Tarif appliqué** : A, B, C, X, XX, Z, ZZ (`appliedRate`)
   - **Conditions de règlement** : 30j fdm, 60j, etc. (`paymentTerms`)
   - **Conditions de port** : Franco, Départ usine, etc. (`shippingTerms`) 
   - **Coût moyen du port** : Montant moyen des frais de port (`averageShippingCost`)

#### 🔧 **Corrections techniques**
- **Requête SQL améliorée** : Utilisation de `COUNT(DISTINCT sd.Id)` pour les commandes
- **Jointures enrichies** : Ajout des tables `SettlementMode` et `Shipping`
- **Calculs corrigés** : Moyenne par commande = CA ÷ nombre de documents (non plus ÷ lignes)

#### 📊 **Résultats validation CCHAUVIN**
- ✅ **Avant** : 225 "commandes" (lignes) → **Après** : 225 commandes + 1336 articles
- ✅ **Montant moyen** : 225,03€ par commande (réaliste)
- ✅ **Informations** : Tarif Z, Règlement "VIREMENT 30 JOURS FIN DE MOIS", Port "FRANCO"

#### 🎨 **Interface utilisateur**
- Affichage distinct du nombre de commandes et d'articles
- Informations commerciales visibles dans les réponses MCP
- Données plus précises pour l'analyse commerciale

### 🔄 **Migration**
- ✅ **Rétrocompatible** : Les anciens appels MCP continuent de fonctionner
- ✅ **Nouveaux champs optionnels** : Enrichissement progressif des données
- ✅ **Performance** : Pas d'impact sur les temps de réponse

---

## [v1.2.0] - 2025-09-06

### 🎯 **Correction calcul CA - Bug NetAmountVatExcluded**
- **Problème** : Calcul CA incorrect (127,209€ au lieu de ~112,000€)
- **Solution** : Utilisation de `RealNetAmountVatExcluded` au lieu de `NetAmountVatExcluded`
- **Impact** : Calculs CA désormais alignés avec EBP Gestion Commerciale

---

## [v1.1.0] - 2025-06-19

### ✨ **Fonctionnalités initiales**
- 5 outils MCP fonctionnels
- Connexion EBP SQL Server
- Analyse CA clients et familles de produits
- Recherche activités commerciales

---

*Dernière mise à jour : 08/09/2025*