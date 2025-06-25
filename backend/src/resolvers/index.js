const resolvers = {
    Query: {
      healthCheck: () => "Server is healthy"
    },
    Mutation: {
      rollDice: (_, { numDice, numSides = 20 }) => 
        Array.from({ length: numDice }, () => 
          1 + Math.floor(Math.random() * (numSides || 20))
        )
    }
  };
  
  module.exports = resolvers;