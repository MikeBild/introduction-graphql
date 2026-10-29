const { ApolloServer, gql } = require('apollo-server');
const { buildFederatedSchema } = require('@apollo/federation');

const profiles = [{ id: 1, url: 'http://kko.com/demo.jpg' }];
const typeDefs = gql`
  type Query {
    profiles: [Profile]
  }
  type Profile @key(fields: "id") {
    id: ID!
    url: String!
  }
`;

const resolvers = {
  Query: {
    profiles() {
      return profiles;
    },
  },
};

const schema = buildFederatedSchema([{ typeDefs, resolvers }]);

(async () => {
  const server = new ApolloServer({ schema });

  server.listen(4002).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  });
})();
