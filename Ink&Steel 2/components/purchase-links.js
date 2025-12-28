class PurchaseLinks extends HTMLElement {
  static get observedAttributes() {
    return ['links'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'links' && oldValue !== newValue) {
      this.render();
    }
  }

  render() {
    const linksData = this.getAttribute('links') ? JSON.parse(this.getAttribute('links')) : [];
    
    if (!linksData || linksData.length === 0) {
      this.shadowRoot.innerHTML = '';
      return;
    }

    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #eee;
        }
        .purchase-links-title {
          font-size: 1.2rem;
          font-weight: 400;
          margin-bottom: 1.5rem;
          color: #333;
        }
        .links-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .purchase-link {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid #f0f0f0;
          text-decoration: none;
          color: #333;
          transition: all 0.3s ease;
        }
        .purchase-link:last-child {
          border-bottom: none;
        }
        .purchase-link:hover {
          color: #555;
          padding-left: 0.5rem;
        }
        .link-name {
          font-weight: 400;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .link-price {
          color: #666;
          font-size: 0.9rem;
        }
        .external-icon {
          width: 14px;
          height: 14px;
          opacity: 0.5;
          margin-left: 0.25rem;
        }
        .no-links {
          color: #999;
          font-style: italic;
          font-size: 0.9rem;
        }
      </style>
      <div>
        <h3 class="purchase-links-title">Where to Purchase</h3>
        <div class="links-list">
          ${linksData.map(link => `
            <a href="${link.url}" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="purchase-link">
              <span class="link-name">
                ${link.name}
                <svg class="external-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </span>
              ${link.price ? `<span class="link-price">$${link.price}</span>` : ''}
            </a>
          `).join('')}
        </div>
      </div>
    `;
  }
}

customElements.define('purchase-links', PurchaseLinks);

