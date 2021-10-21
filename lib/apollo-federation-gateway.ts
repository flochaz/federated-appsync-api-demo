import * as cdk from '@aws-cdk/core';
import { ServiceEndpointDefinition } from '@apollo/gateway';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import {Tracing} from '@aws-cdk/aws-lambda';
import * as apigateway from '@aws-cdk/aws-apigateway';

export interface ApolloFederationGatewayProps {
  serviceList: ServiceEndpointDefinition[];
  apiKey: string;
}

export class ApolloFederationGateway extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: ApolloFederationGatewayProps) {
    super(scope, id);

    // Federation Gateway hosted by an Apollo server running on AWS Lambda
    const apolloServer = new lambda.NodejsFunction(this, 'Server', {
      environment: {
        SERVICE_LIST: JSON.stringify(props.serviceList),
        API_KEY: props.apiKey,
      },
      timeout: cdk.Duration.seconds(30),
      tracing: Tracing.ACTIVE,
    });

    const grapqhQLApi = new apigateway.RestApi(this, `Api`, {
      restApiName: "Federation gateway graphql endpoint",
      description: "This service serves composite graphs data through apollo graphql.",
      deployOptions: {
        tracingEnabled: true,
      }
    });
    

    grapqhQLApi.root.addCorsPreflight({
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowHeaders: ['*'],
      allowMethods: apigateway.Cors.ALL_METHODS, // this is also the default,
      
    });

    const graphqlPostIntegration = new apigateway.LambdaIntegration(apolloServer, {
      requestTemplates: { "application/json": '{ "statusCode": "200" }'},
    });

    grapqhQLApi.root.addMethod("POST", graphqlPostIntegration);

  }
}
