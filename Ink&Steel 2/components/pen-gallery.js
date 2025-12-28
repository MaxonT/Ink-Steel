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
    const imagesData = this.getAttribute('images') ? JSON.parse(this.getAttribute('images')) : {};
    const mainImage = imagesData.main || '';
    const galleryImages = imagesData.gallery || [];
    const allImages = mainImage ? [mainImage, ...galleryImages] : galleryImages;

    this.attachShadow({ mode: 'open' });
    
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
          height: 500px;
          background: #f9f5f0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .main-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          transition: opacity 0.5s ease;
        }
        .thumbnail-container {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .thumbnail {
          width: 80px;
          height: 80px;
          object-fit: cover;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.3s ease;
          background: #f9f5f0;
        }
        .thumbnail:hover {
          border-color: #ddd;
        }
        .thumbnail.active {
          border-color: #333;
        }
        @media (max-width: 768px) {
          .main-image-container {
            height: 300px;
          }
          .thumbnail {
            width: 60px;
            height: 60px;
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
  }
}

customElements.define('pen-gallery', PenGallery);

