# EC2 Module - Main Configuration

# Get latest Ubuntu AMI # lets say there is a custom AMI image that is present 
data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
  owners = ["099720109477"] # Canonical
}

# EC2 Instance
resource "aws_instance" "web" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = var.instance_type
  subnet_id                   = var.public_subnet_id
  vpc_security_group_ids      = [var.web_security_group_id]
  associate_public_ip_address = true

  user_data = templatefile("${path.module}/templates/user_data.sh")
  
  lifecycle {
    create_before_destroy = true
    prevent_destroy       = false
  }  
  
  tags = {
    Name        = "${var.project_name}-web-server"
    Environment = var.environment
  }
}