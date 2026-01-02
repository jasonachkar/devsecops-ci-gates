#!/bin/bash
###############################################################################
# DevSecOps Security Tools Installer (Linux/macOS)
#
# This script installs all security scanning tools required for local
# execution of security gates.
#
# Usage:
#   ./install-tools.sh
#
# Tools installed:
#   - gitleaks (secrets scanning)
#   - trivy (container scanning)
#   - checkov (IaC scanning)
#   - semgrep (SAST - optional, CodeQL is GitHub-only)
#   - Node.js dependencies (for gate evaluator)
###############################################################################

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Detect OS
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    else
        log_error "Unsupported OS: $OSTYPE"
        exit 1
    fi
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Install Homebrew (macOS)
install_homebrew() {
    if ! command_exists brew; then
        log_info "Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    else
        log_info "Homebrew already installed"
    fi
}

# Install gitleaks
install_gitleaks() {
    log_info "Installing gitleaks..."

    local os=$(detect_os)

    if [[ "$os" == "macos" ]]; then
        brew install gitleaks
    elif [[ "$os" == "linux" ]]; then
        # Install via binary
        local version="8.18.1"
        wget -q "https://github.com/gitleaks/gitleaks/releases/download/v${version}/gitleaks_${version}_linux_x64.tar.gz"
        tar -xzf "gitleaks_${version}_linux_x64.tar.gz"
        sudo mv gitleaks /usr/local/bin/
        rm "gitleaks_${version}_linux_x64.tar.gz"
    fi

    log_info "✓ gitleaks installed: $(gitleaks version)"
}

# Install Trivy
install_trivy() {
    log_info "Installing Trivy..."

    local os=$(detect_os)

    if [[ "$os" == "macos" ]]; then
        brew install aquasecurity/trivy/trivy
    elif [[ "$os" == "linux" ]]; then
        # Install via script
        curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
    fi

    log_info "✓ Trivy installed: $(trivy --version)"
}

# Install Checkov
install_checkov() {
    log_info "Installing Checkov..."

    if command_exists pip3; then
        pip3 install checkov
    elif command_exists pip; then
        pip install checkov
    else
        log_error "Python pip not found. Please install Python 3 first."
        exit 1
    fi

    log_info "✓ Checkov installed: $(checkov --version)"
}

# Install Semgrep
install_semgrep() {
    log_info "Installing Semgrep..."

    if command_exists pip3; then
        pip3 install semgrep
    elif command_exists pip; then
        pip install semgrep
    else
        log_warn "Python pip not found. Skipping Semgrep installation."
        return
    fi

    log_info "✓ Semgrep installed: $(semgrep --version)"
}

# Install Node.js dependencies
install_node_deps() {
    log_info "Installing Node.js dependencies for gate evaluator..."

    if ! command_exists node; then
        log_error "Node.js not found. Please install Node.js 18+ first."
        exit 1
    fi

    if ! command_exists npm; then
        log_error "npm not found. Please install npm first."
        exit 1
    fi

    # Install TypeScript and dependencies globally
    npm install -g typescript ts-node @types/node js-yaml @types/js-yaml glob

    log_info "✓ Node.js dependencies installed"
}

# Main installation
main() {
    log_info "DevSecOps Security Tools Installer"
    log_info "===================================="
    echo

    local os=$(detect_os)
    log_info "Detected OS: $os"
    echo

    # Install Homebrew on macOS
    if [[ "$os" == "macos" ]]; then
        install_homebrew
    fi

    # Install tools
    if ! command_exists gitleaks; then
        install_gitleaks
    else
        log_info "✓ gitleaks already installed: $(gitleaks version)"
    fi

    if ! command_exists trivy; then
        install_trivy
    else
        log_info "✓ Trivy already installed: $(trivy --version)"
    fi

    if ! command_exists checkov; then
        install_checkov
    else
        log_info "✓ Checkov already installed: $(checkov --version)"
    fi

    if ! command_exists semgrep; then
        install_semgrep
    else
        log_info "✓ Semgrep already installed: $(semgrep --version)"
    fi

    install_node_deps

    echo
    log_info "Installation complete! 🎉"
    log_info "You can now run security scans locally."
    echo
    log_info "Next steps:"
    log_info "  1. Run 'gitleaks detect' to scan for secrets"
    log_info "  2. Run 'trivy fs .' to scan filesystem"
    log_info "  3. Run 'checkov -d infra/terraform' to scan IaC"
    log_info "  4. Run the full pipeline with GitHub Actions"
}

main
