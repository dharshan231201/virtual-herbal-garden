# VPC Outputs
output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

# EC2 Outputs
output "web_server_public_ip" {
  description = "Public IP address of the web server"
  value       = module.ec2.public_ip
}

output "web_server_public_dns" {
  description = "Public DNS of the web server"
  value       = module.ec2.public_dns
}

output "application_url" {
  description = "URL to access the application"
  value       = "http://${module.ec2.public_ip}"
}

output "s3_bucket_name" {
  value = module.s3_logs.bucket_name
}

output "s3_bucket_arn" {
  value = module.s3_logs.bucket_arn
}