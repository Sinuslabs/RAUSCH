#Requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

. "$PSScriptRoot\info.ps1"

# Path to makensis — adjust if NSIS is installed elsewhere
$makensis    = "C:\Program Files (x86)\NSIS\makensis.exe"
$nsi_script  = "$PSScriptRoot\installer.nsi"
$vst3_src    = "$PROJECT_ROOT\build\Windows\$NAME.vst3"
$output_exe  = "$PSScriptRoot\$NAME-Windows.exe"

if (-not (Test-Path $makensis)) {
    throw "NSIS makensis.exe not found at: $makensis`nDownload NSIS from https://nsis.sourceforge.io/Download"
}

if (-not (Test-Path $vst3_src)) {
    throw "$NAME.vst3 not found at: $vst3_src — run compile.ps1 first"
}

Write-Host "Building installer..."

& "$makensis" `
    "/DPRODUCT_NAME=$NAME" `
    "/DPRODUCT_VERSION=$VERSION" `
    "/DPUBLISHER=Sinuslabs" `
    "/DVST3_SRC=$vst3_src" `
    "/DOUTPUT_EXE=$output_exe" `
    "$nsi_script"

if ($LASTEXITCODE -ne 0) { throw "makensis failed" }

Write-Host "Installer created: $output_exe"
