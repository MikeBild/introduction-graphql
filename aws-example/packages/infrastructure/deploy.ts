#!/usr/bin/env node

import { App } from 'aws-cdk-lib';
import { AppSyncStack } from './stacks/appsync';
import { LambdaStack } from './stacks/lambdas';

const app = new App();
new AppSyncStack(app, 'AppSyncStack');
new LambdaStack(app, 'LambdaStack');
