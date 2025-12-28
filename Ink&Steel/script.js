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

