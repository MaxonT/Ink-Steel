class NewsletterForm extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          max-width: 600px;
          margin: 0 auto;
          padding: 2rem;
          background: white;
          border-radius: 4px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h3 {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: #333;
        }
        p {
          font-size: 1rem;
          color: #666;
          margin-bottom: 1.5rem;
        }
        .form-group {
          display: flex;
          gap: 1rem;
        }
        input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #ddd;
          font-family: 'Cormorant Garamond', serif;
          font-size: 1rem;
        }
        button {
          background: #333;
          color: white;
          border: none;
          padding: 0 2rem;
          cursor: pointer;
          transition: background 0.3s ease;
          font-family: 'Cormorant Garamond', serif;
          font-size: 1rem;
        }
        button:hover {
          background: #555;
        }
        .success {
          color: #065f46;
          display: none;
          margin-top: 1rem;
          text-align: center;
        }
      </style>
      <div>
        <h3>Receive Ink & Steel Letters</h3>
        <p>Subscribe to our occasional correspondence on pens, ink, and the quiet art of writing.</p>
        <form id="newsletter-form">
          <div class="form-group">
            <input type="email" placeholder="Your email address" required>
            <button type="submit">Subscribe</button>
          </div>
          <div class="success">Thank you for subscribing</div>
        </form>
      </div>
    `;

    const form = this.shadowRoot.getElementById('newsletter-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const successMsg = this.shadowRoot.querySelector('.success');
      successMsg.style.display = 'block';
      form.style.display = 'none';
    });
  }
}

customElements.define('newsletter-form', NewsletterForm);