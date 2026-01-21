import { CfnOutput, Stack } from 'aws-cdk-lib';
import { LambdaRestApi, Cors, MethodLoggingLevel } from 'aws-cdk-lib/aws-apigateway';
import { Function } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export interface ApiGatewayConstructProps {
  lambdaFunction: Function;
  apiName: string;
  stageName?: string;
  throttlingRateLimit?: number;
  throttlingBurstLimit?: number;
  enableCors?: boolean;
}

export class ApiGatewayConstruct extends Construct {
  public readonly api: LambdaRestApi;
  public readonly apiUrl: string;

  constructor(scope: Construct, id: string, props: ApiGatewayConstructProps) {
    super(scope, id);

    const corsOptions = props.enableCors !== false
      ? {
          allowOrigins: Cors.ALL_ORIGINS,
          allowMethods: Cors.ALL_METHODS,
          allowHeaders: ['Content-Type', 'Authorization'],
        }
      : undefined;

    const api = new LambdaRestApi(this, 'Api', {
      handler: props.lambdaFunction,
      restApiName: props.apiName,
      description: `API Gateway for ${props.apiName}`,
      proxy: true,
      deployOptions: {
        stageName: props.stageName || 'dev',
        throttlingRateLimit: props.throttlingRateLimit || 100,
        throttlingBurstLimit: props.throttlingBurstLimit || 200,
        loggingLevel: MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        metricsEnabled: true,
      },
      defaultCorsPreflightOptions: corsOptions,
    });
    this.api = api;
    this.apiUrl = api.url;

    // CloudFormation出力
    new CfnOutput(this, 'ApiUrl', {
      value: this.apiUrl,
      description: 'API Gateway URL',
      exportName: `${Stack.of(this).stackName}-ApiUrl`,
    });
  }
}
