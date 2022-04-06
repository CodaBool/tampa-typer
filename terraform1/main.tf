provider "aws" {
  region = "us-east-1"
}

terraform {
  backend "s3" {
    bucket = "codabool-tf-state"
    key    = "tampadev/demo-2/terraform.tfstate" # bucket dir
    region = "us-east-1"
  }
}

# Default Network Resources
# Works different than normal resources
# adopts the default vpc/subnet for tf to reference
# will not create/destroy despite what the cli suggests
resource "aws_default_vpc" "default" {}

resource "aws_default_subnet" "east_1a" {
  availability_zone = "us-east-1a"
}

resource "aws_default_subnet" "east_1b" {
  availability_zone = "us-east-1b"
}

# cluster
resource "aws_ecs_cluster" "tampadev" {
  name = "tampadev"
}

# task definition
resource "aws_ecs_task_definition" "tampadev" {
  family                   = "tampa-nginx"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  task_role_arn            = "arn:aws:iam::${var.account_id}:role/${var.role_name}"
  cpu                      = 256 # 256 minimum
  memory                   = 512 # 512 minimum (MiB)
  container_definitions    = jsonencode([
    {
      name              = "tampa-nginx"
      image             = "public.ecr.aws/x9o9j9n6/tampa-nginx:latest"
      memoryReservation = 128
      portMappings      = [{
        containerPort = 80
      }]
    }
  ])
}
# security group
resource "aws_security_group" "tampadev" {
  name        = "tampadev-ecs"
  description = "Allow HTTP traffic"
  vpc_id      = aws_default_vpc.default.id
  ingress {
    from_port        = 80
    to_port          = 80
    protocol         = "TCP"
    cidr_blocks      = ["0.0.0.0/0"]
  }
  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
  }
  tags = {
    Name = "tampadev-ecs"
  }
}

# service
resource "aws_ecs_service" "tampadev" {
  name             = "tampadev"
  cluster          = aws_ecs_cluster.tampadev.id
  task_definition  = aws_ecs_task_definition.tampadev.arn
  launch_type      = "FARGATE"
  desired_count    = 1
  network_configuration {
    assign_public_ip = true
    security_groups = [aws_security_group.tampadev.id]
    subnets = [
      aws_default_subnet.east_1a.id,
      aws_default_subnet.east_1b.id
    ]
  }
}