class PenDetail extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
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
    const penData = this.getAttribute('pen-data') ? JSON.parse(this.getAttribute('pen-data')) : null;
    
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
        .pen-image-container {
          position: relative;
          height: 500px;
          background: #f9f5f0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pen-image {
          max-height: 100%;
          max-width: 100%;
          object-fit: contain;
          transition: transform 0.3s ease;
        }
        .pen-info h1 {
          font-size: 2.5rem;
          font-weight: 300;
          margin-bottom: 1rem;
        }
        .pen-description {
          font-style: italic;
          color: #666;
          margin-bottom: 2rem;
        }
        .pen-specs {
          margin: 2rem 0;
          border-top: 1px solid #eee;
          padding-top: 2rem;
        }
        .spec-item {
          display: grid;
          grid-template-columns: 120px 1fr;
          margin-bottom: 1rem;
        }
        .spec-label {
          font-weight: 500;
          color: #555;
        }
        .price {
          font-size: 1.8rem;
          margin: 2rem 0;
          color: #333;
        }
        .add-to-cart {
          background: #333;
          color: white;
          border: none;
          padding: 1rem 2rem;
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .add-to-cart:hover {
          background: #555;
        }
        @media (max-width: 768px) {
          .pen-detail-container {
            grid-template-columns: 1fr;
          }
          .pen-image-container {
            height: 300px;
          }
        }
      </style>
      <div class="pen-detail-container">
        <div class="pen-image-container">
          <img src="${penData?.image || 'http://static.photos/workspace/640x360/1'}" 
               alt="${penData?.name || 'Fountain Pen'}" class="pen-image">
        </div>
        <div class="pen-info">
          <h1>${penData?.name || 'Pen Name'}</h1>
          <p class="pen-description">${penData?.description || 'Pen description'}</p>
          <p class="pen-details">${penData?.details || 'Detailed description of the pen'}</p>
          <div class="pen-specs">
            <div class="spec-item">
              <span class="spec-label">Nib:</span>
              <span>${penData?.nib || 'Medium'}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Material:</span>
              <span>${penData?.material || 'Resin'}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Trim:</span>
              <span>${penData?.trim || 'Rhodium'}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Weight:</span>
              <span>${penData?.weight || '22'} grams</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Length:</span>
              <span>${penData?.length || '140'} mm</span>
            </div>
          </div>
          <div class="price">$${penData?.price || '285'}</div>
          <button class="add-to-cart">Add to Collection</button>
        </div>
      </div>
    `;

    this.shadowRoot.querySelector('.add-to-cart').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('add-to-cart', {
        detail: penData,
        bubbles: true,
        composed: true
      }));
    });
  }
}

customElements.define('pen-detail', PenDetail);