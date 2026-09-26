// 실제 브라우저로 홈페이지·관리자 페이지를 눌러보는 테스트 (로컬 D1 + 가짜 구글 로그인/GitHub)
// 실행: npm run test:browser   → 결과 화면은 test-results/ 폴더에 저장된다
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { chromium, devices } from 'playwright';
import { startStack } from './helpers.mjs';

const OUT = 'test-results';
mkdirSync(OUT, { recursive: true });

// 구글 로그인 대신 "대표 관리자로 로그인된 상태"를 흉내 내는 가짜 Firebase 로그인 모듈
const FAKE_AUTH = `(function () {
  var user = { email: 'jangsangyun0310@gmail.com', displayName: '대표', getIdToken: function () { return Promise.resolve('owner-token'); } };
  var auth = {
    currentUser: user,
    onAuthStateChanged: function (cb) { setTimeout(function () { cb(user); }, 0); },
    signOut: function () {}, signInWithPopup: function () { return Promise.resolve(); }, signInWithRedirect: function () {}
  };
  firebase.auth = function () { return auth; };
  firebase.auth.GoogleAuthProvider = function () { this.setCustomParameters = function () {}; };
})();`;

// 2x2 PNG (관리자 페이지가 올리기 전에 JPEG로 줄여 변환한다)
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAFklEQVR4nGP4z8DAwMDAxMDAwMDAAAANHQEDasKb6QAAAABJRU5ErkJggg==', 'base64');

