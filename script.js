/* ==========================================
   THIỆP CƯỚI VĂN ĐẠT & THANH TRÚC
   ĐẾM NGƯỢC - ALBUM - NHẠC - MƯA TIM - LỊCH CƯỚI
   ========================================== */

// ==========================================
// 1. ĐỒNG HỒ ĐẾM NGƯỢC
// ==========================================
const weddingDate = new Date(2026, 9, 25, 9, 30, 0).getTime();

function updateCountdown() {
  const now = new Date().getTime();
  const distance = weddingDate - now;

  const ids = ["days", "hours", "minutes", "seconds"];

  if (distance <= 0) {
    ids.forEach((id) => {
      const element = document.getElementById(id);
      if (element) element.textContent = "00";
    });
    return;
  }

  const values = [
    Math.floor(distance / (1000 * 60 * 60 * 24)),
    Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
    Math.floor((distance % (1000 * 60)) / 1000),
  ];

  ids.forEach((id, index) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = String(values[index]).padStart(2, "0");
    }
  });
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ==========================================
// 2. ALBUM ẢNH
// ==========================================
const albumImages = [
  "images/album1.jpg",
  "images/album2.jpg",
  "images/album3.jpg",
  "images/album4.jpg",
];

let currentAlbumIndex = 0;
let autoSlideInterval = null;

function updateAlbumUi() {
  const mainPreview = document.getElementById("mainAlbumPreview");

  if (mainPreview) {
    mainPreview.style.opacity = "0";

    setTimeout(() => {
      mainPreview.src = albumImages[currentAlbumIndex];
      mainPreview.style.opacity = "1";
    }, 180);
  }

  document.querySelectorAll(".thumb-img").forEach((thumb, index) => {
    thumb.classList.toggle("active-thumb", index === currentAlbumIndex);
  });
}

function currentSlide(index) {
  if (index < 0 || index >= albumImages.length) return;

  currentAlbumIndex = index;
  updateAlbumUi();
  resetAutoSlide();
}

function changeSlide(direction) {
  currentAlbumIndex += direction;

  if (currentAlbumIndex >= albumImages.length) {
    currentAlbumIndex = 0;
  }

  if (currentAlbumIndex < 0) {
    currentAlbumIndex = albumImages.length - 1;
  }

  updateAlbumUi();
  resetAutoSlide();
}

function startAutoSlide() {
  clearInterval(autoSlideInterval);

  autoSlideInterval = setInterval(() => {
    // Không tự chuyển ảnh khi người xem chuyển sang tab khác
    if (document.hidden) return;

    currentAlbumIndex = (currentAlbumIndex + 1) % albumImages.length;
    updateAlbumUi();
  }, 3500);
}

function resetAutoSlide() {
  startAutoSlide();
}

function preloadImages() {
  albumImages.forEach((src) => {
    const image = new Image();
    image.src = src;
  });
}

// ==========================================
// 3. SAO CHÉP SỐ TÀI KHOẢN
// ==========================================
function copySTK() {
  const stkElement = document.getElementById("stkNum");
  if (!stkElement) return;

  const stk = stkElement.textContent.trim();

  function fallbackCopy() {
    const input = document.createElement("textarea");
    input.value = stk;
    input.style.position = "fixed";
    input.style.opacity = "0";

    document.body.appendChild(input);
    input.select();

    try {
      document.execCommand("copy");
      alert("Đã sao chép số tài khoản: " + stk);
    } catch (error) {
      alert("Không thể tự sao chép. Số tài khoản: " + stk);
    }

    input.remove();
  }

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(stk)
      .then(() => alert("Đã sao chép số tài khoản: " + stk))
      .catch(fallbackCopy);
  } else {
    fallbackCopy();
  }
}

