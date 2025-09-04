# Guide Maintenance Personnel - Serveur MCP EBP

## 📍 Emplacements des Logs

### Logs Principaux du Serveur MCP

#### 1. Logs d'Application (si configurés)
```powershell
# Emplacement principal
C:\Services\EBP-MCP-Server\logs\

# Types de fichiers :
# - app.log : Logs généraux d'application
# - error.log : Erreurs uniquement
# - access.log : Requêtes utilisateur
# - sql.log : Requêtes SQL exécutées (si debug activé)
```

#### 2. Logs Console (si pas de service Windows)
```powershell
# Lancer avec redirection des logs
cd C:\Services\EBP-MCP-Server
node dist/index.js > logs\console.log 2>&1
```

#### 3. Logs Service Windows
```powershell
# Logs du service Windows (si installé avec NSSM)
Get-EventLog -LogName Application -Source "EBP-MCP-Server" -Newest 50

# Ou dans l'Event Viewer Windows :
eventvwr.msc
# → Applications and Services Logs → EBP-MCP-Server
```

#### 4. Logs Claude Desktop
```powershell
# Logs Claude Desktop (pour debug connexion MCP)
%APPDATA%\Claude\logs\

# Ou généralement :
C:\Users\[USERNAME]\AppData\Roaming\Claude\logs\
```

#### 5. Logs SQL Server (pour requêtes lentes)
```sql
-- Sur le serveur SQL
SELECT TOP 100
    qs.execution_count,
    qs.total_elapsed_time / 1000000 as total_seconds,
    qs.total_elapsed_time / qs.execution_count / 1000000.0 as avg_seconds,
    SUBSTRING(qt.text, (qs.statement_start_offset/2)+1,
        ((CASE qs.statement_end_offset
            WHEN -1 THEN DATALENGTH(qt.text)
            ELSE qs.statement_end_offset
        END - qs.statement_start_offset)/2) + 1) as query_text
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) qt
WHERE qt.text LIKE '%SaleDocument%'
ORDER BY qs.total_elapsed_time DESC;
```

---

## 🔧 Routine de Maintenance

### QUOTIDIEN (5 minutes)

#### Matin - Vérification Santé
```powershell
# Script de vérification quotidienne
function Check-Daily {
    Write-Host "=== CHECK QUOTIDIEN ===" -ForegroundColor Cyan
    
    # 1. Vérifier le service
    $service = Get-Service "EBP-MCP-Server" -ErrorAction SilentlyContinue
    if ($service) {
        Write-Host "Service Status: $($service.Status)" -ForegroundColor $(if($service.Status -eq "Running"){"Green"}else{"Red"})
    } else {
        Write-Host "Mode Console (pas de service)" -ForegroundColor Yellow
    }
    
    # 2. Vérifier l'espace disque
    $disk = Get-PSDrive C
    $freeGB = [math]::Round($disk.Free / 1GB, 2)
    Write-Host "Espace disque libre: $freeGB GB" -ForegroundColor $(if($freeGB -gt 10){"Green"}else{"Red"})
    
    # 3. Vérifier la taille des logs
    $logPath = "C:\Services\EBP-MCP-Server\logs"
    if (Test-Path $logPath) {
        $logSize = (Get-ChildItem $logPath -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Host "Taille totale logs: $([math]::Round($logSize, 2)) MB" -ForegroundColor $(if($logSize -lt 100){"Green"}else{"Yellow"})
    }
    
    # 4. Vérifier les erreurs récentes
    $errorLog = "$logPath\error.log"
    if (Test-Path $errorLog) {
        $recentErrors = Get-Content $errorLog -Tail 10 | Where-Object {$_ -match "ERROR"}
        if ($recentErrors) {
            Write-Host "⚠️ Erreurs récentes détectées!" -ForegroundColor Red
            $recentErrors | Select-Object -First 3
        } else {
            Write-Host "✅ Pas d'erreurs récentes" -ForegroundColor Green
        }
    }
    
    # 5. Test rapide de connexion SQL
    try {
        $conn = New-Object System.Data.SqlClient.SqlConnection
        $conn.ConnectionString = "Server=SRVDEV2025\EBP;Database=BIJOU_X3;Integrated Security=true;TrustServerCertificate=true"
        $conn.Open()
        $conn.Close()
        Write-Host "✅ Connexion SQL OK" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erreur connexion SQL!" -ForegroundColor Red
    }
}

# Exécuter
Check-Daily
```

