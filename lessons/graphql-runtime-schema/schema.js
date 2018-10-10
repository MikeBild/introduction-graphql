const fs = require('fs');
const path = require('path');
const graphqlTools = require('graphql-tools');
const definition = fs.readFileSync(path.join(__dirname, 'schema.graphql'));

module.exports = graphqlTools.makeExecutableSchema({
  typeDefs: definition.toString(),
  resolvers: resolve(),
});

function resolve() {
  return (resolvers = {
    SearchResult: {
      content: (source, args, context, info) => source.content,
    },
    Query: {
      search: (source, args, context, info) => ({ content: args.term }),
    },
    Mutation: {
      doSomething: (source, args, context, info) => 'Transaction ID',
    },
  });
}
