class CustomFooter extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          background: #333;
          color: white;
          padding: 3rem 2rem;
          margin-top: 5rem;
        }
        .footer-content {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 3rem;
        }
        .footer-section h3 {
          font-size: 1.1rem;
          font-weight: 500;
          margin-bottom: 1.5rem;
          letter-spacing: 0.5px;
        }
        .footer-section p,
        .footer-section a {
          color: #bbb;
          font-size: 0.9rem;
          line-height: 1.6;
        }
        .footer-section a {
          display: block;
          margin-bottom: 0.5rem;
          text-decoration: none;
          transition: color 0.3s ease;
        }
        .footer-section a:hover {
          color: white;
        }
        .copyright {
          text-align: center;
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid #444;
          color: #999;
          font-size: 0.8rem;
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
          <a href="/">Pen Gallery</a>
          <a href="/inks.html">Ink Collection</a>
          <a href="/blog.html">Journal</a>
          <a href="/about.html">Our Philosophy</a>
          <a href="/donate.html">Support Us</a>
        </div>
        <div class="footer-section">
<h3>Connect</h3>
          <a href="/contact.html">Visit Us</a>
          <a href="mailto:contact@inkandsteel.com">Email</a>
          <a href="tel:+18005551234">Phone</a>
        </div>
      </div>
      <div class="copyright">
        &copy; ${new Date().getFullYear()} Ink & Steel. All rights reserved.
      </div>
    `;
  }
}

customElements.define('custom-footer', CustomFooter);