### HEBDOMADAIRE (15 minutes)

#### Lundi Matin - Maintenance Préventive
```powershell
function Maintenance-Weekly {
    Write-Host "=== MAINTENANCE HEBDOMADAIRE ===" -ForegroundColor Cyan
    
    # 1. Rotation des logs (garder 30 jours)
    $logPath = "C:\Services\EBP-MCP-Server\logs"
    $oldDate = (Get-Date).AddDays(-30)
    
    Get-ChildItem "$logPath\*.log" | Where-Object {$_.LastWriteTime -lt $oldDate} | ForEach-Object {
        Write-Host "Archivage: $($_.Name)"
        Move-Item $_.FullName "$logPath\archive\$($_.Name).old" -Force
    }
    
    # 2. Nettoyage des logs Claude Desktop
    $claudeLogs = "$env:APPDATA\Claude\logs"
    if (Test-Path $claudeLogs) {
        Get-ChildItem $claudeLogs -Filter "*.log" | 
            Where-Object {$_.LastWriteTime -lt (Get-Date).AddDays(-7)} | 
            Remove-Item -Force
        Write-Host "✅ Logs Claude nettoyés"
    }
    
    # 3. Analyse performance
    $perfLog = @"
    Date: $(Get-Date)
    CPU Moyen: $((Get-Counter "\Process(node*)\% Processor Time").CounterSamples.CookedValue)%
    RAM Utilisée: $([math]::Round((Get-Process node -ErrorAction SilentlyContinue).WorkingSet64 / 1MB, 2)) MB
"@
    $perfLog | Out-File "$logPath\performance_weekly.log" -Append
    
    # 4. Backup configuration
    $backupPath = "C:\Services\EBP-MCP-Server\backups\$(Get-Date -Format 'yyyy-MM-dd')"
    New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
    
    Copy-Item "C:\Services\EBP-MCP-Server\.env" "$backupPath\.env.backup"
    Copy-Item "$env:APPDATA\Claude\claude_desktop_config.json" "$backupPath\claude_config.backup"
    Write-Host "✅ Backup configuration effectué dans $backupPath"
    
    # 5. Redémarrage préventif du service
    $response = Read-Host "Redémarrer le service maintenant ? (O/N)"
    if ($response -eq 'O') {
        Restart-Service "EBP-MCP-Server"
        Write-Host "✅ Service redémarré"
    }
}

# Exécuter
Maintenance-Weekly
```

### MENSUEL (30 minutes)

#### Premier Lundi du Mois
```powershell
function Maintenance-Monthly {
    Write-Host "=== MAINTENANCE MENSUELLE ===" -ForegroundColor Cyan
    
    # 1. Mise à jour des dépendances
    Write-Host "Vérification des mises à jour npm..."
    cd C:\Services\EBP-MCP-Server
    npm outdated
    
    $update = Read-Host "Mettre à jour les dépendances ? (O/N)"
    if ($update -eq 'O') {
        npm update
        npm audit fix
        npm run build
        Write-Host "✅ Dépendances mises à jour"
    }
    
    # 2. Analyse des requêtes SQL lentes
    Write-Host "`nAnalyse des requêtes lentes..."
    # Créer rapport des requêtes > 5 secondes
    
    # 3. Rapport d'utilisation
    $startDate = (Get-Date).AddMonths(-1)
    $report = @"
    
    === RAPPORT MENSUEL ===
    Période: $($startDate.ToString('yyyy-MM')) 
    
    Statistiques:
    - Nombre total de requêtes: $(Get-Content "$logPath\access.log" | Measure-Object -Line).Lines
    - Erreurs totales: $(Get-Content "$logPath\error.log" | Select-String "ERROR" | Measure-Object -Line).Lines
    - Taille totale logs: $([math]::Round((Get-ChildItem $logPath -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB, 2)) MB
    
    Top 5 requêtes les plus fréquentes:
    $(Get-Content "$logPath\access.log" | Group-Object | Sort-Object Count -Descending | Select-Object -First 5 | Format-Table -AutoSize | Out-String)
"@
    
    $report | Out-File "C:\Services\EBP-MCP-Server\reports\monthly_$(Get-Date -Format 'yyyy-MM').txt"
    Write-Host $report
    
    # 4. Test complet
    Write-Host "`nTest complet du système..."
    node C:\Services\EBP-MCP-Server\dist\test-connection.js
    
    # 5. Vérification de sécurité
    Write-Host "`nVérification sécurité..."
    # Vérifier que .env n'est pas dans git
    cd C:\Services\EBP-MCP-Server
    git status --ignored | Select-String ".env"
    
    Write-Host "✅ Maintenance mensuelle terminée"
}

