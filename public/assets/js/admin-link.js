// 관리자 버튼 — 구글 로그인한 계정이 관리자(대표 관리자이거나 관리자 명단에 있는 사람)일 때만
// 홈페이지에 "관리" 버튼을 보여준다. 일반 신자분들 화면에는 아무것도 나타나지 않는다.
(function () {
  const btn = document.getElementById('adminFab');
  if (!btn || !window.firebase || !firebase.auth || !window.FIREBASE_CONFIG) return;

  if (!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG);
  const owner = String(window.SITE_OWNER_EMAIL || '').toLowerCase();

  firebase.auth().onAuthStateChanged(async (user) => {
    if (!user || !user.email) { btn.hidden = true; return; }
    if (user.email.toLowerCase() === owner) { btn.hidden = false; return; }
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/me', { headers: { Authorization: 'Bearer ' + token }, cache: 'no-store' });
      btn.hidden = !res.ok;
    } catch (e) {
      btn.hidden = true;
    }
  });
})();
