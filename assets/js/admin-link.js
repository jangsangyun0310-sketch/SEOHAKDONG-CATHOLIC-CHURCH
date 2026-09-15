// 관리자 버튼 — 구글 로그인한 계정이 관리자(대표 관리자이거나 Firestore admins 명단에 있는 사람)일 때만
// 홈페이지에 "관리" 버튼을 보여준다. 일반 신자분들 화면에는 아무것도 나타나지 않는다.
(function () {
  const btn = document.getElementById('adminFab');
  if (!btn || !window.firebase || !firebase.auth || !window.FIREBASE_CONFIG) return;

  if (!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG);
  const owner = String(window.SITE_OWNER_EMAIL || '').toLowerCase();

  firebase.auth().onAuthStateChanged(async (user) => {
    if (!user || !user.email) { btn.hidden = true; return; }
    const email = user.email.toLowerCase();
    let isAdmin = email === owner;
    if (!isAdmin) {
      try {
        const doc = await firebase.firestore().collection('admins').doc(email).get();
        isAdmin = doc.exists;
      } catch (e) { isAdmin = false; }
    }
    btn.hidden = !isAdmin;
  });
})();
