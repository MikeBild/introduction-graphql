using System.Collections.Generic;
using System.Linq;

namespace graphql_server_example_dotnet
{
    public class ExampleRepository
    {
        public List<Post> Posts { get; }
        public List<Comment> Comments { get; }

        public ExampleRepository()
        {
            this.Posts = new List<Post> {
                new Post() { Id = "1", Body = "Post A" },
                new Post() { Id = "2", Body = "Post B" }
            };
            this.Comments = new List<Comment>() {
                new Comment() { Id = "1", Text = "Comment A", PostId = "1" },
                new Comment() { Id = "2", Text = "Comment B", PostId = "1" },
                new Comment() { Id = "3", Text = "Comment C", PostId = "1" },
                new Comment() { Id = "4", Text = "Comment D", CommentId = "1" },
                new Comment() { Id = "5", Text = "Comment E", CommentId = "4" }
            };
        }
    }
}