locals {
  assets_path         = "${path.module}/assets"
  assets_s3_origin_id = "KineticChatOrigin"

}



variable "mime_types" {
  default = {
    ".htm"  = "text/html"
    ".html" = "text/html"
    ".css"  = "text/css"
    ".ttf"  = "font/ttf"
    ".js"   = "application/javascript"
    ".map"  = "application/javascript"
    ".json" = "application/json"
  }
}

data "aws_lambda_function" "sso_cookie_decoder" {
  function_name = "sso-cookie-decoder"
}


resource "aws_s3_bucket" "chatbot_assets" {
  bucket = "kinetic${local.env_dash}-chatbot-assets"
  tags = {
    Name = "ChatBotAssets"
  }
}

resource "null_resource" "chatbot_assets" {
  triggers = {
    always_run = "${timestamp()}"
  }

  provisioner "local-exec" {
    command = "yarn run build:client && s5cmd sync --size-only ${path.module}/../dist/client/ s3://${aws_s3_bucket.chatbot_assets.id}/" # echo ${self.private_ip} >> private_ips.txt"
  }
}


# resource "aws_s3_object" "chatbot_assets" {
#   for_each     = fileset("${path.module}/../dist/client", "**/*")
#   bucket       = aws_s3_bucket.chatbot_assets.id
#   content_type = lookup(var.mime_types, regex("\\.[^.]+$", each.value), null)
#   key          = each.value
#   source_hash  = module.chat_message_lambda.lambda_function_source_code_hash
#   source       = "${path.module}/../dist/client/${each.value}"
#   etag         = filemd5("${path.module}/../dist/client/${each.value}")
# }

resource "aws_s3_bucket_public_access_block" "chatbot_assets" {
  bucket = aws_s3_bucket.chatbot_assets.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "chatbot_assets" {
  bucket = aws_s3_bucket.chatbot_assets.id

  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Sid" : "PublicReadGetObject",
        "Effect" : "Allow",
        "Principal" : "*",
        "Action" : ["s3:GetObject"],
        "Resource" : "arn:aws:s3:::${aws_s3_bucket.chatbot_assets.id}/*"
      }
    ]
  })
}

resource "aws_s3_bucket_website_configuration" "chatbot_assets" {
  bucket = aws_s3_bucket.chatbot_assets.id
  index_document {
    suffix = "index.html"
  }
  error_document {
    key = "error.html"
  }
}


// Cloudfront Distribution
resource "aws_cloudfront_distribution" "chatbot" {
  default_root_object = "index.html"

  enabled         = true
  is_ipv6_enabled = true
  comment         = "${var.environment_name} kinetic chatbot"

  origin {
    domain_name = aws_s3_bucket_website_configuration.chatbot_assets.website_endpoint
    origin_id   = local.assets_s3_origin_id
    custom_origin_config {
      http_port                = 80
      https_port               = 443
      origin_keepalive_timeout = 5
      origin_protocol_policy   = "http-only"
      origin_read_timeout      = 10
      origin_ssl_protocols = [
        "TLSv1.2",
      ]
    }
  }


  origin {
    domain_name = replace(module.chatbot_message_lambda.lambda_function_url, "/^https?://([^/]*).*/", "$1")
    origin_id   = module.chatbot_message_lambda.lambda_function_url_id
    custom_origin_config {
      http_port                = 80
      https_port               = 443
      origin_keepalive_timeout = 5
      origin_protocol_policy   = "https-only"
      origin_read_timeout      = 60
      origin_ssl_protocols = [
        "TLSv1.2",
      ]
    }
  }
  origin {
    domain_name = replace(module.chatbot_api_lambda.lambda_function_url, "/^https?://([^/]*).*/", "$1")
    origin_id   = module.chatbot_api_lambda.lambda_function_url_id
    custom_origin_config {
      http_port                = 80
      https_port               = 443
      origin_keepalive_timeout = 5
      origin_protocol_policy   = "https-only"
      origin_read_timeout      = 60
      origin_ssl_protocols = [
        "TLSv1.2",
      ]
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  aliases = [
    local.domain_name, "*.${local.domain_name}",
  ]

  default_cache_behavior {
    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]

    target_origin_id = local.assets_s3_origin_id

    cache_policy_id = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad" # no-cache
    #  "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized

    viewer_protocol_policy = "redirect-to-https"

  }

  ordered_cache_behavior {
    path_pattern     = "/api/chat/message"
    allowed_methods  = ["HEAD", "DELETE", "POST", "GET", "OPTIONS", "PUT", "PATCH"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = module.chatbot_message_lambda.lambda_function_url_id

    compress               = true
    default_ttl            = 0
    max_ttl                = 0
    min_ttl                = 0
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      headers = [
        "Origin",
      ]
      query_string            = true
      query_string_cache_keys = ["end", "start"]

      cookies {
        forward           = "all"
        whitelisted_names = []
      }
    }
  }

  ordered_cache_behavior {
    path_pattern     = "/api/*"
    allowed_methods  = ["HEAD", "DELETE", "POST", "GET", "OPTIONS", "PUT", "PATCH"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = module.chatbot_api_lambda.lambda_function_url_id

    compress               = true
    default_ttl            = 0
    max_ttl                = 0
    min_ttl                = 0
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      headers = [
        "Origin",
      ]
      query_string            = true
      query_string_cache_keys = ["end", "start"]

      cookies {
        forward           = "all"
        whitelisted_names = []
      }
    }
  }


  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.chatbot.arn
    ssl_support_method  = "sni-only"
  }

}