# Exécuter
Maintenance-Monthly
```

---

## 🚨 Résolution de Problèmes

### Problème : Service ne démarre pas

```powershell
# 1. Vérifier les logs Windows
Get-EventLog -LogName Application -Source "EBP-MCP-Server" -Newest 20

# 2. Tester en mode console pour voir l'erreur
cd C:\Services\EBP-MCP-Server
node dist/index.js

# 3. Vérifier le fichier .env
Get-Content .env

# 4. Recréer le service si nécessaire
.\nssm.exe remove "EBP-MCP-Server" confirm
.\nssm.exe install "EBP-MCP-Server" "C:\Program Files\nodejs\node.exe"
```

### Problème : Erreurs SQL fréquentes

```powershell
# 1. Identifier les requêtes problématiques
Get-Content C:\Services\EBP-MCP-Server\logs\sql.log | Select-String "error" -Context 2,2

# 2. Tester la connexion manuellement
$conn = New-Object System.Data.SqlClient.SqlConnection
$conn.ConnectionString = "Server=SRVDEV2025\EBP;Database=BIJOU_X3;Integrated Security=true"
try {
    $conn.Open()
    Write-Host "Connexion OK"
    $conn.Close()
} catch {
    Write-Host "Erreur: $_"
}

# 3. Vérifier les permissions SQL
sqlcmd -S SRVDEV2025\EBP -d BIJOU_X3 -Q "SELECT * FROM fn_my_permissions(NULL, 'DATABASE')"
```

### Problème : Claude Desktop ne répond pas

```powershell
# 1. Vérifier la config
Get-Content "$env:APPDATA\Claude\claude_desktop_config.json" | ConvertFrom-Json | Format-List

# 2. Vérifier que le serveur MCP tourne
Get-Process | Where-Object {$_.Name -like "*node*"}

# 3. Relancer Claude Desktop
Stop-Process -Name "Claude*" -Force
Start-Process "claude.exe"  # Ou via le raccourci

# 4. Vérifier les logs Claude
Get-Content "$env:APPDATA\Claude\logs\main.log" -Tail 50
```

### Problème : Performance dégradée

```powershell
# 1. Analyser l'utilisation CPU/RAM
Get-Process node | Select-Object CPU, WorkingSet64, 
    @{n='RAM(MB)';e={$_.WorkingSet64/1MB}},
    @{n='CPU(%)';e={$_.CPU}}

# 2. Identifier les requêtes lentes
Get-Content C:\Services\EBP-MCP-Server\logs\performance.log | 
    Where-Object {$_ -match "duration: (\d+)ms" -and $Matches[1] -gt 3000}

# 3. Nettoyer le cache Node.js
Remove-Item C:\Services\EBP-MCP-Server\node_modules\.cache -Recurse -Force

