// 접속 시 뜨는 공지·행사 안내 팝업.
// 실제 공지를 띄우려면 index.html의 announceModal 안 제목·본문(·이미지)을 채운 뒤
// 아래 announceModalActive를 그대로 true로 두면 됩니다. 팝업을 끄고 싶으면 false로 바꾸세요.
document.addEventListener('DOMContentLoaded', () => {
  const announceModalActive = true;
  const modal = document.getElementById('announceModal');
  if (!announceModalActive || !modal) return;

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
});
