@echo off
echo ========================================
echo CREATION PACKAGE PRODUCTION PROPRE
echo ========================================

REM Nettoyer
if exist C:\Temp\ebp-mcp-clean rmdir /s /q C:\Temp\ebp-mcp-clean
if exist C:\Temp\ebp-mcp-production-clean.zip del C:\Temp\ebp-mcp-production-clean.zip

REM Créer structure
mkdir C:\Temp\ebp-mcp-clean
mkdir C:\Temp\ebp-mcp-clean\dist
mkdir C:\Temp\ebp-mcp-clean\dist\tools
mkdir C:\Temp\ebp-mcp-clean\dist\utils
mkdir C:\Temp\ebp-mcp-clean\logs

echo Copie fichiers essentiels uniquement...

REM Copier SEULEMENT les fichiers nécessaires
copy dist\index.* C:\Temp\ebp-mcp-clean\dist\
copy dist\database.* C:\Temp\ebp-mcp-clean\dist\
copy dist\config.* C:\Temp\ebp-mcp-clean\dist\
copy dist\logger.* C:\Temp\ebp-mcp-clean\dist\
xcopy /s /i dist\tools C:\Temp\ebp-mcp-clean\dist\tools
xcopy /s /i dist\utils C:\Temp\ebp-mcp-clean\dist\utils

REM Copier node_modules et config
echo Copie node_modules...
xcopy /s /e /i /q node_modules C:\Temp\ebp-mcp-clean\node_modules
copy package.json C:\Temp\ebp-mcp-clean\
copy package-lock.json C:\Temp\ebp-mcp-clean\

REM Créer .env template AVEC LES BONNES VARIABLES
echo # CONFIGURATION OBLIGATOIRE PRODUCTION > C:\Temp\ebp-mcp-clean\.env.template
echo # Remplacer par vos valeurs reelles >> C:\Temp\ebp-mcp-clean\.env.template
echo. >> C:\Temp\ebp-mcp-clean\.env.template
echo EBP_SERVER=VOTRE_SERVEUR\INSTANCE >> C:\Temp\ebp-mcp-clean\.env.template
echo EBP_DATABASE=VOTRE_BASE_PRODUCTION >> C:\Temp\ebp-mcp-clean\.env.template
echo EBP_USER=sa >> C:\Temp\ebp-mcp-clean\.env.template
echo EBP_PASSWORD=VOTRE_MOT_DE_PASSE >> C:\Temp\ebp-mcp-clean\.env.template
echo EBP_PORT=1433 >> C:\Temp\ebp-mcp-clean\.env.template

REM ZIP
echo Creation ZIP...
powershell -Command "Compress-Archive -Path 'C:\Temp\ebp-mcp-clean\*' -DestinationPath 'C:\Temp\ebp-mcp-production-clean.zip' -Force"

echo.
echo ========================================
echo PACKAGE PROPRE CREE !
echo ========================================
echo Fichier: C:\Temp\ebp-mcp-production-clean.zip
echo.
echo ATTENTION: Vous DEVEZ creer un fichier .env sur la production !
echo Copier .env.template vers .env et modifier les valeurs
echo.
pause