import { Stack, StackProps, Duration, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DynamoDBConstruct } from './constructs/dynamo-db';
import { LambdaConstruct } from './constructs/lambda';
import { ApiGatewayConstruct } from './constructs/api-gateway';

export class AiicBootcampProductStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    /**
     * DynamoDB テーブルの作成
     */
    const dynamoDB = new DynamoDBConstruct(this, 'DynamoDB', {
      tableName: 'aiic-bootcamp-items',
      removalPolicy: RemovalPolicy.DESTROY, // 開発用設定（本番では変更してください）
    });

    /**
     * Lambda 関数の作成
     */
    const lambdaFunction = new LambdaConstruct(this, 'Lambda', {
      table: dynamoDB.table,
      functionName: 'aiic-bootcamp-api-handler',
      timeout: Duration.seconds(30),
      memorySize: 128,
    });

    /**
     * API Gateway の作成
     */
    new ApiGatewayConstruct(this, 'ApiGateway', {
      lambdaFunction: lambdaFunction.function,
      apiName: 'AIIC Bootcamp API',
      stageName: 'vv1',
      enableCors: true,
    });
  }
}
