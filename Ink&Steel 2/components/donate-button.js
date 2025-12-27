class DonateButton extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }
        button {
          background: #1a365d;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          font-family: 'Cormorant Garamond', serif;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border-radius: 2px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        button:hover {
          background: #2c5282;
          transform: translateY(-1px);
        }
        button:active {
          transform: translateY(0);
        }
      </style>
      <button>
        <slot>Support Our Work</slot>
      </button>
    `;
    
    this.shadowRoot.querySelector('button').addEventListener('click', () => {
      // Replace with your actual donation link
      window.open('https://donate.stripe.com/test_00g5nE5sZ7mwbJS8ww', '_blank');
    });
  }
}

customElements.define('donate-button', DonateButton);