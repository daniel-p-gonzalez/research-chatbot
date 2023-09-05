variable "aws_region" {
  default = "us-east-1"
}
variable "environment_name" {
  description = "Name of environment"

}
variable "sub_domain_name" {
  default = "chat"
}

variable "base_domain_name" {}
variable "sso_cookie_name" {}
variable "sso_cookie_private_key" {}
variable "sso_cookie_public_key" {}
