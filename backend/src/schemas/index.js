const typeDefs = `#graphql
  type Query {
    healthCheck: String
  }

  type Mutation {
    rollDice(numDice: Int!, numSides: Int): [Int]
  }
`;

module.exports = typeDefs;