class CustomFooter extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap');
        
        :host {
          display: block;
          background: #333;
          color: white;
          padding: var(--spacing-7) var(--spacing-6);
          margin-top: var(--spacing-8);
        }
        .footer-content {
          max-width: var(--max-width-page);
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--spacing-7);
        }
        .footer-section h3 {
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-medium);
          margin-bottom: var(--spacing-5);
          letter-spacing: 0.5px;
          font-family: 'Cormorant Garamond', serif;
        }
        .footer-section p,
        .footer-section a {
          color: #bbb;
          font-size: var(--font-size-sm);
          line-height: var(--line-height-normal);
          font-family: 'Cormorant Garamond', serif;
        }
        .footer-section a {
          display: block;
          margin-bottom: var(--spacing-2);
          text-decoration: none;
          transition: color var(--transition-base);
        }
        .footer-section a:hover {
          color: white;
        }
        .copyright {
          text-align: center;
          margin-top: var(--spacing-7);
          padding-top: var(--spacing-6);
          border-top: 1px solid #444;
          color: #999;
          font-size: var(--font-size-xs);
          font-family: 'Cormorant Garamond', serif;
        }
        @media (max-width: 768px) {
          .footer-content {
            grid-template-columns: 1fr;
          }
        }
      </style>
      <div class="footer-content">
        <div class="footer-section">
          <h3>Ink & Steel</h3>
          <p>A gallery of writing's most elegant companions</p>
        </div>
        <div class="footer-section">
          <h3>Explore</h3>
          <a href="./">Pen Gallery</a>
          <a href="./inks.html">Ink Collection</a>
          <a href="./brands.html">Brands</a>
          <a href="./compare.html">Compare Pens</a>
          <a href="./favorites.html">Favorites</a>
          <a href="./history.html">History</a>
          <a href="./stats.html">Statistics</a>
          <a href="./blog.html">Journal</a>
          <a href="./about.html">Our Philosophy</a>
        </div>
        <div class="footer-section">
          <h3>Connect</h3>
          <a href="./contact.html">Visit Us</a>
          <a href="mailto:contact@inkandsteel.com">Email</a>
        </div>
      </div>
      <div class="copyright">
        &copy; ${new Date().getFullYear()} Ink & Steel. All rights reserved.
      </div>
    `;
  }
}

customElements.define('custom-footer', CustomFooter);

