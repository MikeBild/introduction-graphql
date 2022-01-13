import { join } from 'path';
import { Stack, StackProps, aws_lambda } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { GraphqlApi, Schema, AuthorizationType } from '@aws-cdk/aws-appsync-alpha';

interface AppSyncStackProps extends StackProps {
  articlesLambda: aws_lambda.Function;
}

export class AppSyncStack extends Stack {
  constructor(scope: Construct, id: string, props: AppSyncStackProps) {
    super(scope, id, props);

    const api = new GraphqlApi(this, 'GraphQL-Api', {
      name: 'Blog',
      schema: Schema.fromAsset(join(__dirname, 'schema.graphql')),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.API_KEY,
        },
      },
    });
    const articlesDataSource = api.addLambdaDataSource('ArticleDataSource', props.articlesLambda);
    api.createResolver({ fieldName: 'articles', typeName: 'Query', dataSource: articlesDataSource });
  }
}
