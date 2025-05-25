// sw-register.js

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(function (reg) {
      console.log('Service Worker registered successfully.', reg);
    })
    .catch(function (err) {
      console.error('Service Worker registration failed:', err);
    });
}

