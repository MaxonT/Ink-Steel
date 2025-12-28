class PenComparison extends HTMLElement {
  static get observedAttributes() {
    return ['pens'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'pens' && oldValue !== newValue) {
      this.render();
    }
  }

  render() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    try {
      const pensDataAttr = this.getAttribute('pens');
      let pensData = [];
      
      if (pensDataAttr) {
        try {
          pensData = JSON.parse(pensDataAttr);
        } catch (e) {
          handleError(e, 'PenComparison.render - JSON parse', false);
          this.shadowRoot.innerHTML = '<div class="empty-state">Error loading comparison data.</div>';
          return;
        }
      }
      
      if (!Array.isArray(pensData)) {
        pensData = [];
      }
      
      const maxPens = 4;

      if (pensData.length === 0) {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
          }
          .empty-state {
            text-align: center;
            padding: 2rem;
            color: #999;
            font-style: italic;
          }
        </style>
        <div class="empty-state">
          <svg class="empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
          </svg>
          <p>No pens selected for comparison.</p>
          <p style="font-size: 0.9rem; margin-top: 0.5rem;">Select up to ${maxPens} pens to compare.</p>
          <a href="./" style="display: inline-block; margin-top: 1rem; color: #333; text-decoration: underline;">Browse Collection</a>
        </div>
      `;
      return;
    }

    const pens = pensData.slice(0, maxPens);
    const specsToCompare = [
      { key: 'name', label: 'Name' },
      { key: 'brand', label: 'Brand' },
      { key: 'model', label: 'Model' },
      { key: 'type', label: 'Type' },
      { key: 'specifications.lengthCapped', label: 'Length (Capped)', unit: 'mm' },
      { key: 'specifications.lengthUncapped', label: 'Length (Uncapped)', unit: 'mm' },
      { key: 'specifications.weight', label: 'Weight', unit: 'g' },
      { key: 'specifications.diameterBody', label: 'Body Diameter', unit: 'mm' },
      { key: 'specifications.fillingSystem', label: 'Filling System' },
      { key: 'specifications.nib.type', label: 'Nib Type' },
      { key: 'availability', label: 'Availability' }
    ];

    const getNestedValue = (obj, path) => {
      return path.split('.').reduce((current, key) => current?.[key], obj);
    };

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap');
        
        :host {
          display: block;
          background: white;
          padding: 2rem;
          border-radius: 4px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .comparison-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #eee;
        }
        .comparison-title {
          font-size: 1.8rem;
          font-weight: 400;
          font-family: 'Cormorant Garamond', serif;
        }
        .clear-comparison {
          padding: 0.5rem 1rem;
          background: #333;
          color: white;
          border: none;
          cursor: pointer;
          font-family: 'Cormorant Garamond', serif;
          font-size: 0.95rem;
          transition: background 0.3s ease;
        }
        .clear-comparison:hover {
          background: #555;
        }
        .comparison-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
        }
        .comparison-table th,
        .comparison-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #f0f0f0;
          vertical-align: top;
        }
        .comparison-table th {
          font-weight: 500;
          color: #555;
          background: #fafafa;
          font-family: 'Cormorant Garamond', serif;
        }
        .comparison-table td {
          color: #333;
          font-family: 'Cormorant Garamond', serif;
        }
        .pen-header {
          font-weight: 500;
          min-width: 150px;
        }
        .pen-name {
          font-size: 1.1rem;
          margin-bottom: 0.25rem;
        }
        .pen-brand {
          font-size: 0.9rem;
          color: #666;
        }
        .pen-image {
          width: 120px;
          height: 80px;
          object-fit: contain;
          margin-bottom: 0.5rem;
          background: #f9f5f0;
          border-radius: 4px;
          padding: 0.5rem;
        }
        .spec-value {
          white-space: nowrap;
        }
        .remove-pen {
          margin-top: 0.5rem;
          padding: 0.25rem 0.5rem;
          background: #f5f5f5;
          border: 1px solid #ddd;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.3s ease;
        }
        .remove-pen:hover {
          background: #e0e0e0;
        }
        @media (max-width: 968px) {
          .comparison-table {
            font-size: 0.9rem;
          }
          .comparison-table th,
          .comparison-table td {
            padding: 0.5rem;
          }
          .pen-image {
            width: 80px;
            height: 60px;
          }
        }
      </style>
      <div>
        <div class="comparison-header">
          <h2 class="comparison-title">Pen Comparison</h2>
          <button class="clear-comparison" id="clearAll">Clear All</button>
        </div>
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Specification</th>
              ${pens.map(pen => `
                <th class="pen-header">
                  <img src="${pen.images?.main || 'https://via.placeholder.com/120x80'}" 
                       alt="${pen.name}" 
                       class="pen-image">
                  <div class="pen-name">${pen.name}</div>
                  <div class="pen-brand">${pen.brand || ''} ${pen.model || ''}</div>
                  <button class="remove-pen" data-id="${pen.id}">Remove</button>
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${specsToCompare.map(spec => `
              <tr>
                <td><strong>${spec.label}</strong></td>
                ${pens.map(pen => {
                  const value = getNestedValue(pen, spec.key);
                  const displayValue = value !== null && value !== undefined && value !== '' 
                    ? (spec.unit ? `${value} ${spec.unit}` : value)
                    : '—';
                  return `<td class="spec-value">${displayValue}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Event listeners
    const clearAllBtn = this.shadowRoot.getElementById('clearAll');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('clear-comparison', { bubbles: true, composed: true }));
      });
    }

    const removeBtns = this.shadowRoot.querySelectorAll('.remove-pen');
    removeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const penId = e.target.getAttribute('data-id');
        this.dispatchEvent(new CustomEvent('remove-from-comparison', {
          detail: { id: penId },
          bubbles: true,
          composed: true
        }));
      });
    });
  }
}

customElements.define('pen-comparison', PenComparison);

