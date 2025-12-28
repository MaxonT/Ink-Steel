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
          gap: var(--spacing-6);
          align-items: center;
        }
        .nav-link {
          color: #555;
          text-decoration: none;
          font-size: 1rem;
          position: relative;
          transition: color 0.3s ease;
          font-family: 'Cormorant Garamond', serif;
        }
        .nav-link:hover {
          color: #333;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -3px;
          left: 0;
          width: 0;
          height: 1px;
          background-color: #333;
          transition: width 0.3s ease;
        }
        .nav-link:hover::after {
          width: 100%;
        }
        @media (max-width: 768px) {
          nav {
            flex-direction: column;
            gap: var(--spacing-4);
            padding: var(--spacing-4);
          }
          .nav-links {
            width: 100%;
            justify-content: space-around;
            flex-wrap: wrap;
          }
        }
      </style>
      <nav>
        <a href="./" class="logo">INK & STEEL</a>
        <div class="nav-links">
          <a href="./" class="nav-link" aria-current="page">Gallery</a>
          <a href="./inks.html" class="nav-link">Inks</a>
          <a href="./brands.html" class="nav-link">Brands</a>
          <a href="./compare.html" class="nav-link">Compare</a>
          <a href="./favorites.html" class="nav-link" id="favoritesLink">
            Favorites
            <span id="favoritesCount" style="font-size: 0.8em; margin-left: 0.25rem; color: #9f1239;"></span>
          </a>
          <a href="./history.html" class="nav-link">History</a>
          <a href="./stats.html" class="nav-link">Stats</a>
          <a href="./blog.html" class="nav-link">Journal</a>
          <a href="./about.html" class="nav-link">Manifesto</a>
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

