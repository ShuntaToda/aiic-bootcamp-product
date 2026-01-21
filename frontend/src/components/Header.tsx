import { Link } from 'react-router-dom';
import { useState } from 'react';

interface HeaderProps {
  cartCount?: number;
  onSearch?: (keyword: string) => void;
}

export default function Header({ cartCount = 0, onSearch }: HeaderProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  return (
    <header>
      <div className="header-top">
        <Link to="/" className="logo">
          🛒 EC Site
        </Link>

        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="商品を検索"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">🔍</button>
        </form>

        <nav className="header-nav">
          <Link to="/" className="nav-link">
            ホーム
          </Link>
          <Link to="/cart" className="nav-link">
            🛒 カート
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
        </nav>
      </div>

      <div className="header-sub">
        <Link to="/category/Electronics">家電</Link>
        <Link to="/category/Books">本</Link>
        <Link to="/category/Fashion">ファッション</Link>
        <Link to="/category/Food">食品</Link>
        <Link to="/category/Sports">スポーツ</Link>
      </div>
    </header>
  );
}
