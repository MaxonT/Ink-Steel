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
      const penDataAttr = this.getAttribute('pen-data');
      let penData = null;
      
      if (penDataAttr) {
        try {
          penData = JSON.parse(penDataAttr);
        } catch (e) {
          if (typeof handleError !== 'undefined') {
            handleError(e, 'PenDetail.render - JSON parse', false);
          }
          this.shadowRoot.innerHTML = '<p style="padding: 2rem; text-align: center; color: #666;">Error loading pen data.</p>';
          return;
        }
      }
      
      if (!penData) {
        this.shadowRoot.innerHTML = '<p style="padding: 2rem; text-align: center; color: #666;">Loading...</p>';
        return;
      }

    // 确保必要字段有默认值，防止页面空白
    if (!penData.name || penData.name.trim() === '') {
      penData.name = 'Fountain Pen';
    }
    if (!penData.description && !penData.details) {
      penData.description = `Detailed information about ${penData.name}.`;
    }
    if (!penData.brand) {
      penData.brand = '';
    }
    
    const specs = penData.specifications || {};
    const nib = specs.nib || {};
    const images = penData.images || {};
    
    // 确保至少有一个占位图片
    if (!images.main) {
      images.main = `https://dummyimage.com/800x600/F9F5F0/1A365D.png?text=${encodeURIComponent(penData.name)}`;
    }
    
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
          padding: var(--spacing-7);
          box-shadow: var(--shadow-lg);
          border-radius: var(--radius-sm);
          max-width: var(--max-width-page);
          margin: var(--spacing-6) auto;
          font-family: 'Cormorant Garamond', serif;
        }
        .pen-detail-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-8);
        }
        @media (max-width: 968px) {
          .pen-detail-container {
            grid-template-columns: 1fr;
            gap: var(--spacing-6);
          }
        }
        .pen-info h1 {
          font-size: var(--font-size-2xl);
          font-weight: var(--font-weight-light);
          margin-bottom: var(--spacing-2);
          line-height: var(--line-height-tight);
        }
        .pen-brand-model {
          font-size: var(--font-size-lg);
          color: var(--text-light);
          margin-bottom: var(--spacing-4);
          font-weight: var(--font-weight-normal);
        }
        .pen-description {
          font-style: italic;
          color: var(--text-light);
          margin-bottom: var(--spacing-5);
          font-size: var(--font-size-lg);
        }
        .pen-details {
          color: var(--text-light);
          line-height: var(--line-height-relaxed);
          margin-bottom: var(--spacing-6);
          font-size: var(--font-size-base);
        }
        .pen-specs {
          margin: var(--spacing-7) var(--spacing-0);
          border-top: 1px solid var(--border-color-light);
          padding-top: var(--spacing-6);
        }
        .spec-section {
          margin-bottom: var(--spacing-6);
        }
        .spec-section-title {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-medium);
          margin-bottom: var(--spacing-4);
          color: var(--text-color);
        }
        .spec-table {
          width: 100%;
          border-collapse: collapse;
        }
        .spec-table tr {
          border-bottom: 1px solid var(--border-color-light);
        }
        .spec-table td {
          padding: var(--spacing-3) var(--spacing-2);
          vertical-align: top;
        }
        .spec-label {
          font-weight: var(--font-weight-medium);
          color: var(--text-light);
          width: 45%;
          font-size: var(--font-size-base);
        }
        .spec-value {
          color: var(--text-color);
          font-size: var(--font-size-base);
        }
        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-2);
          margin-top: var(--spacing-5);
        }
        .tag {
          display: inline-block;
          padding: var(--spacing-1) var(--spacing-3);
          background: var(--bg-gray-100);
          border: 1px solid var(--border-color-light);
          border-radius: var(--radius-sm);
          font-size: var(--font-size-sm);
          color: var(--text-light);
        }
        .meta-info {
          margin-top: var(--spacing-6);
          padding-top: var(--spacing-5);
          border-top: 1px solid var(--border-color-light);
          font-size: var(--font-size-sm);
          color: var(--text-light);
        }
        .meta-info-row {
          margin-bottom: var(--spacing-2);
        }
        .back-link {
          display: inline-block;
          margin-top: var(--spacing-6);
          color: var(--text-light);
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: all var(--transition-base);
          font-size: var(--font-size-base);
        }
        .back-link:hover {
          color: var(--text-color);
          border-bottom-color: var(--text-color);
        }
        @media (max-width: 968px) {
          .pen-detail-container {
            grid-template-columns: 1fr;
          }
          .pen-info h1 {
            font-size: var(--font-size-xl);
          }
        }
      </style>
      <div class="pen-detail-container">
        <pen-gallery images='${JSON.stringify(images)}'></pen-gallery>
        <div class="pen-info">
          <h1>${escapeHtmlSafe(penData.name || 'Pen Name')}</h1>
          ${penData.brand || penData.model ? `
            <div class="pen-brand-model">${escapeHtmlSafe(penData.brand || '')} ${escapeHtmlSafe(penData.model || '')}</div>
          ` : ''}
          ${penData.description ? `
            <p class="pen-description">${escapeHtmlSafe(penData.description)}</p>
          ` : ''}
          ${penData.details ? `
            <p class="pen-details">${escapeHtmlSafe(penData.details)}</p>
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
              ${penData.tags.map(tag => `<span class="tag">${escapeHtmlSafe(String(tag))}</span>`).join('')}
            </div>
          ` : ''}

          ${penData.yearIntroduced || penData.availability || penData.country ? `
            <div class="meta-info">
              ${penData.country ? `<div class="meta-info-row"><strong>Country:</strong> ${escapeHtmlSafe(String(penData.country))}</div>` : ''}
              ${penData.yearIntroduced ? `<div class="meta-info-row"><strong>Introduced:</strong> ${escapeHtmlSafe(String(penData.yearIntroduced))}</div>` : ''}
              ${penData.availability ? `<div class="meta-info-row"><strong>Status:</strong> ${escapeHtmlSafe(String(penData.availability))}</div>` : ''}
            </div>
          ` : ''}

          <purchase-links links='${JSON.stringify(penData.purchaseLinks || [])}'></purchase-links>
          
          <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #eee; display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
            <favorite-button pen-id="${escapeHtmlSafe(String(penData.id))}"></favorite-button>
            <share-button url="${window.location.href}" title="${escapeHtmlSafe(penData.name)} | Ink & Steel" text="${escapeHtmlSafe(penData.description || penData.name)}"></share-button>
            <button id="addToComparison" style="padding: 0.75rem 1.5rem; background: #333; color: white; border: none; cursor: pointer; font-family: 'Cormorant Garamond', serif; font-size: 1rem; transition: background 0.3s ease;">
              Add to Comparison
            </button>
            <a href="./compare.html" class="back-link">View Comparison →</a>
          </div>
          
          <a href="./" class="back-link">← Back to Gallery</a>
        </div>
      </div>
    `;
    } catch (e) {
      if (typeof handleError !== 'undefined') {
        handleError(e, 'PenDetail.render', false);
      }
      this.shadowRoot.innerHTML = '<p style="padding: 2rem; text-align: center; color: #666;">Error rendering pen details.</p>';
      return;
    }

    // Add to comparison button
    const addToComparisonBtn = this.shadowRoot.getElementById('addToComparison');
    if (addToComparisonBtn) {
      addToComparisonBtn.addEventListener('click', () => {
        try {
          let comparisonIds = [];
          if (typeof safeLocalStorageGet !== 'undefined') {
            comparisonIds = safeLocalStorageGet('pen-comparison', []);
          } else if (typeof localStorage !== 'undefined') {
            try {
              const stored = localStorage.getItem('pen-comparison');
              comparisonIds = stored ? JSON.parse(stored) : [];
            } catch (e) {
              comparisonIds = [];
            }
          }
          
          if (!Array.isArray(comparisonIds)) {
            comparisonIds = [];
            if (typeof safeLocalStorageSet !== 'undefined') {
              safeLocalStorageSet('pen-comparison', []);
            } else if (typeof localStorage !== 'undefined') {
              try {
                localStorage.setItem('pen-comparison', JSON.stringify([]));
              } catch (e) {
                // Ignore
              }
            }
            return;
          }
          
          if (comparisonIds.includes(penData.id)) {
            if (typeof showUserError !== 'undefined') {
              showUserError('This pen is already in the comparison list.', 2000);
            }
            return;
          }
          if (comparisonIds.length >= 4) {
            if (typeof showUserError !== 'undefined') {
              showUserError('You can compare up to 4 pens at once. Please remove one from the comparison page first.', 3000);
            }
            return;
          }
          comparisonIds.push(penData.id);
          if (typeof safeLocalStorageSet !== 'undefined') {
            safeLocalStorageSet('pen-comparison', comparisonIds);
          } else if (typeof localStorage !== 'undefined') {
            try {
              localStorage.setItem('pen-comparison', JSON.stringify(comparisonIds));
            } catch (e) {
              // Ignore localStorage errors
            }
          }
          addToComparisonBtn.textContent = 'Added to Comparison ✓';
          addToComparisonBtn.style.background = '#065f46';
          setTimeout(() => {
            addToComparisonBtn.textContent = 'Add to Comparison';
            addToComparisonBtn.style.background = '#333';
          }, 2000);
        } catch (e) {
          if (typeof handleError !== 'undefined') {
            handleError(e, 'addToComparison', true);
          }
        }
      });
    }
  }
}

customElements.define('pen-detail', PenDetail);

