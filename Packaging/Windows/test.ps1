#Requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

. "$PSScriptRoot\info.ps1"

# Adjust this path to your pluginval installation
$pluginval    = "C:\Program Files\Pluginval\pluginval.exe"
$plugin_vst3  = "$PROJECT_ROOT\build\Windows\$NAME.vst3"
$log_dir      = "$PSScriptRoot\logs"

New-Item -ItemType Directory -Path $log_dir -Force | Out-Null

if (-not (Test-Path $pluginval)) {
    throw "pluginval not found at: $pluginval — download from https://github.com/Tracktion/pluginval/releases"
}

Write-Host "Starting plugin validation..."
& "$pluginval" --validate "$plugin_vst3" --strictness-level 10 --output-dir "$log_dir" --verbose
if ($LASTEXITCODE -ne 0) {
    throw "Plugin validation failed."
}

Write-Host "Plugin validation succeeded."
