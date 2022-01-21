using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using GraphQL.Types;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using GraphQL;
using GraphQL.SystemTextJson;
using GraphQL.Server;
using Microsoft.Extensions.Logging;
using System.Security.Claims;

namespace graphql_server_example_dotnet
{
    public class GraphQLUserContext : Dictionary<string, object>
    {
        public ClaimsPrincipal User { get; set; }
        public string Token { get; set; }
        public ExampleRepository ExampleRepository { get; set; }
    }
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            var schema = Schema.For(@"
            enum ArticeType {
                COMMENT
                ARTICLE
            }                 

            union ArticleSearch = Post | Comment
            
            interface Article {
                id: ID
            }

            type Post implements Article {
                id: ID
                body: String @deprecated(reason: ""use the new field body2 please"")                
                body2: String
                comments: [Comment]
            }

            type Comment implements Article {
                id: ID
                text: String
                answer: Comment 
                post: Post
            }

            type Query {
                post(id: ID!): Post
                posts(input: PagedInput): [Post]
                search: [ArticleSearch]
                articles: [Article]
            }            

            type Mutation {
                postAdd(input: PostInput!): Post
            }

            input PostInput {
                text: String
            }

            input PagedInput {
                skip: Int
                take: Int
            }
            ", builder =>
            {
                builder.AllowUnknownTypes = true;
                builder.AllowUnknownFields = true;
                builder.Types.For("ArticleSearch").ResolveType = obj => new GraphQLTypeReference(obj.GetType().Name);
                builder.Types.For("Article").ResolveType = obj => new GraphQLTypeReference(obj.GetType().Name);
                builder.Types.Include<Comment>();
                builder.Types.Include<Post>();
                builder.Types.Include<Query>();
                builder.Types.Include<Mutation>();
            });
            services.AddLogging(builder => builder.AddConsole());
            services.AddHttpContextAccessor();

            GraphQL.MicrosoftDI.GraphQLBuilderExtensions
                .AddGraphQL(services)
                .AddServer(true)
                .AddSystemTextJson(deserializerSettings => { }, serializerSettings => { })
                .AddErrorInfoProvider(opt => opt.ExposeExceptionStackTrace = true)
                .AddSchema<ISchema>(s => schema)
                .AddUserContextBuilder(httpContext => new GraphQLUserContext
                {
                    User = httpContext.User,
                    Token = httpContext.Request?.Headers["x-api-key"],
                    ExampleRepository = new ExampleRepository()
                });
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseGraphQL<ISchema>();
            app.UseGraphQLPlayground();
        }
    }
}
