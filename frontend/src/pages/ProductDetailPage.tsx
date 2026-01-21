import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProduct, getProductReviews, getRecommendations, addToCart } from '../utils/api';
import type { Product, Review } from '../types';
import ProductCard from '../components/ProductCard';

const USER_ID = 'demo-user-001';

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productId) {
      loadProductData(productId);
    }
  }, [productId]);

  const loadProductData = async (id: string) => {
    try {
      setLoading(true);
      const [productData, reviewsData, recommendationsData] = await Promise.all([
        getProduct(id),
        getProductReviews(id),
        getRecommendations(id),
      ]);
      setProduct(productData);
      setReviews(reviewsData);
      setRecommendations(recommendationsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await addToCart(USER_ID, product.productId, 1);
      alert('カートに追加しました！');
    } catch (err) {
      alert('カートへの追加に失敗しました');
    }
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push('★');
    }
    if (hasHalfStar) {
      stars.push('⯨');
    }
    while (stars.length < 5) {
      stars.push('☆');
    }

    return stars.join('');
  };

  if (loading) return <div className="loading">読み込み中...</div>;
  if (!product) return <div className="error">商品が見つかりません</div>;

  return (
    <main>
      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '40px', marginBottom: '40px' }}>
        <div>
          <img
            src={product.imageUrl || '/placeholder-product.jpg'}
            alt={product.name}
            style={{ width: '100%', border: '1px solid var(--border-color)', borderRadius: '8px' }}
          />
        </div>

        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '16px' }}>{product.name}</h1>

          {product.reviewCount > 0 && (
            <div className="product-rating" style={{ marginBottom: '16px' }}>
              <span className="stars" style={{ fontSize: '20px' }}>{renderStars(product.averageRating)}</span>
              <span style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>
                {product.averageRating.toFixed(1)} / 5.0 ({product.reviewCount}件のレビュー)
              </span>
            </div>
          )}

          <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>
            ¥{product.price.toLocaleString()}
          </div>

          {product.brand && (
            <div style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--text-secondary)' }}>
              ブランド: <Link to={`/search?brand=${product.brand}`} style={{ color: 'var(--amazon-blue)' }}>{product.brand}</Link>
            </div>
          )}

          <div style={{ fontSize: '16px', marginBottom: '24px', lineHeight: '1.6' }}>
            {product.description}
          </div>

          {product.stock > 0 ? (
            <>
              <div style={{ color: '#007600', fontWeight: 'bold', marginBottom: '16px' }}>
                在庫あり（{product.stock}個）
              </div>
              <button className="btn btn-primary" style={{ fontSize: '16px', padding: '12px 32px' }} onClick={handleAddToCart}>
                カートに入れる
              </button>
            </>
          ) : (
            <div style={{ color: '#B12704', fontWeight: 'bold' }}>現在在庫切れです</div>
          )}
        </div>
      </div>

      {reviews.length > 0 && (
        <div id="reviews" style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>カスタマーレビュー</h2>
          {reviews.map((review) => (
            <div
              key={review.reviewId}
              style={{
                padding: '20px',
                borderBottom: '1px solid var(--border-color)',
                marginBottom: '16px',
              }}
            >
              <div className="product-rating" style={{ marginBottom: '8px' }}>
                <span className="stars">{renderStars(review.rating)}</span>
                <span style={{ fontWeight: 'bold', marginLeft: '8px' }}>{review.title}</span>
                {review.verified && (
                  <span style={{ marginLeft: '8px', color: 'var(--amazon-blue)', fontSize: '14px' }}>
                    ✓ 認証済み購入
                  </span>
                )}
              </div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '14px' }}>
                {new Date(review.createdAt).toLocaleDateString('ja-JP')}
              </p>
              <p style={{ lineHeight: '1.6' }}>{review.comment}</p>
              {review.helpful > 0 && (
                <p style={{ marginTop: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {review.helpful}人が参考になったと評価しています
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {recommendations.length > 0 && (
        <div>
          <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>こちらもおすすめ</h2>
          <div className="products-grid">
            {recommendations.map((rec) => (
              <ProductCard key={rec.productId} product={rec} onAddToCart={handleAddToCart} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
