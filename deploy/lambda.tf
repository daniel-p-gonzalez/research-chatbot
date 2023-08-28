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
  handler                    = "chatbot-post-message-lambda.handler"
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
        ":zip dist/chatbot-post-message-lambda.js .",
      ]
    }
  ]

}

module "fetch_chat_messages_lambda" {
  source                     = "terraform-aws-modules/lambda/aws"
  function_name              = "kinetic${local.env_dash}-chatbot-fetch-messages"
  timeout                    = 60
  handler                    = "chatbot-fetch-messages-lambda.handler"
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
        ":zip dist/chatbot-fetch-messages-lambda.js .",
      ]
    }
  ]
}
