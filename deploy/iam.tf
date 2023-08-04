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
