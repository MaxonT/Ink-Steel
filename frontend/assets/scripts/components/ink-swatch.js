class InkSwatch extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    const color = this.getAttribute('color') || '#1a365d';
    const name = this.getAttribute('name') || 'Ink';
    
    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap');
        
        :host {
          display: block;
        }
        .swatch-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        .ink-swatch {
          width: 100%;
          height: 180px;
          border-radius: 4px;
          background: linear-gradient(to bottom, ${color}, ${this.adjustColor(color, 20)});
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.3s ease;
        }
        .ink-swatch:hover {
          transform: scale(1.02);
        }
        .ink-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.1rem;
          color: #333;
          text-align: center;
        }
      </style>
      <div class="swatch-container">
        <div class="ink-swatch"></div>
        <span class="ink-name">${name}</span>
      </div>
    `;
  }

  adjustColor(color, amount) {
    let col = color.replace(/[^0-9a-f]/gi, '');
    if (col.length < 6) {
      col = col[0]+col[0]+col[1]+col[1]+col[2]+col[2];
    }
    let r = parseInt(col.substr(0,2), 16);
    let g = parseInt(col.substr(2,2), 16);
    let b = parseInt(col.substr(4,2), 16);
    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }
}

customElements.define('ink-swatch', InkSwatch);

