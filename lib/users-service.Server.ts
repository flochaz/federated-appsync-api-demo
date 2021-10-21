import { ApolloServer, gql } from 'apollo-server-lambda';
import { buildSubgraphSchema } from '@apollo/federation';


const loggerPlugin = {
  // Fires whenever a GraphQL request is received from a client.
  async requestDidStart(requestContext: any) {
    console.log('Request started! Query:\n' + requestContext.request.query);

    return {
      // Fires whenever Apollo Server will parse a GraphQL
      // request to create its associated document AST.
      async parsingDidStart() {
        console.log('Parsing started!');
      },

      // Fires whenever Apollo Server will validate a
      // request's document AST against your GraphQL schema.
      async validationDidStart() {
        console.log('Validation started!');
      },
    };
  },
};

const typeDefs = gql`
  type User  @key(fields: "email") {
    email: ID!
    totalProductsCreated: Int
    name: String
  }

  type Query @extends{
    users: [User]
  }

`;

const users = [{email: 'support@apollographql.com', totalProductsCreated: 10, name: 'Me'}];

const resolvers = {
  Product: {
    users: () => [{ email: 'support@flochaz.com', name: 'Apollo Studio Support', totalProductsCreated: 1337 }],
  },
  User: {
    __resolveReference(reference: { email: string; }) {
      return users.find(user => user.email === reference.email);
    }
  },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
  plugins: [loggerPlugin]

});


exports.handler = server.createHandler();
