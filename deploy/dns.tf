data "aws_route53_zone" "kinetic" {
  name = var.base_domain_name
}

resource "aws_route53_zone" "kinetic_chatbot" {
  name = local.domain_name
}

# resource "aws_route53_record" "kinetic_workspaces_ns" {
#   zone_id = data.aws_route53_zone.kinetic.zone_id
#   name    = aws_route53_zone.kinetic_workspaces.name
#   type    = "NS"
#   ttl     = "30"
#   records = aws_route53_zone.kinetic_workspaces.name_servers
# }

resource "aws_acm_certificate" "chatbot" {
  domain_name               = local.domain_name
  subject_alternative_names = ["*.${local.domain_name}"]
  validation_method         = "DNS"
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "chatbot_cert_validation" {
  allow_overwrite = true
  name            = tolist(aws_acm_certificate.chatbot.domain_validation_options)[0].resource_record_name
  records         = [tolist(aws_acm_certificate.chatbot.domain_validation_options)[0].resource_record_value]
  type            = tolist(aws_acm_certificate.chatbot.domain_validation_options)[0].resource_record_type
  zone_id         = data.aws_route53_zone.kinetic.id
  ttl             = 60
}

resource "aws_acm_certificate_validation" "chatbot" {
  certificate_arn         = aws_acm_certificate.chatbot.arn
  validation_record_fqdns = ["${aws_route53_record.chatbot_cert_validation.fqdn}"]
}

resource "aws_route53_record" "chatbot" {
  name    = local.domain_name
  type    = "A"
  zone_id = data.aws_route53_zone.kinetic.id

  alias {
    name    = aws_cloudfront_distribution.chatbot.domain_name
    zone_id = aws_cloudfront_distribution.chatbot.hosted_zone_id

    evaluate_target_health = true
  }
}
