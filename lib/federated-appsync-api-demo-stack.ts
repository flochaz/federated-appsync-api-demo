import * as cdk from '@aws-cdk/core';
import { ApolloBasedService } from './apollo-based-graphql-service';
import { ApolloFederationGateway } from './apollo-federation-gateway';
import { AppSyncBasedService } from './appsync-based-service';

export class FederatedAppsyncApiDemoStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const usersService = new ApolloBasedService(this, 'UsersService', {
      serviceName: 'users-service',
    });

    const reviewsService = new ApolloBasedService(this, 'ReviewsService', {
      serviceName: 'reviews-service',
    });

    const productsService = new AppSyncBasedService (this, 'ProductsService', {
      serviceName: 'products-service',
    });

    new ApolloFederationGateway(this, 'FederationGateway', {
      serviceList: [
        {
          name: 'User',
          url: usersService.graphQLApiEndpoint,
        },
        {
          name: 'Review',
          url: reviewsService.graphQLApiEndpoint,
        },
        {
          name: 'Product',
          url: productsService.graphQLApiEndpoint,
        }
      ],
    apiKey:  productsService.apiKey,
    });
    
  }
}
