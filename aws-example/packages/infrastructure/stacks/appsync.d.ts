import { Stack, StackProps, aws_lambda } from 'aws-cdk-lib';
import { Construct } from 'constructs';
interface AppSyncStackProps extends StackProps {
    articlesLambda: aws_lambda.Function;
}
export declare class AppSyncStack extends Stack {
    constructor(scope: Construct, id: string, props: AppSyncStackProps);
}
export {};
