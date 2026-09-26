// "오늘의 말씀" 표시 — content/notices.json처럼 파일에서 읽지 않고,
// Firestore(site_data/todayword)에서 실시간으로 읽어온다.
// 이렇게 하면 매일 자동 갱신이 index.html을 고치지 않아서, 깃허브에 커밋될 일이 없고
// 그래서 Netlify가 매일 사이트를 재배포하며 크레딧을 쓰는 일도 없어진다.
// Firestore에서 못 가져오는 경우 index.html에 이미 적혀 있는 기본값을 그대로 둔다.
(function () {
  if (!window.FIREBASE_CONFIG || window.FIREBASE_CONFIG.apiKey === 'REPLACE_ME') return;

  function getFirebaseApp() {
    return firebase.apps.length ? firebase.apps[0] : firebase.initializeApp(window.FIREBASE_CONFIG);
  }

  getFirebaseApp();
  firebase.firestore().collection('site_data').doc('todayword').get()
    .then((doc) => {
      if (!doc.exists) return;
      const d = doc.data();
      const setText = (id, value) => {
        if (value == null) return;
        const el = document.getElementById(id);
        if (el) el.textContent = value;
      };
      setText('liturgyYm', d.ym);
      setText('liturgyDay', d.day);
      setText('liturgyFeast', d.feastName);
      setText('liturgyVerse', d.verse);
      const colorEl = document.getElementById('liturgyColor');
      if (colorEl && d.color) {
        // 색 모양(CSS)은 한국어 값(백/홍/녹/자/흑)을 기준으로 하므로 data-color는 그대로 두고 글자만 바꾼다
        colorEl.dataset.color = d.color;
        colorEl.textContent = window.I18N ? I18N.t('color_' + d.color, d.color) : d.color;
      }
      if (window.I18N) I18N.translateElements([document.getElementById('liturgyFeast'), document.getElementById('liturgyVerse')]);
    })
    .catch((err) => console.error('오늘의 말씀 불러오기 실패', err));
})();
