import { Link } from 'react-router-dom';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
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

  return (
    <div className="product-card">
      <Link to={`/product/${product.productId}`}>
        <img
          src={product.imageUrl || '/placeholder-product.jpg'}
          alt={product.name}
          className="product-image"
        />
        <h3 className="product-title">{product.name}</h3>
      </Link>

      {product.reviewCount > 0 && (
        <div className="product-rating">
          <span className="stars">{renderStars(product.averageRating)}</span>
          <Link to={`/product/${product.productId}#reviews`} className="rating-count">
            ({product.reviewCount})
          </Link>
        </div>
      )}

      <div className="product-price">
        <span className="price-currency">¥</span>
        {product.price.toLocaleString()}
      </div>

      {product.stock > 0 ? (
        <button
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '12px' }}
          onClick={() => onAddToCart && onAddToCart(product.productId)}
        >
          カートに入れる
        </button>
      ) : (
        <div className="product-badge" style={{ background: '#999' }}>
          在庫切れ
        </div>
      )}

      {product.brand && (
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px' }}>
          ブランド: {product.brand}
        </div>
      )}
    </div>
  );
}
