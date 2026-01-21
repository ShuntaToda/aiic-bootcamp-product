# データベーススキーマ一覧

## 概要

- **データベース**: Amazon DynamoDB
- **リージョン**: ap-northeast-1 (東京)
- **テーブル数**: 5
- **削除ポリシー**: DESTROY (開発環境用)
- **Point-in-Time Recovery**: 有効

---

## 1. Products テーブル（商品）

商品情報を管理するテーブル。

### テーブル情報
- **テーブル名**: `AiicBootcampProductStack-ProductsTable`
- **パーティションキー**: `productId` (String)
- **請求モード**: PAY_PER_REQUEST

### GSI (Global Secondary Index)
#### CategoryIndex
- **パーティションキー**: `category` (String)
- **ソートキー**: `averageRating` (Number)
- **用途**: カテゴリ別・評価順での商品検索

### 属性

| 属性名 | 型 | 必須 | 説明 |
|---|---|---|---|
| productId | String | ✓ | 商品ID (UUID) |
| name | String | ✓ | 商品名 |
| description | String | ✓ | 商品説明 |
| price | Number | ✓ | 価格（円） |
| stock | Number | ✓ | 在庫数 |
| category | String | ✓ | カテゴリ |
| imageUrl | String |  | 商品画像URL |
| averageRating | Number |  | 平均評価 (0-5) |
| reviewCount | Number |  | レビュー数 |
| tags | List\<String\> |  | タグ |
| createdAt | String | ✓ | 作成日時 (ISO 8601) |
| updatedAt | String | ✓ | 更新日時 (ISO 8601) |

### カテゴリ値
- `Tires`: タイヤ・ホイール
- `Oil`: オイル・ケミカル
- `Interior`: 内装パーツ
- `Exterior`: 外装パーツ
- `Electronics`: 電装品
- `Maintenance`: メンテナンス
- `Accessories`: アクセサリー

