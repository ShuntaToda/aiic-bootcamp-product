# 車用品専門ECサイト API仕様書

## 概要

- **API名**: 車用品専門ECサイト API
- **ベースURL**: `https://5y67wr0uvj.execute-api.ap-northeast-1.amazonaws.com/v1`
- **認証**: なし（デモ環境）
- **レスポンス形式**: JSON
- **文字エンコーディング**: UTF-8

---

## 1. ヘルスチェック

### GET /

APIの稼働状況を確認します。

**レスポンス**
```json
{
  "message": "EC Site API is running!",
  "version": "1.0.0",
  "endpoints": {
    "products": "/products",
    "carts": "/carts",
    "orders": "/orders",
    "users": "/users",
    "reviews": "/reviews",
    "search": "/products/search",
    "recommendations": "/products/recommendations"
  }
}
```

---

## 2. 商品管理 (Products)

### GET /products

全商品を取得します。

**レスポンス**
```json
{
  "products": [
    {
      "productId": "uuid",
      "name": "ブリヂストン POTENZA S007A 245/40R18",
      "description": "ハイパフォーマンスタイヤ",
      "price": 28500,
      "stock": 20,
      "category": "Tires",
      "imageUrl": "https://example.com/tire.jpg",
      "averageRating": 4.5,
      "reviewCount": 10,
      "tags": ["タイヤ", "ブリヂストン"],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### GET /products/:productId

特定商品の詳細を取得します。

**パラメータ**
- `productId` (path, required): 商品ID

**レスポンス**
```json
{
  "product": {
    "productId": "uuid",
    "name": "ブリヂストン POTENZA S007A 245/40R18",
    "description": "ハイパフォーマンスタイヤ",
    "price": 28500,
    "stock": 20,
    "category": "Tires",
    "imageUrl": "https://example.com/tire.jpg",
    "averageRating": 4.5,
    "reviewCount": 10,
    "tags": ["タイヤ", "ブリヂストン"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**エラーレスポンス**
- `404 Not Found`: 商品が見つからない

---

### POST /products

新規商品を作成します。

**リクエストボディ**
```json
{
  "name": "ブリヂストン POTENZA S007A 245/40R18",
  "description": "ハイパフォーマンスタイヤ",
  "price": 28500,
  "stock": 20,
  "category": "Tires",
  "imageUrl": "https://example.com/tire.jpg",
  "tags": ["タイヤ", "ブリヂストン"]
}
```

**レスポンス**
```json
{
  "product": {
    "productId": "uuid",
    "name": "ブリヂストン POTENZA S007A 245/40R18",
    ...
  }
}
```

---

### PUT /products/:productId

商品情報を更新します。

**パラメータ**
- `productId` (path, required): 商品ID

**リクエストボディ**
```json
{
  "price": 27000,
  "stock": 15
}
```

**レスポンス**
```json
{
  "product": {
    "productId": "uuid",
    "name": "ブリヂストン POTENZA S007A 245/40R18",
    "price": 27000,
    "stock": 15,
    ...
  }
}
```

---

### DELETE /products/:productId

商品を削除します。

**パラメータ**
- `productId` (path, required): 商品ID

**レスポンス**
```json
{
  "message": "Product deleted successfully"
}
```

---

### GET /products/search

商品を検索します。

**クエリパラメータ**
- `category` (optional): カテゴリ (Tires, Oil, Interior, Exterior, Electronics, Maintenance, Accessories)
- `minPrice` (optional): 最小価格
- `maxPrice` (optional): 最大価格
- `minRating` (optional): 最小評価 (0-5)
- `keyword` (optional): キーワード検索

**レスポンス**
```json
{
  "products": [
    {
      "productId": "uuid",
      "name": "ブリヂストン POTENZA S007A 245/40R18",
      ...
    }
  ],
  "count": 10
}
```

**使用例**
```
GET /products/search?category=Tires&minPrice=20000&minRating=4
GET /products/search?keyword=オイル
```

---

### GET /products/recommendations/:productId

おすすめ商品を取得します。

**パラメータ**
- `productId` (path, required): 基準となる商品ID

**レスポンス**
```json
{
  "recommendations": [
    {
      "productId": "uuid",
      "name": "ヨコハマ ADVAN FLEVA V701",
      ...
    }
  ]
}
```

---

## 3. カート管理 (Carts)

### GET /carts/:userId

ユーザーのカートを取得します。

**パラメータ**
- `userId` (path, required): ユーザーID

**レスポンス**
```json
{
  "cart": {
    "userId": "demo-user-001",
    "items": [
      {
        "productId": "uuid",
        "productName": "ブリヂストン POTENZA S007A",
        "quantity": 4,
        "price": 28500,
        "imageUrl": "https://example.com/tire.jpg"
      }
    ],
    "totalAmount": 114000,
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### POST /carts/:userId/items

カートに商品を追加します。

**パラメータ**
- `userId` (path, required): ユーザーID

**リクエストボディ**
```json
{
  "productId": "uuid",
  "quantity": 4
}
```

**レスポンス**
```json
{
  "message": "Item added to cart",
  "cart": {
    "userId": "demo-user-001",
    "items": [...],
    "totalAmount": 114000
  }
}
```

---

### PUT /carts/:userId/items/:productId

カート内商品の数量を更新します。

**パラメータ**
- `userId` (path, required): ユーザーID
- `productId` (path, required): 商品ID

**リクエストボディ**
```json
{
  "quantity": 8
}
```

**レスポンス**
```json
{
  "message": "Cart item updated",
  "cart": {
    "userId": "demo-user-001",
    "items": [...],
    "totalAmount": 228000
  }
}
```

---

### DELETE /carts/:userId/items/:productId

カートから商品を削除します。

**パラメータ**
- `userId` (path, required): ユーザーID
- `productId` (path, required): 商品ID

**レスポンス**
```json
{
  "message": "Item removed from cart"
}
```

---

### DELETE /carts/:userId

カート全体をクリアします。

**パラメータ**
- `userId` (path, required): ユーザーID

**レスポンス**
```json
{
  "message": "Cart cleared"
}
```

---

## 4. 注文管理 (Orders)

### POST /orders

注文を作成します。

**リクエストボディ**
```json
{
  "userId": "demo-user-001",
  "items": [
    {
      "productId": "uuid",
      "quantity": 4,
      "price": 28500
    }
  ],
  "totalAmount": 125960,
  "shippingAddress": {
    "zipCode": "100-0001",
    "prefecture": "東京都",
    "city": "千代田区",
    "street": "千代田1-1-1"
  }
}
```

**レスポンス**
```json
{
  "order": {
    "orderId": "uuid",
    "userId": "demo-user-001",
    "items": [...],
    "totalAmount": 125960,
    "status": "pending",
    "shippingAddress": {...},
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### GET /orders/user/:userId

ユーザーの注文履歴を取得します。

**パラメータ**
- `userId` (path, required): ユーザーID

**レスポンス**
```json
{
  "orders": [
    {
      "orderId": "uuid",
      "userId": "demo-user-001",
      "totalAmount": 125960,
      "status": "shipped",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### GET /orders/:orderId

注文詳細を取得します。

**パラメータ**
- `orderId` (path, required): 注文ID

**レスポンス**
```json
{
  "order": {
    "orderId": "uuid",
    "userId": "demo-user-001",
    "items": [...],
    "totalAmount": 125960,
    "status": "delivered",
    "shippingAddress": {...},
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  }
}
```

---

### PUT /orders/:orderId/status

注文ステータスを更新します。

**パラメータ**
- `orderId` (path, required): 注文ID

**リクエストボディ**
```json
{
  "status": "shipped"
}
```

**ステータス値**
- `pending`: 注文確定
- `processing`: 処理中
- `shipped`: 発送済み
- `delivered`: 配達完了
- `cancelled`: キャンセル

**レスポンス**
```json
{
  "order": {
    "orderId": "uuid",
    "status": "shipped",
    ...
  }
}
```

---

## 5. ユーザー管理 (Users)

### GET /users

全ユーザーを取得します。

**レスポンス**
```json
{
  "users": [
    {
      "userId": "uuid",
      "email": "user@example.com",
      "name": "山田太郎",
      "address": {...},
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### GET /users/:userId

ユーザー詳細を取得します。

**パラメータ**
- `userId` (path, required): ユーザーID

**レスポンス**
```json
{
  "user": {
    "userId": "uuid",
    "email": "user@example.com",
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
}
```

---

### GET /users/email/:email

メールアドレスでユーザーを検索します。

**パラメータ**
- `email` (path, required): メールアドレス

**レスポンス**
```json
{
  "user": {
    "userId": "uuid",
    "email": "user@example.com",
    ...
  }
}
```

---

### POST /users

新規ユーザーを作成します。

**リクエストボディ**
```json
{
  "email": "user@example.com",
  "name": "山田太郎",
  "address": {
    "zipCode": "100-0001",
    "prefecture": "東京都",
    "city": "千代田区",
    "street": "千代田1-1-1"
  }
}
```

**レスポンス**
```json
{
  "user": {
    "userId": "uuid",
    "email": "user@example.com",
    ...
  }
}
```

---

### PUT /users/:userId

ユーザー情報を更新します。

**パラメータ**
- `userId` (path, required): ユーザーID

**リクエストボディ**
```json
{
  "name": "山田花子",
  "address": {
    "zipCode": "150-0001",
    "prefecture": "東京都",
    "city": "渋谷区",
    "street": "渋谷1-1-1"
  }
}
```

**レスポンス**
```json
{
  "user": {
    "userId": "uuid",
    "name": "山田花子",
    ...
  }
}
```

---

### DELETE /users/:userId

ユーザーを削除します。

**パラメータ**
- `userId` (path, required): ユーザーID

**レスポンス**
```json
{
  "message": "User deleted successfully"
}
```

---

## 6. レビュー管理 (Reviews)

### GET /reviews/product/:productId

商品のレビュー一覧を取得します。

**パラメータ**
- `productId` (path, required): 商品ID

**レスポンス**
```json
{
  "reviews": [
    {
      "reviewId": "uuid",
      "productId": "uuid",
      "userId": "uuid",
      "userName": "山田太郎",
      "rating": 5,
      "title": "グリップ力抜群！",
      "comment": "雨の日でも安定した走行ができます",
      "helpfulCount": 10,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### GET /reviews/user/:userId

ユーザーのレビュー一覧を取得します。

**パラメータ**
- `userId` (path, required): ユーザーID

**レスポンス**
```json
{
  "reviews": [
    {
      "reviewId": "uuid",
      "productId": "uuid",
      "productName": "ブリヂストン POTENZA S007A",
      "rating": 5,
      "title": "グリップ力抜群！",
      ...
    }
  ]
}
```

---

### POST /reviews

新規レビューを作成します。

**リクエストボディ**
```json
{
  "productId": "uuid",
  "userId": "uuid",
  "rating": 5,
  "title": "グリップ力抜群！",
  "comment": "雨の日でも安定した走行ができます"
}
```

**レスポンス**
```json
{
  "review": {
    "reviewId": "uuid",
    "productId": "uuid",
    "userId": "uuid",
    "rating": 5,
    ...
  }
}
```

---

### PUT /reviews/:productId/:reviewId

レビューを更新します。

**パラメータ**
- `productId` (path, required): 商品ID
- `reviewId` (path, required): レビューID

**リクエストボディ**
```json
{
  "rating": 4,
  "title": "グリップ力が良い",
  "comment": "価格がやや高めです"
}
```

**レスポンス**
```json
{
  "review": {
    "reviewId": "uuid",
    "rating": 4,
    ...
  }
}
```

---

### DELETE /reviews/:productId/:reviewId

レビューを削除します。

**パラメータ**
- `productId` (path, required): 商品ID
- `reviewId` (path, required): レビューID

**レスポンス**
```json
{
  "message": "Review deleted successfully"
}
```

---

### POST /reviews/:productId/:reviewId/helpful

レビューを「参考になった」とマークします。

**パラメータ**
- `productId` (path, required): 商品ID
- `reviewId` (path, required): レビューID

**リクエストボディ**
```json
{
  "userId": "uuid"
}
```

**レスポンス**
```json
{
  "message": "Marked as helpful",
  "helpfulCount": 11
}
```

---

## エラーレスポンス

全エンドポイント共通のエラーレスポンス形式:

```json
{
  "error": "エラーメッセージ"
}
```

**HTTPステータスコード**
- `200 OK`: 成功
- `201 Created`: 作成成功
- `400 Bad Request`: リクエストが不正
- `404 Not Found`: リソースが見つからない
- `500 Internal Server Error`: サーバーエラー

---

## カテゴリ一覧

- `Tires`: タイヤ・ホイール
- `Oil`: オイル・ケミカル
- `Interior`: 内装パーツ
- `Exterior`: 外装パーツ
- `Electronics`: 電装品
- `Maintenance`: メンテナンス
- `Accessories`: アクセサリー

---

## データ型

| フィールド | 型 | 説明 |
|---|---|---|
| productId | string (UUID) | 商品ID |
| userId | string (UUID) | ユーザーID |
| orderId | string (UUID) | 注文ID |
| reviewId | string (UUID) | レビューID |
| price | number | 価格（円） |
| stock | number | 在庫数 |
| quantity | number | 数量 |
| rating | number (0-5) | 評価 |
| createdAt | string (ISO 8601) | 作成日時 |
| updatedAt | string (ISO 8601) | 更新日時 |
