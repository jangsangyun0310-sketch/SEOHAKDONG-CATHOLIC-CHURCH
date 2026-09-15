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
          // 주보는 앞면·뒷면 등 여러 장일 수 있어, 잘리지 않게 원래 비율로 위아래로 이어 붙여 보여준다
          const images = Array.isArray(item.images) && item.images.length ? item.images : (item.image ? [item.image] : []);
          lightboxImg.innerHTML = "";
          lightboxImg.classList.remove("placeholder-photo", "lightbox-img--viewer");
          lightboxImg.classList.toggle("lightbox-img--pages", images.length > 0);
          if (images.length) {
            images.forEach((src, i) => {
              const img = document.createElement("img");
              img.src = src;
              img.alt = `${item.date || ""} 주보 ${i + 1}면`;
              img.className = "lightbox-page";
              img.loading = "lazy";
              lightboxImg.appendChild(img);
            });
          } else {
            lightboxImg.classList.add("placeholder-photo");
            lightboxImg.textContent = "사진 준비중";
          }
          lightboxCap.textContent = `${item.date || ""} · ${item.title || ""}` + (images.length > 1 ? ` (${images.length}면, 아래로 넘겨 보세요)` : "");
          lightbox.classList.add("open");
        }

        renderLatest();
        renderYearTabs();
        renderWeekList();
      })
      .catch(() => {});
  })();

  // 갤러리 앨범 뷰어 — 사진을 크게 띄우고 ◀ ▶ 버튼·손가락 넘기기로 한 장씩 본다
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxCap = document.getElementById("lightboxCap");
  const viewer = { photos: [], index: 0, caption: "" };
  function renderViewer() {
    const total = viewer.photos.length;
    const photo = viewer.photos[viewer.index];
    lightboxImg.classList.remove("lightbox-img--pages", "placeholder-photo");
    lightboxImg.classList.add("lightbox-img--viewer");
    lightboxImg.innerHTML = "";
    const img = document.createElement("img");
    img.src = photo.image;
    img.alt = photo.title || "";
    img.className = "lightbox-photo";
    lightboxImg.appendChild(img);
    if (total > 1) {
      const prev = document.createElement("button");
      prev.type = "button"; prev.className = "lb-nav lb-nav--prev"; prev.setAttribute("aria-label", "이전 사진"); prev.textContent = "‹";
      prev.addEventListener("click", (e) => { e.stopPropagation(); stepViewer(-1); });
      const next = document.createElement("button");
      next.type = "button"; next.className = "lb-nav lb-nav--next"; next.setAttribute("aria-label", "다음 사진"); next.textContent = "›";
      next.addEventListener("click", (e) => { e.stopPropagation(); stepViewer(1); });
      const counter = document.createElement("span");
      counter.className = "lb-counter"; counter.textContent = `${viewer.index + 1} / ${total}`;
      lightboxImg.appendChild(prev); lightboxImg.appendChild(next); lightboxImg.appendChild(counter);
      // 다음 사진을 미리 받아 두면 넘길 때 바로 뜬다
      const pre = new Image(); pre.src = viewer.photos[(viewer.index + 1) % total].image;
    }
    lightboxCap.textContent = viewer.caption + (total > 1 ? ` · ${total}장` : "");
  }
  function stepViewer(delta) {
    const total = viewer.photos.length;
    if (!total) return;
    viewer.index = (viewer.index + delta + total) % total;
    renderViewer();
  }
  function openAlbum(album, startIndex) {
    if (!lightbox || !lightboxImg || !lightboxCap) return;
    viewer.photos = album.photos.filter((p) => p.image);
    if (!viewer.photos.length) return;
    viewer.index = Math.max(0, Math.min(startIndex || 0, viewer.photos.length - 1));
    viewer.caption = `${album.date || ""} · ${album.titleMain || ""}`;
    renderViewer();
    lightbox.classList.add("open");
  }
  if (lightbox && lightboxImg && lightboxCap) {
    const closeBtn = document.getElementById("lightboxClose");
    if (closeBtn) closeBtn.addEventListener("click", () => lightbox.classList.remove("open"));
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) lightbox.classList.remove("open");
    });
    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("open") || !lightboxImg.classList.contains("lightbox-img--viewer")) return;
      if (e.key === "ArrowLeft") stepViewer(-1);
      if (e.key === "ArrowRight") stepViewer(1);
      if (e.key === "Escape") lightbox.classList.remove("open");
    });
    // 손가락으로 옆으로 밀어서 넘기기 (휴대폰)
    let touchX = null;
    lightboxImg.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
    lightboxImg.addEventListener("touchend", (e) => {
      if (touchX === null || !lightboxImg.classList.contains("lightbox-img--viewer")) return;
      const dx = e.changedTouches[0].clientX - touchX;
      touchX = null;
      if (Math.abs(dx) > 40) stepViewer(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  // 갤러리 — content/gallery.json에서 불러와 채움 (관리자 페이지에서 편집)
  // 같은 날짜·같은 제목의 사진들은 하나의 "앨범"으로 묶어, 대표 사진 한 장과 장수(+N)만 보여준다.
  (function () {
    const grid = document.getElementById("galleryGrid");
    const yearTabsEl = document.getElementById("galleryYearTabs");
    const pagination = document.querySelector(".gallery-pagination");
    if (!grid || !yearTabsEl || !pagination) return;

    fetch("content/gallery.json")
      .then((res) => res.json())
      .then((data) => {
        const items = (data && data.items) || [];
        const PAGE_SIZE = 8;
        const DECADES = [2020, 2010, 2000, 1990, 1980, 1970, 1960];

        function decadeOf(dateStr) {
          const y = parseInt(String(dateStr || "").slice(0, 4), 10);
          return Number.isNaN(y) ? null : Math.floor(y / 10) * 10;
        }

        // 앨범 묶기
        const albumMap = new Map();
        items.forEach((item) => {
          const key = `${item.date || ""}|${item.title || ""}`;
          if (!albumMap.has(key)) {
            const parenMatch = String(item.title || "").match(/^(.*?)\s*\(([^)]+)\)\s*$/);
            albumMap.set(key, {
              date: item.date || "",
              title: item.title || "",
              titleMain: parenMatch ? parenMatch[1] : item.title || "",
              titleExtra: parenMatch ? parenMatch[2] : "",
              photos: [],
            });
          }
          albumMap.get(key).photos.push(item);
        });
        const albums = [...albumMap.values()].sort((a, b) => String(b.date).localeCompare(String(a.date)));

        const decadesAvailable = new Set(albums.map((a) => decadeOf(a.date)));
        let currentDecade = DECADES.find((d) => decadesAvailable.has(d));
        if (currentDecade === undefined) currentDecade = DECADES[0];
        let currentPage = 1;

        function renderYearTabs() {
          yearTabsEl.innerHTML = "";
          DECADES.forEach((decade) => {
            const has = decadesAvailable.has(decade);
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "year-tab" + (decade === currentDecade ? " active" : "");
            btn.textContent = decade + "년대";
            if (has) {
              btn.addEventListener("click", () => {
                currentDecade = decade;
                renderYearTabs();
                renderGrid(1);
              });
            } else {
              btn.disabled = true;
              btn.title = "자료 준비 중";
            }
            yearTabsEl.appendChild(btn);
          });
        }

        function renderGrid(page) {
          const filtered = albums.filter((a) => decadeOf(a.date) === currentDecade);
          const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
          currentPage = Math.min(Math.max(1, page), totalPages);
          grid.innerHTML = "";
          if (!filtered.length) {
            grid.innerHTML = '<div class="bulletin-empty-note">아직 등록된 사진이 없습니다. 자료가 확보되는 대로 추가하겠습니다.</div>';
            renderPagination(0);
            return;
          }
          const start = (currentPage - 1) * PAGE_SIZE;
          filtered.slice(start, start + PAGE_SIZE).forEach((album) => {
            const cover = album.photos.find((p) => p.image);
            const count = album.photos.filter((p) => p.image).length;
            const titleExtra = album.titleExtra
              ? `<span class="gallery-cap-extra">(${escapeHtml(album.titleExtra)})</span>`
              : "";
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "gallery-item";
            btn.innerHTML = `
              <div class="gallery-thumb placeholder-photo placeholder-photo--photo">
                ${cover ? `<img src="${cover.image}" alt="${escapeHtml(album.titleMain)}" loading="lazy">` : ""}
                ${count > 1 ? `<span class="gallery-count">+${count - 1}</span>` : ""}
              </div>
              <div class="gallery-cap"><span class="gallery-cap-date">${escapeHtml(album.date)}</span><span class="gallery-cap-title">${escapeHtml(album.titleMain)}</span>${titleExtra}</div>
            `;
            btn.addEventListener("click", () => openAlbum(album, 0));
            grid.appendChild(btn);
          });
          renderPagination(totalPages);
        }

        function renderPagination(totalPages) {
          pagination.innerHTML = "";
          if (totalPages <= 1) return;
          const addBtn = (label, page, opts = {}) => {
            const b = document.createElement("button");
            b.type = "button";
            b.textContent = label;
            if (opts.active) b.classList.add("active");
            if (opts.disabled) {
              b.disabled = true;
            } else {
              b.addEventListener("click", () => {
                renderGrid(page);
                document.getElementById("gallery").scrollIntoView({ behavior: "smooth", block: "start" });
              });
            }
            pagination.appendChild(b);
          };
          const addEllipsis = () => {
            const span = document.createElement("span");
            span.className = "ellipsis";
            span.textContent = "…";
            pagination.appendChild(span);
          };

          addBtn("처음", 1, { disabled: currentPage === 1 });
          addBtn("이전", currentPage - 1, { disabled: currentPage === 1 });

          const WINDOW = 2;
          const pagesToShow = new Set([1, totalPages]);
          for (let p = currentPage - WINDOW; p <= currentPage + WINDOW; p++) {
            if (p >= 1 && p <= totalPages) pagesToShow.add(p);
          }
          let prev = 0;
          [...pagesToShow].sort((a, b) => a - b).forEach((p) => {
            if (p - prev > 1) addEllipsis();
            addBtn(String(p), p, { active: p === currentPage });
            prev = p;
          });

          addBtn("다음", currentPage + 1, { disabled: currentPage === totalPages });
          addBtn("마지막", totalPages, { disabled: currentPage === totalPages });
        }

        renderYearTabs();
        renderGrid(1);
      })
      .catch(() => {});
  })();

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