const stack = await startStack({ port: 8798, persist: '.wrangler/browser-state' });
const errors = [];
try {
  const api = async (path, method = 'GET', body) => {
    const res = await fetch(stack.base + path, {
      method,
      headers: { Authorization: 'Bearer owner-token', ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    assert.ok(res.ok, `${method} ${path} → ${res.status} ${await res.clone().text()}`);
    return res.json();
  };
  const upload = async (name) => {
    const res = await fetch(stack.base + '/api/admin/upload', {
      method: 'POST',
      headers: { Authorization: 'Bearer owner-token', 'Content-Type': 'text/plain', 'X-Upload-Path': `assets/img/uploads/2026/${name}.jpg` },
      body: PNG.toString('base64'),
    });
    return res.json();
  };

  // ---------- 예시 데이터 ----------
  await api('/api/admin/notices', 'POST', { tag: '공지', title: '추석 합동 위령 미사', date: '2026.09.25', body: '10월 5일 오전 10시\n성당 대성전' });
  const b1 = await upload('b1');
  await api('/api/admin/bulletins', 'POST', { date: '2026.09.20', title: '연중 제25주일', images: [b1.path], blobs: [b1] });
  const g1 = await upload('g1');
  const g2 = await upload('g2');
  await api('/api/admin/gallery', 'POST', { date: '2026.09.15', title: '본당의 날', photos: [g1.path, g2.path], blobs: [g1, g2] });
  await api('/api/admin/announce', 'PUT', { active: true, title: '추석 미사 안내', text: '추석 미사시간을 안내해 드립니다.', image: '', blobs: [] });
  await api('/api/admin/push', 'POST', { title: '첫 알림', body: '알림함 확인용' });

  const browser = await chromium.launch();

  // ---------- 1. 홈페이지 (휴대폰) ----------
  const ctx = await browser.newContext({ ...devices['Pixel 7'], locale: 'ko-KR' });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push('home: ' + e.message));
  await page.route('**/firebase-auth-compat.js', (r) => r.fulfill({ contentType: 'text/javascript', body: FAKE_AUTH }));
  await page.goto(stack.base + '/', { waitUntil: 'load' });
  await page.waitForSelector('#announceModal.open', { timeout: 10000 });
  assert.equal(await page.textContent('#announceModalTitle'), '추석 미사 안내');
  await page.screenshot({ path: `${OUT}/home-announce.png` });
  await page.click('#announceModalCloseBtn');

  await page.waitForSelector('.notice-title');
  assert.equal(await page.textContent('.notice-title'), '추석 합동 위령 미사');
  assert.match(await page.textContent('#bulletinLatest h3'), /연중 제25주일/);
  assert.equal(await page.textContent('.gallery-cap-title'), '본당의 날');
  assert.equal((await page.textContent('.gallery-count')).trim(), '+1');
  assert.equal((await page.textContent('#notifBellBtnMobile .notif-bell-badge')).trim(), '1');
  assert.equal(await page.isVisible('#adminFab'), true, '대표 관리자에게는 관리 버튼이 보여야 함');

  // 앨범 열기 → 두 장
  await page.click('.gallery-item');
  await page.waitForSelector('#lightbox.open .lb-counter');
  assert.equal(await page.textContent('.lb-counter'), '1 / 2');
  const photoOk = await page.$eval('.lightbox-photo', (img) => img.complete && img.naturalWidth > 0);
  assert.ok(photoOk, '배포 전 사진도 GitHub에서 읽어 보여야 함');
  await page.screenshot({ path: `${OUT}/home-album.png` });
  await page.click('#lightboxClose');

  // 알림함
  await page.click('#notifBellBtnMobile');
  await page.waitForSelector('#notifPanel.open .notif-item-title');
  assert.equal(await page.textContent('.notif-item-title'), '첫 알림');
  await page.screenshot({ path: `${OUT}/home-inbox.png` });
  await ctx.close();

  // ---------- 2. 관리자 페이지 (PC) ----------
  const actx = await browser.newContext({ viewport: { width: 1100, height: 900 }, locale: 'ko-KR' });
  const admin = await actx.newPage();
  admin.on('pageerror', (e) => errors.push('admin: ' + e.message));
  admin.on('dialog', (d) => d.accept());
  await admin.route('**/firebase-auth-compat.js', (r) => r.fulfill({ contentType: 'text/javascript', body: FAKE_AUTH }));
  await admin.goto(stack.base + '/admin/', { waitUntil: 'load' });
  await admin.waitForSelector('#viewHome:not([hidden])');
  assert.equal(await admin.isVisible('#adminsTile'), true);

  // 공지 추가
  await admin.click('[data-section="notices"]');
  await admin.waitForSelector('.card');
  await admin.click('#addBtn');
  await admin.fill('[data-k="title"]', '관리자 화면에서 쓴 공지');
  await admin.fill('[data-k="body"]', '본문입니다');
  await admin.click('[data-save]');
  await admin.waitForSelector('#sectionStatus.ok');
  assert.equal((await api('/api/home')).notices.some((n) => n.title === '관리자 화면에서 쓴 공지'), true);

  // 갤러리: 사진 두 장으로 새 앨범
  await admin.click('#backBtn');
  await admin.click('[data-section="gallery"]');
  await admin.waitForSelector('.card');
  await admin.click('#addBtn');
  await admin.fill('[data-k="title"]', '관리자 화면 앨범');
  const treesBefore = stack.gh.trees.length;
  await admin.setInputFiles('.file-box input[type=file]', [
    { name: 'a.png', mimeType: 'image/png', buffer: PNG },
    { name: 'b.png', mimeType: 'image/png', buffer: PNG },
  ]);
  await admin.waitForFunction(() => document.querySelectorAll('.file-box .preview img').length === 2);
  await admin.click('[data-save]');
  await admin.waitForSelector('#sectionStatus.ok', { timeout: 15000 });
  assert.equal(stack.gh.trees.length, treesBefore + 1, '사진 두 장이 한 번의 커밋으로 저장되어야 함');
  const gallery = (await api('/api/admin/gallery')).items;
  const created = gallery.find((a) => a.title === '관리자 화면 앨범');
  assert.equal(created.photos.length, 2);
  await admin.screenshot({ path: `${OUT}/admin-gallery.png` });

  // 앨범 수정: 한 장 빼기
  await admin.click(`[data-edit="${created.id}"]`);
  await admin.click('.album-photo-x');
  await admin.click('[data-save]');
  await admin.waitForSelector('#sectionStatus.ok');
  assert.equal((await api(`/api/gallery/${created.id}`)).album.photos.length, 1);

  // 관리자 명단
  await admin.click('#backBtn');
  await admin.click('[data-section="admins"]');
  await admin.fill('#adminEmail', 'helper@example.com');
  await admin.click('#adminAddBtn');
  await admin.waitForSelector('#adminList .card');
  assert.equal(await admin.textContent('#adminList .title'), 'helper@example.com');
  await admin.screenshot({ path: `${OUT}/admin-admins.png` });
  await actx.close();

  await browser.close();
  assert.deepEqual(errors, [], 'JS 오류가 없어야 함');
  console.log('브라우저 테스트 통과 — 화면은 test-results/ 에 저장');
} finally {
  stack.stop();
}
