class CustomNavbar extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
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
          padding: 1rem 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }
        .logo {
          font-size: 1.25rem;
          font-weight: 500;
          letter-spacing: 1px;
          color: #333;
          text-decoration: none;
        }
        .nav-links {
          display: flex;
          gap: 2rem;
        }
        .nav-link {
          color: #555;
          text-decoration: none;
          font-size: 1rem;
          position: relative;
          transition: color 0.3s ease;
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
            gap: 1rem;
            padding: 1rem;
          }
          .nav-links {
            width: 100%;
            justify-content: space-around;
          }
        }
      </style>
      <nav>
        <a href="/" class="logo">INK & STEEL</a>
        <div class="nav-links">
          <a href="/" class="nav-link">Gallery</a>
<a href="/inks.html" class="nav-link">Inks</a>
          <a href="/blog.html" class="nav-link">Journal</a>
          <a href="/about.html" class="nav-link">Manifesto</a>
          <a href="/contact.html" class="nav-link">Contact</a>
          <a href="/care.html" class="nav-link">Care</a>
          <donate-button></donate-button>
        </div>
      </nav>
`;
  }
}

customElements.define('custom-navbar', CustomNavbar);