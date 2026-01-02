# Terraform Outputs
#
# Define outputs to expose resource information

output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "vpc_cidr" {
  description = "CIDR block of the VPC"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_id" {
  description = "ID of the public subnet"
  value       = aws_subnet.public.id
}

output "private_subnet_id" {
  description = "ID of the private subnet"
  value       = aws_subnet.private.id
}

output "internet_gateway_id" {
  description = "ID of the Internet Gateway"
  value       = aws_internet_gateway.main.id
}

output "web_security_group_id" {
  description = "ID of the web security group"
  value       = aws_security_group.web.id
}

output "database_security_group_id" {
  description = "ID of the database security group"
  value       = aws_security_group.database.id
}

output "s3_bucket_name" {
  description = "Name of the S3 bucket"
  value       = aws_s3_bucket.data.id
}

output "s3_bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = aws_s3_bucket.data.arn
}

output "ec2_role_arn" {
  description = "ARN of the EC2 IAM role"
  value       = aws_iam_role.ec2_role.arn
}

# SECURITY ISSUE: Sensitive output without sensitive flag
# Fix: Mark sensitive outputs appropriately
output "database_password" {
  description = "Database password (DO NOT USE - demonstration only)"
  value       = var.database_password
  # sensitive   = true # Should be marked sensitive
}

# Good practice: Provide deployment information
output "deployment_info" {
  description = "Deployment information"
  value = {
    region      = var.aws_region
    environment = var.environment
    project     = var.project_name
    timestamp   = timestamp()
  }
}

# Security reminder in outputs
output "security_warning" {
  description = "Security configuration warning"
  value       = "⚠️  This infrastructure contains intentional security misconfigurations for testing. DO NOT use in production!"
}
