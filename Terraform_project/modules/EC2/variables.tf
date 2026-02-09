
# EC2 Module - Variables

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

variable "public_subnet_id" {
  description = "ID of the public subnet"
  type        = string
}

variable "web_security_group_id" {
  description = "Security group ID for the web server"
  type        = string
}