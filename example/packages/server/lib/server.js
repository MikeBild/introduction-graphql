const { join } = require('path');
const { readFile: readFilePromise } = require('fs');
const { promisify } = require('util');
const readFile = promisify(readFilePromise);
const { ApolloServer } = require('apollo-server');
const resolvers = require('./resolvers');
const mocks = require('./mocks');
const datasources = require('./datasources');
module.exports = start;

async function start({ port, isProd }) {
  const typeDefs = (await readFile(
    join(__dirname, 'schema.graphql')
  )).toString();

  const server = new ApolloServer({
    cors             : true,
    typeDefs,
    mocks            : !isProd && mocks,
    mockEntireSchema : false,
    resolvers,
    context          : ({ req }) => ({
      datasources,
      userToken   : req.headers.authorization || '',
    }),
  });

  const { url } = await server.listen(port);

  return {
    stop : async () => await server.stop(),
    url,
  };
}
