const { ApolloServer, gql } = require('apollo-server');
const { buildFederatedSchema } = require('@apollo/federation');

const accounts = [{ id: 1, name: 'Joe' }];
const typeDefs = gql`
  type Query {
    accounts: [Account]
  }
  type Account @key(fields: "id") {
    id: ID!
    name: String!
  }
`;

const resolvers = {
  Query: {
    accounts() {
      return accounts;
    },
  },
};

const schema = buildFederatedSchema([{ typeDefs, resolvers }]);

(async () => {
  const server = new ApolloServer({ schema });

  server.listen(4001).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  });
})();
