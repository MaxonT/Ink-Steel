class CartIcon extends HTMLElement {
  constructor() {
    super();
    this.handleCartUpdate = this.handleCartUpdate.bind(this);
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.render();
    document.addEventListener('cart-updated', this.handleCartUpdate);
  }

  disconnectedCallback() {
    document.removeEventListener('cart-updated', this.handleCartUpdate);
  }

  handleCartUpdate() {
    this.render();
  }

  render() {
    const count = JSON.parse(localStorage.getItem('cart'))?.reduce((total, item) => total + item.quantity, 0) || 0;
    this.shadowRoot.innerHTML = `
<style>
        :host {
          display: inline-block;
          position: relative;
          cursor: pointer;
        }
        svg {
          width: 24px;
          height: 24px;
          stroke: currentColor;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
          fill: none;
        }
        .badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background-color: #9f1239;
          color: white;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
        }
      </style>
      <div>
        <svg viewBox="0 0 24 24">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <div class="badge">0</div>
      </div>
    `;
  }
}

customElements.define('cart-icon', CartIcon);