using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GraphQL.Types;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using GraphQL;
using GraphQL.SystemTextJson;
using GraphQL.Server;

namespace graphql_server_example_dotnet
{
    public class Comment
    {
        public string Id { get; set; }
        public string Text { get; set; }

        public Comment Answer(IResolveFieldContext context, Comment source)
        {
            return new Comment { Id = "99", Text = "Comment Answer Text 1" };
        }

        public Post Post(IResolveFieldContext context, Comment source)
        {
            return new Post { Id = "99", Body = "Comment Answer Text 1" };
        }
    }
    public class PostInput
    {
        public string Text { get; set; }
    }
    public class Post
    {
        public string Id { get; set; }
        public string Body { get; set; }

        public Comment[] Comments(IResolveFieldContext context, Post source)
        {
            return new[] { new Comment { Id = "1", Text = "Comment Text 1" } };
        }
    }

    public class Query
    {
        public Post[] posts(IResolveFieldContext context)
        {
            return new[] {
                new Post { Id = "1", Body = "Body A" },
                new Post { Id = "2", Body = "Body B" }
            };
        }
    }

    public class Mutation
    {
        public Post postAdd(IResolveFieldContext context)
        {
            var pi = context.GetArgument<PostInput>("input");
            return new Post { Id = "1", Body = pi.Text };
        }
    }

    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            var schema = Schema.For(@"
            type Post {
                id: ID
                body: String
                comments: [Comment]
            }

            type Comment {
                id: ID
                postId: ID
                text: String
                answer: Comment
                post: Post
            }

            type Query {
                posts: [Post]
            }

            type Mutation {
                postAdd(input: PostInput!): Post
            }

            input PostInput {
                text: String
            }
            ", _ =>
            {
                _.Types.Include<Comment>();
                _.Types.Include<Post>();
                _.Types.Include<Query>();
                _.Types.Include<Mutation>();
            });

            GraphQL.MicrosoftDI.GraphQLBuilderExtensions
                .AddGraphQL(services)
                .AddServer(true)
                .AddSystemTextJson(deserializerSettings => { }, serializerSettings => { })
                .AddSchema<ISchema>(s => schema);
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseGraphQL<ISchema>();
            app.UseGraphQLPlayground();

        }
    }
}
