# AIIC Bootcamp Product - API Gateway + Lambda (Hono) + DynamoDB

API Gateway、Lambda (TypeScript + Hono)、DynamoDB を AWS CDK (TypeScript) で実装したプロジェクトです。

## アーキテクチャ

- **API Gateway**: REST API のエントリーポイント
- **Lambda**: Hono フレームワークを使用した TypeScript API
- **DynamoDB**: NoSQL データベース（アイテム管理）

## セットアップ

### 前提条件
- Node.js 20.x 以上
- pnpm 9.x 以上 (`npm install -g pnpm` でインストール)

### 手順

1. CDKプロジェクトの依存関係をインストール:
```bash
pnpm install
```

2. Lambda関数の依存関係をインストール:
```bash
cd lambda/api
pnpm install
cd ../..
```

3. CDKスタックをビルド:
```bash
pnpm run build
```

4. CloudFormationテンプレートを確認:
```bash
pnpm cdk synth
```

## デプロイ

AWSにデプロイする前に、AWS認証情報を設定してください。

```bash
# 初回デプロイ時（CDK Bootstrapが必要な場合）
pnpm cdk bootstrap

# スタックをデプロイ
pnpm cdk deploy
```

デプロイ後、API GatewayのURLがターミナルに出力されます。

## API エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/` | ヘルスチェック |
| GET | `/items` | 全アイテム取得 |
| GET | `/items/:id` | 単一アイテム取得 |
| POST | `/items` | アイテム作成 |
| PUT | `/items/:id` | アイテム更新 |
| DELETE | `/items/:id` | アイテム削除 |

## 使用例

```bash
# ヘルスチェック
curl https://<api-id>.execute-api.<region>.amazonaws.com/dev/

# アイテム作成
curl -X POST https://<api-id>.execute-api.<region>.amazonaws.com/dev/items \
  -H "Content-Type: application/json" \
  -d '{"name": "Sample Item", "description": "This is a test"}'

# 全アイテム取得
curl https://<api-id>.execute-api.<region>.amazonaws.com/dev/items

# 単一アイテム取得
curl https://<api-id>.execute-api.<region>.amazonaws.com/dev/items/<item-id>

# アイテム更新
curl -X PUT https://<api-id>.execute-api.<region>.amazonaws.com/dev/items/<item-id> \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Item", "description": "Updated description"}'

# アイテム削除
curl -X DELETE https://<api-id>.execute-api.<region>.amazonaws.com/dev/items/<item-id>
```

## CDKコマンド

* `pnpm run build`   TypeScriptをJSにコンパイル
* `pnpm run watch`   変更を監視してコンパイル
* `pnpm run test`    Jestユニットテストを実行
* `pnpm cdk deploy`  スタックをAWSアカウント/リージョンにデプロイ
* `pnpm cdk diff`    デプロイ済みスタックと現在の状態を比較
* `pnpm cdk synth`   CloudFormationテンプレートを生成
* `pnpm cdk destroy` スタックを削除

## プロジェクト構造

```
.
├── bin/
│   └── aiic-bootcamp-product.ts           # CDKアプリのエントリーポイント
├── lib/
│   ├── aiic-bootcamp-product-stack.ts     # メインCDKスタック
│   └── constructs/                        # 再利用可能なConstructs
│       ├── dynamo-db/
│       │   └── index.ts                   # DynamoDB Construct
│       ├── lambda/
│       │   └── index.ts                   # Lambda Construct
│       └── api-gateway/
│           └── index.ts                   # API Gateway Construct
├── lambda/
│   └── api/
│       ├── index.ts                       # Lambda関数（Hono API）
│       ├── package.json
│       └── tsconfig.json
├── test/
├── cdk.json
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
└── README.md
```
