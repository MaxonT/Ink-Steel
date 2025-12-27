class LoadingSpinner extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(0,0,0,0.1);
          border-radius: 50%;
          border-top-color: #333;
          animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
      <div class="spinner"></div>
    `;
  }
}

customElements.define('loading-spinner', LoadingSpinner);