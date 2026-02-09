
# VPC Module
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.5.1"

  name = var.project_name
  cidr = var.vpc_cidr

  azs             = var.aws_region
  public_subnets  = var.public_subnet_cidr
  private_subnets = var.private_subnet_cidrs

  enable_nat_gateway = true
  single_nat_gateway = true

  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Environment = "dev"
    Terraform   = "true"
  }
}


# Security Groups Module
module "security_groups" {
  source = "./modules/security_groups"

  project_name = var.project_name
  environment  = var.environment
  vpc_id       = module.vpc.vpc_id
}

# EC2 Module
module "ec2" {
  source = "./modules/EC2"

  project_name          = var.project_name
  environment           = var.environment
  instance_type         = var.ec2_instance_type
  public_subnet_id      = module.vpc.public_subnet_id
  web_security_group_id = module.security_groups.web_sg_id
  depends_on = [module.security_groups]
}


module "s3_logs" {
  source = "./modules/s3"

  bucket_name       = "my-company-dev-logs-12345"
  environment       = "dev"
  enable_versioning = true
}
