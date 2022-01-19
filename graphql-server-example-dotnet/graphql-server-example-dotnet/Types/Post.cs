using System.Collections.Generic;
using System.Linq;
using GraphQL;

namespace graphql_server_example_dotnet
{
    public class Post
    {
        public string Id { get; set; }
        public string Body { get; set; }

        public IEnumerable<Comment> Comments(IResolveFieldContext context, Post source)
        {
            var repository = (context.UserContext as GraphQLUserContext).ExampleRepository;

            return repository.Comments.Where(x => source.Id == x.CommentId);
        }
    }

}