import { Stack, StackProps, aws_lambda as lambda } from 'aws-cdk-lib';
import { Construct } from 'constructs';
interface LambdaStackProps extends StackProps {
    envName: string;
}
export declare class LambdaStack extends Stack {
    articlesLambda: lambda.Function;
    constructor(scope: Construct, id: string, props?: LambdaStackProps);
}
export {};
