#Requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

. "$PSScriptRoot\info.ps1"

# ── Arguments ─────────────────────────────────────────────────────────────────
param([switch]$Verbose)

# ── Colors ────────────────────────────────────────────────────────────────────
$ESC   = [char]27
$BOLD  = "$ESC[1m";  $DIM   = "$ESC[2m"
$GREEN = "$ESC[0;32m"; $RED = "$ESC[0;31m"; $CYAN = "$ESC[0;36m"; $RESET = "$ESC[0m"

# ── State ─────────────────────────────────────────────────────────────────────
$OVERALL_START = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$LOG_FILE      = "$env:TEMP\${NAME}_build.log"
$STEP_NAMES    = [System.Collections.Generic.List[string]]::new()
$STEP_TIMES    = [System.Collections.Generic.List[int]]::new()
"" | Set-Content $LOG_FILE

# ── Spinner ───────────────────────────────────────────────────────────────────
$FRAMES = @('⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏')

function Start-Spin($label, $t0) {
    $script:SPINNER_JOB = $null
    # Simple spinner using a background runspace
    $rs = [RunspaceFactory]::CreateRunspace()
    $rs.Open()
    $ps = [PowerShell]::Create()
    $ps.Runspace = $rs
    $frames_str = '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
    [void]$ps.AddScript({
        param($label, $t0, $LOG_FILE, $frames_str)
        $i = 0
        while ($true) {
            $elapsed = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds() - $t0
            $m = [int]($elapsed / 60); $s = $elapsed % 60
            $frame = $frames_str[$i % 10]
            $last = ""
            if (Test-Path $LOG_FILE) {
                $last = (Get-Content $LOG_FILE -Tail 1 2>$null) -replace '\x1b\[[0-9;]*[a-zA-Z]','' | Select-Object -First 1
                if ($last.Length -gt 70) { $last = $last.Substring(0,70) }
            }
            $ESC = [char]27
            Write-Host "`r${ESC}[K  ${ESC}[0;36m${frame}${ESC}[0m  $($label.PadRight(20)) ${ESC}[2m${m}:$($s.ToString('D2'))${ESC}[0m  ${ESC}[2m$last${ESC}[0m" -NoNewline
            $i++
            Start-Sleep -Milliseconds 150
        }
    }).AddArgument($label).AddArgument($t0).AddArgument($LOG_FILE).AddArgument($frames_str) | Out-Null
    $script:SPINNER_JOB = $ps
    $script:SPINNER_RS  = $rs
    $script:SPINNER_HANDLE = $ps.BeginInvoke()
}

function Stop-Spin {
    if ($script:SPINNER_JOB) {
        $script:SPINNER_JOB.Stop()
        $script:SPINNER_RS.Close()
        $script:SPINNER_JOB = $null
        Write-Host "`r$ESC[K" -NoNewline
    }
}

# ── Step runner ───────────────────────────────────────────────────────────────
function Run-Step($name, $script_path) {
    $t0 = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    $ec = 0

    if ($Verbose) {
        Write-Host "`n${BOLD}▶  $name${RESET}"
        try { & pwsh -NoProfile -File "$PSScriptRoot\$script_path" }
        catch { $ec = 1 }
    } else {
        Start-Spin $name $t0
        try {
            & pwsh -NoProfile -File "$PSScriptRoot\$script_path" >> $LOG_FILE 2>&1
        } catch {
            $ec = 1
        }
        if ($LASTEXITCODE -and $LASTEXITCODE -ne 0) { $ec = $LASTEXITCODE }
        Stop-Spin
    }

    $elapsed = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds() - $t0
    $STEP_NAMES.Add($name)
    $STEP_TIMES.Add($elapsed)

    if ($ec -eq 0) {
        Write-Host "  ${GREEN}✓${RESET}  $($name.PadRight(20)) ${DIM}${elapsed}s${RESET}"
    } else {
        Write-Host "  ${RED}✗${RESET}  $($name.PadRight(20)) ${DIM}${elapsed}s${RESET}"
        if (-not $Verbose) {
            Write-Host "`n${RED}Last output:${RESET}"
            Get-Content $LOG_FILE -Tail 30
        }
        Print-Summary $ec
        exit $ec
    }
}

# ── Summary ───────────────────────────────────────────────────────────────────
function Print-Summary($ec = 0) {
    $total = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds() - $OVERALL_START
    $mins  = [int]($total / 60); $secs = $total % 60

    Write-Host "`n${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
    Write-Host "${BOLD}  Build Summary — $NAME $VERSION${RESET}"
    Write-Host "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`n"

    for ($i = 0; $i -lt $STEP_NAMES.Count; $i++) {
        Write-Host "  ${GREEN}✓${RESET}  $($STEP_NAMES[$i].PadRight(20)) ${DIM}$($STEP_TIMES[$i])s${RESET}"
    }

    if ($mins -gt 0) { Write-Host "`n  ${DIM}Total${RESET}   ${BOLD}${mins}m ${secs}s${RESET}" }
    else             { Write-Host "`n  ${DIM}Total${RESET}   ${BOLD}${secs}s${RESET}" }

    Write-Host "`n${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`n"

    if ($ec -eq 0) {
        Write-Host "${GREEN}${BOLD}  Build complete!${RESET}`n"
        Write-Host "${BOLD}  What's next?${RESET}`n"
        Write-Host "  $('Install'.PadRight(14)) run .\$NAME-Windows.exe"
        Write-Host "  $('Distribute'.PadRight(14)) upload .\$NAME-Windows.exe"
        Write-Host "  $('Full logs'.PadRight(14)) notepad $LOG_FILE`n"
    } else {
        Write-Host "${RED}${BOLD}  Build failed.${RESET}`n"
        if (-not $Verbose) {
            Write-Host "  ${DIM}Tip: rerun with ${RESET}${BOLD}-Verbose${RESET}${DIM} for full output${RESET}"
            Write-Host "  ${DIM}Logs saved to: $LOG_FILE${RESET}`n"
        }
    }
}

# ── Header ────────────────────────────────────────────────────────────────────
Write-Host "`n${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
$header = "${BOLD}  $NAME $VERSION  —  Build Pipeline (Windows)${RESET}"
if ($Verbose) { $header += "  ${DIM}[verbose]${RESET}" }
Write-Host $header
Write-Host "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`n"

# ── Pipeline ──────────────────────────────────────────────────────────────────
Run-Step "Compile"  "compile.ps1"
Run-Step "Test"     "test.ps1"
Run-Step "Package"  "package.ps1"

# ── Done ──────────────────────────────────────────────────────────────────────
Print-Summary 0
