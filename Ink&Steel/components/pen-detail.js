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
      this.shadowRoot.innerHTML = '<p style="padding: 2rem; text-align: center; color: #666;">Loading...</p>';
      return;
    }

    const specs = penData.specifications || {};
    const nib = specs.nib || {};
    const images = penData.images || {};
    
    const formatSpecValue = (value) => {
      if (value === null || value === undefined || value === '') return '—';
      if (Array.isArray(value)) return value.join(', ');
      return value;
    };

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap');
        
        :host {
          display: block;
          background: white;
          padding: 3rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          border-radius: 4px;
          max-width: 1400px;
          margin: 2rem auto;
          font-family: 'Cormorant Garamond', serif;
        }
        .pen-detail-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
        }
        .pen-info h1 {
          font-size: 3rem;
          font-weight: 300;
          margin-bottom: 0.5rem;
          line-height: 1.2;
        }
        .pen-brand-model {
          font-size: 1.4rem;
          color: #666;
          margin-bottom: 1rem;
          font-weight: 400;
        }
        .pen-description {
          font-style: italic;
          color: #666;
          margin-bottom: 1.5rem;
          font-size: 1.2rem;
        }
        .pen-details {
          color: #555;
          line-height: 1.8;
          margin-bottom: 2rem;
          font-size: 1.1rem;
        }
        .pen-specs {
          margin: 2.5rem 0;
          border-top: 1px solid #eee;
          padding-top: 2rem;
        }
        .spec-section {
          margin-bottom: 2rem;
        }
        .spec-section-title {
          font-size: 1.3rem;
          font-weight: 500;
          margin-bottom: 1rem;
          color: #333;
        }
        .spec-table {
          width: 100%;
          border-collapse: collapse;
        }
        .spec-table tr {
          border-bottom: 1px solid #f0f0f0;
        }
        .spec-table td {
          padding: 0.75rem 0.5rem;
          vertical-align: top;
        }
        .spec-label {
          font-weight: 500;
          color: #555;
          width: 45%;
          font-size: 1rem;
        }
        .spec-value {
          color: #333;
          font-size: 1rem;
        }
        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 1.5rem;
        }
        .tag {
          display: inline-block;
          padding: 0.4rem 0.9rem;
          background: #f5f5f5;
          border: 1px solid #e0e0e0;
          border-radius: 3px;
          font-size: 0.9rem;
          color: #666;
        }
        .meta-info {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #eee;
          font-size: 0.95rem;
          color: #666;
        }
        .meta-info-row {
          margin-bottom: 0.5rem;
        }
        .back-link {
          display: inline-block;
          margin-top: 2rem;
          color: #555;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: all 0.3s ease;
          font-size: 1.1rem;
        }
        .back-link:hover {
          color: #333;
          border-bottom-color: #333;
        }
        @media (max-width: 968px) {
          .pen-detail-container {
            grid-template-columns: 1fr;
          }
          .pen-info h1 {
            font-size: 2.5rem;
          }
        }
      </style>
      <div class="pen-detail-container">
        <pen-gallery images='${JSON.stringify(images)}'></pen-gallery>
        <div class="pen-info">
          <h1>${penData.name || 'Pen Name'}</h1>
          ${penData.brand || penData.model ? `
            <div class="pen-brand-model">${penData.brand || ''} ${penData.model || ''}</div>
          ` : ''}
          ${penData.description ? `
            <p class="pen-description">${penData.description}</p>
          ` : ''}
          ${penData.details ? `
            <p class="pen-details">${penData.details}</p>
          ` : ''}
          
          <div class="pen-specs">
            <div class="spec-section">
              <h3 class="spec-section-title">Dimensions</h3>
              <table class="spec-table">
                ${specs.length ? `
                  <tr>
                    <td class="spec-label">Length (Capped)</td>
                    <td class="spec-value">${formatSpecValue(specs.lengthCapped || specs.length)} mm</td>
                  </tr>
                ` : ''}
                ${specs.lengthUncapped ? `
                  <tr>
                    <td class="spec-label">Length (Uncapped)</td>
                    <td class="spec-value">${formatSpecValue(specs.lengthUncapped)} mm</td>
                  </tr>
                ` : ''}
                ${specs.lengthPosted ? `
                  <tr>
                    <td class="spec-label">Length (Posted)</td>
                    <td class="spec-value">${formatSpecValue(specs.lengthPosted)} mm</td>
                  </tr>
                ` : ''}
                ${specs.diameterBody ? `
                  <tr>
                    <td class="spec-label">Body Diameter</td>
                    <td class="spec-value">${formatSpecValue(specs.diameterBody)} mm</td>
                  </tr>
                ` : ''}
                ${specs.diameterGrip ? `
                  <tr>
                    <td class="spec-label">Grip Diameter</td>
                    <td class="spec-value">${formatSpecValue(specs.diameterGrip)} mm</td>
                  </tr>
                ` : ''}
                ${specs.diameterCap ? `
                  <tr>
                    <td class="spec-label">Cap Diameter</td>
                    <td class="spec-value">${formatSpecValue(specs.diameterCap)} mm</td>
                  </tr>
                ` : ''}
                ${specs.weight ? `
                  <tr>
                    <td class="spec-label">Total Weight</td>
                    <td class="spec-value">${formatSpecValue(specs.weight)} g</td>
                  </tr>
                ` : ''}
              </table>
            </div>

            <div class="spec-section">
              <h3 class="spec-section-title">Materials & Construction</h3>
              <table class="spec-table">
                ${specs.material ? `
                  <tr>
                    <td class="spec-label">Material</td>
                    <td class="spec-value">${formatSpecValue(specs.material)}</td>
                  </tr>
                ` : ''}
                ${specs.finish ? `
                  <tr>
                    <td class="spec-label">Finish</td>
                    <td class="spec-value">${formatSpecValue(specs.finish)}</td>
                  </tr>
                ` : ''}
                ${specs.trim ? `
                  <tr>
                    <td class="spec-label">Trim</td>
                    <td class="spec-value">${formatSpecValue(specs.trim)}</td>
                  </tr>
                ` : ''}
                ${specs.clip ? `
                  <tr>
                    <td class="spec-label">Clip</td>
                    <td class="spec-value">${formatSpecValue(specs.clip)}</td>
                  </tr>
                ` : ''}
              </table>
            </div>

            <div class="spec-section">
              <h3 class="spec-section-title">Filling System</h3>
              <table class="spec-table">
                ${specs.fillingSystem ? `
                  <tr>
                    <td class="spec-label">Type</td>
                    <td class="spec-value">${formatSpecValue(specs.fillingSystem)}</td>
                  </tr>
                ` : ''}
                ${specs.capacity ? `
                  <tr>
                    <td class="spec-label">Capacity</td>
                    <td class="spec-value">${formatSpecValue(specs.capacity)} ml</td>
                  </tr>
                ` : ''}
                ${specs.capType ? `
                  <tr>
                    <td class="spec-label">Cap Type</td>
                    <td class="spec-value">${formatSpecValue(specs.capType)}</td>
                  </tr>
                ` : ''}
                ${specs.capRotation ? `
                  <tr>
                    <td class="spec-label">Cap Rotation</td>
                    <td class="spec-value">${formatSpecValue(specs.capRotation)} turns</td>
                  </tr>
                ` : ''}
              </table>
            </div>

            ${nib.type || (nib.sizes && nib.sizes.length > 0) ? `
              <div class="spec-section">
                <h3 class="spec-section-title">Nib</h3>
                <table class="spec-table">
                  ${nib.type ? `
                    <tr>
                      <td class="spec-label">Type</td>
                      <td class="spec-value">${formatSpecValue(nib.type)}</td>
                    </tr>
                  ` : ''}
                  ${nib.sizes ? `
                    <tr>
                      <td class="spec-label">Available Sizes</td>
                      <td class="spec-value">${formatSpecValue(nib.sizes)}</td>
                    </tr>
                  ` : ''}
                  ${nib.flexibility ? `
                    <tr>
                      <td class="spec-label">Flexibility</td>
                      <td class="spec-value">${formatSpecValue(nib.flexibility)}</td>
                    </tr>
                  ` : ''}
                </table>
              </div>
            ` : ''}
          </div>

          ${penData.tags && penData.tags.length > 0 ? `
            <div class="tags">
              ${penData.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
          ` : ''}

          ${penData.yearIntroduced || penData.availability || penData.country ? `
            <div class="meta-info">
              ${penData.country ? `<div class="meta-info-row"><strong>Country:</strong> ${penData.country}</div>` : ''}
              ${penData.yearIntroduced ? `<div class="meta-info-row"><strong>Introduced:</strong> ${penData.yearIntroduced}</div>` : ''}
              ${penData.availability ? `<div class="meta-info-row"><strong>Status:</strong> ${penData.availability}</div>` : ''}
            </div>
          ` : ''}

          <purchase-links links='${JSON.stringify(penData.purchaseLinks || [])}'></purchase-links>
          
          <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #eee; display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
            <favorite-button pen-id="${penData.id}"></favorite-button>
            <share-button url="${window.location.href}" title="${penData.name} | Ink & Steel" text="${penData.description || penData.name}"></share-button>
            <button id="addToComparison" style="padding: 0.75rem 1.5rem; background: #333; color: white; border: none; cursor: pointer; font-family: 'Cormorant Garamond', serif; font-size: 1rem; transition: background 0.3s ease;">
              Add to Comparison
            </button>
            <a href="./compare.html" class="back-link">View Comparison →</a>
          </div>
          
          <a href="./" class="back-link">← Back to Gallery</a>
        </div>
      </div>
    `;

    // Add to comparison button
    const addToComparisonBtn = this.shadowRoot.getElementById('addToComparison');
    if (addToComparisonBtn) {
      addToComparisonBtn.addEventListener('click', () => {
        try {
          const comparisonIds = safeLocalStorageGet('pen-comparison', []);
          if (!Array.isArray(comparisonIds)) {
            safeLocalStorageSet('pen-comparison', []);
            return;
          }
          
          if (comparisonIds.includes(penData.id)) {
            showUserError('This pen is already in the comparison list.', 2000);
            return;
          }
          if (comparisonIds.length >= 4) {
            showUserError('You can compare up to 4 pens at once. Please remove one from the comparison page first.', 3000);
            return;
          }
          comparisonIds.push(penData.id);
          safeLocalStorageSet('pen-comparison', comparisonIds);
          addToComparisonBtn.textContent = 'Added to Comparison ✓';
          addToComparisonBtn.style.background = '#065f46';
          setTimeout(() => {
            addToComparisonBtn.textContent = 'Add to Comparison';
            addToComparisonBtn.style.background = '#333';
          }, 2000);
        } catch (e) {
          handleError(e, 'addToComparison', true);
        }
      });
    }
  }
}

customElements.define('pen-detail', PenDetail);

