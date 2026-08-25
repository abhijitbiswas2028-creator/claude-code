<#
.SYNOPSIS
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
Write-Host "Running: npm install -g git+https://github.com/abhijitbiswas2028-creator/claude-code.git" -ForegroundColor DarkGray
try {
    npm install -g @anthropic-ai/claude-code
    Write-Host "`n`u{2714} Installation successful!" -ForegroundColor Green
    Write-Host "To get started, simply run: claude" -ForegroundColor White
} catch {
    Write-Host "`n`u{2716} Installation failed. Please ensure you have administrator privileges." -ForegroundColor Red
    exit 1
}
