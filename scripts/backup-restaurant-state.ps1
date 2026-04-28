$ErrorActionPreference = "Stop"

# Run from repo root:
#   .\scripts\backup-restaurant-state.ps1
#
# Creates a timestamped backup folder containing:
# - MySQL dump (source of truth for migrated Mongo data)
# - Uploaded restaurant photos copied from full-api pod

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupRoot = "backups\restaurant-state\$stamp"
$photosLocal = Join-Path $backupRoot "uploads"
$sqlLocal = Join-Path $backupRoot "yelp_db.sql"

New-Item -ItemType Directory -Force -Path $photosLocal | Out-Null

$mysqlPod = (kubectl get pod -l app=mysql -o jsonpath="{.items[0].metadata.name}")
if (-not $mysqlPod) {
  throw "MySQL pod not found."
}

$fullApiPod = (kubectl get pod -l app=full-api -o jsonpath="{.items[0].metadata.name}")
if (-not $fullApiPod) {
  throw "full-api pod not found."
}

Write-Host "Backing up SQL from pod: $mysqlPod"
kubectl exec $mysqlPod -- sh -c "mysqldump -uroot -proot yelp_db" | Out-File -FilePath $sqlLocal -Encoding utf8

Write-Host "Backing up uploads from pod: $fullApiPod"
kubectl cp "${fullApiPod}:/app/uploads" $photosLocal

Write-Host ""
Write-Host "Backup complete: $backupRoot"
Write-Host " - SQL: $sqlLocal"
Write-Host " - Uploads: $photosLocal"
