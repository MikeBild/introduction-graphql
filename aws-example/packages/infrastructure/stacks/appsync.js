"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppSyncStack = void 0;
const path_1 = require("path");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_appsync_alpha_1 = require("@aws-cdk/aws-appsync-alpha");
class AppSyncStack extends aws_cdk_lib_1.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const api = new aws_appsync_alpha_1.GraphqlApi(this, 'GraphQL-Api', {
            name: 'Blog',
            schema: aws_appsync_alpha_1.Schema.fromAsset((0, path_1.join)(__dirname, 'schema.graphql')),
            authorizationConfig: {
                defaultAuthorization: {
                    authorizationType: aws_appsync_alpha_1.AuthorizationType.API_KEY,
                },
            },
        });
        const articlesDataSource = api.addLambdaDataSource('ArticleDataSource', props.articlesLambda);
        api.createResolver({ fieldName: 'articles', typeName: 'Query', dataSource: articlesDataSource });
    }
}
exports.AppSyncStack = AppSyncStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwc3luYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFwcHN5bmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0JBQTRCO0FBQzVCLDZDQUE0RDtBQUU1RCxrRUFBbUY7QUFNbkYsTUFBYSxZQUFhLFNBQVEsbUJBQUs7SUFDckMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUF3QjtRQUNoRSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixNQUFNLEdBQUcsR0FBRyxJQUFJLDhCQUFVLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRTtZQUM5QyxJQUFJLEVBQUUsTUFBTTtZQUNaLE1BQU0sRUFBRSwwQkFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFBLFdBQUksRUFBQyxTQUFTLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztZQUMzRCxtQkFBbUIsRUFBRTtnQkFDbkIsb0JBQW9CLEVBQUU7b0JBQ3BCLGlCQUFpQixFQUFFLHFDQUFpQixDQUFDLE9BQU87aUJBQzdDO2FBQ0Y7U0FDRixDQUFDLENBQUM7UUFDSCxNQUFNLGtCQUFrQixHQUFHLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxtQkFBbUIsRUFBRSxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDOUYsR0FBRyxDQUFDLGNBQWMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO0lBQ25HLENBQUM7Q0FDRjtBQWhCRCxvQ0FnQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBqb2luIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBTdGFjaywgU3RhY2tQcm9wcywgYXdzX2xhbWJkYSB9IGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0IHsgR3JhcGhxbEFwaSwgU2NoZW1hLCBBdXRob3JpemF0aW9uVHlwZSB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1hcHBzeW5jLWFscGhhJztcblxuaW50ZXJmYWNlIEFwcFN5bmNTdGFja1Byb3BzIGV4dGVuZHMgU3RhY2tQcm9wcyB7XG4gIGFydGljbGVzTGFtYmRhOiBhd3NfbGFtYmRhLkZ1bmN0aW9uO1xufVxuXG5leHBvcnQgY2xhc3MgQXBwU3luY1N0YWNrIGV4dGVuZHMgU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogQXBwU3luY1N0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIGNvbnN0IGFwaSA9IG5ldyBHcmFwaHFsQXBpKHRoaXMsICdHcmFwaFFMLUFwaScsIHtcbiAgICAgIG5hbWU6ICdCbG9nJyxcbiAgICAgIHNjaGVtYTogU2NoZW1hLmZyb21Bc3NldChqb2luKF9fZGlybmFtZSwgJ3NjaGVtYS5ncmFwaHFsJykpLFxuICAgICAgYXV0aG9yaXphdGlvbkNvbmZpZzoge1xuICAgICAgICBkZWZhdWx0QXV0aG9yaXphdGlvbjoge1xuICAgICAgICAgIGF1dGhvcml6YXRpb25UeXBlOiBBdXRob3JpemF0aW9uVHlwZS5BUElfS0VZLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9KTtcbiAgICBjb25zdCBhcnRpY2xlc0RhdGFTb3VyY2UgPSBhcGkuYWRkTGFtYmRhRGF0YVNvdXJjZSgnQXJ0aWNsZURhdGFTb3VyY2UnLCBwcm9wcy5hcnRpY2xlc0xhbWJkYSk7XG4gICAgYXBpLmNyZWF0ZVJlc29sdmVyKHsgZmllbGROYW1lOiAnYXJ0aWNsZXMnLCB0eXBlTmFtZTogJ1F1ZXJ5JywgZGF0YVNvdXJjZTogYXJ0aWNsZXNEYXRhU291cmNlIH0pO1xuICB9XG59XG4iXX0=