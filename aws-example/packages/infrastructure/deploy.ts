#!/usr/bin/env node

import { App, Tags } from 'aws-cdk-lib';
import { AppSyncStack } from './stacks/appsync';
import { LambdaStack } from './stacks/lambdas';

const envName = 'Prod';

const app = new App();
Tags.of(app).add('Stage', envName);

const { articlesLambda } = new LambdaStack(app, 'LambdaStack', { envName });
new AppSyncStack(app, 'AppSyncStack', { articlesLambda });
