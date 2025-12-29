class InkDetail extends HTMLElement {
  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }
    this.render();
  }

  static get observedAttributes() {
    return ['ink-data'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'ink-data' && oldValue !== newValue) {
      this.render();
    }
  }

  render() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    // Safe escapeHtml function for use in this component
    const escapeHtmlSafe = (text) => {
      if (typeof escapeHtml !== 'undefined') {
        return escapeHtml(text);
      }
      if (text == null) return '';
      const div = document.createElement('div');
      div.textContent = String(text);
      return div.innerHTML;
    };

    try {
      const inkDataAttr = this.getAttribute('ink-data');
      let inkData = null;
      
      if (inkDataAttr) {
        try {
          inkData = JSON.parse(inkDataAttr);
        } catch (e) {
          if (typeof handleError !== 'undefined') {
            handleError(e, 'InkDetail.render - JSON parse', false);
          }
          this.shadowRoot.innerHTML = '<p style="padding: 2rem; text-align: center; color: #666;">Error loading ink data.</p>';
          return;
        }
      }
      
      if (!inkData) {
        this.shadowRoot.innerHTML = '<p style="padding: 2rem; text-align: center; color: #666;">Loading...</p>';
        return;
      }

    const swatchColors = inkData.swatches || [];
    const purchaseLinks = inkData.purchaseLinks || [];

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap');
        
        :host {
          display: block;
        }
        .ink-detail-container {
          max-width: var(--max-width-page);
          margin: 0 auto;
          background: white;
          padding: var(--spacing-4);
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .ink-header {
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid #eee;
        }
        .ink-brand {
          font-size: 1rem;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 0.5rem;
          font-family: 'Cormorant Garamond', serif;
        }
        .ink-name {
          font-size: 2.5rem;
          font-weight: 400;
          margin-bottom: 1rem;
          font-family: 'Cormorant Garamond', serif;
        }
        .ink-description {
          font-size: 1.1rem;
          color: #555;
          line-height: 1.8;
          font-style: italic;
          margin-bottom: 1.5rem;
          font-family: 'Cormorant Garamond', serif;
        }
        .swatches-section {
          margin: 2rem 0;
        }
        .swatches-title {
          font-size: 1.5rem;
          font-weight: 400;
          margin-bottom: 1.5rem;
          font-family: 'Cormorant Garamond', serif;
        }
        .swatches-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .swatch-item {
          text-align: center;
        }
        .swatch-color {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 4px;
          margin-bottom: 0.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          border: 1px solid #eee;
        }
        .swatch-label {
          font-size: 0.9rem;
          color: #666;
          font-family: 'Cormorant Garamond', serif;
        }
        .ink-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin: 2rem 0;
        }
        .info-section {
          border-top: 1px solid #eee;
          padding-top: 1.5rem;
        }
        .info-title {
          font-size: 1.2rem;
          font-weight: 500;
          margin-bottom: 1rem;
          font-family: 'Cormorant Garamond', serif;
        }
        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid #f5f5f5;
          font-family: 'Cormorant Garamond', serif;
        }
        .info-label {
          font-weight: 500;
          color: #666;
        }
        .info-value {
          color: #333;
        }
        .purchase-links-section {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #eee;
        }
        .back-link {
          display: inline-block;
          margin-top: 2rem;
          color: #666;
          text-decoration: none;
          font-family: 'Cormorant Garamond', serif;
          transition: color 0.3s ease;
        }
        .back-link:hover {
          color: #333;
        }
      </style>
      <div class="ink-detail-container">
        <div class="ink-header">
          <p class="ink-brand">${escapeHtmlSafe(inkData.brand || 'Unknown Brand')}</p>
          <h1 class="ink-name">${escapeHtmlSafe(inkData.name || 'Ink Name')}</h1>
          ${inkData.description ? `<p class="ink-description">${escapeHtmlSafe(inkData.description)}</p>` : ''}
        </div>

        ${swatchColors.length > 0 ? `
          <div class="swatches-section">
            <h2 class="swatches-title">Color Swatches</h2>
            <div class="swatches-grid">
              ${swatchColors.map(swatch => {
                const safeColor = (swatch.color || '#000').replace(/[<>"']/g, '');
                return `
                <div class="swatch-item">
                  <div class="swatch-color" style="background-color: ${safeColor}"></div>
                  <div class="swatch-label">${escapeHtmlSafe(swatch.label || '')}</div>
                </div>
              `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        <div class="ink-info">
          ${inkData.properties ? `
            <div class="info-section">
              <h3 class="info-title">Properties</h3>
              ${inkData.properties.color ? `
                <div class="info-item">
                  <span class="info-label">Color:</span>
                  <span class="info-value">${escapeHtmlSafe(String(inkData.properties.color))}</span>
                </div>
              ` : ''}
              ${inkData.properties.flow ? `
                <div class="info-item">
                  <span class="info-label">Flow:</span>
                  <span class="info-value">${escapeHtml(String(inkData.properties.flow))}</span>
                </div>
              ` : ''}
              ${inkData.properties.lubrication ? `
                <div class="info-item">
                  <span class="info-label">Lubrication:</span>
                  <span class="info-value">${escapeHtml(String(inkData.properties.lubrication))}</span>
                </div>
              ` : ''}
              ${inkData.properties.waterResistance ? `
                <div class="info-item">
                  <span class="info-label">Water Resistance:</span>
                  <span class="info-value">${escapeHtml(String(inkData.properties.waterResistance))}</span>
                </div>
              ` : ''}
              ${inkData.properties.feathering ? `
                <div class="info-item">
                  <span class="info-label">Feathering:</span>
                  <span class="info-value">${escapeHtml(String(inkData.properties.feathering))}</span>
                </div>
              ` : ''}
              ${inkData.properties.bleedThrough ? `
                <div class="info-item">
                  <span class="info-label">Bleed Through:</span>
                  <span class="info-value">${escapeHtml(String(inkData.properties.bleedThrough))}</span>
                </div>
              ` : ''}
            </div>
          ` : ''}

          ${inkData.volume || inkData.bottleSize ? `
            <div class="info-section">
              <h3 class="info-title">Specifications</h3>
              ${inkData.volume ? `
                <div class="info-item">
                  <span class="info-label">Volume:</span>
                  <span class="info-value">${escapeHtml(String(inkData.volume))}ml</span>
                </div>
              ` : ''}
              ${inkData.bottleSize ? `
                <div class="info-item">
                  <span class="info-label">Bottle Size:</span>
                  <span class="info-value">${escapeHtml(String(inkData.bottleSize))}</span>
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>

        ${purchaseLinks.length > 0 ? `
          <div class="purchase-links-section">
            <h3 class="info-title">Where to Acquire</h3>
            ${purchaseLinks.map(link => {
              const safeUrl = typeof sanitizeUrl !== 'undefined' ? (sanitizeUrl(link.url) || link.url || '#') : (link.url || '#');
              const safeName = escapeHtmlSafe(link.name || '');
              const safePrice = link.price ? escapeHtmlSafe(String(link.price)) : null;
              return `
              <div style="margin: 1rem 0;">
                <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" 
                   style="color: #333; text-decoration: none; font-family: 'Cormorant Garamond', serif; font-size: 1.1rem;">
                  ${safeName} ${safePrice ? `($${safePrice})` : ''} →
                </a>
              </div>
            `;
            }).join('')}
          </div>
        ` : ''}

        <a href="./inks.html" class="back-link">← Back to Ink Collection</a>
      </div>
    `;
    } catch (e) {
      if (typeof handleError !== 'undefined') {
        handleError(e, 'InkDetail.render', false);
      }
      this.shadowRoot.innerHTML = '<p style="padding: 2rem; text-align: center; color: #666;">Error rendering ink details.</p>';
      return;
    }
  }
}

customElements.define('ink-detail', InkDetail);

