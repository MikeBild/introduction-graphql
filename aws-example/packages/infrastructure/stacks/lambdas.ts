import { join } from 'path';
import { Stack, StackProps, aws_lambda as lambda, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface LambdaStackProps extends StackProps {
  envName: string;
}

export class LambdaStack extends Stack {
  articlesLambda: lambda.Function;

  constructor(scope: Construct, id: string, props?: LambdaStackProps) {
    super(scope, id, props);

    this.articlesLambda = new lambda.Function(this, 'ArticlesFunctions', {
      runtime: lambda.Runtime.NODEJS_12_X,
      timeout: Duration.seconds(60),
      memorySize: props?.envName === 'Prod' ? 128 : 256,
      handler: 'articles.list',
      code: lambda.Code.fromAsset(join(__dirname, '../lambdas')),
    });    
  }
}
