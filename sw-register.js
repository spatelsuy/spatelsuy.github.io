// sw-register.js

if (window.isSecureContext && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('/offline-worker.js')
    .then(function (reg) {
      console.log('Service Worker registered successfully.', reg);
    })
    .catch(function (err) {
      console.error('Service Worker registration failed:', err);
    });
}

