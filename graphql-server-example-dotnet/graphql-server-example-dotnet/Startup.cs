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
    public class Droid
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public Character Friend(IResolveFieldContext context, Droid source)
        {
            return new Character { Name = "C3-PO" };
        }
    }

    public class Character
    {
        public string Name { get; set; }
    }
    
    public class Post
    {
        public string Id { get; set; }
        public string Text { get; set; }
    }

    public class Query
    {
        public Droid hero(IResolveFieldContext context)
        {
            return new Droid { Id = "1", Name = "R2-D2" };
        }

        public Post[] posts(IResolveFieldContext context)
        {
            return new[] {
                new Post { Id = "1", Text = "Text A" },
                new Post { Id = "2", Text = "Text B" }
            };
        }
    }

    public class Mutation
    {
        public Post postAdd(IResolveFieldContext context)
        {
            return new Post { Id = "1", Text = "Demo" };
        }
    }

    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            var schema = Schema.For(@"
            type Droid {
                id: String
                name: String
                friend: Character
            }

            type Character {
                name: String
            }

            type Post {
                id: ID
                text: String
            }

            type Query {
                hero: Droid
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
                _.Types.Include<Droid>();
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
