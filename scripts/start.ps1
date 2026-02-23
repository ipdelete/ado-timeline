$ErrorActionPreference = 'Stop'

function ConvertTo-JsString([string]$value) {
  if ($null -eq $value) { return "''" }
  $escaped = $value.Replace('\', '\\').Replace("'", "\'")
  return "'$escaped'"
}

$token = az account get-access-token --resource 499b84ac-1321-427f-aa17-267ca6975798 --query accessToken -o tsv
if (-not $token) { Write-Error "Failed to get ADO token. Run 'az login' first."; exit 1 }

$repoRoot = Split-Path $PSScriptRoot
$envPath = Join-Path $repoRoot '.env'
if (-not (Test-Path $envPath)) { Write-Error "Missing .env at $envPath"; exit 1 }

$envValues = @{}
Get-Content $envPath | ForEach-Object {
  $line = $_.Trim()
  if (-not $line -or $line.StartsWith('#') -or -not $line.Contains('=')) { return }
  $parts = $line.Split('=', 2)
  $envValues[$parts[0]] = $parts[1]
}

$lines = Get-Content $envPath | Where-Object { $_ -notmatch '^ADO_TOKEN=' }
$lines += "ADO_TOKEN=$token"
$lines | Set-Content $envPath
$envValues['ADO_TOKEN'] = $token

$configPath = Join-Path $repoRoot 'src\ui\config.local.js'
$configJs = @(
  "window.__ADO_CONFIG = {"
  "  org: $(ConvertTo-JsString $envValues['ADO_ORG']),"
  "  project: $(ConvertTo-JsString $envValues['ADO_PROJECT']),"
  "  areaPath: $(ConvertTo-JsString $envValues['ADO_AREA_PATH']),"
  "  team: $(ConvertTo-JsString $envValues['ADO_TEAM']),"
  "  token: $(ConvertTo-JsString $envValues['ADO_TOKEN'])"
  "};"
) -join [Environment]::NewLine
$configJs | Set-Content $configPath

Write-Host "Token written to .env (expires in ~1h)"
Write-Host "Runtime config written to src/ui/config.local.js"
Write-Host "Serving on http://localhost:8080 ..."
Push-Location (Join-Path $repoRoot 'src\ui')
try {
  python -m http.server 8080
} finally {
  Pop-Location
}