// ==========================================
// 4. NHẠC NỀN VÀ NÚT MỞ THIỆP
// ==========================================
function initMusic() {
  const audio = document.getElementById("weddingMusic");
  const musicToggle = document.getElementById("musicToggle");
  const openBtn = document.getElementById("openInviteBtn");
  const introLoader = document.getElementById("introLoader");

  if (audio) {
    audio.volume = 0.6;
  }

  function updateMusicButton() {
    if (!musicToggle || !audio) return;

    musicToggle.innerHTML = audio.paused
      ? '<i class="fa-solid fa-volume-xmark"></i>'
      : '<i class="fa-solid fa-music"></i>';

    musicToggle.setAttribute(
      "aria-label",
      audio.paused ? "Bật nhạc" : "Tắt nhạc",
    );
  }

  async function playMusic() {
    if (!audio) return;

    try {
      audio.muted = false;
      await audio.play();
    } catch (error) {
      // Một số trình duyệt có thể chặn phát nhạc.
      // Người xem có thể bấm nút nhạc để thử phát lại.
      console.warn("Chưa thể phát nhạc. Hãy kiểm tra file nhạc.", error);
    }

    updateMusicButton();
  }

  if (musicToggle && audio) {
    musicToggle.addEventListener("click", async () => {
      if (audio.paused) {
        await playMusic();
      } else {
        audio.pause();
        updateMusicButton();
      }
    });

    audio.addEventListener("play", updateMusicButton);
    audio.addEventListener("pause", updateMusicButton);
  }

  if (openBtn) {
    openBtn.addEventListener("click", () => {
      if (introLoader) {
        introLoader.classList.add("hide");
      }

      // Bắt đầu nhạc khi người xem chủ động mở thiệp
      playMusic();

      // Bắt đầu hiệu ứng mưa trái tim
      createHeartShower();
    });
  }

  updateMusicButton();
}

// ==========================================
// 5. HIỆU ỨNG MƯA TRÁI TIM
// ==========================================
let heartShowerStarted = false;
let heartShowerInterval = null;

function createHeartShower() {
  if (heartShowerStarted) return;

  heartShowerStarted = true;

  const wrapper = document.querySelector(".mobile-wrapper");
  if (!wrapper) return;

  wrapper.style.position = "relative";

  // Bao phủ chiều cao của thiệp để tim rơi dọc trang
  const heartContainer = document.createElement("div");
  heartContainer.id = "wedding-heart-shower";

  Object.assign(heartContainer.style, {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: wrapper.scrollHeight + "px",
    overflow: "hidden",
    pointerEvents: "none",
    zIndex: "1000",
  });

  wrapper.appendChild(heartContainer);

  if (!document.getElementById("heart-shower-style")) {
    const style = document.createElement("style");
    style.id = "heart-shower-style";

    style.textContent = `
            @keyframes weddingHeartFall {
                0% {
                    transform: translate3d(0, -30px, 0) rotate(0deg);
                    opacity: 0;
                }
                10% {
                    opacity: 0.75;
                }
                85% {
                    opacity: 0.6;
                }
                100% {
                    transform: translate3d(12px, 380px, 0) rotate(25deg);
                    opacity: 0;
                }
            }

            .wedding-falling-heart {
                position: absolute;
                top: 0;
                line-height: 1;
                user-select: none;
                pointer-events: none;
                will-change: transform, opacity;
                animation-name: weddingHeartFall;
                animation-timing-function: linear;
                animation-fill-mode: forwards;
            }

            @media (prefers-reduced-motion: reduce) {
                .wedding-falling-heart {
                    animation-duration: 8s !important;
                }
            }
        `;

    document.head.appendChild(style);
  }

  function spawnHeart() {
    if (document.hidden || !heartContainer.isConnected) return;

    const heart = document.createElement("span");
    heart.className = "wedding-falling-heart";
    heart.textContent = Math.random() > 0.5 ? "❤️" : "💕";

    const size = Math.random() * 10 + 12;
    const duration = Math.random() * 3 + 5;
    const left = Math.random() * 96;

    heart.style.left = left + "%";
    heart.style.fontSize = size + "px";
    heart.style.animationDuration = duration + "s";

    heartContainer.appendChild(heart);

    heart.addEventListener(
      "animationend",
      () => {
        heart.remove();
      },
      { once: true },
    );

    // Dự phòng nếu trình duyệt không phát animationend
    setTimeout(() => heart.remove(), (duration + 1) * 1000);
  }

  // Thả tim vừa phải để giảm tải trên điện thoại
  spawnHeart();
  heartShowerInterval = setInterval(spawnHeart, 850);

  // Dừng tạo tim khi rời trang
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && heartShowerInterval) {
      clearInterval(heartShowerInterval);
      heartShowerInterval = null;
    } else if (!document.hidden && !heartShowerInterval) {
      heartShowerInterval = setInterval(spawnHeart, 850);
    }
  });
}

