@echo off
echo ========================================
echo PACKAGE PRODUCTION SRV2024 - VERSION AMELIOREE
echo ========================================

REM Nettoyer
if exist C:\Temp\ebp-mcp-srv2024-v2 rmdir /s /q C:\Temp\ebp-mcp-srv2024-v2
if exist C:\Temp\ebp-mcp-srv2024-v2-ready.zip del C:\Temp\ebp-mcp-srv2024-v2-ready.zip

REM Créer structure
mkdir C:\Temp\ebp-mcp-srv2024-v2
mkdir C:\Temp\ebp-mcp-srv2024-v2\dist
mkdir C:\Temp\ebp-mcp-srv2024-v2\dist\tools
mkdir C:\Temp\ebp-mcp-srv2024-v2\dist\utils
mkdir C:\Temp\ebp-mcp-srv2024-v2\logs

echo COPIE FICHIERS AVEC VERIFICATION D'ERREURS...

REM Fichiers core essentiels
echo   • Copie des fichiers dist...
copy dist\index.* C:\Temp\ebp-mcp-srv2024-v2\dist\
if errorlevel 1 echo ERREUR: Copie index.* failed
copy dist\database.* C:\Temp\ebp-mcp-srv2024-v2\dist\
if errorlevel 1 echo ERREUR: Copie database.* failed
copy dist\config.* C:\Temp\ebp-mcp-srv2024-v2\dist\
if errorlevel 1 echo ERREUR: Copie config.* failed
copy dist\logger.* C:\Temp\ebp-mcp-srv2024-v2\dist\
if errorlevel 1 echo ERREUR: Copie logger.* failed

REM Outils MCP
echo   • Copie des outils MCP...
copy dist\tools\*.* C:\Temp\ebp-mcp-srv2024-v2\dist\tools\
if errorlevel 1 echo ERREUR: Copie tools failed
copy dist\utils\*.* C:\Temp\ebp-mcp-srv2024-v2\dist\utils\
if errorlevel 1 echo ERREUR: Copie utils failed

REM Configuration CRITIQUE
echo   • Copie package.json et package-lock.json...
copy package.json C:\Temp\ebp-mcp-srv2024-v2\
if errorlevel 1 (
    echo ERREUR CRITIQUE: package.json non copie !
    pause
    exit /b 1
)
copy package-lock.json C:\Temp\ebp-mcp-srv2024-v2\
if errorlevel 1 echo ATTENTION: package-lock.json non copie

REM .env prêt pour SRV2024
echo   • Copie configuration .env...
copy .env.srv2024 C:\Temp\ebp-mcp-srv2024-v2\.env
if errorlevel 1 (
    echo ERREUR CRITIQUE: .env.srv2024 non copie !
    pause
    exit /b 1
)
copy .env.srv2024 C:\Temp\ebp-mcp-srv2024-v2\.env.backup

echo   • Configuration SRV2024 installee avec succes

REM Instructions améliorées
echo # SERVEUR MCP EBP - PRODUCTION SRV2024 - VERSION AMELIOREE > C:\Temp\ebp-mcp-srv2024-v2\README.txt
echo. >> C:\Temp\ebp-mcp-srv2024-v2\README.txt
echo INSTALLATION: >> C:\Temp\ebp-mcp-srv2024-v2\README.txt
echo 1. Copier ce dossier vers C:\Services\EBP-MCP-Server\ >> C:\Temp\ebp-mcp-srv2024-v2\README.txt
echo 2. cd C:\Services\EBP-MCP-Server >> C:\Temp\ebp-mcp-srv2024-v2\README.txt
echo 3. npm install --production >> C:\Temp\ebp-mcp-srv2024-v2\README.txt
echo 4. Tester: node dist\index.js >> C:\Temp\ebp-mcp-srv2024-v2\README.txt
echo 5. Si OK, configurer Claude Desktop >> C:\Temp\ebp-mcp-srv2024-v2\README.txt
echo. >> C:\Temp\ebp-mcp-srv2024-v2\README.txt
echo SECURITE: Mot de passe dans .env (non versionne) >> C:\Temp\ebp-mcp-srv2024-v2\README.txt
echo SERVEUR: Pre-configure pour SRV2024\EBP >> C:\Temp\ebp-mcp-srv2024-v2\README.txt
echo NODE_MODULES: A installer avec npm install sur le serveur >> C:\Temp\ebp-mcp-srv2024-v2\README.txt

REM Script d'installation automatique
echo @echo off > C:\Temp\ebp-mcp-srv2024-v2\install.bat
echo echo Installation dependencies EBP MCP Server... >> C:\Temp\ebp-mcp-srv2024-v2\install.bat
echo npm install --production >> C:\Temp\ebp-mcp-srv2024-v2\install.bat
echo if errorlevel 1 ( >> C:\Temp\ebp-mcp-srv2024-v2\install.bat
echo   echo ERREUR: Installation npm failed >> C:\Temp\ebp-mcp-srv2024-v2\install.bat
echo   pause >> C:\Temp\ebp-mcp-srv2024-v2\install.bat
echo   exit /b 1 >> C:\Temp\ebp-mcp-srv2024-v2\install.bat
echo ) >> C:\Temp\ebp-mcp-srv2024-v2\install.bat
echo echo Installation reussie ! >> C:\Temp\ebp-mcp-srv2024-v2\install.bat
echo echo Test du serveur... >> C:\Temp\ebp-mcp-srv2024-v2\install.bat
echo timeout /t 2 /nobreak >> C:\Temp\ebp-mcp-srv2024-v2\install.bat
echo node dist\index.js >> C:\Temp\ebp-mcp-srv2024-v2\install.bat

REM ZIP final
echo.
echo CREATION ARCHIVE...
powershell -Command "Compress-Archive -Path 'C:\Temp\ebp-mcp-srv2024-v2\*' -DestinationPath 'C:\Temp\ebp-mcp-srv2024-v2-ready.zip' -Force"

echo.
echo ========================================
echo PACKAGE SRV2024 V2 CREE!
echo ========================================
echo Fichier: C:\Temp\ebp-mcp-srv2024-v2-ready.zip
echo.
echo PRET POUR PRODUCTION:
echo   ✓ Serveur: SRV2024\EBP (pre-configure)
echo   ✓ Fichier .env inclus et pret
echo   ✓ Package.json inclus (VERIFIE)
echo   ✓ Script install.bat inclus
echo   ✓ Pas de node_modules corrompus
echo   ✓ Instructions detaillees
echo.
echo INSTALLATION SUR SERVEUR:
echo 1. Extraire le ZIP
echo 2. Executer install.bat
echo 3. Configurer Claude Desktop
pause