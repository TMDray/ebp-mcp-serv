@echo off
echo ========================================
echo PACKAGE PRODUCTION SECURISE ET PROPRE
echo ========================================

REM Nettoyer anciens packages
if exist C:\Temp\ebp-mcp-clean rmdir /s /q C:\Temp\ebp-mcp-clean
if exist C:\Temp\ebp-mcp-production-final.zip del C:\Temp\ebp-mcp-production-final.zip

REM Créer structure propre
mkdir C:\Temp\ebp-mcp-clean
mkdir C:\Temp\ebp-mcp-clean\dist
mkdir C:\Temp\ebp-mcp-clean\dist\tools
mkdir C:\Temp\ebp-mcp-clean\dist\utils
mkdir C:\Temp\ebp-mcp-clean\logs

echo COPIE FICHIERS ESSENTIELS UNIQUEMENT...

REM Fichiers core OBLIGATOIRES
copy dist\index.* C:\Temp\ebp-mcp-clean\dist\ >nul
copy dist\database.* C:\Temp\ebp-mcp-clean\dist\ >nul
copy dist\config.* C:\Temp\ebp-mcp-clean\dist\ >nul
copy dist\logger.* C:\Temp\ebp-mcp-clean\dist\ >nul

REM Outils MCP (fonctionnalités métier)
copy dist\tools\*.* C:\Temp\ebp-mcp-clean\dist\tools\ >nul
copy dist\utils\*.* C:\Temp\ebp-mcp-clean\dist\utils\ >nul

echo   • Fichiers core et outils copies

REM Node_modules complet
echo   • Copie node_modules (patientez...)
xcopy /s /e /i /q node_modules C:\Temp\ebp-mcp-clean\node_modules >nul

REM Configuration
copy package.json C:\Temp\ebp-mcp-clean\ >nul
copy package-lock.json C:\Temp\ebp-mcp-clean\ >nul

echo   • Configuration copiee

REM Template .env pour production
copy .env.production.template C:\Temp\ebp-mcp-clean\ >nul

REM README pour installation
echo # EBP MCP SERVER - PRODUCTION > C:\Temp\ebp-mcp-clean\README_INSTALL.txt
echo. >> C:\Temp\ebp-mcp-clean\README_INSTALL.txt
echo INSTALLATION RAPIDE: >> C:\Temp\ebp-mcp-clean\README_INSTALL.txt
echo 1. Copier .env.production.template vers .env >> C:\Temp\ebp-mcp-clean\README_INSTALL.txt
echo 2. Modifier .env avec vos parametres de production >> C:\Temp\ebp-mcp-clean\README_INSTALL.txt
echo 3. Tester: node dist\index.js >> C:\Temp\ebp-mcp-clean\README_INSTALL.txt
echo 4. Configurer Claude Desktop >> C:\Temp\ebp-mcp-clean\README_INSTALL.txt
echo. >> C:\Temp\ebp-mcp-clean\README_INSTALL.txt
echo SECURITE: Mot de passe obligatoire dans .env ! >> C:\Temp\ebp-mcp-clean\README_INSTALL.txt

echo   • Documentation ajoutee

REM Créer ZIP final
echo.
echo CREATION ZIP FINAL...
powershell -Command "Compress-Archive -Path 'C:\Temp\ebp-mcp-clean\*' -DestinationPath 'C:\Temp\ebp-mcp-production-final.zip' -Force"

REM Statistiques
for /f %%A in ('dir /s /b C:\Temp\ebp-mcp-clean\dist\*.js ^| find /c ".js"') do set NB_FILES=%%A
echo.
echo ========================================
echo PACKAGE SECURISE CREE AVEC SUCCES!
echo ========================================
echo Fichier: C:\Temp\ebp-mcp-production-final.zip
echo Fichiers essentiels: %NB_FILES% (vs 72 avant nettoyage)
echo.
echo CONTENU:
echo   ✓ dist/core (index, database, config, logger)
echo   ✓ dist/tools (fonctionnalites MCP)
echo   ✓ dist/utils (utilitaires)
echo   ✓ node_modules (dependances)
echo   ✓ .env.production.template (A ADAPTER!)
echo   ✓ README_INSTALL.txt (instructions)
echo.
echo SECURITE: Plus de mot de passe dans le code !
echo OBLIGATION: Creer fichier .env sur la production
echo.
pause