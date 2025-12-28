class PurchaseLinks extends HTMLElement {
  static get observedAttributes() {
    return ['links', 'currency'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if ((name === 'links' || name === 'currency') && oldValue !== newValue) {
      this.render();
    }
  }

  render() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    const linksData = this.getAttribute('links') ? JSON.parse(this.getAttribute('links')) : [];
    const preferredCurrency = this.getAttribute('currency') || 'USD';
    
    if (!linksData || linksData.length === 0) {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
          }
        </style>
        <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #eee;">
          <p style="color: #999; font-style: italic; font-size: 0.9rem;">No purchase links available at this time.</p>
        </div>
      `;
      return;
    }

    // Group by region
    const groupedByRegion = linksData.reduce((acc, link) => {
      const region = link.region || 'Global';
      if (!acc[region]) {
        acc[region] = [];
      }
      acc[region].push(link);
      return acc;
    }, {});

    // Sort links within each region by price
    Object.keys(groupedByRegion).forEach(region => {
      groupedByRegion[region].sort((a, b) => {
        const priceA = a.price || Infinity;
        const priceB = b.price || Infinity;
        return priceA - priceB;
      });
    });

    const formatPrice = (price, currency) => {
      if (!price) return '';
      const currencySymbols = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥',
        'CNY': '¥'
      };
      const symbol = currencySymbols[currency] || currency;
      if (currency === 'JPY' || currency === 'CNY') {
        return `${symbol}${price.toLocaleString()}`;
      }
      return `${symbol}${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #eee;
        }
        .purchase-links-title {
          font-size: 1.5rem;
          font-weight: 400;
          margin-bottom: 1.5rem;
          color: #333;
          font-family: 'Cormorant Garamond', serif;
        }
        .region-group {
          margin-bottom: 2rem;
        }
        .region-title {
          font-size: 1.1rem;
          font-weight: 500;
          margin-bottom: 1rem;
          color: #555;
          font-family: 'Cormorant Garamond', serif;
        }
        .links-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .purchase-link {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          text-decoration: none;
          color: #333;
          transition: all 0.3s ease;
          background: white;
        }
        .purchase-link:hover {
          border-color: #999;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transform: translateY(-1px);
        }
        .link-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .link-name {
          font-weight: 400;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.1rem;
        }
        .link-availability {
          font-size: 0.85rem;
          color: #666;
          padding: 0.25rem 0.5rem;
          border-radius: 3px;
          background: #f5f5f5;
        }
        .link-availability.in-stock {
          background: #e8f5e9;
          color: #2e7d32;
        }
        .link-price {
          color: #333;
          font-size: 1.1rem;
          font-weight: 500;
          font-family: 'Cormorant Garamond', serif;
        }
        .external-icon {
          width: 16px;
          height: 16px;
          opacity: 0.5;
          margin-left: 0.5rem;
        }
        .purchase-link:hover .external-icon {
          opacity: 0.8;
        }
      </style>
      <div>
        <h3 class="purchase-links-title">Where to Purchase</h3>
        ${Object.keys(groupedByRegion).map(region => `
          <div class="region-group">
            <h4 class="region-title">${region}</h4>
            <div class="links-list">
              ${groupedByRegion[region].map(link => `
                <a href="${link.url}" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="purchase-link">
                  <div class="link-info">
                    <span class="link-name">
                      ${link.name}
                      <svg class="external-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                    </span>
                    ${link.availability ? `
                      <span class="link-availability ${link.availability.toLowerCase().includes('stock') ? 'in-stock' : ''}">
                        ${link.availability}
                      </span>
                    ` : ''}
                  </div>
                  ${link.price ? `<span class="link-price">${formatPrice(link.price, link.currency || preferredCurrency)}</span>` : ''}
                </a>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
}

customElements.define('purchase-links', PurchaseLinks);

