###############################################################################
# DevSecOps Security Tools Installer (Windows/PowerShell)
#
# This script installs all security scanning tools required for local
# execution of security gates on Windows.
#
# Usage:
#   .\install-tools.ps1
#
# Prerequisites:
#   - PowerShell 5.1 or later
#   - Administrator privileges (for some installations)
#   - Chocolatey package manager (will be installed if missing)
###############################################################################

# Require administrator privileges
#Requires -RunAsAdministrator

$ErrorActionPreference = "Stop"

# Colors for output
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if command exists
function Test-CommandExists {
    param([string]$Command)
    $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

# Install Chocolatey
function Install-Chocolatey {
    if (Test-CommandExists choco) {
        Write-Info "Chocolatey already installed"
        return
    }

    Write-Info "Installing Chocolatey..."
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

    # Refresh environment
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

    Write-Info "✓ Chocolatey installed"
}

# Install gitleaks
function Install-Gitleaks {
    Write-Info "Installing gitleaks..."

    if (Test-CommandExists gitleaks) {
        Write-Info "✓ gitleaks already installed"
        return
    }

    choco install gitleaks -y
    Write-Info "✓ gitleaks installed"
}

# Install Trivy
function Install-Trivy {
    Write-Info "Installing Trivy..."

    if (Test-CommandExists trivy) {
        Write-Info "✓ Trivy already installed"
        return
    }

    # Download latest Trivy for Windows
    $trivyVersion = "0.48.0"
    $trivyUrl = "https://github.com/aquasecurity/trivy/releases/download/v$trivyVersion/trivy_${trivyVersion}_Windows-64bit.zip"
    $trivyZip = "$env:TEMP\trivy.zip"
    $trivyDir = "C:\Program Files\trivy"

    Invoke-WebRequest -Uri $trivyUrl -OutFile $trivyZip
    Expand-Archive -Path $trivyZip -DestinationPath $trivyDir -Force

    # Add to PATH
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
    if ($currentPath -notlike "*$trivyDir*") {
        [Environment]::SetEnvironmentVariable("Path", "$currentPath;$trivyDir", "Machine")
    }

    Remove-Item $trivyZip
    Write-Info "✓ Trivy installed"
}

# Install Checkov
function Install-Checkov {
    Write-Info "Installing Checkov..."

    if (Test-CommandExists checkov) {
        Write-Info "✓ Checkov already installed"
        return
    }

    # Requires Python
    if (-not (Test-CommandExists python)) {
        Write-Info "Installing Python..."
        choco install python -y
    }

    # Refresh PATH
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine")

    pip install checkov
    Write-Info "✓ Checkov installed"
}

# Install Semgrep
function Install-Semgrep {
    Write-Info "Installing Semgrep..."

    if (Test-CommandExists semgrep) {
        Write-Info "✓ Semgrep already installed"
        return
    }

    if (-not (Test-CommandExists pip)) {
        Write-Warn "Python pip not found. Skipping Semgrep."
        return
    }

    pip install semgrep
    Write-Info "✓ Semgrep installed"
}

# Install Node.js dependencies
function Install-NodeDeps {
    Write-Info "Installing Node.js dependencies..."

    if (-not (Test-CommandExists node)) {
        Write-Info "Installing Node.js..."
        choco install nodejs -y

        # Refresh PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine")
    }

    if (-not (Test-CommandExists npm)) {
        Write-Error-Custom "npm not found after Node.js installation"
        exit 1
    }

    npm install -g typescript ts-node @types/node js-yaml @types/js-yaml glob
    Write-Info "✓ Node.js dependencies installed"
}

# Main installation
function Main {
    Write-Info "DevSecOps Security Tools Installer (Windows)"
    Write-Info "============================================="
    Write-Host ""

    try {
        Install-Chocolatey
        Install-Gitleaks
        Install-Trivy
        Install-Checkov
        Install-Semgrep
        Install-NodeDeps

        Write-Host ""
        Write-Info "Installation complete! 🎉"
        Write-Info "You can now run security scans locally."
        Write-Host ""
        Write-Info "Next steps:"
        Write-Info "  1. Restart your terminal to refresh PATH"
        Write-Info "  2. Run 'gitleaks detect' to scan for secrets"
        Write-Info "  3. Run 'trivy fs .' to scan filesystem"
        Write-Info "  4. Run 'checkov -d infra\terraform' to scan IaC"

    } catch {
        Write-Error-Custom "Installation failed: $_"
        exit 1
    }
}

Main
