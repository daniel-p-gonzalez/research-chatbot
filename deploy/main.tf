terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
  backend "s3" {
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Name        = "Kinetic ChatBot"
      Environment = var.environment_name
      Project     = "Research"
      Application = "KineticChatBot"
    }
  }
}
data "aws_caller_identity" "current" {}

locals {
  domain_name    = "${var.sub_domain_name}.${var.base_domain_name}"
  env_dash       = var.environment_name == "production" ? "" : "-${var.environment_name}"
  env_underscore = var.environment_name == "production" ? "" : "_${var.environment_name}"
  account_id     = data.aws_caller_identity.current.account_id
}
