class ShareButton extends HTMLElement {
  static get observedAttributes() {
    return ['url', 'title', 'text', 'pen-id', 'pen-name', 'pen-description'];
  }
  
  constructor() {
    super();
    this._boundHandlers = new Map();
  }

  connectedCallback() {
    this.render();
  }
  
  disconnectedCallback() {
    // Clean up event listeners
    if (this.shadowRoot) {
      this._boundHandlers.forEach((handler, element) => {
        if (element && element.removeEventListener) {
          element.removeEventListener('click', handler);
        }
      });
      this._boundHandlers.clear();
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  render() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    try {
      let url = this.getAttribute('url');
      let title = this.getAttribute('title');
      let text = this.getAttribute('text');
      
      // If pen-id is provided, build URL and title from it
      const penId = this.getAttribute('pen-id');
      if (penId && !url) {
        const sanitizedId = sanitizeId(penId);
        if (sanitizedId) {
          url = `${window.location.origin}/pen-detail.html?id=${sanitizedId}`;
        }
      }
      if (!url) url = window.location.href;
      
      if (penId && !title) {
        const penName = this.getAttribute('pen-name') || 'Pen';
        title = `${escapeHtml(penName)} | Ink & Steel`;
      }
      if (!title) title = document.title;
      
      if (penId && !text) {
        text = this.getAttribute('pen-description') || this.getAttribute('pen-name') || title;
      }
      if (!text) text = title;

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap');
        
        :host {
          display: inline-block;
        }
        .share-container {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        button {
          background: none;
          border: 1px solid #ddd;
          padding: 0.5rem 1rem;
          cursor: pointer;
          font-family: 'Cormorant Garamond', serif;
          font-size: 0.95rem;
          color: #555;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        button:hover {
          border-color: #999;
          background: #fafafa;
        }
        .share-icon {
          width: 16px;
          height: 16px;
        }
        .copy-button {
          position: relative;
        }
        .copy-feedback {
          position: absolute;
          top: -30px;
          left: 50%;
          transform: translateX(-50%);
          background: #333;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 3px;
          font-size: 0.8rem;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }
        .copy-feedback.show {
          opacity: 1;
        }
      </style>
      <div class="share-container">
        <button class="share-button" id="nativeShare">
          <svg class="share-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
          Share
        </button>
        <button class="copy-button" id="copyLink">
          <svg class="share-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          Copy Link
          <span class="copy-feedback" id="copyFeedback">Copied!</span>
        </button>
      </div>
    `;

    // Native share (Web Share API)
    const nativeShareBtn = this.shadowRoot.getElementById('nativeShare');
    nativeShareBtn.addEventListener('click', async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: title,
            text: text,
            url: url
          });
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.error('Error sharing:', err);
          }
        }
      } else {
        // Fallback: copy to clipboard
        this.copyToClipboard(url);
      }
    });

    // Copy link
    const copyBtn = this.shadowRoot.getElementById('copyLink');
    copyBtn.addEventListener('click', () => {
      this.copyToClipboard(url);
    });
  }

  copyToClipboard(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          this.showCopyFeedback();
        }).catch(err => {
          handleError(err, 'copyToClipboard', false);
          this.fallbackCopy(text);
        });
      } else {
        this.fallbackCopy(text);
      }
    } catch (error) {
      handleError(error, 'copyToClipboard', false);
      this.fallbackCopy(text);
    }
  }

  fallbackCopy(text) {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (success) {
        this.showCopyFeedback();
      }
    } catch (err) {
      handleError(err, 'fallbackCopy', false);
    }
  }

  showCopyFeedback() {
    const feedback = this.shadowRoot.getElementById('copyFeedback');
    feedback.classList.add('show');
    setTimeout(() => {
      feedback.classList.remove('show');
    }, 2000);
  }
}

customElements.define('share-button', ShareButton);

