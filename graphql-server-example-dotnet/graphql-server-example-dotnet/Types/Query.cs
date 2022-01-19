using System;
using System.Collections.Generic;
using System.Linq;
using GraphQL;

namespace graphql_server_example_dotnet
{
    public class Query
    {
        public IEnumerable<Post> Posts(IResolveFieldContext context)
        {
            var repository = (context.UserContext as GraphQLUserContext).ExampleRepository;
            
            return repository.Posts;
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