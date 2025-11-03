// Register service worker for PWA
(function() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      const swUrl = 'sw.js';
      navigator.serviceWorker.register(swUrl)
        .catch(err => console.warn('SW registration failed:', err));
    });
  }
})();

