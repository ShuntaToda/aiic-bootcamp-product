import { Hono } from 'hono';
import { handle } from 'hono/aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const app = new Hono();

// DynamoDB クライアント初期化
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME || '';

// ヘルスチェック
app.get('/', (c) => {
  return c.json({ message: 'API is running!' });
});

// 全アイテム取得
app.get('/items', async (c) => {
  try {
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
      })
    );
    return c.json({ items: result.Items || [] });
  } catch (error) {
    console.error('Error fetching items:', error);
    return c.json({ error: 'Failed to fetch items' }, 500);
  }
});

// 単一アイテム取得
app.get('/items/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { id },
      })
    );

    if (!result.Item) {
      return c.json({ error: 'Item not found' }, 404);
    }

    return c.json({ item: result.Item });
  } catch (error) {
    console.error('Error fetching item:', error);
    return c.json({ error: 'Failed to fetch item' }, 500);
  }
});

// アイテム作成
app.post('/items', async (c) => {
  try {
    const body = await c.req.json();
    const item = {
      id: crypto.randomUUID(),
      ...body,
      createdAt: new Date().toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      })
    );

    return c.json({ item }, 201);
  } catch (error) {
    console.error('Error creating item:', error);
    return c.json({ error: 'Failed to create item' }, 500);
  }
});

// アイテム更新
app.put('/items/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const body = await c.req.json();
    const item = {
      id,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      })
    );

    return c.json({ item });
  } catch (error) {
    console.error('Error updating item:', error);
    return c.json({ error: 'Failed to update item' }, 500);
  }
});

// アイテム削除
app.delete('/items/:id', async (c) => {
  const id = c.req.param('id');
  try {
    await docClient.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { id },
      })
    );

    return c.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    return c.json({ error: 'Failed to delete item' }, 500);
  }
});

export const handler = handle(app);
