resource "aws_dynamodb_table" "chatbot" {
  name      = "chatbot${local.env_dash}"
  hash_key  = "pk"
  range_key = "sk"

  global_secondary_index {
    name     = "gs1"
    hash_key = "gs1"
    # write_capacity  = 5
    # read_capacity   = 5
    projection_type = "ALL"
  }

  billing_mode = "PAY_PER_REQUEST"
  # read_capacity  = 5
  # write_capacity = 5
  attribute {
    name = "pk"
    type = "S"
  }
  attribute {
    name = "sk"
    type = "S"
  }
  attribute {
    name = "gs1"
    type = "S"
  }

}
