// Minimal service worker so Chrome/Android offers the "홈 화면에 추가"(install) prompt.
// No caching is done on purpose — the site's content(공지사항 등)이 수시로 바뀌므로
// 항상 네트워크에서 최신 내용을 가져와야 한다.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
