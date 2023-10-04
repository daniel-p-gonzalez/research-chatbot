locals {
  lambda_env = {
    NODE_ENV          = "production"
    ENV_NAME          = var.environment_name
    DYNAMO_DATA_TABLE = aws_dynamodb_table.chatbot.name
  }
}

module "chatbot_message_lambda" {
  source = "terraform-aws-modules/lambda/aws"

  function_name = "chatbot-message${local.env_dash}"

  timeout                    = 900
  invoke_mode                = "RESPONSE_STREAM"
  handler                    = "lambda_chat.handler"
  runtime                    = "nodejs18.x"
  create_lambda_function_url = true
  environment_variables      = local.lambda_env
  create_role                = false # to control creation of the IAM role and policies required for Lambda Function
  lambda_role                = aws_iam_role.chatbot_lambda.arn

  source_path = [
    {
      path = "${path.module}/.."
      pattern = "dist/lambda/lambda_chat*"
      commands = [
        "yarn run build:lamba_chat",
        "cd dist/lambda_chat",
        ":zip",
      ]
    }
  ]

}



module "chatbot_api_lambda" {
  source = "terraform-aws-modules/lambda/aws"

  function_name = "chatbot-api${local.env_dash}"

  timeout                    = 900
  handler                    = "lambda_api.handler"
  runtime                    = "nodejs18.x"
  create_lambda_function_url = true
  environment_variables      = local.lambda_env
  create_role                = false # to control creation of the IAM role and policies required for Lambda Function
  lambda_role                = aws_iam_role.chatbot_lambda.arn

  source_path = [
    {
      path = "${path.module}/.."
      pattern = "dist/lambda/lambda_api*"
      commands = [
        "yarn run build:lambda_api",
        "cd dist/lambda_api",
        ":zip",
      ]
    }
  ]

}
