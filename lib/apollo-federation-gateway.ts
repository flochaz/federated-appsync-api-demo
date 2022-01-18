import * as core from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ServiceEndpointDefinition } from '@apollo/gateway';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import { Tracing } from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export interface ApolloFederationGatewayProps {
  serviceList: ServiceEndpointDefinition[];
  apiKey: string;
}

export class ApolloFederationGateway extends Construct {
  constructor(scope: Construct, id: string, props: ApolloFederationGatewayProps) {
    super(scope, id);

    // Federation Gateway hosted by an Apollo server running on AWS Lambda
    const apolloServer = new lambda.NodejsFunction(this, 'Server', {
      environment: {
        SERVICE_LIST: JSON.stringify(props.serviceList),
        API_KEY: props.apiKey,
      },
      timeout: core.Duration.seconds(30),
      tracing: Tracing.ACTIVE,
    });

    const grapqhQLApi = new apigateway.RestApi(this, `Api`, {
      restApiName: 'Federation gateway graphql endpoint',
      description: 'This service serves composite graphs data through apollo graphql.',
      deployOptions: {
        tracingEnabled: true,
      },
    });

    grapqhQLApi.root.addCorsPreflight({
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowHeaders: ['*'],
      allowMethods: apigateway.Cors.ALL_METHODS, // this is also the default,
    });

    const graphqlPostIntegration = new apigateway.LambdaIntegration(apolloServer, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
    });

    grapqhQLApi.root.addMethod('POST', graphqlPostIntegration);
  }
}
