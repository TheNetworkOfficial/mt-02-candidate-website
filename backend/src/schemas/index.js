const typeDefs = `#graphql
  type Query {
    healthCheck: String
  }

  type Mutation {
    _empty: String
  }
`;

module.exports = typeDefs;