import * as cdk from '@aws-cdk/core';
import * as appsync from '@aws-cdk/aws-appsync';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import { join } from 'path';

export interface AppSyncBasedServiceProps {
  readonly serviceName: string;
}

export class AppSyncBasedService extends cdk.Construct {
  readonly graphQLApiEndpoint: string;
  readonly apiKey: string;

  constructor(scope: cdk.Construct, id: string, props: AppSyncBasedServiceProps) {
    super(scope, id);

    const api = new appsync.GraphqlApi(this, 'Api', {
      name: props.serviceName,
      schema: appsync.Schema.fromAsset(join(__dirname, `${props.serviceName}.graphql`)),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
        },
      },
      xrayEnabled: true,
    });

    const lambdaResolver = new lambda.NodejsFunction(this, 'lambdaResolver', {
      entry: join(__dirname, `${props.serviceName}-resolver.ts`),
      environment: {
        SCHEMA: api.schema.definition.replace('__typename: String!', ''),
      },
    });

    const lambdaDS = api.addLambdaDataSource('LambdaDS', lambdaResolver);

    lambdaDS.createResolver({
      typeName: 'Query',
      fieldName: '_service',
    });

    lambdaDS.createResolver({
      typeName: 'Query',
      fieldName: '_entities',
    });

    // TODO infer from schema
    lambdaDS.createResolver({
      typeName: 'Query',
      fieldName: 'product'});

    lambdaDS.createResolver({
      typeName: 'Product',
      fieldName: 'createdBy'
    });

    this.graphQLApiEndpoint = api.graphqlUrl;
    this.apiKey = api.apiKey!;
  }
}
