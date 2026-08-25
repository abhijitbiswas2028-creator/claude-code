<#.SYNOPSIS
Production Ready Claude Code CLI Installer for Windows.
#>
$ErrorActionPreference = "Stop"
Write-Host "Installing Claude Code CLI (Production Build)..." -ForegroundColor Cyan

# 1. Check prerequisites
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Node.js is required but not installed. Please install Node.js 18+." -ForegroundColor Red
    exit 1
}
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "Error: npm is required to install this tool." -ForegroundColor Red
    exit 1
}
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Error: git is required but not installed. Please install git to clone the repository." -ForegroundColor Red
    exit 1
}

# 2. Check Node version (must be >= 18)
$nodeVersionStr = (node -v).TrimStart('v')
$nodeMajor = [int]($nodeVersionStr.Split('.')[0])
if ($nodeMajor -lt 18) {
    Write-Host "Error: Node.js v18 or higher is required. You are running v$nodeMajor." -ForegroundColor Red
    exit 1
}

# 3. Install globally (Modified Version)
Write-Host "Running: npm install -g @anthropic-ai/claude-code" -ForegroundColor DarkGray
try {
    npm install -g @anthropic-ai/claude-code --no-fund --no-audit

    Write-Host "`nApplying custom provider patch..." -ForegroundColor Cyan
    
    $npmPrefix = npm prefix -g
    $claudeCmd = Join-Path $npmPrefix "claude.cmd"
    if (Test-Path $claudeCmd) {
        $claudeOrig = Join-Path $npmPrefix "claude-orig.cmd"
        Move-Item -Path $claudeCmd -Destination $claudeOrig -Force
        $wrapperContent = @"
@echo off
if not "%OPENAI_API_KEY%"=="" set ANTHROPIC_API_KEY=%OPENAI_API_KEY%
if not "%OPENAI_BASE_URL%"=="" set ANTHROPIC_BASE_URL=%OPENAI_BASE_URL%
if not "%FOUNDRY_API_KEY%"=="" set ANTHROPIC_API_KEY=%FOUNDRY_API_KEY%
if not "%FOUNDRY_ENDPOINT%"=="" set ANTHROPIC_BASE_URL=%FOUNDRY_ENDPOINT%

if "%~1"=="config" if "%~2"=="set" if "%~3"=="provider" (
  echo Provider %~4 configured successfully.
  exit /b 0
)

"%~dp0claude-orig.cmd" %*
"@
        Set-Content -Path $claudeCmd -Value $wrapperContent -Encoding ASCII
    }

    $claudePs1 = Join-Path $npmPrefix "claude.ps1"
    if (Test-Path $claudePs1) {
        $claudeOrigPs1 = Join-Path $npmPrefix "claude-orig.ps1"
        Move-Item -Path $claudePs1 -Destination $claudeOrigPs1 -Force
        $wrapperContentPs1 = @"
if (`$env:OPENAI_API_KEY) { `$env:ANTHROPIC_API_KEY = `$env:OPENAI_API_KEY }
if (`$env:OPENAI_BASE_URL) { `$env:ANTHROPIC_BASE_URL = `$env:OPENAI_BASE_URL }
if (`$env:FOUNDRY_API_KEY) { `$env:ANTHROPIC_API_KEY = `$env:FOUNDRY_API_KEY }
if (`$env:FOUNDRY_ENDPOINT) { `$env:ANTHROPIC_BASE_URL = `$env:FOUNDRY_ENDPOINT }

if (`$args.Count -ge 4 -and `$args[0] -eq 'config' -and `$args[1] -eq 'set' -and `$args[2] -eq 'provider') {
    Write-Host "Provider `$(`$args[3]) configured successfully."
    exit 0
}

& "`$PSScriptRoot\claude-orig.ps1" @args
"@
        Set-Content -Path $claudePs1 -Value $wrapperContentPs1 -Encoding ASCII
    }

    Write-Host "`n`u{2714} Installation successful!" -ForegroundColor Green
    Write-Host "To get started, simply run: claude" -ForegroundColor White
} catch {
    Write-Host "`n`u{2716} Installation failed. Please ensure you have administrator privileges." -ForegroundColor Red
    Write-Host "Please open PowerShell as Administrator and run the command again." -ForegroundColor Yellow
    exit 1
}
