import { RemovalPolicy, CfnOutput, Stack } from 'aws-cdk-lib';
import { Table, AttributeType, BillingMode } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export interface DynamoDBConstructProps {
  tableName: string;
  removalPolicy?: RemovalPolicy;
}

export class DynamoDBConstruct extends Construct {
  public readonly table: Table;

  constructor(scope: Construct, id: string, props: DynamoDBConstructProps) {
    super(scope, id);

    this.table = new Table(this, 'Table', {
      tableName: props.tableName,
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: props.removalPolicy || RemovalPolicy.RETAIN,
      pointInTimeRecovery: true, // バックアップ機能を有効化
    });

    // CloudFormation出力
    new CfnOutput(this, 'TableName', {
      value: this.table.tableName,
      description: 'DynamoDB Table Name',
      exportName: `${Stack.of(this).stackName}-TableName`,
    });

    new CfnOutput(this, 'TableArn', {
      value: this.table.tableArn,
      description: 'DynamoDB Table ARN',
      exportName: `${Stack.of(this).stackName}-TableArn`,
    });
  }
}
