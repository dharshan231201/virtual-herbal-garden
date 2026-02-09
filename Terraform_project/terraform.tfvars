
# Terraform tfvars Example File
# Copy this file to terraform.tfvars and update values as needed

# General Settings
project_name = "day22-rds-demo"
environment  = "dev"
aws_region   = "us-east-1"

# VPC Settings
vpc_cidr             = "10.0.0.0/16"
public_subnet_cidr   = "10.0.1.0/24"
private_subnet_cidrs = ["10.0.2.0/24", "10.0.3.0/24"]

# EC2 Settings
ec2_instance_type = "t2.micro"
