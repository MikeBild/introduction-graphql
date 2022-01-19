using System.Collections.Generic;
using System.Linq;
using GraphQL;

namespace graphql_server_example_dotnet
{
    public class Comment
    {
        public string Id { get; set; }
        public string Text { get; set; }
        public string CommentId { get; set; }
        public string PostId { get; set; }
        

        public Comment Answer(IResolveFieldContext context, Comment source)
        {
            var repository = (context.UserContext as GraphQLUserContext).ExampleRepository;

            return repository.Comments.SingleOrDefault(x => source.CommentId == x.Id);
        }

        public Post Post(IResolveFieldContext context, Comment source)
        {
            var repository = (context.UserContext as GraphQLUserContext).ExampleRepository;

            return repository.Posts.SingleOrDefault(x => source.PostId == x.Id);

        }
    }

}