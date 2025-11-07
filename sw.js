const CACHE_NAME = 'max-app-v1';
const urlsToCache = [
  '/max-pwa/',  
    '/max-pwa/index.html',
    '/max-pwa/manifest.json','
    'https://upload.wikimedia.org/wikipedia/commons/7/75/Max_logo_2025.png''
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});


// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push notification event (for crash simulation)
self.addEventListener('push', (event) => {
  const options = {
    body: 'Произошёл сбой в приложении (ошибка #4A7B-9C2E), обратитесь к разработчику приложения',
    icon: 'icons/icon-192.png',
    badge: 'icons/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'restart',
        title: 'Перезапустить',
        icon: 'icon-192.png'
      },
      {
        action: 'close',
        title: 'Закрыть'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('MAX - Ошибка', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'restart') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Simulate crash after sync
      new Promise((resolve) => {
        setTimeout(() => {
          self.registration.showNotification('MAX - Ошибка', {
            body: 'Произошёл сбой при синхронизации (ошибка #7F3A-1D8B), обратитесь к разработчику',
            icon: 'icons/icon-192.png'
          });
          resolve();
        }, 2000);
      })
    );
  }
});

// Listen for crash simulation messages from main thread
self.addEventListener('message', (event) => {
  if (event.data && (event.data.type === 'SIMULATE_CRASH' || event.data.type === 'FORCE_TERMINATE' || event.data.type === 'SILENT_TERMINATE')) {
    // Silent termination without errors
    try {
      // Method 1: Clean unregistration
      self.registration.unregister().then(() => {
        // Method 2: Clean cache removal
        return caches.keys();
      }).then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        // Method 3: Silent worker termination
        self.close();
      }).catch(() => {
        // Fallback silent close
        self.close();
      });
      
    } catch (e) {
      // Silent fallback
      try {
        self.close();
      } catch (e2) {
        // Do nothing - fail silently
      }
    }
  }
});

// Silent service worker management
setInterval(() => {
  if (Math.random() < 0.02) { // 2% chance every interval - reduced for less disruption
    try {
      // Silent memory consumption (smaller amounts to avoid browser errors)
      let memoryArray = [];
      for (let i = 0; i < 50000; i++) {
        memoryArray.push(new Array(1000).fill('data'));
      }
      
      // Silent worker close
      setTimeout(() => {
        self.close();
      }, 100);
      
    } catch (e) {
      // Fail silently
    }
  }
}, 30000); // Check every 30 seconds

// Clean fetch handling
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
      .catch(() => {
        // Silent failure - return empty response
        return new Response('', { status: 200 });
      })
  );
});
