class PenGallery extends HTMLElement {
  static get observedAttributes() {
    return ['images'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'images' && oldValue !== newValue) {
      this.render();
    }
  }

  render() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    const imagesData = this.getAttribute('images') ? JSON.parse(this.getAttribute('images')) : {};
    const mainImage = imagesData.main || '';
    const galleryImages = imagesData.gallery || [];
    const allImages = mainImage ? [mainImage, ...galleryImages] : galleryImages;

    if (allImages.length === 0) {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
          }
          .placeholder {
            width: 100%;
            height: 500px;
            background: #f9f5f0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #999;
            font-style: italic;
            font-family: 'Cormorant Garamond', serif;
          }
        </style>
        <div class="placeholder">No image available</div>
      `;
      return;
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
        .gallery-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .main-image-container {
          position: relative;
          width: 100%;
          height: 600px;
          background: #f9f5f0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: 4px;
        }
        .main-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          transition: opacity 0.5s ease;
          cursor: zoom-in;
        }
        .main-image:hover {
          opacity: 0.9;
        }
        .thumbnail-container {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          justify-content: center;
        }
        .thumbnail {
          width: 100px;
          height: 100px;
          object-fit: cover;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.3s ease;
          background: #f9f5f0;
          border-radius: 4px;
        }
        .thumbnail:hover {
          border-color: #999;
          transform: scale(1.05);
        }
        .thumbnail.active {
          border-color: #333;
        }
        .fullscreen-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.95);
          display: none;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          cursor: zoom-out;
        }
        .fullscreen-overlay.active {
          display: flex;
        }
        .fullscreen-image {
          max-width: 90%;
          max-height: 90%;
          object-fit: contain;
        }
        .close-fullscreen {
          position: absolute;
          top: 20px;
          right: 30px;
          color: white;
          font-size: 40px;
          cursor: pointer;
          font-weight: 300;
          line-height: 1;
        }
        @media (max-width: 768px) {
          .main-image-container {
            height: 400px;
          }
          .thumbnail {
            width: 70px;
            height: 70px;
          }
        }
      </style>
      <div class="gallery-container">
        <div class="main-image-container">
          <img src="${allImages[0]}" alt="Pen" class="main-image" id="mainImage">
        </div>
        ${allImages.length > 1 ? `
          <div class="thumbnail-container">
            ${allImages.map((img, index) => `
              <img src="${img}" 
                   alt="Thumbnail ${index + 1}" 
                   class="thumbnail ${index === 0 ? 'active' : ''}"
                   data-index="${index}">
            `).join('')}
          </div>
        ` : ''}
        <div class="fullscreen-overlay" id="fullscreenOverlay">
          <span class="close-fullscreen">&times;</span>
          <img src="" alt="Fullscreen view" class="fullscreen-image" id="fullscreenImage">
        </div>
      </div>
    `;

    // Add click handlers for thumbnails
    if (allImages.length > 1) {
      const thumbnails = this.shadowRoot.querySelectorAll('.thumbnail');
      const mainImage = this.shadowRoot.getElementById('mainImage');
      
      thumbnails.forEach(thumb => {
        thumb.addEventListener('click', () => {
          const index = parseInt(thumb.getAttribute('data-index'));
          mainImage.src = allImages[index];
          
          // Update active state
          thumbnails.forEach(t => t.classList.remove('active'));
          thumb.classList.add('active');
        });
      });
    }

    // Fullscreen functionality
    const mainImageEl = this.shadowRoot.getElementById('mainImage');
    const fullscreenOverlay = this.shadowRoot.getElementById('fullscreenOverlay');
    const fullscreenImage = this.shadowRoot.getElementById('fullscreenImage');
    const closeFullscreen = this.shadowRoot.querySelector('.close-fullscreen');

    if (mainImageEl && fullscreenOverlay && fullscreenImage) {
      mainImageEl.addEventListener('click', () => {
        fullscreenImage.src = mainImageEl.src;
        fullscreenOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      });

      const closeFullscreenHandler = () => {
        fullscreenOverlay.classList.remove('active');
        document.body.style.overflow = '';
      };

      if (closeFullscreen) {
        closeFullscreen.addEventListener('click', closeFullscreenHandler);
      }
      fullscreenOverlay.addEventListener('click', (e) => {
        if (e.target === fullscreenOverlay) {
          closeFullscreenHandler();
        }
      });
    }
  }
}

customElements.define('pen-gallery', PenGallery);

