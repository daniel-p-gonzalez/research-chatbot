
resource "aws_ssm_parameter" "cookie_key" {
  name        = "/research/chatbot/${var.environment_name}/sso-cookie"
  description = "values for the sso cookie"
  type        = "SecureString"
  value = jsonencode({
    "name"        = var.sso_cookie_name
    "public_key"  = var.sso_cookie_public_key
    "private_key" = var.sso_cookie_private_key
  })
}
