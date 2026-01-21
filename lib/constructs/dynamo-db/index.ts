import { RemovalPolicy, CfnOutput, Stack } from 'aws-cdk-lib';
import { Table, AttributeType, BillingMode } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export interface DynamoDBConstructProps {
  tableName: string;
  removalPolicy?: RemovalPolicy;
}

/**
 * DynamoDB の作成
 */
export class DynamoDBConstruct extends Construct {
  public readonly table: Table;

  constructor(scope: Construct, id: string, props: DynamoDBConstructProps) {
    super(scope, id);

    const table = new Table(this, 'Table', {
      tableName: props.tableName,
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.RETAIN,
      pointInTimeRecovery: true,
    });
    this.table = table;
  }
}
