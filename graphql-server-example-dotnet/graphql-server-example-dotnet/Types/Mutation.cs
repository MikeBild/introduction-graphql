using System.Collections.Generic;
using System.Linq;
using GraphQL;

namespace graphql_server_example_dotnet
{
    public class Mutation
    {
        public Post PostAdd(IResolveFieldContext context)
        {
            var input = context.GetArgument<PostInput>("input");
            return new Post { Id = "1", Body = input.Text };
        }
    }

}