// ==========================================
// 6. TỰ ĐỘNG THÊM LỊCH CƯỚI THÁNG 10/2026
// Không cần sửa index.html
// ==========================================
function addWeddingCalendar() {
  if (document.getElementById("weddingCalendar")) return;

  const eventsSection = document.querySelector(".events-section");
  const countdownSection = document.querySelector(".countdown-section");

  if (!eventsSection || !countdownSection) return;

  const calendarSection = document.createElement("section");
  calendarSection.id = "weddingCalendar";
  calendarSection.className = "wedding-calendar-section";

  calendarSection.innerHTML = `
        <div class="calendar-heading">
            <p class="calendar-eyebrow">SAVE THE DATE</p>
            <h2>Lịch Cưới</h2>
            <p class="calendar-subtitle">
                Tháng 10 năm 2026 · Văn Đạt &amp; Thanh Trúc
            </p>
            <div class="calendar-heart">♥</div>
        </div>

        <div class="calendar-card">
            <div class="calendar-month-title">
                <span>THÁNG 10</span>
                <strong>2026</strong>
            </div>

            <div class="calendar-grid calendar-weekdays">
                <span>T2</span>
                <span>T3</span>
                <span>T4</span>
                <span>T5</span>
                <span>T6</span>
                <span>T7</span>
                <span>CN</span>
            </div>

            <div class="calendar-grid calendar-days" id="calendarDays"></div>

            <div class="calendar-legend">
                <div class="calendar-legend-item">
                    <span class="legend-dot bride-dot"></span>
                    <span>21/10 · Lễ nạp tài nhà gái</span>
                </div>
                <div class="calendar-legend-item">
                    <span class="legend-dot groom-dot"></span>
                    <span>25/10 · Lễ thành hôn nhà trai</span>
                </div>
            </div>
        </div>

        <p class="calendar-footer">
            Hân hạnh được đón tiếp và chung vui cùng gia đình ❤️
        </p>
    `;

  // Đặt lịch sau đồng hồ đếm ngược
  countdownSection.insertAdjacentElement("afterend", calendarSection);

  const calendarDays = calendarSection.querySelector("#calendarDays");

  // Tháng 10/2026 bắt đầu vào thứ Năm.
  // Chuyển về cách đánh số thứ Hai = 0.
  const firstDay = new Date(2026, 9, 1).getDay();
  const offset = (firstDay + 6) % 7;
  const daysInMonth = new Date(2026, 10, 0).getDate();

  for (let i = 0; i < offset; i++) {
    const blank = document.createElement("span");
    blank.className = "calendar-day calendar-empty";
    calendarDays.appendChild(blank);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayElement = document.createElement("span");
    dayElement.className = "calendar-day";
    dayElement.textContent = day;

    if (day === 21) {
      dayElement.classList.add("calendar-bride-day");
      dayElement.title = "21/10/2026 - Lễ nạp tài nhà gái";
      dayElement.setAttribute("aria-label", "Ngày 21, lễ nạp tài nhà gái");
    }

    if (day === 25) {
      dayElement.classList.add("calendar-groom-day");
      dayElement.title = "25/10/2026 - Lễ thành hôn nhà trai";
      dayElement.setAttribute("aria-label", "Ngày 25, lễ thành hôn nhà trai");
    }

    calendarDays.appendChild(dayElement);
  }

  addCalendarStyles();
}

