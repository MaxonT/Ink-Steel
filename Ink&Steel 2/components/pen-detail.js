class PenDetail extends HTMLElement {
  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }
    this.render();
  }

  static get observedAttributes() {
    return ['pen-data'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'pen-data' && oldValue !== newValue) {
      this.render();
    }
  }

  render() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }
    
    const penData = this.getAttribute('pen-data') ? JSON.parse(this.getAttribute('pen-data')) : null;
    
    if (!penData) {
      this.shadowRoot.innerHTML = '<p>Loading...</p>';
      return;
    }

    const specs = penData.specifications || {};
    const nib = specs.nib || {};
    const images = penData.images || {};
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          background: white;
          padding: 2rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          border-radius: 4px;
          max-width: 1200px;
          margin: 2rem auto;
        }
        .pen-detail-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
        }
        .pen-info h1 {
          font-size: 2.5rem;
          font-weight: 300;
          margin-bottom: 0.5rem;
        }
        .pen-brand-model {
          font-size: 1.2rem;
          color: #666;
          margin-bottom: 1rem;
          font-weight: 400;
        }
        .pen-description {
          font-style: italic;
          color: #666;
          margin-bottom: 1.5rem;
        }
        .pen-details {
          color: #555;
          line-height: 1.6;
          margin-bottom: 2rem;
        }
        .pen-specs {
          margin: 2rem 0;
          border-top: 1px solid #eee;
          padding-top: 2rem;
        }
        .spec-item {
          display: grid;
          grid-template-columns: 140px 1fr;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
        }
        .spec-label {
          font-weight: 500;
          color: #555;
        }
        .spec-value {
          color: #333;
        }
        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 1rem;
        }
        .tag {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: #f5f5f5;
          border: 1px solid #e0e0e0;
          border-radius: 3px;
          font-size: 0.85rem;
          color: #666;
        }
        .meta-info {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #eee;
          font-size: 0.9rem;
          color: #666;
        }
        .back-link {
          display: inline-block;
          margin-top: 2rem;
          color: #555;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: all 0.3s ease;
        }
        .back-link:hover {
          color: #333;
          border-bottom-color: #333;
        }
        @media (max-width: 768px) {
          .pen-detail-container {
            grid-template-columns: 1fr;
          }
        }
      </style>
      <div class="pen-detail-container">
        <pen-gallery images='${JSON.stringify(images)}'></pen-gallery>
        <div class="pen-info">
          <h1>${penData.name || 'Pen Name'}</h1>
          ${penData.brand && penData.model ? `
            <div class="pen-brand-model">${penData.brand} ${penData.model}</div>
          ` : ''}
          <p class="pen-description">${penData.description || 'Pen description'}</p>
          <p class="pen-details">${penData.details || 'Detailed description of the pen'}</p>
          <div class="pen-specs">
            ${specs.length ? `
              <div class="spec-item">
                <span class="spec-label">Length:</span>
                <span class="spec-value">${specs.length} mm</span>
              </div>
            ` : ''}
            ${specs.diameter ? `
              <div class="spec-item">
                <span class="spec-label">Diameter:</span>
                <span class="spec-value">${specs.diameter} mm</span>
              </div>
            ` : ''}
            ${specs.weight ? `
              <div class="spec-item">
                <span class="spec-label">Weight:</span>
                <span class="spec-value">${specs.weight} grams</span>
              </div>
            ` : ''}
            ${specs.material && specs.material.length > 0 ? `
              <div class="spec-item">
                <span class="spec-label">Material:</span>
                <span class="spec-value">${specs.material.join(', ')}</span>
              </div>
            ` : ''}
            ${specs.trim ? `
              <div class="spec-item">
                <span class="spec-label">Trim:</span>
                <span class="spec-value">${specs.trim}</span>
              </div>
            ` : ''}
            ${nib.type || (nib.sizes && nib.sizes.length > 0) ? `
              <div class="spec-item">
                <span class="spec-label">Nib:</span>
                <span class="spec-value">
                  ${nib.type || ''}${nib.type && nib.sizes ? ' - ' : ''}${nib.sizes ? nib.sizes.join(', ') : ''}
                </span>
              </div>
            ` : ''}
            ${specs.fillingSystem ? `
              <div class="spec-item">
                <span class="spec-label">Filling System:</span>
                <span class="spec-value">${specs.fillingSystem}</span>
              </div>
            ` : ''}
            ${specs.capType ? `
              <div class="spec-item">
                <span class="spec-label">Cap Type:</span>
                <span class="spec-value">${specs.capType}</span>
              </div>
            ` : ''}
          </div>
          ${penData.tags && penData.tags.length > 0 ? `
            <div class="tags">
              ${penData.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
          ` : ''}
          ${penData.year || penData.status ? `
            <div class="meta-info">
              ${penData.year ? `<div>Year: ${penData.year}</div>` : ''}
              ${penData.status ? `<div>Status: ${penData.status}</div>` : ''}
            </div>
          ` : ''}
          <purchase-links links='${JSON.stringify(penData.purchaseLinks || [])}'></purchase-links>
          <a href="./" class="back-link">← Back to Gallery</a>
        </div>
      </div>
    `;
  }
}

customElements.define('pen-detail', PenDetail);
