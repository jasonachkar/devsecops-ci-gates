# DevSecOps Terraform Example
#
# This Terraform configuration demonstrates a simple AWS infrastructure
# setup with intentional security misconfigurations for testing IaC scanners
# like Checkov.
#
# WARNING: DO NOT deploy this to production! Contains intentional security issues.

terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.28"
    }
  }

  # Best practice: Use remote backend for state
  # backend "s3" {
  #   bucket         = "devsecops-terraform-state"
  #   key            = "security-gates/terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   dynamodb_table = "terraform-state-lock"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "DevSecOps Security Gates"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Purpose     = "Security Testing"
    }
  }
}

# ============================================================================
# VPC and Networking
# ============================================================================

resource "aws_vpc" "main" {
  cidr_block = var.vpc_cidr

  # SECURITY ISSUE: VPC flow logs disabled (should trigger Checkov)
  # Fix: Enable VPC flow logs for network monitoring
  # enable_dns_hostnames = true
  # enable_dns_support   = true

  tags = {
    Name = "${var.project_name}-vpc"
  }
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidr
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true # SECURITY ISSUE: Auto-assign public IPs

  tags = {
    Name = "${var.project_name}-public-subnet"
    Type = "Public"
  }
}

resource "aws_subnet" "private" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidr
  availability_zone = "${var.aws_region}b"

  tags = {
    Name = "${var.project_name}-private-subnet"
    Type = "Private"
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-igw"
  }
}

# ============================================================================
# Security Groups
# ============================================================================

resource "aws_security_group" "web" {
  name        = "${var.project_name}-web-sg"
  description = "Security group for web servers"
  vpc_id      = aws_vpc.main.id

  # SECURITY ISSUE: Overly permissive ingress (should trigger Checkov)
  # Fix: Restrict to specific IP ranges and ports
  ingress {
    description = "Allow all inbound traffic" # Bad!
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # SECURITY ISSUE: Open to world
  }

  # SECURITY ISSUE: Overly permissive egress
  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-web-sg"
  }
}

resource "aws_security_group" "database" {
  name        = "${var.project_name}-db-sg"
  description = "Security group for database"
  vpc_id      = aws_vpc.main.id

  # SECURITY ISSUE: Database accessible from public subnet
  ingress {
    description = "PostgreSQL access"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [var.public_subnet_cidr] # Should only allow private subnet
  }

  # SECURITY ISSUE: SSH access on database security group
  ingress {
    description = "SSH access" # Databases shouldn't allow SSH
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # And definitely not from everywhere!
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-db-sg"
  }
}

# ============================================================================
# S3 Bucket
# ============================================================================

resource "aws_s3_bucket" "data" {
  bucket = "${var.project_name}-data-${var.environment}"

  # SECURITY ISSUE: Force destroy enabled (data loss risk)
  force_destroy = true # Bad for production!

  tags = {
    Name        = "${var.project_name}-data"
    Environment = var.environment
  }
}

# SECURITY ISSUE: S3 bucket encryption not enabled (should trigger Checkov)
# Fix: Enable server-side encryption
# resource "aws_s3_bucket_server_side_encryption_configuration" "data" {
#   bucket = aws_s3_bucket.data.id
#   rule {
#     apply_server_side_encryption_by_default {
#       sse_algorithm = "AES256"
#     }
#   }
# }

# SECURITY ISSUE: S3 bucket versioning not enabled
# Fix: Enable versioning for data protection
# resource "aws_s3_bucket_versioning" "data" {
#   bucket = aws_s3_bucket.data.id
#   versioning_configuration {
#     status = "Enabled"
#   }
# }

# SECURITY ISSUE: Public access not blocked
# Fix: Block all public access
resource "aws_s3_bucket_public_access_block" "data" {
  bucket = aws_s3_bucket.data.id

  block_public_acls       = false # SECURITY ISSUE: Should be true
  block_public_policy     = false # SECURITY ISSUE: Should be true
  ignore_public_acls      = false # SECURITY ISSUE: Should be true
  restrict_public_buckets = false # SECURITY ISSUE: Should be true
}

# ============================================================================
# IAM Role (Example)
# ============================================================================

resource "aws_iam_role" "ec2_role" {
  name = "${var.project_name}-ec2-role"

  # SECURITY ISSUE: Overly permissive assume role policy
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-ec2-role"
  }
}

# SECURITY ISSUE: Overly permissive IAM policy (should trigger Checkov)
resource "aws_iam_role_policy" "ec2_policy" {
  name = "${var.project_name}-ec2-policy"
  role = aws_iam_role.ec2_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:*",      # SECURITY ISSUE: Wildcard permissions
          "ec2:*",     # SECURITY ISSUE: Full EC2 access
          "rds:*",     # SECURITY ISSUE: Full RDS access
          "lambda:*"   # SECURITY ISSUE: Full Lambda access
        ]
        Resource = "*" # SECURITY ISSUE: All resources
      }
    ]
  })
}

# ============================================================================
# RDS Instance (Example - not actually created to save costs)
# ============================================================================

# Commented out to avoid actual resource creation
# Demonstrates security issues that Checkov would catch

# resource "aws_db_instance" "main" {
#   identifier           = "${var.project_name}-db"
#   engine               = "postgres"
#   engine_version       = "15.3"
#   instance_class       = "db.t3.micro"
#   allocated_storage    = 20
#
#   # SECURITY ISSUE: Publicly accessible database
#   publicly_accessible = true # Bad!
#
#   # SECURITY ISSUE: Encryption not enabled
#   storage_encrypted = false # Bad!
#
#   # SECURITY ISSUE: Deletion protection disabled
#   deletion_protection = false
#
#   # SECURITY ISSUE: Backup retention too short
#   backup_retention_period = 0 # Bad: No backups!
#
#   # SECURITY ISSUE: Automated minor version upgrade disabled
#   auto_minor_version_upgrade = false
#
#   # SECURITY ISSUE: CloudWatch logs not exported
#   enabled_cloudwatch_logs_exports = [] # Should enable postgresql logs
#
#   vpc_security_group_ids = [aws_security_group.database.id]
#   db_subnet_group_name   = aws_db_subnet_group.main.name
#
#   skip_final_snapshot = true # SECURITY ISSUE: No final snapshot
# }
