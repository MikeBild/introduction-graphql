import { join } from 'path';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { GraphqlApi, Schema, AuthorizationType } from '@aws-cdk/aws-appsync-alpha';

export class AppSyncStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const api = new GraphqlApi(this, 'GraphQL-Api', {
      name: 'Blog',
      schema: Schema.fromAsset(join(__dirname, 'schema.graphql')),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.API_KEY,
        },
      }
    });
  }
}
