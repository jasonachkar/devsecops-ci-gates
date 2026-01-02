# Terraform Variables
#
# Define input variables for the infrastructure configuration

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "devsecops-gates"

  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.project_name))
    error_message = "Project name must contain only lowercase letters, numbers, and hyphens."
  }
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"

  validation {
    condition     = can(cidrhost(var.vpc_cidr, 0))
    error_message = "VPC CIDR must be a valid IPv4 CIDR block."
  }
}

variable "public_subnet_cidr" {
  description = "CIDR block for public subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "private_subnet_cidr" {
  description = "CIDR block for private subnet"
  type        = string
  default     = "10.0.2.0/24"
}

variable "allowed_ssh_cidr" {
  description = "CIDR blocks allowed for SSH access"
  type        = list(string)
  default     = ["0.0.0.0/0"] # SECURITY ISSUE: Default allows all

  # Better default would be:
  # default     = [] # Require explicit configuration
}

variable "enable_flow_logs" {
  description = "Enable VPC flow logs"
  type        = bool
  default     = false # SECURITY ISSUE: Should default to true
}

variable "enable_encryption" {
  description = "Enable encryption for resources"
  type        = bool
  default     = false # SECURITY ISSUE: Should default to true
}

# SECURITY ISSUE: Hardcoded sensitive default (should trigger scanners)
variable "database_password" {
  description = "Database password"
  type        = string
  default     = "ChangeMe123!" # Bad: Never use default passwords
  sensitive   = true

  # Better approach: No default, require from secret manager
  # default     = null
}

variable "tags" {
  description = "Additional tags for resources"
  type        = map(string)
  default     = {}
}
