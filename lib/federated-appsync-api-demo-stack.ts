import * as core from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApolloBasedService } from './apollo-based-graphql-service';
import { ApolloFederationGateway } from './apollo-federation-gateway';
import { AppSyncBasedService } from './appsync-based-service';

export class FederatedAppsyncApiDemoStack extends core.Stack {
  constructor(scope: Construct, id: string, props?: core.StackProps) {
    super(scope, id, props);

    const usersService = new ApolloBasedService(this, 'UsersService', {
      serviceName: 'users-service',
    });

    const reviewsService = new ApolloBasedService(this, 'ReviewsService', {
      serviceName: 'reviews-service',
    });

    const productsService = new AppSyncBasedService(this, 'ProductsService', {
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
        },
      ],
      apiKey: productsService.apiKey,
    });
  }
}
