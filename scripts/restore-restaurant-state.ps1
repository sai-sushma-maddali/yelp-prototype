$ErrorActionPreference = "Stop"

param(
  [Parameter(Mandatory = $true)]
  [string]$BackupPath
)

# Run from repo root, example:
#   .\scripts\restore-restaurant-state.ps1 -BackupPath "backups\restaurant-state\20260427-113000"
#
# Restores:
# - MySQL DB from backup SQL
# - Mongo collections via migrate_to_mongo
# - Uploaded images into full-api pod filesystem

$sqlPath = Join-Path $BackupPath "yelp_db.sql"
$uploadsPath = Join-Path $BackupPath "uploads"

if (-not (Test-Path $sqlPath)) {
  throw "SQL file not found at $sqlPath"
}
if (-not (Test-Path $uploadsPath)) {
  throw "Uploads folder not found at $uploadsPath"
}

$mysqlPod = (kubectl get pod -l app=mysql -o jsonpath="{.items[0].metadata.name}")
if (-not $mysqlPod) {
  throw "MySQL pod not found."
}
$fullApiPod = (kubectl get pod -l app=full-api -o jsonpath="{.items[0].metadata.name}")
if (-not $fullApiPod) {
  throw "full-api pod not found."
}

Write-Host "Restoring SQL into pod: $mysqlPod"
kubectl cp $sqlPath "${mysqlPod}:/tmp/yelp_db_restore.sql"
kubectl exec $mysqlPod -- sh -c "mysql -uroot -proot yelp_db < /tmp/yelp_db_restore.sql"

Write-Host "Migrating restored MySQL data into Mongo"
kubectl exec deployment/full-api -- python -m app.migrate_to_mongo

Write-Host "Restoring uploads into pod: $fullApiPod"
kubectl cp $uploadsPath "${fullApiPod}:/app/uploads"
kubectl exec $fullApiPod -- sh -c "mkdir -p /app/uploads/restaurant_photos && if [ -d /app/uploads/uploads/restaurant_photos ]; then cp -r /app/uploads/uploads/restaurant_photos/* /app/uploads/restaurant_photos/; fi"

Write-Host ""
Write-Host "Restore complete from: $BackupPath"
