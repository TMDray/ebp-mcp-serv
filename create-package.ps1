# Script de création du package de production
Write-Host "🚀 CRÉATION DU PACKAGE DE PRODUCTION" -ForegroundColor Cyan

# Nettoyer et créer le dossier temporaire
$deployPath = "C:\Temp\ebp-mcp-deploy"
if (Test-Path $deployPath) {
    Remove-Item $deployPath -Recurse -Force
}
New-Item -ItemType Directory -Path $deployPath -Force | Out-Null

Write-Host "📁 Copie des fichiers essentiels..." -ForegroundColor Green

# Copier les fichiers nécessaires
Write-Host "  • dist/ (code compilé)" -ForegroundColor Gray
Copy-Item "dist" "$deployPath\" -Recurse

Write-Host "  • node_modules/ (dépendances) - Patientez..." -ForegroundColor Gray
Copy-Item "node_modules" "$deployPath\" -Recurse

Write-Host "  • package.json et package-lock.json" -ForegroundColor Gray
Copy-Item "package.json" "$deployPath\"
Copy-Item "package-lock.json" "$deployPath\"

# Créer un template de configuration
Write-Host "  • Template de configuration" -ForegroundColor Gray
$envTemplate = @"
# Configuration Base de Données EBP
# À ADAPTER selon votre environnement de production

DB_SERVER=VOTRE_SERVEUR\INSTANCE
DB_DATABASE=VOTRE_BASE_EBP
DB_TRUSTED_CONNECTION=true
DB_TRUST_SERVER_CERTIFICATE=true

# Note: Si vous utilisez l'authentification SQL au lieu de Windows:
# DB_USER=votre_user
# DB_PASSWORD=votre_password
# DB_TRUSTED_CONNECTION=false
"@
$envTemplate | Out-File -FilePath "$deployPath\.env.template" -Encoding UTF8

# Créer le dossier logs
Write-Host "  • Dossier logs/" -ForegroundColor Gray
New-Item -ItemType Directory -Path "$deployPath\logs" -Force | Out-Null

# Créer un README pour la production
$readme = @"
# EBP MCP Server - Installation Production

## Installation Rapide

1. Installer Node.js v18+ si pas déjà fait
2. Copier ce dossier vers C:\Services\EBP-MCP-Server\
3. Créer le fichier .env depuis .env.template avec vos paramètres
4. Tester : node dist\index.js
5. Configurer Claude Desktop (voir ci-dessous)

## Configuration Claude Desktop

Dans %APPDATA%\Claude\claude_desktop_config.json :

{
  "mcpServers": {
    "ebp-server": {
      "command": "node",
      "args": ["C:\\Services\\EBP-MCP-Server\\dist\\index.js"]
    }
  }
}

## Test
Ouvrir Claude Desktop et demander : "Quel est le CA de janvier 2025 ?"
"@
$readme | Out-File -FilePath "$deployPath\README_PROD.txt" -Encoding UTF8

# Calculer la taille
$size = (Get-ChildItem $deployPath -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "`n📦 Création du ZIP..." -ForegroundColor Green

# Créer le ZIP
$zipPath = "C:\Temp\ebp-mcp-production.zip"
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

Compress-Archive -Path "$deployPath\*" -DestinationPath $zipPath -CompressionLevel Optimal

$zipSize = (Get-Item $zipPath).Length / 1MB

Write-Host "`n✅ PACKAGE CRÉÉ AVEC SUCCÈS!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📦 Fichier : $zipPath" -ForegroundColor White
Write-Host "📊 Taille : $([math]::Round($zipSize, 2)) MB" -ForegroundColor White
Write-Host "📁 Contenu :" -ForegroundColor White
Write-Host "   • dist/ (code compilé)" -ForegroundColor Gray
Write-Host "   • node_modules/ (dépendances)" -ForegroundColor Gray
Write-Host "   • package.json" -ForegroundColor Gray
Write-Host "   • .env.template (à adapter)" -ForegroundColor Gray
Write-Host "   • README_PROD.txt (instructions)" -ForegroundColor Gray
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "`n🎯 PROCHAINES ÉTAPES:" -ForegroundColor Yellow
Write-Host "1. Copier $zipPath sur le serveur de production" -ForegroundColor White
Write-Host "2. Extraire dans C:\Services\EBP-MCP-Server\" -ForegroundColor White
Write-Host "3. Configurer le fichier .env avec les paramètres de production" -ForegroundColor White
Write-Host "4. Installer Node.js sur le serveur si nécessaire" -ForegroundColor White