### 例
```json
{
  "productId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "ブリヂストン POTENZA S007A 245/40R18",
  "description": "ハイパフォーマンスタイヤ。優れたグリップ力と静粛性を実現",
  "price": 28500,
  "stock": 20,
  "category": "Tires",
  "imageUrl": "https://example.com/tire-potenza.jpg",
  "averageRating": 4.5,
  "reviewCount": 10,
  "tags": ["タイヤ", "ブリヂストン", "POTENZA"],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## 2. Carts テーブル（カート）

ユーザーのショッピングカート情報を管理するテーブル。

### テーブル情報
- **テーブル名**: `AiicBootcampProductStack-CartsTable`
- **パーティションキー**: `userId` (String)
- **請求モード**: PAY_PER_REQUEST

### 属性

| 属性名 | 型 | 必須 | 説明 |
|---|---|---|---|
| userId | String | ✓ | ユーザーID |
| items | List\<Map\> | ✓ | カート内商品リスト |
| items[].productId | String | ✓ | 商品ID |
| items[].productName | String | ✓ | 商品名 |
| items[].quantity | Number | ✓ | 数量 |
| items[].price | Number | ✓ | 価格 |
| items[].imageUrl | String |  | 商品画像URL |
| totalAmount | Number | ✓ | 合計金額 |
| updatedAt | String | ✓ | 更新日時 (ISO 8601) |

### 例
```json
{
  "userId": "demo-user-001",
  "items": [
    {
      "productId": "550e8400-e29b-41d4-a716-446655440000",
      "productName": "ブリヂストン POTENZA S007A 245/40R18",
      "quantity": 4,
      "price": 28500,
      "imageUrl": "https://example.com/tire-potenza.jpg"
    },
    {
      "productId": "660e8400-e29b-41d4-a716-446655440001",
      "productName": "Castrol EDGE 5W-30 4L",
      "quantity": 2,
      "price": 5980,
      "imageUrl": "https://example.com/oil-castrol.jpg"
    }
  ],
  "totalAmount": 125960,
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## 3. Orders テーブル（注文）

注文情報を管理するテーブル。

### テーブル情報
- **テーブル名**: `AiicBootcampProductStack-OrdersTable`
- **パーティションキー**: `orderId` (String)
- **請求モード**: PAY_PER_REQUEST

### GSI (Global Secondary Index)
#### UserOrdersIndex
- **パーティションキー**: `userId` (String)
- **ソートキー**: `createdAt` (String)
- **用途**: ユーザー別・日時順での注文履歴取得

### 属性

| 属性名 | 型 | 必須 | 説明 |
|---|---|---|---|
| orderId | String | ✓ | 注文ID (UUID) |
| userId | String | ✓ | ユーザーID |
| items | List\<Map\> | ✓ | 注文商品リスト |
| items[].productId | String | ✓ | 商品ID |
| items[].productName | String | ✓ | 商品名 |
| items[].quantity | Number | ✓ | 数量 |
| items[].price | Number | ✓ | 単価 |
| totalAmount | Number | ✓ | 合計金額 |
| status | String | ✓ | 注文ステータス |
| shippingAddress | Map | ✓ | 配送先住所 |
| shippingAddress.zipCode | String | ✓ | 郵便番号 |
| shippingAddress.prefecture | String | ✓ | 都道府県 |
| shippingAddress.city | String | ✓ | 市区町村 |
| shippingAddress.street | String | ✓ | 番地 |
| createdAt | String | ✓ | 作成日時 (ISO 8601) |
| updatedAt | String | ✓ | 更新日時 (ISO 8601) |

### ステータス値
- `pending`: 注文確定
- `processing`: 処理中
- `shipped`: 発送済み
- `delivered`: 配達完了
- `cancelled`: キャンセル

### 例
```json
{
  "orderId": "770e8400-e29b-41d4-a716-446655440002",
  "userId": "demo-user-001",
  "items": [
    {
      "productId": "550e8400-e29b-41d4-a716-446655440000",
      "productName": "ブリヂストン POTENZA S007A 245/40R18",
      "quantity": 4,
      "price": 28500
    },
    {
      "productId": "660e8400-e29b-41d4-a716-446655440001",
      "productName": "Castrol EDGE 5W-30 4L",
      "quantity": 2,
      "price": 5980
    }
  ],
  "totalAmount": 125960,
  "status": "shipped",
  "shippingAddress": {
    "zipCode": "100-0001",
    "prefecture": "東京都",
    "city": "千代田区",
    "street": "千代田1-1-1"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-02T00:00:00.000Z"
}
```

---

## 4. Users テーブル（ユーザー）

ユーザー情報を管理するテーブル。

### テーブル情報
- **テーブル名**: `AiicBootcampProductStack-UsersTable`
- **パーティションキー**: `userId` (String)
- **請求モード**: PAY_PER_REQUEST

### GSI (Global Secondary Index)
#### EmailIndex
- **パーティションキー**: `email` (String)
- **用途**: メールアドレスでのユーザー検索

### 属性

| 属性名 | 型 | 必須 | 説明 |
|---|---|---|---|
| userId | String | ✓ | ユーザーID (UUID) |
| email | String | ✓ | メールアドレス |
| name | String | ✓ | 氏名 |
| address | Map | ✓ | 住所 |
| address.zipCode | String | ✓ | 郵便番号 |
| address.prefecture | String | ✓ | 都道府県 |
| address.city | String | ✓ | 市区町村 |
| address.street | String | ✓ | 番地 |
| createdAt | String | ✓ | 作成日時 (ISO 8601) |
| updatedAt | String | ✓ | 更新日時 (ISO 8601) |

### 例
```json
{
  "userId": "demo-user-001",
  "email": "yamada@example.com",
  "name": "山田太郎",
  "address": {
    "zipCode": "100-0001",
    "prefecture": "東京都",
    "city": "千代田区",
    "street": "千代田1-1-1"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## 5. Reviews テーブル（レビュー）

商品レビュー情報を管理するテーブル。

### テーブル情報
- **テーブル名**: `AiicBootcampProductStack-ReviewsTable`
- **パーティションキー**: `productId` (String)
- **ソートキー**: `reviewId` (String)
- **請求モード**: PAY_PER_REQUEST

### GSI (Global Secondary Index)
#### UserReviewsIndex
- **パーティションキー**: `userId` (String)
- **ソートキー**: `createdAt` (String)
- **用途**: ユーザー別・日時順でのレビュー取得

### 属性

| 属性名 | 型 | 必須 | 説明 |
|---|---|---|---|
| productId | String | ✓ | 商品ID |
| reviewId | String | ✓ | レビューID (UUID) |
| userId | String | ✓ | ユーザーID |
| userName | String | ✓ | ユーザー名 |
| rating | Number | ✓ | 評価 (0-5) |
| title | String | ✓ | レビュータイトル |
| comment | String | ✓ | レビューコメント |
| helpfulCount | Number |  | 参考になった数 |
| createdAt | String | ✓ | 作成日時 (ISO 8601) |
| updatedAt | String | ✓ | 更新日時 (ISO 8601) |

### 例
```json
{
  "productId": "550e8400-e29b-41d4-a716-446655440000",
  "reviewId": "880e8400-e29b-41d4-a716-446655440003",
  "userId": "demo-user-001",
  "userName": "山田太郎",
  "rating": 5,
  "title": "グリップ力抜群！",
  "comment": "雨の日でも安定した走行ができます。静粛性も高く満足しています。",
  "helpfulCount": 10,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## アクセスパターン

### Products テーブル
1. **全商品取得**: `Scan`
2. **商品詳細取得**: `GetItem` (productId)
3. **カテゴリ別検索**: `Query` on CategoryIndex (category, averageRating)
4. **商品作成**: `PutItem`
5. **商品更新**: `UpdateItem`
6. **商品削除**: `DeleteItem`

### Carts テーブル
1. **カート取得**: `GetItem` (userId)
2. **カート更新**: `UpdateItem` (userId)
3. **カート削除**: `DeleteItem` (userId)

### Orders テーブル
1. **注文作成**: `PutItem`
2. **注文詳細取得**: `GetItem` (orderId)
3. **ユーザー別注文履歴**: `Query` on UserOrdersIndex (userId, createdAt)
4. **注文ステータス更新**: `UpdateItem` (orderId)

### Users テーブル
1. **全ユーザー取得**: `Scan`
2. **ユーザー詳細取得**: `GetItem` (userId)
3. **メールアドレス検索**: `Query` on EmailIndex (email)
4. **ユーザー作成**: `PutItem`
5. **ユーザー更新**: `UpdateItem`
6. **ユーザー削除**: `DeleteItem`

### Reviews テーブル
1. **商品別レビュー取得**: `Query` (productId)
2. **ユーザー別レビュー取得**: `Query` on UserReviewsIndex (userId, createdAt)
3. **レビュー作成**: `PutItem`
4. **レビュー更新**: `UpdateItem` (productId, reviewId)
5. **レビュー削除**: `DeleteItem` (productId, reviewId)

---

## 容量見積もり（参考）

| テーブル | 想定レコード数 | 平均サイズ | 合計サイズ |
|---|---|---|---|
| Products | 1,000 | 1 KB | 1 MB |
| Carts | 10,000 | 2 KB | 20 MB |
| Orders | 100,000 | 3 KB | 300 MB |
| Users | 10,000 | 500 B | 5 MB |
| Reviews | 10,000 | 1 KB | 10 MB |
| **合計** | | | **336 MB** |

---

## インデックス戦略

### GSI設計のポイント
1. **CategoryIndex**: カテゴリ別商品検索を高速化
2. **UserOrdersIndex**: ユーザー別注文履歴を時系列順で取得
3. **EmailIndex**: メールアドレスでのユーザー検索を高速化
4. **UserReviewsIndex**: ユーザー別レビュー履歴を時系列順で取得

### パフォーマンス最適化
- **Query優先**: Scanを避け、Queryを使用
- **射影式**: 必要な属性のみをGSIに含める
- **パーティション設計**: 均等なデータ分散

---

## データ整合性

### 商品削除時の対応
1. Reviews テーブルの該当レビューを削除（または論理削除）
2. Carts テーブルから該当商品を削除
3. Orders テーブルは履歴として保持

### レビュー投稿時の対応
1. Reviewsテーブルにレビューを追加
2. Productsテーブルの`averageRating`と`reviewCount`を更新

### トランザクション
- DynamoDB Transactionsを使用して複数テーブルの整合性を保つ

---

## バックアップ・リストア

### Point-in-Time Recovery (PITR)
- 全テーブルで有効化
- 過去35日間のデータを復元可能

### 削除ポリシー
- 開発環境: `DESTROY` (スタック削除時にテーブル削除)
- 本番環境: `RETAIN` 推奨（誤削除防止）

---

## コスト最適化

### 請求モード
- **PAY_PER_REQUEST**: リクエスト数に応じた課金
- **メリット**: キャパシティ管理不要、トラフィック変動に柔軟

### 推奨設定（本番環境）
- トラフィックが安定している場合は`PROVISIONED`に変更を検討
- Auto Scalingで自動調整
