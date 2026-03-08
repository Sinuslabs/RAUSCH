#Requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

. "$PSScriptRoot\info.ps1"

$config       = "Release"
$optimization = $true
$clean        = $true
$build        = $true
$copy         = $true
$plugin_type  = "VST3"   # Windows only supports VST3

$output     = "$PROJECT_ROOT\build\Windows"
$source_vst3 = "$PROJECT_ROOT\Binaries\Builds\VisualStudio2022\x64\Release\VST3\$NAME.vst3"

Write-Host "source_vst3: $source_vst3"

# Clean
if ($clean) {
    Write-Host "Starting clean action..."
    if (Test-Path "$PROJECT_ROOT\build") { Remove-Item "$PROJECT_ROOT\build" -Recurse -Force }
    New-Item -ItemType Directory -Path "$PROJECT_ROOT\build" | Out-Null
    if (Test-Path "$PROJECT_ROOT\Binaries") { Remove-Item "$PROJECT_ROOT\Binaries" -Recurse -Force }
}

# Build
if ($build) {
    Write-Host "Starting plugin build..."

    $lto_flag = if ($optimization) { "" } else { " -nolto" }

    & "$HISE_EXE" compile_networks "-c:$config"
    if ($LASTEXITCODE -ne 0) { throw "compile_networks failed" }

    & "$HISE_EXE" export_ci "XmlPresetBackups\$NAME.xml" -t:'instrument' "-p:$plugin_type"$lto_flag.Trim()
    if ($LASTEXITCODE -ne 0) { throw "export_ci failed" }

    $batch = "$PROJECT_ROOT\Binaries\batchCompileWindows.bat"
    & cmd /c $batch
    if ($LASTEXITCODE -ne 0) { throw "batchCompileWindows failed" }
}

# Copy
if ($copy) {
    Write-Host "Copying built plugins to output directory..."
    if (Test-Path $source_vst3) {
        New-Item -ItemType Directory -Path $output -Force | Out-Null
        Copy-Item $source_vst3 $output -Recurse -Force
        Write-Host "Copied $NAME.vst3 to $output"
    } else {
        Write-Warning "$NAME.vst3 not found, skipping copy."
    }
}

Write-Host "Build succeeded."
Write-Host "Version: $VERSION"
