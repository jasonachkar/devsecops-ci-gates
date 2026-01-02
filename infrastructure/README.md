# Infrastructure as Code

This directory contains Terraform configuration for deploying the DevSecOps Security Dashboard to AWS.

## Prerequisites

- Terraform >= 1.0
- AWS CLI configured
- Appropriate AWS permissions

## Usage

1. Create a `terraform.tfvars` file:

```hcl
aws_region      = "us-east-1"
project_name    = "devsecops-dashboard"
db_instance_class = "db.t3.micro"
db_name         = "devsecops"
db_username     = "postgres"
db_password     = "your-secure-password"
```

2. Initialize Terraform:

```bash
terraform init
```

3. Plan the deployment:

```bash
terraform plan
```

4. Apply the configuration:

```bash
terraform apply
```

## Resources Created

- VPC with public and private subnets
- RDS PostgreSQL database
- Security groups
- Subnet groups

## Notes

- This is a basic setup. For production, add:
  - Application Load Balancer
  - ECS/Fargate services
  - CloudWatch logging
  - Secrets Manager for credentials
  - Multi-AZ deployment
  - Automated backups


