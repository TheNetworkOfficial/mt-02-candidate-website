const resolvers = {
    Query: {
      healthCheck: () => "Server is healthy"
    },
    Mutation: {
      _empty: () => ""
    }
  };
  
  module.exports = resolvers;