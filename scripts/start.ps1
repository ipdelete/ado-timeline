$ErrorActionPreference = 'Stop'

$token = az account get-access-token --resource 499b84ac-1321-427f-aa17-267ca6975798 --query accessToken -o tsv
if (-not $token) { Write-Error "Failed to get ADO token. Run 'az login' first."; exit 1 }

$repoRoot = Split-Path $PSScriptRoot
$envPath = Join-Path $repoRoot '.env'
$lines = Get-Content $envPath | Where-Object { $_ -notmatch '^ADO_TOKEN=' }
$lines += "ADO_TOKEN=$token"
$lines | Set-Content $envPath

Write-Host "Token written to .env (expires in ~1h)"
Write-Host "Serving on http://localhost:8080 ..."
Push-Location (Join-Path $repoRoot 'src\ui')
python -m http.server 8080
Pop-Location
