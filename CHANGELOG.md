# Changelog EBP MCP Server

## [v1.4.0] - 2025-09-08

### 🔍 **Amélioration majeure - Recherche d'entreprises intelligente**

#### ✨ **NOUVEAUX OUTILS MCP**

1. **`ebp_search_companies`** - Recherche d'entreprises par nom
   - **Recherche floue tolérante** : "CHAUVIN" → trouve "CHAUVIN ARNOUX"
   - **Recherche approximative** : "ASB" → trouve "ASB - AEROSPATIALE Batteries"
   - **Tri intelligent** : Résultats les plus courts en premier
   - **Support fautes d'orthographe** : Flexibilité dans la saisie
   - **Paramètres** : `searchTerm`, `limit`, `exactMatch`

2. **`ebp_list_companies`** - Liste alphabétique d'entreprises  
   - **Filtrage par lettre** : Commençant par "C", "CH", etc.
   - **Navigation alphabétique** : Parcours ordonné de la base clients
   - **Limite configurable** : Contrôle du nombre de résultats
   - **Paramètres** : `startsWith`, `limit`, `activeOnly`

#### 🎯 **Cas d'usage résolus**

- ✅ **"CHAUVIN"** → Trouve 4 entreprises dont **CCHAUVIN : CHAUVIN ARNOUX**
- ✅ **"ASB"** → Trouve **CAEROSPATIALE : ASB - AEROSPATIALE Batteries**  
- ✅ **Navigation A-Z** → 276 entreprises commençant par "C"
- ✅ **Recherche partielle** → Plus de flexibilité pour les utilisateurs

#### 🔧 **Améliorations techniques**

- **2 nouveaux outils MCP** ajoutés (total : **7 outils**)
- **Requêtes SQL optimisées** pour la recherche textuelle
- **Interface MCP enrichie** avec nouveaux schémas d'entrée
- **Gestion d'erreurs robuste** pour les recherches vides

#### 💡 **Impact utilisateur**

- **Terminé la rigidité** : Plus besoin de connaître l'ID exact
- **Recherche intuitive** : Tapez une partie du nom d'entreprise
- **Découverte facilitée** : Exploration alphabétique possible
- **Gain de temps** : Recherche rapide même avec fautes de frappe

#### 📊 **Validation technique**

- ✅ **Build réussi** avec nouveaux outils
- ✅ **Tests fonctionnels** sur CHAUVIN, ASB, liste "C"
- ✅ **Serveur MCP** démarre avec 7 outils
- ✅ **Compatibilité** avec Claude Desktop

---

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