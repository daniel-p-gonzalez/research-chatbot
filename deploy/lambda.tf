locals {
  lambda_env = {
    NODE_ENV          = "production"
    ENV_NAME          = var.environment_name
    DYNAMO_DATA_TABLE = aws_dynamodb_table.chatbot.name
  }
}

module "chat_message_lambda" {
  source = "terraform-aws-modules/lambda/aws"

  function_name = "kinetic${local.env_dash}-chatbot-post-message"

  timeout                    = 900
  invoke_mode                = "RESPONSE_STREAM"
  handler                    = "chat-message-lambda.handler"
  runtime                    = "nodejs18.x"
  create_lambda_function_url = true
  environment_variables      = local.lambda_env
  create_role                = false # to control creation of the IAM role and policies required for Lambda Function
  lambda_role                = aws_iam_role.chatbot_lambda.arn
  # layers = [
  #   "arn:aws:lambda:us-east-2:590474943231:layer:AWS-Parameters-and-Secrets-Lambda-Extension:10",
  # ]

  source_path = [
    {
      path = "${path.module}/.."
      commands = [
        "yarn run build:all",
        ":zip dist/chat-message-lambda.js .",
      ]
    }
  ]

}

module "fetch_chat_messages_lambda" {
  source                     = "terraform-aws-modules/lambda/aws"
  function_name              = "kinetic${local.env_dash}-chatbot-fetch-messages"
  timeout                    = 60
  handler                    = "chat-history-lambda.handler"
  runtime                    = "nodejs18.x"
  create_lambda_function_url = true
  environment_variables      = local.lambda_env
  create_role                = false # to control creation of the IAM role and policies required for Lambda Function
  lambda_role                = aws_iam_role.chatbot_lambda.arn
  source_path = [
    {
      path = "${path.module}/.."
      commands = [
        "yarn run build:all",
        ":zip dist/chat-history-lambda.js .",
      ]
    }
  ]
}

resource "aws_iam_role" "chatbot_lambda" {
  name = "kinetic${local.env_dash}-chatbot-lambda"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Sid    = ""
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "chatbot_policy" {
  role       = aws_iam_role.chatbot_lambda.id
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}


resource "aws_iam_role_policy" "chatbot_lambda" {
  name = "kinetic${local.env_dash}-chatbot-lambda"
  role = aws_iam_role.chatbot_lambda.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid      = "ChatAPIDynamoDBListTables"
        Effect   = "Allow",
        Resource = "*",
        Action = [
          "dynamodb:ListTables",
          "dynamodb:Query",
        ],
      },
      {
        Sid      = "ChatAPIAccessForDynamoDB"
        Effect   = "Allow",
        Resource = aws_dynamodb_table.chatbot.arn,
        Action = [
          "dynamodb:GetItem",
          "dynamodb:Query",
          "dynamodb:BatchWriteItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
        ],
      },
      {
        Sid      = "ParameterStoreAccess"
        Effect   = "Allow",
        Resource = "arn:aws:ssm:${var.aws_region}:${local.account_id}:parameter/research/chatbot/*",
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters",
        ],
      },
    ]
  })
}

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
