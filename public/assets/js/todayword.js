// "오늘의 말씀" 표시 — 서버(D1)에 매일 자동으로 저장되는 값을 site-data.js로 받아 채운다.
// 못 받아오면 index.html에 적힌 기본값을 그대로 둔다.
(function () {
  if (!window.SITE_DATA) return;
  window.SITE_DATA.then((data) => {
    const d = data && data.todayword;
    if (!d) return;
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
  });
})();