# 4. Redémarrer le service
Restart-Service "EBP-MCP-Server"
```

---

## 📊 Scripts de Monitoring

### Monitor en Temps Réel
```powershell
# Créer C:\Services\EBP-MCP-Server\scripts\monitor.ps1
while ($true) {
    Clear-Host
    Write-Host "=== EBP MCP Monitor - $(Get-Date -Format 'HH:mm:ss') ===" -ForegroundColor Cyan
    
    # Status service
    $svc = Get-Service "EBP-MCP-Server" -ErrorAction SilentlyContinue
    if ($svc) {
        Write-Host "Service: $($svc.Status)" -ForegroundColor $(if($svc.Status -eq "Running"){"Green"}else{"Red"})
    }
    
    # Process info
    $proc = Get-Process node -ErrorAction SilentlyContinue | Where-Object {$_.Path -like "*EBP-MCP*"}
    if ($proc) {
        Write-Host "PID: $($proc.Id)"
        Write-Host "CPU: $([math]::Round($proc.CPU, 2))%"
        Write-Host "RAM: $([math]::Round($proc.WorkingSet64/1MB, 2)) MB"
        Write-Host "Threads: $($proc.Threads.Count)"
    }
    
    # Dernières erreurs
    $errorLog = "C:\Services\EBP-MCP-Server\logs\error.log"
    if (Test-Path $errorLog) {
        $lastError = Get-Content $errorLog -Tail 1
        if ($lastError) {
            Write-Host "`nDernière erreur:" -ForegroundColor Yellow
            Write-Host $lastError
        }
    }
    
    # Dernière requête
    $accessLog = "C:\Services\EBP-MCP-Server\logs\access.log"
    if (Test-Path $accessLog) {
        $lastAccess = Get-Content $accessLog -Tail 1
        if ($lastAccess) {
            Write-Host "`nDernière requête:" -ForegroundColor Cyan
            Write-Host $lastAccess
        }
    }
    
    Start-Sleep -Seconds 5
}
```

### Dashboard de Santé
```powershell
function Show-Dashboard {
    $metrics = @{}
    
    # Collecter les métriques
    $metrics.Service = (Get-Service "EBP-MCP-Server" -ErrorAction SilentlyContinue).Status
    $metrics.Uptime = if ($metrics.Service -eq "Running") {
        $proc = Get-Process node -ErrorAction SilentlyContinue | Where-Object {$_.Path -like "*EBP-MCP*"}
        if ($proc) { (Get-Date) - $proc.StartTime }
    }
    $metrics.LogSize = [math]::Round((Get-ChildItem "C:\Services\EBP-MCP-Server\logs" -Recurse | 
        Measure-Object -Property Length -Sum).Sum / 1MB, 2)
    $metrics.ErrorsToday = (Get-Content "C:\Services\EBP-MCP-Server\logs\error.log" | 
        Where-Object {$_ -match (Get-Date).ToString('yyyy-MM-dd')} | Measure-Object).Count
    $metrics.RequestsToday = (Get-Content "C:\Services\EBP-MCP-Server\logs\access.log" | 
        Where-Object {$_ -match (Get-Date).ToString('yyyy-MM-dd')} | Measure-Object).Count
    
    # Afficher le dashboard
    Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║       EBP MCP SERVER DASHBOARD         ║" -ForegroundColor Cyan
    Write-Host "╠════════════════════════════════════════╣" -ForegroundColor Cyan
    Write-Host "║ Status: $($metrics.Service.ToString().PadRight(31))║" -ForegroundColor $(if($metrics.Service -eq "Running"){"Green"}else{"Red"})
    Write-Host "║ Uptime: $($metrics.Uptime.ToString().PadRight(31))║"
    Write-Host "║ Logs Size: $($metrics.LogSize.ToString().PadRight(28)) MB║"
    Write-Host "║ Errors Today: $($metrics.ErrorsToday.ToString().PadRight(25))║" -ForegroundColor $(if($metrics.ErrorsToday -gt 10){"Yellow"}else{"White"})
    Write-Host "║ Requests Today: $($metrics.RequestsToday.ToString().PadRight(23))║"
    Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
}

# Exécuter
Show-Dashboard
```

---

## 🔐 Sauvegardes

### Script de Backup Automatique
```powershell
# Créer C:\Services\EBP-MCP-Server\scripts\backup.ps1
$backupRoot = "C:\Services\EBP-MCP-Server\backups"
$date = Get-Date -Format "yyyy-MM-dd_HHmm"
$backupPath = "$backupRoot\backup_$date"

# Créer le dossier
New-Item -ItemType Directory -Path $backupPath -Force

# Sauvegarder les fichiers critiques
Copy-Item "C:\Services\EBP-MCP-Server\.env" "$backupPath\"
Copy-Item "C:\Services\EBP-MCP-Server\package.json" "$backupPath\"
Copy-Item "$env:APPDATA\Claude\claude_desktop_config.json" "$backupPath\"

# Compresser
Compress-Archive -Path $backupPath -DestinationPath "$backupRoot\backup_$date.zip"
Remove-Item $backupPath -Recurse

# Nettoyer les vieux backups (garder 30 jours)
Get-ChildItem "$backupRoot\*.zip" | 
    Where-Object {$_.LastWriteTime -lt (Get-Date).AddDays(-30)} | 
    Remove-Item

Write-Host "✅ Backup créé: $backupRoot\backup_$date.zip"
```

---

## 📝 Notes Importantes

1. **Toujours tester en mode console** avant de diagnostiquer un problème service
2. **Sauvegarder .env** avant toute modification
3. **Logs SQL sensibles** : Ne jamais commiter ou partager
4. **Redémarrage mensuel** recommandé pour éviter les fuites mémoire
5. **Monitor CPU** : Si > 50% constant, investiguer les requêtes

---

*Document créé le 09/01/2025 - À usage personnel uniquement*