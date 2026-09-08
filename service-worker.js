// Minimal service worker so Chrome/Android offers the "홈 화면에 추가"(install) prompt.
// No caching is done on purpose — the site's content(공지사항 등)이 수시로 바뀌므로
// 항상 네트워크에서 최신 내용을 가져와야 한다.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});

// ---------- 웹 푸시 알림(Firebase Cloud Messaging) ----------
// 화면이 꺼져있거나 다른 앱을 보고 있을 때(백그라운드) 알림을 띄워주는 부분.
// push-config.js와 값이 같아야 하며, 서비스워커는 페이지의 window 값을 못 읽으므로 여기 직접 적어둔다.
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBFqfixoo2Rky7VU7-WPZ43qisL3dFMY9g",
  authDomain: "seohakdong-church.firebaseapp.com",
  projectId: "seohakdong-church",
  storageBucket: "seohakdong-church.firebasestorage.app",
  messagingSenderId: "270912339972",
  appId: "1:270912339972:web:f25d3096f300c3de72b551"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = (payload.notification && payload.notification.title) || '서학동성당';
  const body = (payload.notification && payload.notification.body) || '';
  self.registration.showNotification(title, {
    body,
    icon: 'assets/img/icons/icon-192.png',
    badge: 'assets/img/icons/icon-192.png'
  });
});
