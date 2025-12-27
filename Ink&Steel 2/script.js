// Initialize cart if not exists
if (!localStorage.getItem('cart')) {
  localStorage.setItem('cart', JSON.stringify([]));
}

// Handle adding items to cart
document.addEventListener('add-to-cart', (e) => {
  const cart = JSON.parse(localStorage.getItem('cart'));
  const existingItem = cart.find(item => item.id === e.detail.id);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      ...e.detail,
      quantity: 1
    });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Dispatch cart update event
  document.dispatchEvent(new CustomEvent('cart-updated'));
  
  // Show notification
  const notification = document.createElement('div');
  notification.innerHTML = `
    <style>
      .cart-notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #333;
        color: white;
        padding: 1rem;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        animation: fadeInOut 3s ease;
        opacity: 0;
      }
      @keyframes fadeInOut {
        0%, 100% { opacity: 0; transform: translateY(10px); }
        20%, 80% { opacity: 1; transform: translateY(0); }
      }
    </style>
    <div class="cart-notification">
      Added ${e.detail.name} to your collection
    </div>
  `;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
});

// Handle page transitions
document.addEventListener('DOMContentLoaded', () => {
  // Fade in animation
  document.body.style.opacity = '0';
  setTimeout(() => {
    document.body.style.transition = 'opacity 1.5s ease';
    document.body.style.opacity = '1';
  }, 100);
  
  // Remove transition on page leave
  window.addEventListener('beforeunload', () => {
    document.body.style.transition = 'none';
  });
});