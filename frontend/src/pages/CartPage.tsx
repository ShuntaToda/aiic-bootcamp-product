import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCart, updateCartItem, removeFromCart, getProduct } from '../utils/api';
import type { CartItem, Product } from '../types';

const USER_ID = 'demo-user-001';

export default function CartPage() {
  const [cartItems, setCartItems] = useState<(CartItem & { product?: Product })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const items = await getCart(USER_ID);

      // 各カートアイテムの商品情報を取得
      const itemsWithProducts = await Promise.all(
        items.map(async (item) => {
          try {
            const product = await getProduct(item.productId);
            return { ...item, product };
          } catch {
            return item;
          }
        })
      );

      setCartItems(itemsWithProducts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      await updateCartItem(USER_ID, productId, newQuantity);
      setCartItems((prev) =>
        prev.map((item) =>
          item.productId === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (err) {
      alert('数量の更新に失敗しました');
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      await removeFromCart(USER_ID, productId);
      setCartItems((prev) => prev.filter((item) => item.productId !== productId));
    } catch (err) {
      alert('削除に失敗しました');
    }
  };

  const total = cartItems.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  if (loading) return <div className="loading">読み込み中...</div>;

  return (
    <main className="cart-container">
      <h1 style={{ fontSize: '28px', marginBottom: '24px' }}>ショッピングカート</h1>

      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--text-secondary)' }}>
            カートは空です
          </p>
          <Link to="/" className="btn btn-primary">
            買い物を続ける
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
          <div style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            {cartItems.map((item) => (
              <div key={item.productId} className="cart-item">
                <Link to={`/product/${item.productId}`}>
                  <img
                    src={item.product?.imageUrl || '/placeholder-product.jpg'}
                    alt={item.product?.name}
                    className="cart-item-image"
                  />
                </Link>

                <div className="cart-item-details">
                  <Link to={`/product/${item.productId}`} className="cart-item-title">
                    {item.product?.name || '商品名を取得中...'}
                  </Link>

                  {item.product && (
                    <>
                      <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                        ¥{item.product.price.toLocaleString()}
                      </div>

                      {item.product.stock > 0 ? (
                        <div style={{ color: '#007600', fontSize: '14px' }}>在庫あり</div>
                      ) : (
                        <div style={{ color: '#B12704', fontSize: '14px' }}>在庫切れ</div>
                      )}
                    </>
                  )}

                  <div className="quantity-selector">
                    <button onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}>
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}>
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => handleRemove(item.productId)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--amazon-blue)',
                      cursor: 'pointer',
                      fontSize: '14px',
                      textDecoration: 'underline',
                      padding: 0,
                    }}
                  >
                    削除
                  </button>
                </div>

                <div style={{ fontSize: '20px', fontWeight: 'bold', alignSelf: 'flex-start' }}>
                  ¥{((item.product?.price || 0) * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>ご注文内容</h3>
            <div className="summary-row">
              <span>小計 ({cartItems.reduce((sum, item) => sum + item.quantity, 0)}点):</span>
              <span>¥{total.toLocaleString()}</span>
            </div>
            <div className="summary-total summary-row">
              <span>合計:</span>
              <span style={{ color: 'var(--amazon-orange)' }}>¥{total.toLocaleString()}</span>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '16px', fontSize: '16px' }}
              onClick={() => alert('チェックアウト機能は未実装です')}
            >
              レジに進む
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
