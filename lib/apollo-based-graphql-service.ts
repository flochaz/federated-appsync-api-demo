import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import * as apigateway from '@aws-cdk/aws-apigateway';
import { join } from 'path';

export interface ApolloBasedServiceProps {
  readonly serviceName: string;
}

export class ApolloBasedService extends cdk.Construct {
  readonly graphQLApiEndpoint: string;
  constructor(scope: cdk.Construct, id: string, props: ApolloBasedServiceProps) {
    super(scope, id);

    //  Service hosted by an Apollo server running on AWS Lambda
    const apolloServer = new lambda.NodejsFunction(this, `${props.serviceName}-ApolloServer`, {
      entry: join(__dirname, `${props.serviceName}.Server.ts`),
      timeout: cdk.Duration.seconds(30),
      handler: 'graphqlHandler',
    });

    const grapqhQLApi = new apigateway.RestApi(this, `${props.serviceName}-Api`, {
      restApiName: `${props.serviceName} graphql endpoint`,
      description: `This service serves ${props.serviceName} data through apollo graphql`,
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS // this is also the default
      }
    });

    const graphqlPostIntegration = new apigateway.LambdaIntegration(apolloServer);

    grapqhQLApi.root.addMethod("POST", graphqlPostIntegration);
    

    this.graphQLApiEndpoint = grapqhQLApi.url;
  }
}