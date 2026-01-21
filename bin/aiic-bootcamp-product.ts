#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AiicBootcampProductStack } from '../lib/aiic-bootcamp-product-stack';

const app = new cdk.App();
new AiicBootcampProductStack(app, 'AiicBootcampProductStack', {
  env: {
    account: '395663595720',
    region: 'ap-northeast-1',
  },
});