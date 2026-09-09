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

  // 홈페이지 링크 공유하기 — 모바일은 공유 시트, 안 되는 환경은 링크 복사로 대체
  const shareBtn = document.getElementById("shareBtn");
  const shareBtnLabel = document.getElementById("shareBtnLabel");
  if (shareBtn && shareBtnLabel) {
    const defaultLabel = shareBtnLabel.textContent;
    function flashLabel(text) {
      shareBtnLabel.textContent = text;
      setTimeout(() => { shareBtnLabel.textContent = defaultLabel; }, 2000);
    }
    function copyLink() {
      const url = location.href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(
          () => flashLabel("링크가 복사됐어요!"),
          () => flashLabel("복사에 실패했어요")
        );
        return;
      }
      // 클립보드 API를 못 쓰는 구형 브라우저 대비
      const temp = document.createElement("textarea");
      temp.value = url;
      temp.style.position = "fixed";
      temp.style.opacity = "0";
      document.body.appendChild(temp);
      temp.select();
      try {
        document.execCommand("copy");
        flashLabel("링크가 복사됐어요!");
      } catch (err) {
        flashLabel("복사에 실패했어요");
      }
      document.body.removeChild(temp);
    }
    shareBtn.addEventListener("click", async () => {
      if (navigator.share) {
        try {
          await navigator.share({ title: document.title, url: location.href });
        } catch (err) {
          // 사용자가 공유를 취소한 경우 등은 그냥 둔다
        }
        return;
      }
      copyLink();
    });
  }

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
  function bindNoticeAccordions(root) {
    root.querySelectorAll(".notice-item").forEach((item) => {
      const row = item.querySelector(".notice-row");
      const body = item.querySelector(".notice-body");
      if (!row || !body) return;
      row.addEventListener("click", () => {
        const isOpen = item.classList.toggle("open");
        body.style.maxHeight = isOpen ? body.scrollHeight + "px" : null;
      });
    });
  }
  bindNoticeAccordions(document);

  // 공지사항 목록 — content/notices.json에서 불러와 채움 (관리자 페이지에서 편집)
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }
  const noticeList = document.getElementById("noticeList");
  if (noticeList) {
    fetch("content/notices.json")
      .then((res) => res.json())
      .then((data) => {
        const items = (data && data.items) || [];
        noticeList.innerHTML = items.map((n) => `
          <div class="notice-item">
            <button class="notice-row">
              <span class="notice-tag">${escapeHtml(n.tag || "")}</span>
              <span class="notice-title">${escapeHtml(n.title || "")}</span>
              <span class="notice-date">${escapeHtml(n.date || "")}</span>
              <span class="notice-plus"></span>
            </button>
            <div class="notice-body"><div class="notice-body-inner">${escapeHtml(n.body || "").replace(/\n/g, "<br>")}</div></div>
          </div>
        `).join("");
        bindNoticeAccordions(noticeList);
      })
      .catch(() => {});
  }

  // 주보 아카이브 — content/bulletins.json에서 불러와 채움 (관리자 페이지에서 편집)
  (function () {
    const latestEl = document.getElementById("bulletinLatest");
    const yearTabsEl = document.getElementById("bulletinYearTabs");
    const weekListEl = document.getElementById("bulletinWeekList");
    if (!latestEl || !yearTabsEl || !weekListEl) return;

    fetch("content/bulletins.json")
      .then((res) => res.json())
      .then((data) => {
        const items = (data && data.items) || [];
        if (!items.length) {
          latestEl.innerHTML = `
            <div><p class="eyebrow" style="margin-bottom:6px;">최근 게시된 주보</p><h3 style="margin:0;">주보 자료 준비중</h3></div>
            <span class="badge badge--todo">준비중</span>
          `;
          weekListEl.innerHTML = '<li class="bulletin-empty-note">아직 등록된 주보가 없습니다. 자료가 확보되는 대로 추가하겠습니다.</li>';
          return;
        }

        const byYear = {};
        items.forEach((item) => {
          const year = String(item.date || "").slice(0, 4);
          if (!byYear[year]) byYear[year] = [];
          byYear[year].push(item);
        });
        const years = Object.keys(byYear).sort((a, b) => b.localeCompare(a));
        const latest = items.slice().sort((a, b) => String(a.date).localeCompare(String(b.date))).pop();
        let currentYear = years[0] || null;

        function renderLatest() {
          latestEl.innerHTML = `
            <div>
              <p class="eyebrow" style="margin-bottom:6px;">최근 게시된 주보 (${escapeHtml(latest.date || "")})</p>
              <h3 style="margin:0;">${escapeHtml(latest.title || "")}</h3>
            </div>
            <button class="btn btn--primary" type="button" id="bulletinLatestBtn">주보 보기</button>
          `;
          const btn = document.getElementById("bulletinLatestBtn");
          if (btn) btn.addEventListener("click", () => openBulletin(latest));
        }

        function renderYearTabs() {
          yearTabsEl.innerHTML = "";
          years.forEach((y) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "year-tab" + (y === currentYear ? " active" : "");
            btn.textContent = y + "년";
            btn.addEventListener("click", () => {
              currentYear = currentYear === y ? null : y;
              renderYearTabs();
              renderWeekList();
            });
            yearTabsEl.appendChild(btn);
          });
        }

        function renderWeekList() {
          weekListEl.innerHTML = "";
          if (!currentYear) {
            weekListEl.innerHTML = '<li class="bulletin-empty-note">연도를 선택하면 주보 목록이 표시됩니다.</li>';
            return;
          }
          const list = (byYear[currentYear] || [])
            .slice()
            .sort((a, b) => String(b.date).localeCompare(String(a.date)));
          if (!list.length) {
            weekListEl.innerHTML = '<li class="bulletin-empty-note">아직 등록된 주보가 없습니다. 자료가 확보되는 대로 추가하겠습니다.</li>';
            return;
          }
          list.forEach((item) => {
            const li = document.createElement("li");
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "bulletin-week-row";
            btn.innerHTML = `<span class="wdate">${escapeHtml(item.date || "")}</span><span class="wtitle">${escapeHtml(item.title || "")}</span>`;
            btn.addEventListener("click", () => openBulletin(item));
            li.appendChild(btn);
            weekListEl.appendChild(li);
          });
        }

        function openBulletin(item) {
          const lightbox = document.getElementById("lightbox");
          const lightboxImg = document.getElementById("lightboxImg");
          const lightboxCap = document.getElementById("lightboxCap");
          if (!lightbox || !lightboxImg || !lightboxCap) return;
          lightboxImg.innerHTML = "";
          lightboxImg.classList.remove("placeholder-photo");
          if (item.image) {
            const img = document.createElement("img");
            img.src = item.image;
            img.alt = `${item.date || ""} 주보`;
            img.style.width = "100%";
            img.style.height = "100%";
            img.style.objectFit = "cover";
            img.style.display = "block";
            lightboxImg.appendChild(img);
          } else {
            lightboxImg.classList.add("placeholder-photo");
            lightboxImg.textContent = "사진 준비중";
          }
          lightboxCap.textContent = `${item.date || ""} · ${item.title || ""}`;
          lightbox.classList.add("open");
        }

        renderLatest();
        renderYearTabs();
        renderWeekList();
      })
      .catch(() => {});
  })();

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

        mapEl.innerHTML = ""; // 지도가 정상 로드되면 안내 문구(fallback)를 지운다
        const map = new kakao.maps.Map(mapEl, { center, level: 4 });
        new kakao.maps.Marker({ map, position: center, title: "서학동성당" });
      });
    });
  }
});
