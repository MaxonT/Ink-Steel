class CustomNavbar extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap');
        
        :host {
          display: block;
          background: white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-4) var(--spacing-6);
          max-width: var(--max-width-page);
          margin: 0 auto;
        }
        .logo {
          font-size: 1.25rem;
          font-weight: 500;
          letter-spacing: 1px;
          color: #333;
          text-decoration: none;
          font-family: 'Cormorant Garamond', serif;
        }
        .nav-links {
          display: flex;
          gap: var(--spacing-5);
          align-items: center;
        }
        .nav-link {
          color: #555;
          text-decoration: none;
          font-size: var(--font-size-base);
          position: relative;
          transition: color var(--transition-base);
          font-family: 'Cormorant Garamond', serif;
          padding: var(--spacing-2) 0;
        }
        .nav-link:hover {
          color: #333;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 1px;
          background-color: #333;
          transition: width var(--transition-base);
        }
        .nav-link:hover::after {
          width: 100%;
        }
        .nav-link[aria-current="page"] {
          color: #333;
          font-weight: var(--font-weight-medium);
        }
        .nav-link[aria-current="page"]::after {
          width: 100%;
        }
        .nav-secondary {
          display: flex;
          gap: var(--spacing-4);
          align-items: center;
          margin-left: auto;
        }
        .nav-secondary-link {
          color: #999;
          text-decoration: none;
          font-size: var(--font-size-sm);
          font-family: 'Cormorant Garamond', serif;
          transition: color var(--transition-fast);
        }
        .nav-secondary-link:hover {
          color: #666;
        }
        .menu-toggle {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: var(--spacing-2);
          color: #333;
          font-size: var(--font-size-xl);
        }
        .menu-icon {
          width: 24px;
          height: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
        }
        .menu-icon span {
          width: 100%;
          height: 2px;
          background: #333;
          transition: all var(--transition-base);
        }
        .menu-icon.open span:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }
        .menu-icon.open span:nth-child(2) {
          opacity: 0;
        }
        .menu-icon.open span:nth-child(3) {
          transform: rotate(-45deg) translate(7px, -6px);
        }
        .mobile-menu {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          box-shadow: var(--shadow-lg);
          padding: var(--spacing-4);
          flex-direction: column;
          gap: var(--spacing-3);
        }
        .mobile-menu.open {
          display: flex;
        }
        .mobile-menu .nav-link {
          padding: var(--spacing-3) 0;
          border-bottom: 1px solid var(--border-color-light);
        }
        .mobile-menu .nav-link:last-child {
          border-bottom: none;
        }
        @media (max-width: 968px) {
          .nav-secondary {
            display: none;
          }
          .menu-toggle {
            display: block;
          }
          .nav-links {
            display: none;
          }
          nav {
            position: relative;
          }
        }
        @media (min-width: 969px) {
          .mobile-menu {
            display: none !important;
          }
        }
      </style>
      <nav>
        <a href="./" class="logo">INK & STEEL</a>
        <button class="menu-toggle" id="menuToggle" aria-label="Toggle menu">
          <div class="menu-icon">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
        <div class="nav-links">
          <a href="./" class="nav-link" id="navGallery">Gallery</a>
          <a href="./inks.html" class="nav-link" id="navInks">Inks</a>
          <a href="./brands.html" class="nav-link" id="navBrands">Brands</a>
          <a href="./compare.html" class="nav-link" id="navCompare">Compare</a>
          <a href="./favorites.html" class="nav-link" id="favoritesLink">
            Favorites
            <span id="favoritesCount" style="font-size: 0.8em; margin-left: 0.25rem; color: #9f1239;"></span>
          </a>
        </div>
        <div class="nav-secondary">
          <a href="./history.html" class="nav-secondary-link">History</a>
          <a href="./stats.html" class="nav-secondary-link">Stats</a>
          <a href="./blog.html" class="nav-secondary-link">Journal</a>
          <a href="./about.html" class="nav-secondary-link">About</a>
        </div>
        <div class="mobile-menu" id="mobileMenu">
          <a href="./" class="nav-link">Gallery</a>
          <a href="./inks.html" class="nav-link">Inks</a>
          <a href="./brands.html" class="nav-link">Brands</a>
          <a href="./compare.html" class="nav-link">Compare</a>
          <a href="./favorites.html" class="nav-link">Favorites</a>
          <a href="./history.html" class="nav-link">History</a>
          <a href="./stats.html" class="nav-link">Stats</a>
          <a href="./blog.html" class="nav-link">Journal</a>
          <a href="./about.html" class="nav-link">About</a>
          <a href="./contact.html" class="nav-link">Contact</a>
          <a href="./care.html" class="nav-link">Care</a>
        </div>
      </nav>
    `;
    
    // Update favorites count
    this.updateFavoritesCount();
    
    // Listen for favorites updates
    document.addEventListener('favorites-updated', () => {
      this.updateFavoritesCount();
    });
    
    // Mobile menu toggle
    const menuToggle = this.shadowRoot.getElementById('mobileMenuToggle');
    const navLinks = this.shadowRoot.getElementById('navLinks');
    if (menuToggle && navLinks) {
      menuToggle.addEventListener('click', () => {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        navLinks.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', !isExpanded);
      });
      
      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!this.shadowRoot.contains(e.target)) {
          navLinks.classList.remove('active');
          menuToggle.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }
  
  updateFavoritesCount() {
    try {
      const favorites = safeLocalStorageGet('pen-favorites', []);
      const countEl = this.shadowRoot?.getElementById('favoritesCount');
      if (countEl) {
        if (Array.isArray(favorites) && favorites.length > 0) {
          countEl.textContent = `(${favorites.length})`;
        } else {
          countEl.textContent = '';
        }
      }
    } catch (e) {
      handleError(e, 'updateFavoritesCount', false);
    }
  }
}

customElements.define('custom-navbar', CustomNavbar);

