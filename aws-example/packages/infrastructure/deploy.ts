#!/usr/bin/env node

import { App } from 'aws-cdk-lib';
import { AppSyncStack } from './stacks/appsync';
import { LambdaStack } from './stacks/lambdas';

const envName = 'Prod';

const app = new App();
const { articlesLambda } = new LambdaStack(app, 'LambdaStack', { envName });
new AppSyncStack(app, 'AppSyncStack', { articlesLambda });
