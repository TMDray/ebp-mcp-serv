# Feedback Client - Analyse CCHAUVIN

## 📅 Date
08/09/2025

## 👤 Source
- **Utilisateur** : Client final (retour terrain)
- **Contexte** : Test en production sur la fiche client CCHAUVIN

## 📝 Feedback

### 🔴 Problèmes identifiés

#### 1. **Nombre de commandes suspect**
- **Problème** : Le nombre de commandes affiché est **très élevé**
- **Hypothèse client** : Ce serait le nombre de **lignes d'articles** commandés, pas le nombre de commandes
- **Impact** : Fausse le montant moyen de commande qui devient **très faible**

#### 2. **Données manquantes critiques**
Dans l'analyse client, il manque :
- **Tarif appliqué** : B - C - X - XX - Z - ZZ
- **Conditions de règlement** : 30j fdm, 60j, etc.
- **Conditions de port** : Franco, Franco à X€, Départ usine, etc.

### 💡 Observations positives
- Le **nombre de commandes** reste une info intéressante (si corrigé)
- Le **nombre d'articles commandés** est également pertinent

## 📊 Impact
- **Criticité** : Bloquant - Données erronées
- **Utilisateurs concernés** : Tous (calculs faux)
- **Fréquence** : Systémique sur tous les clients

## 🔧 Actions requises

### Urgent
1. **Vérifier la requête SQL** : Commandes vs Lignes de commande
2. **Identifier les tables/champs** pour :
   - Tarifs appliqués
   - Conditions de règlement  
   - Conditions de port

### Amélioration
3. **Distinguer dans l'affichage** :
   - Nombre de commandes (documents)
   - Nombre d'articles commandés (lignes)

## 🏷️ Tags
`#bug` `#donnees-erronees` `#champs-manquants` `#analyse-client`

## 🔗 Liens
- Client testé : CCHAUVIN
- Tables à analyser : SaleDocument, SaleDocumentLine, Customer