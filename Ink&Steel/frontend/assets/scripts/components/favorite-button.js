class FavoriteButton extends HTMLElement {
  static get observedAttributes() {
    return ['pen-id'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'pen-id' && oldValue !== newValue) {
      this.render();
    }
  }

  render() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    const penId = this.getAttribute('pen-id');
    if (!penId) {
      this.shadowRoot.innerHTML = '<div></div>';
      return;
    }
    
    const favorites = safeLocalStorageGet('pen-favorites', []);
    const isFavorited = Array.isArray(favorites) && favorites.includes(penId);

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap');
        
        :host {
          display: inline-block;
        }
        button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          color: #666;
          transition: all 0.3s ease;
          font-family: 'Cormorant Garamond', serif;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        button:hover {
          color: #333;
        }
        button.favorited {
          color: #9f1239;
        }
        svg {
          width: 18px;
          height: 18px;
          fill: none;
          stroke: currentColor;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        button.favorited svg {
          fill: currentColor;
        }
        .text {
          margin-left: 0.25rem;
        }
      </style>
      <button class="${isFavorited ? 'favorited' : ''}" id="favoriteBtn">
        <svg viewBox="0 0 24 24">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
        <span class="text">${isFavorited ? 'Favorited' : 'Favorite'}</span>
      </button>
    `;

    const button = this.shadowRoot.getElementById('favoriteBtn');
    button.addEventListener('click', () => {
      this.toggleFavorite(penId);
    });
  }

  toggleFavorite(penId) {
    if (!penId) return;
    
    try {
      let favorites = safeLocalStorageGet('pen-favorites', []);
      if (!Array.isArray(favorites)) favorites = [];
      
      const index = favorites.indexOf(penId);
      
      if (index > -1) {
        favorites.splice(index, 1);
      } else {
        favorites.push(penId);
      }
      
      safeLocalStorageSet('pen-favorites', favorites);
      this.render();
      
      // Dispatch event for other components
      document.dispatchEvent(new CustomEvent('favorites-updated', {
        detail: { penId, isFavorited: index === -1 }
      }));
    } catch (e) {
      handleError(e, 'toggleFavorite', true);
    }
  }
}

customElements.define('favorite-button', FavoriteButton);

