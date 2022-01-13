const { join } = require("path");
const { readFile: readFilePromise } = require("fs");
const { promisify } = require("util");
const readFile = promisify(readFilePromise);
const { ApolloServer, SchemaDirectiveVisitor } = require("apollo-server");
const { defaultFieldResolver } = require("graphql");
const resolvers = require("./resolvers");
const mocks = require("./mocks");
const datasources = require("./datasources");
const { PubSub } = require("graphql-subscriptions");
const pubsub = new PubSub();


module.exports = start;

async function start({ port }) {
  const typeDefs = (
    await readFile(join(__dirname, "schema.graphql"))
  ).toString();

  const server = new ApolloServer({
    cors: true,
    introspection: true,
    subscriptions: true,
    schemaDirectives: {
      upper: UpperCaseDirective,
    },
    mocks,
    mockEntireSchema: false,
    typeDefs,
    resolvers,
    context: ({ req }) => ({
      datasources,
      pubsub,
      userToken: (req && req.headers && req.headers.authorization) || "",
    }),
  });

  const { url } = await server.listen(port);

  return {
    stop: async () => await server.stop(),
    url,
  };
}

class UpperCaseDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    field.resolve = async function (...args) {
      const result = await resolve.apply(this, args);
      if (typeof result === "string") {
        return result.toUpperCase();
      }
      return result;
    };
  }
}
