# Windows-specific build configuration
# Edit HISE_PATH to match your local HISE installation

# Resolve shared info (NAME, VERSION) from parent info.env
$_InfoDir = Split-Path -Parent $PSScriptRoot
Get-Content "$_InfoDir\info.env" | Where-Object { $_ -match '^[A-Z_]+=.+$' } | ForEach-Object {
    $key, $val = $_ -split '=', 2
    Set-Variable -Name $key -Value $val -Scope Script
}

# Windows HISE path — update this
$HISE_PATH = "C:\Users\$env:USERNAME\Documents\GitHub\HiSE"

# Derived paths
$PROJECT_ROOT = (Resolve-Path "$PSScriptRoot\..\..").Path
$HISE_EXE    = "$HISE_PATH\projects\standalone\Builds\VisualStudio2022\x64\Release\App\HISE.exe"
