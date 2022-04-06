provider "aws" {
  region = "us-east-1"
}

terraform {
  backend "s3" {
    bucket = "codabool-tf-state"
    key    = "tampadev/demo-3/terraform.tfstate" # bucket dir
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

# load balancer
resource "aws_lb" "tampadev" {
  name               = "tampadev"
  load_balancer_type = "application"
  security_groups    = [aws_security_group.tampadev.id]
  subnets            = [
    aws_default_subnet.east_1a.id,
    aws_default_subnet.east_1b.id
  ]
  tags = {
    Name = "tampadev"
  }
}

# load balancer target group
resource "aws_lb_target_group" "tampadev" {
  name        = "tampadev"
  port        = 80
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_default_vpc.default.id
  stickiness {
    type = "lb_cookie"
  }
}

# load balancer incoming port and action
resource "aws_lb_listener" "tampadev" {
  load_balancer_arn = aws_lb.tampadev.arn
  port              = 80
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tampadev.arn
  }
}

# cluster
resource "aws_ecs_cluster" "tampadev" {
  name = "tampadev"
}

# task definition
resource "aws_ecs_task_definition" "tampadev" {
  family                   = "tampa-typer"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  task_role_arn            = "arn:aws:iam::${var.account_id}:role/${var.role_name}"
  cpu                      = 256 # 256 minimum
  memory                   = 512 # 512 minimum (MiB)
  container_definitions = <<DEFINITION
    [{
      "name": "tampa-typer",
      "image": "public.ecr.aws/x9o9j9n6/tampa-typer:latest",
      "memoryReservation": 128,
      "portMappings": [{
        "containerPort": 3000
      }],
      "environment": ${jsonencode(var.container_env)}
    }
  ]
  DEFINITION
}

# security group
resource "aws_security_group" "tampadev" {
  name        = "tampadev-ecs"
  description = "Allow HTTP and app 3000"
  vpc_id      = aws_default_vpc.default.id
  ingress {
    from_port        = 3000
    to_port          = 3000
    protocol         = "TCP"
    cidr_blocks      = ["0.0.0.0/0"]
  }
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
  load_balancer {
    target_group_arn = aws_lb_target_group.tampadev.arn
    container_name   = "tampa-typer"
    container_port   = 3000
  }
  network_configuration {
    assign_public_ip = true
    security_groups = [aws_security_group.tampadev.id]
    subnets = [
      aws_default_subnet.east_1a.id,
      aws_default_subnet.east_1b.id
    ]
  }
}