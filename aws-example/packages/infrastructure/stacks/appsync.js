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
            xrayEnabled: true,
        });
    }
}
exports.AppSyncStack = AppSyncStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwc3luYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFwcHN5bmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0JBQTRCO0FBQzVCLDZDQUFnRDtBQUVoRCxrRUFBbUY7QUFFbkYsTUFBYSxZQUFhLFNBQVEsbUJBQUs7SUFDckMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFrQjtRQUMxRCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixNQUFNLEdBQUcsR0FBRyxJQUFJLDhCQUFVLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRTtZQUM5QyxJQUFJLEVBQUUsTUFBTTtZQUNaLE1BQU0sRUFBRSwwQkFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFBLFdBQUksRUFBQyxTQUFTLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztZQUMzRCxtQkFBbUIsRUFBRTtnQkFDbkIsb0JBQW9CLEVBQUU7b0JBQ3BCLGlCQUFpQixFQUFFLHFDQUFpQixDQUFDLE9BQU87aUJBQzdDO2FBQ0Y7WUFDRCxXQUFXLEVBQUUsSUFBSTtTQUNsQixDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUFmRCxvQ0FlQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IFN0YWNrLCBTdGFja1Byb3BzIH0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgeyBHcmFwaHFsQXBpLCBTY2hlbWEsIEF1dGhvcml6YXRpb25UeXBlIH0gZnJvbSAnQGF3cy1jZGsvYXdzLWFwcHN5bmMtYWxwaGEnO1xuXG5leHBvcnQgY2xhc3MgQXBwU3luY1N0YWNrIGV4dGVuZHMgU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IFN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIGNvbnN0IGFwaSA9IG5ldyBHcmFwaHFsQXBpKHRoaXMsICdHcmFwaFFMLUFwaScsIHtcbiAgICAgIG5hbWU6ICdCbG9nJyxcbiAgICAgIHNjaGVtYTogU2NoZW1hLmZyb21Bc3NldChqb2luKF9fZGlybmFtZSwgJ3NjaGVtYS5ncmFwaHFsJykpLFxuICAgICAgYXV0aG9yaXphdGlvbkNvbmZpZzoge1xuICAgICAgICBkZWZhdWx0QXV0aG9yaXphdGlvbjoge1xuICAgICAgICAgIGF1dGhvcml6YXRpb25UeXBlOiBBdXRob3JpemF0aW9uVHlwZS5BUElfS0VZLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHhyYXlFbmFibGVkOiB0cnVlLFxuICAgIH0pO1xuICB9XG59XG4iXX0=