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


const reviews = [
  {
    id: 'reviewid1',
    product: {id: 'apollo-federation'},
    content: 'awesome !!',
    rating: 5.0
},
{
  id: 'reviewid2',
  product: {id: 'apollo-federation'},
  content: 'awesome 2 !!',
  rating: 5.0
}
]

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  type Product @key(fields: "id") @extends {
    id: ID! @external
    reviews: [Review]
    reviewSummary: ReviewSummary
  }

  """
  This is an Entity, docs:https://www.apollographql.com/docs/federation/entities/
  You will need to define a __resolveReference resolver for the type you define, docs: https://www.apollographql.com/docs/federation/entities/#resolving
  """
  type Review @key(fields: "id") {
    id: ID!
    rating: Float
    content: String
    product: Product
  }

  type ReviewSummary {
    totalReviews: Int
    averageRating: Float
  }

  type Query @extends {
    reviews: [Review]
  }
`;

const resolvers = {
  Product: {
    __resolveReference(reference: any) {
      return {
        id: reference.id,
        reviews: reviews.filter(r => r.product.id === reference.id)
      };
    },
  },
  Query: {
    reviews() {
      return reviews;
    }
  }
};


// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
  plugins: [loggerPlugin]

});


exports.handler = server.createHandler();
