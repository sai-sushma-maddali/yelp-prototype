# Run from repo root: .\scripts\push-eks-images.ps1
$ErrorActionPreference = "Stop"
$Account = "177044824844"
$Region = "us-east-1"
$Registry = "$Account.dkr.ecr.$Region.amazonaws.com"

aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin $Registry

$repos = @("yelp/user-api", "yelp/restaurant-api", "yelp/review-api", "yelp/restaurant-owner-api", "yelp/full-api")
foreach ($r in $repos) {
  aws ecr create-repository --repository-name $r --region $Region 2>$null
}

docker build -t yelp/user-api:latest -f services/user-api/Dockerfile backend
docker build -t yelp/restaurant-api:latest -f services/restaurant-api/Dockerfile backend
docker build -t yelp/review-api:latest -f services/review-api/Dockerfile backend
docker build -t yelp/restaurant-owner-api:latest -f services/restaurant-owner-api/Dockerfile backend
docker build -t yelp/full-api:latest -f backend/Dockerfile backend

docker tag yelp/user-api:latest "$Registry/yelp/user-api:latest"
docker tag yelp/restaurant-api:latest "$Registry/yelp/restaurant-api:latest"
docker tag yelp/review-api:latest "$Registry/yelp/review-api:latest"
docker tag yelp/restaurant-owner-api:latest "$Registry/yelp/restaurant-owner-api:latest"
docker tag yelp/full-api:latest "$Registry/yelp/full-api:latest"

docker push "$Registry/yelp/user-api:latest"
docker push "$Registry/yelp/restaurant-api:latest"
docker push "$Registry/yelp/review-api:latest"
docker push "$Registry/yelp/restaurant-owner-api:latest"
docker push "$Registry/yelp/full-api:latest"

Write-Host "Done. Apply: kubectl apply -f k8s/app-services.yaml && kubectl apply -f k8s/full-api.yaml"
