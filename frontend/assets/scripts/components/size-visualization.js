class SizeVisualization extends HTMLElement {
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
          handleError(e, 'SizeVisualization.render - JSON parse', false);
          this.shadowRoot.innerHTML = '<div></div>';
          return;
        }
      }
      
      if (!Array.isArray(pensData) || pensData.length === 0) {
        this.shadowRoot.innerHTML = `
          <style>
            :host {
              display: block;
            }
          </style>
          <div></div>
        `;
        return;
      }

    // Get max dimensions for scaling
    const pens = pensData.map(pen => ({
      ...pen,
      length: pen.specifications?.lengthCapped || pen.specifications?.length || 140,
      diameter: pen.specifications?.diameterBody || pen.specifications?.diameter || 12,
      weight: pen.specifications?.weight || 20
    }));

    const maxLength = Math.max(...pens.map(p => p.length));
    const maxDiameter = Math.max(...pens.map(p => p.diameter));
    const scale = 400 / maxLength; // Scale to fit 400px width

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap');
        
        :host {
          display: block;
        }
        .visualization-container {
          background: #f9f5f0;
          padding: 2rem;
          border-radius: 4px;
          margin: 2rem 0;
        }
        .visualization-title {
          font-size: 1.5rem;
          font-weight: 400;
          margin-bottom: 1.5rem;
          font-family: 'Cormorant Garamond', serif;
        }
        .pens-visualization {
          display: flex;
          align-items: flex-end;
          gap: 2rem;
          padding: 2rem 0;
          border-bottom: 2px solid #333;
          min-height: 300px;
        }
        .pen-visual {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
        }
        .pen-visual-name {
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
          text-align: center;
          font-family: 'Cormorant Garamond', serif;
          color: #333;
        }
        .pen-bar {
          width: 100%;
          background: linear-gradient(to bottom, #666, #333);
          border-radius: 4px 4px 0 0;
          position: relative;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          transition: transform 0.3s ease;
        }
        .pen-bar:hover {
          transform: scale(1.05);
        }
        .pen-dimensions {
          margin-top: 0.5rem;
          font-size: 0.85rem;
          color: #666;
          text-align: center;
          font-family: 'Cormorant Garamond', serif;
        }
        .scale-legend {
          margin-top: 1rem;
          text-align: center;
          font-size: 0.9rem;
          color: #666;
          font-family: 'Cormorant Garamond', serif;
        }
        @media (max-width: 768px) {
          .pens-visualization {
            flex-direction: column;
            align-items: center;
            gap: 1rem;
          }
          .pen-bar {
            width: 200px;
          }
        }
      </style>
      <div class="visualization-container">
        <h3 class="visualization-title">Size Comparison</h3>
        <div class="pens-visualization">
          ${pens.map(pen => `
            <div class="pen-visual">
              <div class="pen-visual-name">${pen.name}</div>
              <div class="pen-bar" 
                   style="height: ${pen.length * scale}px; 
                          width: ${Math.max(pen.diameter * scale * 3, 40)}px;"
                   title="Length: ${pen.length}mm, Diameter: ${pen.diameter}mm"></div>
              <div class="pen-dimensions">
                ${pen.length}mm × ${pen.diameter}mm<br>
                ${pen.weight}g
              </div>
            </div>
          `).join('')}
        </div>
        <div class="scale-legend">
          Scale: 1mm = ${(1 / scale).toFixed(1)}px (relative comparison only)
        </div>
      </div>
    `;
    } catch (e) {
      if (typeof handleError !== 'undefined') {
        handleError(e, 'SizeVisualization.render', false);
      }
      this.shadowRoot.innerHTML = '<div style="padding: 2rem; text-align: center; color: #666;">Error rendering size visualization.</div>';
      return;
    }
  }
}

customElements.define('size-visualization', SizeVisualization);

