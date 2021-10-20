import { ApolloServer } from 'apollo-server-lambda';
import { ApolloGateway, RemoteGraphQLDataSource } from '@apollo/gateway';

class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  willSendRequest({ request }: any) {
    // Pass the user's id from the context to each subgraph
    // as a header called `user-id`
    request.http.headers.set('x-api-key', process.env.API_KEY);
  }
}

// Initialize an ApolloGateway instance and pass it
// the supergraph schema
const gateway = new ApolloGateway({
  serviceList: JSON.parse(process.env.SERVICE_LIST!),
  buildService({ name, url }) {
    return new AuthenticatedDataSource({ url });
  },
});

// Pass the ApolloGateway to the ApolloServer constructor
const server = new ApolloServer({
  gateway,
  debug: true,
});

exports.graphqlHandler = server.createHandler();
