import { RemovalPolicy, CfnOutput, Stack, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as path from 'path';

export interface CloudFrontS3ConstructProps {
  /**
   * フロントエンドのソースディレクトリ
   */
  frontendSourcePath?: string;

  /**
   * 削除ポリシー
   */
  removalPolicy?: RemovalPolicy;

  /**
   * API Gateway URL
   */
  apiUrl: string;
}

export class CloudFrontS3Construct extends Construct {
  public readonly bucket: s3.Bucket;
  public readonly distribution: cloudfront.Distribution;
  public readonly websiteUrl: string;

  constructor(scope: Construct, id: string, props: CloudFrontS3ConstructProps) {
    super(scope, id);

    const removalPolicy = props.removalPolicy || RemovalPolicy.RETAIN;
    const frontendSourcePath = props.frontendSourcePath || path.join(__dirname, '../../../frontend/dist');

    // S3バケット作成
    this.bucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: `ec-frontend-${Stack.of(this).account}-${Stack.of(this).region}`,
      removalPolicy,
      autoDeleteObjects: removalPolicy === RemovalPolicy.DESTROY,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    // CloudFront Origin Access Identity (OAI) を作成
    const oai = new cloudfront.OriginAccessIdentity(this, 'OAI', {
      comment: 'OAI for EC Site Frontend',
    });

    // S3バケットポリシー - CloudFrontからのアクセスのみ許可
    this.bucket.grantRead(oai);

    // CloudFront Distribution作成
    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: Duration.minutes(5),
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: Duration.minutes(5),
        },
      ],
      defaultBehavior: {
        origin: new origins.S3Origin(this.bucket, {
          originAccessIdentity: oai,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        compress: true,
      },
      priceClass: cloudfront.PriceClass.PRICE_CLASS_200,
      comment: 'EC Site Frontend Distribution',
    });

    // S3にフロントエンドファイルをデプロイ
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [
        s3deploy.Source.asset(frontendSourcePath),
        // 環境変数をconfig.jsとして注入
        s3deploy.Source.data(
          'config.js',
          `window.ENV = { API_URL: "${props.apiUrl}" };`
        ),
      ],
      destinationBucket: this.bucket,
      distribution: this.distribution,
      distributionPaths: ['/*'],
    });

    this.websiteUrl = `https://${this.distribution.distributionDomainName}`;

    // CloudFormation出力
    new CfnOutput(this, 'BucketName', {
      value: this.bucket.bucketName,
      description: 'S3 Bucket Name',
      exportName: `${Stack.of(this).stackName}-BucketName`,
    });

    new CfnOutput(this, 'DistributionId', {
      value: this.distribution.distributionId,
      description: 'CloudFront Distribution ID',
      exportName: `${Stack.of(this).stackName}-DistributionId`,
    });

    new CfnOutput(this, 'WebsiteUrl', {
      value: this.websiteUrl,
      description: 'CloudFront Website URL',
      exportName: `${Stack.of(this).stackName}-WebsiteUrl`,
    });
  }
}
