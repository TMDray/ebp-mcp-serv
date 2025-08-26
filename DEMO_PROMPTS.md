# 🎭 Prompts de Démonstration POC - EBP MCP Server

## 🚀 Démarrage Rapide

**Pour lancer le serveur:**
1. `npm run build` (compile TypeScript)
2. **Copier le contenu de `claude-desktop-config.json` dans votre config Claude Desktop**
3. **Redémarrer Claude Desktop**
4. **Les 5 tools EBP sont maintenant disponibles !**

---

## 📊 **1. Analyse Chiffre d'Affaires avec Familles de Produits**

### 🎯 **Prompt Principal - Vue d'ensemble client**
```
Montre-moi le chiffre d'affaires d'AEROSPATIALE pour 2025 avec l'analyse des familles de produits et l'évolution mensuelle.
```

### 🔍 **Prompts de Drill-down**
```
Quel est le CA de ce client seulement pour les 6 derniers mois ?
```

```
Analyse les familles de produits pour AEROSPATIALE ce trimestre seulement.
```

```
Montre l'évolution mensuelle du CA d'AEROSPATIALE depuis janvier.
```

---

## 👥 **2. Recherche Activités Commerciales Enrichie**

### 🎯 **Prompt Activités par Commercial**
```
Quelles sont les activités de MATHIAS ce mois-ci ?
```

### 🔍 **Prompts Multi-filtres**
```
Montre-moi toutes les activités de type "Visite" de l'équipe ce trimestre.
```

```
Recherche les activités avec AEROSPATIALE sur les 30 derniers jours.
```

```
Donne-moi un résumé des activités par commercial ce trimestre.
```

---

## 📈 **3. Performance Familles de Produits**

### 🎯 **Prompt Performance Globale**
```
Analyse la performance des familles de produits ce trimestre avec les détails clients et sous-familles.
```

### 🔍 **Prompts Spécialisés**
```
Focus sur la famille "Mica et Dérivés" ce trimestre - qui sont les top clients et quelles sous-familles performent le mieux ?
```

```
Compare la croissance des familles de produits ce trimestre vs l'année dernière.
```

```
Quelles familles de produits AEROSPATIALE achète-t-il principalement cette année ?
```

---

## 🏆 **4. Prompts Démo Executive (Effet WOW)**

### 💎 **Prompt Directeur Commercial**
```
Donne-moi un dashboard complet sur AEROSPATIALE : CA 2025, top familles produits, activités récentes et croissance vs 2024.
```

### 💎 **Prompt Analyse Territoriale**
```
Qui sont nos commerciaux les plus actifs ce trimestre et sur quels clients ? Inclus les statistiques d'activité.
```

### 💎 **Prompt Stratégique Produits**
```
Quelles sont nos familles de produits qui croissent le plus ce trimestre ? Montre-moi la comparaison avec l'année dernière et les top clients.
```

---

## 🎪 **5. Séquence de Démo Complète (10 minutes)**

### **Étape 1 - Vue Client (2 min)**
> *"Commençons par analyser un de nos clients clés"*
```
Montre-moi le CA complet d'AEROSPATIALE en 2025 avec les familles de produits.
```

### **Étape 2 - Zoom Produits (2 min)**
> *"Intéressant, voyons le détail de leur famille principale"*
```
Focus sur la famille "Mica et Dérivés" pour AEROSPATIALE - détaille les sous-familles et l'évolution.
```

### **Étape 3 - Activités Commerciales (2 min)**
> *"Et du côté activités commerciales ?"*
```
Quelles sont les activités récentes avec AEROSPATIALE et qui s'en occupe ?
```

### **Étape 4 - Performance Globale (2 min)**
> *"Prenons du recul sur toute notre gamme"*
```
Performance générale de nos familles de produits ce trimestre avec croissance vs année précédente.
```

### **Étape 5 - Vue Équipe (2 min)**
> *"Et notre équipe commerciale, comment ça se passe ?"*
```
Résumé des activités par commercial ce trimestre avec leurs statistiques.
```

---

## 🔧 **6. Prompts de Test Technique**

### **Validation Périodes Flexibles**
```
CA d'AEROSPATIALE du 1er mars au 31 juillet 2025.
```

### **Test Multi-filtres**
```
Activités de DEBORAH avec des visites client ce mois-ci.
```

### **Test Edge Cases**
```
Performance des familles de produits la semaine dernière.
```

---

## 💡 **7. Prompts Business Intelligence**

### **Analyse Tendances**
```
Quelles familles de produits ont la meilleure croissance et pourquoi ? Compare Q3 2025 vs Q3 2024.
```

### **Recommandations Commerciales**
```
Sur quels clients l'équipe devrait-elle se concentrer ? Analyse CA, activités récentes et potentiel.
```

### **Insights Produits**
```
Quelles sont les sous-familles Mica les plus vendues et à quels types de clients ?
```

---

## 🎯 **Messages Clés pour la Démo**

✅ **"Plus besoin de rapports Excel complexes"**
✅ **"Réponses instantanées en langage naturel"**  
✅ **"Vision 360° : CA + Produits + Activités"**
✅ **"Drill-down illimité par période/client/famille"**
✅ **"Historique complet + analyse de croissance"**

---

## 🚨 **Troubleshooting**

### **Si le serveur ne démarre pas:**
1. Vérifier `npm run build` sans erreur
2. Vérifier la config Claude Desktop
3. Redémarrer Claude Desktop complètement

### **Si pas de données:**
- Le serveur utilise la base EBP de test avec AEROSPATIALE
- Tester d'abord avec `CAEROSPATIALE` comme customerId
- Vérifier la connexion réseau vers `SRVDEV2025\EBP`

### **IDs clients de test garantis:**
- `CAEROSPATIALE` (AEROSPATIALE - 447 commandes)
- `CHAUVIN ARNOUX` (client composants)
- `AXON CABLE S.A.` (client mica)

---

**🎉 Le serveur MCP expose maintenant 5 tools puissants pour une démo complète du potentiel EBP + IA !**