// ==========================================
// 7. GIAO DIỆN LỊCH CƯỚI
// ==========================================
function addCalendarStyles() {
  if (document.getElementById("wedding-calendar-style")) return;

  const style = document.createElement("style");
  style.id = "wedding-calendar-style";

  style.textContent = `
        .wedding-calendar-section {
            padding: 34px 20px;
            background: #fbf6f0;
            color: #6e1618;
            text-align: center;
            font-family: 'Montserrat', sans-serif;
        }

        .calendar-heading {
            margin-bottom: 22px;
        }

        .calendar-eyebrow {
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 4px;
            color: #a67c70;
            margin-bottom: 8px;
        }

        .calendar-heading h2 {
            font-family: 'Great Vibes', cursive;
            font-size: 42px;
            color: #6e1618;
            margin-bottom: 4px;
        }

        .calendar-subtitle {
            font-size: 11px;
            color: #777;
            margin-bottom: 8px;
        }

        .calendar-heart {
            font-size: 17px;
            color: #b88a5b;
        }

        .calendar-card {
            background: #fff;
            border: 1px solid rgba(110, 22, 24, 0.12);
            border-radius: 18px;
            padding: 20px 12px;
            box-shadow: 0 8px 24px rgba(110, 22, 24, 0.07);
        }

        .calendar-month-title {
            display: flex;
            flex-direction: column;
            gap: 3px;
            margin-bottom: 18px;
        }

        .calendar-month-title span {
            font-size: 11px;
            letter-spacing: 4px;
            font-weight: 700;
        }

        .calendar-month-title strong {
            font-size: 24px;
            letter-spacing: 2px;
        }

        .calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, minmax(0, 1fr));
            gap: 5px 2px;
        }

        .calendar-weekdays {
            margin-bottom: 9px;
            color: #a18b82;
            font-size: 10px;
            font-weight: 700;
        }

        .calendar-weekdays span {
            padding: 7px 0;
        }

        .calendar-day {
            aspect-ratio: 1 / 1;
            min-width: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 50%;
            font-size: 12px;
            color: #4e4140;
            position: relative;
        }

        .calendar-empty {
            visibility: hidden;
        }

        .calendar-bride-day {
            background: #f4d9df;
            color: #6e1618;
            font-weight: 800;
            border: 2px solid #d99aa7;
        }

        .calendar-groom-day {
            background: #6e1618;
            color: #fff;
            font-weight: 800;
            border: 2px solid #6e1618;
            box-shadow: 0 3px 8px rgba(110, 22, 24, 0.22);
        }

        .calendar-legend {
            display: flex;
            flex-direction: column;
            gap: 10px;
            text-align: left;
            border-top: 1px dashed #ead9d6;
            padding-top: 16px;
            margin-top: 17px;
        }

        .calendar-legend-item {
            display: flex;
            align-items: center;
            gap: 9px;
            font-size: 10px;
            color: #5e5050;
            line-height: 1.5;
        }

        .legend-dot {
            width: 12px;
            height: 12px;
            flex: 0 0 12px;
            border-radius: 50%;
        }

        .bride-dot {
            background: #f4d9df;
            border: 2px solid #d99aa7;
        }

        .groom-dot {
            background: #6e1618;
        }

        .calendar-footer {
            margin: 18px 4px 0;
            color: #7d6561;
            font-size: 11px;
            line-height: 1.7;
            font-style: italic;
        }

        #mainAlbumPreview {
            transition: opacity 0.2s ease;
        }

        @media (max-width: 360px) {
            .wedding-calendar-section {
                padding-left: 14px;
                padding-right: 14px;
            }

            .calendar-card {
                padding-left: 7px;
                padding-right: 7px;
            }

            .calendar-grid {
                gap: 4px 1px;
            }

            .calendar-day {
                font-size: 11px;
            }
        }
    `;

  document.head.appendChild(style);
}

// ==========================================
// 8. HIỆU ỨNG KHI CUỘN TRANG
// ==========================================
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll(".scroll-animate");

  if (!("IntersectionObserver" in window)) {
    animatedElements.forEach((element) => {
      element.classList.add("animated");
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animated");
          currentObserver.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      rootMargin: "0px 0px -40px 0px",
      threshold: 0.12,
    },
  );

  animatedElements.forEach((element) => observer.observe(element));
}

// ==========================================
// 9. KHỞI CHẠY TẤT CẢ
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  preloadImages();
  startAutoSlide();
  initMusic();
  initScrollAnimations();
  addWeddingCalendar();
});
