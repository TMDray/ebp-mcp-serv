@echo off
echo ========================================
echo PACKAGE PRODUCTION SRV2024 - PRET A L'EMPLOI
echo ========================================

REM Nettoyer
if exist C:\Temp\ebp-mcp-srv2024 rmdir /s /q C:\Temp\ebp-mcp-srv2024
if exist C:\Temp\ebp-mcp-srv2024-ready.zip del C:\Temp\ebp-mcp-srv2024-ready.zip

REM Créer structure
mkdir C:\Temp\ebp-mcp-srv2024
mkdir C:\Temp\ebp-mcp-srv2024\dist
mkdir C:\Temp\ebp-mcp-srv2024\dist\tools
mkdir C:\Temp\ebp-mcp-srv2024\dist\utils
mkdir C:\Temp\ebp-mcp-srv2024\logs

echo COPIE FICHIERS OPTIMISES POUR SRV2024...

REM Fichiers core essentiels
copy dist\index.* C:\Temp\ebp-mcp-srv2024\dist\ >nul
copy dist\database.* C:\Temp\ebp-mcp-srv2024\dist\ >nul
copy dist\config.* C:\Temp\ebp-mcp-srv2024\dist\ >nul
copy dist\logger.* C:\Temp\ebp-mcp-srv2024\dist\ >nul

REM Outils MCP
copy dist\tools\*.* C:\Temp\ebp-mcp-srv2024\dist\tools\ >nul
copy dist\utils\*.* C:\Temp\ebp-mcp-srv2024\dist\utils\ >nul

echo   • Fichiers essentiels copies

REM Node_modules
echo   • Copie dependencies...
xcopy /s /e /i /q node_modules C:\Temp\ebp-mcp-srv2024\node_modules >nul

REM Configuration
copy package.json C:\Temp\ebp-mcp-srv2024\ >nul
copy package-lock.json C:\Temp\ebp-mcp-srv2024\ >nul

REM .env prêt pour SRV2024
copy .env.srv2024 C:\Temp\ebp-mcp-srv2024\.env >nul
copy .env.srv2024 C:\Temp\ebp-mcp-srv2024\.env.backup >nul

echo   • Configuration SRV2024 installee

REM Instructions
echo # SERVEUR MCP EBP - PRODUCTION SRV2024 > C:\Temp\ebp-mcp-srv2024\README.txt
echo. >> C:\Temp\ebp-mcp-srv2024\README.txt
echo INSTALLATION: >> C:\Temp\ebp-mcp-srv2024\README.txt
echo 1. Copier ce dossier vers C:\Services\EBP-MCP-Server\ >> C:\Temp\ebp-mcp-srv2024\README.txt
echo 2. Tester: node dist\index.js >> C:\Temp\ebp-mcp-srv2024\README.txt
echo 3. Si OK, configurer Claude Desktop >> C:\Temp\ebp-mcp-srv2024\README.txt
echo. >> C:\Temp\ebp-mcp-srv2024\README.txt
echo SECURITE: Mot de passe dans .env (non versionne) >> C:\Temp\ebp-mcp-srv2024\README.txt
echo SERVEUR: Pre-configure pour SRV2024\EBP >> C:\Temp\ebp-mcp-srv2024\README.txt

REM ZIP final
echo.
echo CREATION ARCHIVE...
powershell -Command "Compress-Archive -Path 'C:\Temp\ebp-mcp-srv2024\*' -DestinationPath 'C:\Temp\ebp-mcp-srv2024-ready.zip' -Force"

echo.
echo ========================================
echo PACKAGE SRV2024 CREE!
echo ========================================
echo Fichier: C:\Temp\ebp-mcp-srv2024-ready.zip
echo.
echo PRET POUR PRODUCTION:
echo   ✓ Serveur: SRV2024\EBP (pre-configure)
echo   ✓ Fichier .env inclus et pret
echo   ✓ Package minimal et securise
echo   ✓ Instructions incluses
echo.
echo Il suffit d'extraire et tester !
pause