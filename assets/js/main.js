// 서학동성당 홈페이지 — 원페이지 스크립트
document.addEventListener("DOMContentLoaded", () => {
  // 모바일 메뉴
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => menu.classList.remove("is-open"));
    });
  }

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // 오늘의 미사 날짜 · CBCK 링크
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const monthEl = document.getElementById("liturgyMonth");
  const dayEl = document.getElementById("liturgyDay");
  const linkEl = document.getElementById("liturgyLink");
  if (monthEl) monthEl.textContent = yyyy + "." + mm;
  if (dayEl) dayEl.textContent = dd;
  if (linkEl) linkEl.href = "https://missa.cbck.or.kr/DailyMissa/" + yyyy + mm + dd;

  // 미사시간 탭 (주일 / 평일)
  document.querySelectorAll(".mass-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".mass-tab").forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".mass-panel").forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      const panel = document.getElementById("panel-" + tab.dataset.tab);
      if (panel) panel.classList.add("active");
    });
  });

  // 공지사항 아코디언
  document.querySelectorAll(".notice-item").forEach((item) => {
    const row = item.querySelector(".notice-row");
    const body = item.querySelector(".notice-body");
    if (!row || !body) return;
    row.addEventListener("click", () => {
      const isOpen = item.classList.toggle("open");
      body.style.maxHeight = isOpen ? body.scrollHeight + "px" : null;
    });
  });

  // 갤러리 라이트박스
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxCap = document.getElementById("lightboxCap");
  if (lightbox && lightboxImg && lightboxCap) {
    document.querySelectorAll(".gallery-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const imgUrl = btn.dataset.img;
        if (imgUrl) {
          lightboxImg.innerHTML = "";
          lightboxImg.classList.remove("placeholder-photo");
          const img = document.createElement("img");
          img.src = imgUrl;
          img.alt = btn.dataset.caption || "";
          img.style.width = "100%";
          img.style.height = "100%";
          img.style.objectFit = "cover";
          img.style.display = "block";
          lightboxImg.appendChild(img);
        } else {
          lightboxImg.classList.add("placeholder-photo");
          lightboxImg.textContent = btn.dataset.caption || "";
        }
        lightboxCap.textContent = btn.dataset.caption || "";
        lightbox.classList.add("open");
      });
    });
    const closeBtn = document.getElementById("lightboxClose");
    if (closeBtn) closeBtn.addEventListener("click", () => lightbox.classList.remove("open"));
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) lightbox.classList.remove("open");
    });
  }

  // 카카오맵 — 오시는 길
  const mapEl = document.getElementById("locMap");
  if (mapEl && window.kakao && window.kakao.maps) {
    kakao.maps.load(() => {
      const geocoder = new kakao.maps.services.Geocoder();
      const address = "전주시 완산구 서학로 51";
      geocoder.addressSearch(address, (result, status) => {
        const center =
          status === kakao.maps.services.Status.OK
            ? new kakao.maps.LatLng(result[0].y, result[0].x)
            : new kakao.maps.LatLng(35.8074, 127.1489); // 주소 검색 실패 시 대략적 위치로 대체

        const map = new kakao.maps.Map(mapEl, { center, level: 4 });
        new kakao.maps.Marker({ map, position: center, title: "서학동성당" });
      });
    });
  }
});
