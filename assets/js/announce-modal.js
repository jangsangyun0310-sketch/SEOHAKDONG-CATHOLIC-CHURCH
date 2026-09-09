// 접속 시 뜨는 공지·행사 안내 팝업.
// 제목/본문/사진/켜고끄기는 content/announce.json에서 불러옵니다 (관리자 페이지에서 편집).
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('announceModal');
  if (!modal) return;

  fetch('content/announce.json')
    .then((res) => res.json())
    .then((data) => {
      if (!data || !data.active) return;

      const titleEl = document.getElementById('announceModalTitle');
      const textEl = document.getElementById('announceModalText');
      const imgEl = document.getElementById('announceModalImg');
      if (titleEl) titleEl.textContent = data.title || '';
      if (textEl) textEl.textContent = data.text || '';
      if (imgEl) {
        if (data.image) {
          imgEl.src = data.image;
          imgEl.style.display = '';
        } else {
          imgEl.style.display = 'none';
        }
      }

      const HIDE_KEY = 'seohakdong-announce-hide-date-v1';
      const todayStr = new Date().toDateString();
      const hideCheckbox = document.getElementById('announceModalHideToday');

      function openModal() { modal.classList.add('open'); }
      function closeAndMaybeRemember() {
        if (hideCheckbox.checked) localStorage.setItem(HIDE_KEY, todayStr);
        modal.classList.remove('open');
      }

      document.getElementById('announceModalCloseBtn').addEventListener('click', closeAndMaybeRemember);
      modal.addEventListener('click', (e) => { if (e.target === modal) closeAndMaybeRemember(); });

      if (localStorage.getItem(HIDE_KEY) !== todayStr) openModal();
    })
    .catch(() => {});
});
