# 🚀 Quick Start Guide

## Immediate Next Steps

### 1. Initialize Git Repository (if not done)

```bash
cd /Volumes/Cybersec/Projects/devsecops-ci-cd-gates
git init
git add .
git commit -m "Initial commit: DevSecOps Security Gates"
```

### 2. Push to GitHub

```bash
# Create a new repository on GitHub first, then:
git remote add origin https://github.com/YOUR-ORG/devsecops-security-gates.git
git branch -M main
git push -u origin main
```

### 3. Enable GitHub Actions

1. Go to your repository on GitHub
2. Click **Settings** → **Actions** → **General**
3. Ensure "Allow all actions and reusable workflows" is selected
4. Save

### 4. Test the Pipeline

Create a test branch and PR:

```bash
git checkout -b test/security-pipeline
echo "# Test" >> TEST.md
git add TEST.md
git commit -m "Test: Trigger security pipeline"
git push origin test/security-pipeline
```

Then create a Pull Request on GitHub. The security gates will run automatically!

## What Happens on First Run?

1. **Secrets Scan (Gitleaks)** - Will find intentional hardcoded secrets
2. **SAST (CodeQL)** - Will find SQL injection, command injection, etc.
3. **Dependencies** - Will scan npm and NuGet packages
4. **IaC (Checkov)** - Will find Terraform misconfigurations
5. **Containers (Trivy)** - Will scan Dockerfiles and dependencies
6. **Gate Evaluation** - Will **FAIL** due to intentional vulnerabilities

**This is expected!** The sample apps contain intentional security issues for testing.

## View Results

- **Actions Tab**: See workflow execution
- **Security Tab**: View SARIF uploads (Code scanning alerts)
- **PR Comments**: See security summary
- **Artifacts**: Download detailed reports

## Customize for Your Project

### Remove Sample Apps (Use Your Own Code)

```bash
# Remove sample apps
rm -rf apps/node-api apps/dotnet-api

# Add your applications
cp -r /path/to/your/app apps/my-app
```

### Adjust Security Thresholds

Edit `scripts/gates/thresholds.yml`:

```yaml
production:
  block:
    critical: 0  # Adjust as needed
    high: 0      # Adjust as needed
    medium: 5
    low: 20
```

### Test Locally

```bash
# Install tools (one-time setup)
./scripts/setup/install-tools.sh

# Run scans locally
gitleaks detect --source .
checkov -d infra/terraform
trivy fs apps/
```

## Common Issues

### "CodeQL: No code to analyze"

**Fix**: Ensure you have JavaScript/TypeScript or C# code in your repo.

### "SARIF upload failed"

**Fix**: Check that `security-events: write` permission is set in workflow.

### "Gate evaluation script fails"

**Fix**: Install TypeScript dependencies:
```bash
npm install -g typescript ts-node @types/node js-yaml @types/js-yaml glob
```

## Next Steps

1. ✅ Read the [full README](README.md)
2. ✅ Review [sample reports](reports/samples/)
3. ✅ Customize [thresholds](scripts/gates/thresholds.yml)
4. ✅ Explore [GitHub Security tab](https://docs.github.com/en/code-security)
5. ✅ Set up [Dependabot](https://docs.github.com/en/code-security/dependabot)

## Support

- **Issues**: File an issue on GitHub
- **Questions**: Start a discussion
- **Security**: Use GitHub Security Advisories

---

**Ready to build secure software! 🔐**
