using System;
using System.Collections.Generic;
using System.Linq;
using GraphQL;
using GraphQL.Types;

namespace graphql_server_example_dotnet
{
    public class Query
    {
        public Post Post(IResolveFieldContext context)
        {
            var byId = context.GetArgument<int>("id");
            
            var repository = (context.UserContext as GraphQLUserContext).ExampleRepository;

            return repository.Posts.SingleOrDefault(x => x.Id == byId.ToString());
        }

        public IEnumerable<Post> Posts(IResolveFieldContext context)
        {
            var input = context.GetArgument<PagedInput>("input", new PagedInput { Take = 100, Skip = 0 });

            var repository = (context.UserContext as GraphQLUserContext).ExampleRepository;

            return repository.Posts.Skip(input.Skip).Take(input.Take);
        }

        public IEnumerable<object> Search(IResolveFieldContext context)
        {
            var repository = (context.UserContext as GraphQLUserContext).ExampleRepository;

            return repository.Comments.Cast<object>().Concat(repository.Posts.Cast<object>());
        }

        public IEnumerable<object> Articles(IResolveFieldContext context)
        {
            Console.WriteLine((context.UserContext as GraphQLUserContext).Token);

            var repository = (context.UserContext as GraphQLUserContext).ExampleRepository;

            return repository.Comments.Cast<object>().Concat(repository.Posts.Cast<object>());
        }
    }

}