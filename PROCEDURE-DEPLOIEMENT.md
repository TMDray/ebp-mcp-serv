# Procédure de Déploiement EBP MCP Server - Production

## Résumé de la procédure précédente

### 1. Création du package de déploiement
- Créer un dossier temporaire (ex: `C:\Temp\ebp-production-deploy`)
- Copier les fichiers suivants :
  - **Dossier `dist/`** (code compilé)
  - **`package.json`** (dépendances)
  - **`package-lock.json`** (versions exactes)
  - **Scripts .bat** depuis le dossier `scripts/` :
    - `install.bat` (pour npm install)
    - `start.bat` (pour démarrer le service)
    - `stop.bat` (pour arrêter le service)

### 2. Création du ZIP
- Compresser tout le contenu du dossier temporaire
- Nom suggéré : `EBP-MCP-Server-PRODUCTION-READY-v2.zip` (avec correction CA)

### 3. Déploiement sur le serveur de production

#### Étape 1 : Arrêter le service existant
```cmd
cd C:\Services\EBP-MCP-Server
stop.bat
```

#### Étape 2 : Sauvegarder l'ancienne version (optionnel)
```cmd
move C:\Services\EBP-MCP-Server C:\Services\EBP-MCP-Server-backup
```

#### Étape 3 : Extraire le nouveau package
- Extraire `EBP-MCP-Server-PRODUCTION-READY-v2.zip` dans `C:\Services\`
- Renommer le dossier extrait en `EBP-MCP-Server`

#### Étape 4 : Installation des dépendances
```cmd
cd C:\Services\EBP-MCP-Server
npm install --production
```
**⚠️ IMPORTANT : Utiliser `--production` car :**
- Installe uniquement les dépendances de production (pas les devDependencies)
- Package plus léger et installation plus rapide
- Les `node_modules` ne sont pas inclus dans le ZIP (trop volumineux)
- Le serveur de prod peut avoir une version de Node.js différente
- Certaines dépendances sont compilées nativement (ex: mssql)

#### Étape 5 : Test de fonctionnement
```cmd
node dist\index.js
```
**Vérifications :**
- Le serveur doit démarrer sans erreur
- Doit afficher "Serveur MCP EBP démarré avec 5 tools"
- Appuyer `Ctrl+C` pour arrêter le test

#### Étape 6 : Démarrer le service en production
```cmd
start.bat
```

#### Étape 7 : Vérifier le fonctionnement complet
- Redémarrer Claude Desktop
- Tester avec une requête CA : "Quel est le CA de janvier 2025 ?"
- Vérifier que le résultat est ~112,000€ (et non 127,000€)

## Corrections importantes dans cette version v2

### ✅ Correction majeure du calcul CA
- **Avant** : `NetAmountVatExcluded` → Retournait ~127,209€
- **Après** : `RealNetAmountVatExcluded` → Retourne ~112,100€ 
- **Résultat attendu** : ~111,920€ (correspondance avec EBP)

### ✅ Fichiers modifiés
- `src/tools/families.ts` : Toutes les requêtes SQL corrigées
- Compilation effectuée avec `npm run build`

## Notes importantes

1. **Configuration** : Le fichier `src/config.ts` reste flexible pour accepter les variables d'environnement de Claude Desktop

2. **Sécurité** : Le mot de passe reste dans Claude Desktop config, pas dans les fichiers du serveur

3. **Test après déploiement** : Redémarrer Claude Desktop et tester avec "Quel est le CA de janvier 2025 ?"

4. **Rollback** : En cas de problème, restaurer depuis `EBP-MCP-Server-backup`