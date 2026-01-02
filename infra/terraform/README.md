# DevSecOps Terraform Infrastructure

This directory contains Terraform configurations for demonstrating Infrastructure as Code (IaC) security scanning with Checkov and other tools.

## ⚠️ Important Notice

**This Terraform configuration contains intentional security misconfigurations for testing purposes.**

Security issues included:
- Overly permissive security groups (0.0.0.0/0)
- Missing encryption on S3 buckets
- Missing VPC flow logs
- Public accessibility on resources that should be private
- Overly permissive IAM policies with wildcard permissions
- Missing backup and versioning configurations
- Hardcoded sensitive defaults
- Publicly accessible databases (in commented examples)

**DO NOT deploy this infrastructure to production!**

## Purpose

This infrastructure demonstrates:

1. **Common IaC Security Issues** that scanners should detect:
   - CKV_AWS_1: S3 bucket encryption
   - CKV_AWS_18: S3 bucket logging
   - CKV_AWS_19: S3 bucket encryption
   - CKV_AWS_20: S3 bucket versioning
   - CKV_AWS_21: S3 bucket ACLs
   - CKV_AWS_23: Security group ingress 0.0.0.0/0
   - CKV_AWS_24: Security group egress 0.0.0.0/0
   - CKV_AWS_111: IAM policy wildcard permissions
   - And many more...

2. **Security Scanning Workflow**:
   - Checkov scans for misconfigurations
   - Results in SARIF format for GitHub Security
   - Gate evaluation based on severity thresholds
   - Automated PR comments with findings

## Infrastructure Overview

This configuration creates:

```
┌─────────────────────────────────────────┐
│              VPC (10.0.0.0/16)          │
│                                          │
│  ┌────────────────┐  ┌────────────────┐ │
│  │ Public Subnet  │  │ Private Subnet │ │
│  │  10.0.1.0/24   │  │  10.0.2.0/24   │ │
│  └────────────────┘  └────────────────┘ │
│           │                              │
│    ┌──────▼──────┐                      │
│    │   Internet  │                      │
│    │   Gateway   │                      │
│    └─────────────┘                      │
└─────────────────────────────────────────┘

         Security Groups
    ┌──────────┬──────────┐
    │   Web    │ Database │
    └──────────┴──────────┘

         Additional Resources
    ┌──────────┬──────────┐
    │ S3 Bucket│ IAM Role │
    └──────────┴──────────┘
```

### Resources

- **VPC**: Virtual Private Cloud with public and private subnets
- **Subnets**: Public subnet for internet-facing resources, private for internal
- **Security Groups**: Network access control (intentionally misconfigured)
- **S3 Bucket**: Object storage (missing encryption and versioning)
- **IAM Role**: EC2 instance role (overly permissive)
- **Internet Gateway**: Public internet access

## Usage

### Prerequisites

- Terraform >= 1.6.0
- AWS CLI configured with credentials
- Appropriate AWS permissions

### Initialize

```bash
terraform init
```

### Plan

```bash
terraform plan
```

### Apply (DO NOT RUN - For Demonstration Only)

```bash
# Don't actually run this!
# terraform apply
```

### Security Scanning

Run Checkov scan:
```bash
checkov -d . --output sarif --output-file ../../reports/checkov-results.sarif
```

Run Checkov with detailed output:
```bash
checkov -d . --framework terraform
```

### Destroy

If you accidentally deployed:
```bash
terraform destroy
```

## Variables

Key variables defined in `variables.tf`:

| Variable | Description | Default | Security Issue |
|----------|-------------|---------|----------------|
| `aws_region` | AWS region | `us-east-1` | - |
| `environment` | Environment name | `dev` | - |
| `vpc_cidr` | VPC CIDR block | `10.0.0.0/16` | - |
| `allowed_ssh_cidr` | SSH access | `["0.0.0.0/0"]` | ⚠️ Too permissive |
| `enable_flow_logs` | VPC flow logs | `false` | ⚠️ Should be true |
| `enable_encryption` | Resource encryption | `false` | ⚠️ Should be true |
| `database_password` | DB password | Hardcoded | ⚠️ Use secrets manager |

## Expected Scan Results

When scanned with Checkov, this configuration should trigger:

- **Critical**: 5-10 findings
  - Public database access
  - Missing encryption
  - Overly permissive IAM

- **High**: 10-15 findings
  - Security group misconfigurations
  - Missing logging
  - Missing backup configurations

- **Medium**: 15-20 findings
  - Missing tags
  - Deletion protection disabled
  - Auto-upgrade disabled

- **Low**: Various best practice violations

## Security Best Practices (What TO Do)

To fix this configuration for production:

1. **Enable Encryption**
   ```hcl
   storage_encrypted = true
   ```

2. **Restrict Security Groups**
   ```hcl
   cidr_blocks = ["10.0.0.0/16"] # Internal only
   ```

3. **Enable Flow Logs**
   ```hcl
   enable_vpc_flow_logs = true
   ```

4. **Use Least Privilege IAM**
   ```hcl
   # Specific actions and resources only
   ```

5. **Enable Versioning and Backup**
   ```hcl
   backup_retention_period = 7
   ```

6. **Block Public Access**
   ```hcl
   block_public_acls = true
   ```

7. **Use Secrets Manager**
   ```hcl
   # No hardcoded credentials
   ```

## CI/CD Integration

This configuration is automatically scanned by:
- `.github/workflows/security-gates.yml` - PR and main branch scans
- `.github/workflows/security-nightly.yml` - Scheduled scans

Results are:
- Uploaded as SARIF to GitHub Security tab
- Evaluated against thresholds in `scripts/gates/thresholds.yml`
- Included in security summary reports

## File Structure

```
terraform/
├── main.tf         # Main infrastructure definition
├── variables.tf    # Input variables
├── outputs.tf      # Output values
└── README.md       # This file
```

## Learning Resources

- [Terraform Security Best Practices](https://www.terraform.io/docs/cloud/guides/recommended-practices/index.html)
- [Checkov Documentation](https://www.checkov.io/)
- [AWS Security Best Practices](https://aws.amazon.com/security/best-practices/)
- [CIS AWS Foundations Benchmark](https://www.cisecurity.org/benchmark/amazon_web_services)

## License

MIT - For demonstration and testing purposes only
