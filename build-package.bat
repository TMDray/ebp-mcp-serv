@echo off
echo ========================================
echo CREATION PACKAGE PRODUCTION EBP MCP
echo ========================================

REM Nettoyer ancien package
if exist C:\Temp\ebp-mcp-deploy rmdir /s /q C:\Temp\ebp-mcp-deploy
if exist C:\Temp\ebp-mcp-production.zip del C:\Temp\ebp-mcp-production.zip

REM Créer dossier temporaire
echo.
echo Creation du dossier temporaire...
mkdir C:\Temp\ebp-mcp-deploy

REM Copier les fichiers
echo.
echo Copie de dist...
xcopy /s /e /i dist C:\Temp\ebp-mcp-deploy\dist

echo Copie de node_modules (patientez, cela peut prendre 1-2 minutes)...
xcopy /s /e /i /q node_modules C:\Temp\ebp-mcp-deploy\node_modules

echo Copie des fichiers de configuration...
copy package.json C:\Temp\ebp-mcp-deploy\
copy package-lock.json C:\Temp\ebp-mcp-deploy\

REM Créer dossier logs
mkdir C:\Temp\ebp-mcp-deploy\logs

REM Créer le ZIP avec PowerShell
echo.
echo Creation du fichier ZIP...
powershell -Command "Compress-Archive -Path 'C:\Temp\ebp-mcp-deploy\*' -DestinationPath 'C:\Temp\ebp-mcp-production.zip' -Force"

echo.
echo ========================================
echo PACKAGE CREE AVEC SUCCES!
echo ========================================
echo.
echo Fichier: C:\Temp\ebp-mcp-production.zip
echo.
echo A faire sur le serveur de production:
echo 1. Installer Node.js v18+
echo 2. Extraire le ZIP dans C:\Services\EBP-MCP-Server\
echo 3. Configurer la base de donnees si necessaire
echo 4. Tester avec: node dist\index.js
echo.
pause