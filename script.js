// ===============================
// COUNTDOWN (Cập nhật ngày 25/10/2026 09:30:00)
// ===============================
const weddingDate = new Date("Oct 25, 2026 09:30:00").getTime();

const countdownFunction = setInterval(() => {
  const now = new Date().getTime();
  const distance = weddingDate - now;

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  if (document.getElementById("days")) {
    document.getElementById("days").innerHTML = days < 10 ? "0" + days : days;
    document.getElementById("hours").innerHTML =
      hours < 10 ? "0" + hours : hours;
    document.getElementById("minutes").innerHTML =
      minutes < 10 ? "0" + minutes : minutes;
    document.getElementById("seconds").innerHTML =
      seconds < 10 ? "0" + seconds : seconds;
  }

  if (distance < 0) {
    clearInterval(countdownFunction);
    ["days", "hours", "minutes", "seconds"].forEach((id) => {
      if (document.getElementById(id))
        document.getElementById(id).innerHTML = "00";
    });
  }
}, 1000);

// ===============================
// ALBUM
// ===============================
const albumImages = [
  "images/album1.jpg",
  "images/album2.jpg",
  "images/album3.jpg",
  "images/album4.jpg",
];

let currentAlbumIndex = 0;
let autoSlideInterval;

function updateAlbumUi() {
  const mainPreview = document.getElementById("mainAlbumPreview");

  if (mainPreview) {
    mainPreview.style.opacity = 0;
    setTimeout(() => {
      mainPreview.src = albumImages[currentAlbumIndex];
      mainPreview.style.opacity = 1;
    }, 200);
  }

  const thumbnails = document.querySelectorAll(".thumb-img");
  thumbnails.forEach((thumb, index) => {
    thumb.classList.toggle("active-thumb", index === currentAlbumIndex);
  });
}

function currentSlide(index) {
  currentAlbumIndex = index;
  updateAlbumUi();
  resetAutoSlide();
}

function changeSlide(direction) {
  currentAlbumIndex += direction;
  if (currentAlbumIndex >= albumImages.length) currentAlbumIndex = 0;
  if (currentAlbumIndex < 0) currentAlbumIndex = albumImages.length - 1;
  updateAlbumUi();
  resetAutoSlide();
}

function startAutoSlide() {
  autoSlideInterval = setInterval(() => {
    currentAlbumIndex++;
    if (currentAlbumIndex >= albumImages.length) currentAlbumIndex = 0;
    updateAlbumUi();
  }, 3500);
}

function resetAutoSlide() {
  clearInterval(autoSlideInterval);
  startAutoSlide();
}

// ===============================
// COPY STK
// ===============================
function copySTK() {
  const stk = document.getElementById("stkNum").innerText.trim();
  navigator.clipboard
    .writeText(stk)
    .then(() => {
      alert("Đã sao chép số tài khoản: " + stk);
    })
    .catch(() => {
      const tempInput = document.createElement("input");
      tempInput.value = stk;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);
      alert("Đã sao chép số tài khoản: " + stk);
    });
}

// ===============================
// MUSIC & OPEN INVITE
// ===============================
function initMusic() {
  const audio = document.getElementById("weddingMusic");
  const musicToggle = document.getElementById("musicToggle");

  if (!audio) return;
  audio.volume = 0.6;

  if (musicToggle) {
    musicToggle.addEventListener("click", () => {
      if (audio.paused) {
        audio.play();
        musicToggle.innerHTML = '<i class="fa-solid fa-music"></i>';
      } else {
        audio.pause();
        musicToggle.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
      }
    });
  }

  const openBtn = document.getElementById("openInviteBtn");
  if (openBtn) {
    openBtn.addEventListener("click", () => {
      audio.muted = false;
      audio.play();
      document.getElementById("introLoader").classList.add("hide");
      createHeartShower();
    });
  }
}

// ===============================
// SCROLL ANIMATIONS MANAGER
// ===============================
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll(".scroll-animate");

  if ("IntersectionObserver" in window) {
    const animationObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animated");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -60px 0px",
        threshold: 0.15,
      },
    );

    animatedElements.forEach((element) => animationObserver.observe(element));
  } else {
    animatedElements.forEach((element) => element.classList.add("animated"));
  }
}

// ===============================
// PRELOAD IMAGES
// ===============================
function preloadImages() {
  albumImages.forEach((img) => {
    const image = new Image();
    image.src = img;
  });
}

// ==========================================
// HIỆU ỨNG MƯA TRÁI TIM RƠI CHẬM RÃI
// ==========================================
function createHeartShower() {
  const wrapper = document.querySelector(".mobile-wrapper");
  const targetContainer = wrapper ? wrapper : document.body;

  if (wrapper) wrapper.style.position = "relative";
  if (document.getElementById("wedding-heart-shower")) return;

  const heartContainer = document.createElement("div");
  heartContainer.id = "wedding-heart-shower";

  Object.assign(heartContainer.style, {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    overflow: "hidden",
    pointerEvents: "none",
    zIndex: 9999,
  });

  targetContainer.appendChild(heartContainer);

  const styleSheet = document.createElement("style");
  styleSheet.innerText = `
    @keyframes heartFall {
      0% { transform: translateY(-20px) scale(0); opacity: 0; }
      10% { opacity: 0.8; }
      90% { opacity: 0.5; }
      100% { transform: translateY(102%) scale(1); opacity: 0; }
    }
    @keyframes heartSway {
      0%, 100% { transform: translateX(0); }
      50% { transform: translateX(20px); }
    }
    .falling-heart {
      position: absolute;
      color: #ff4d6d;
      font-family: Arial, sans-serif;
      line-height: 1;
      user-select: none;
      will-change: transform, opacity;
    }
  `;
  document.head.appendChild(styleSheet);

  function spawnHeart() {
    if (document.hidden) return;

    const heart = document.createElement("div");
    heart.className = "falling-heart";
    heart.innerHTML = "❤️";

    const size = Math.random() * 12 + 12;
    const leftPos = Math.random() * 100;
    const fallDuration = Math.random() * 5 + 6;
    const initialOpacity = Math.random() * 0.3 + 0.5;

    Object.assign(heart.style, {
      left: `${leftPos}%`,
      top: `-20px`,
      fontSize: `${size}px`,
      opacity: initialOpacity,
      animation: `heartFall ${fallDuration}s linear forwards, heartSway ${Math.random() * 2 + 2}s ease-in-out infinite`,
    });

    heartContainer.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, fallDuration * 1000);
  }

  setInterval(spawnHeart, 450);
}

// ===============================
// INIT ALL FUNCTIONS
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  preloadImages();
  startAutoSlide();
  initMusic();
  initScrollAnimations();
});

// =====================================================
// ENHANCED MOTION & PHOTO DETAILS
// =====================================================
function addGentlePetals() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (document.getElementById("wedding-petals")) return;
  const layer = document.createElement("div");
  layer.id = "wedding-petals";
  Object.assign(layer.style, {
    position: "fixed",
    inset: "0",
    overflow: "hidden",
    pointerEvents: "none",
    zIndex: "1000",
    contain: "strict",
  });
  document.body.appendChild(layer);
  const style = document.createElement("style");
  style.textContent = `
    @keyframes petalDrift {
      0% { transform: translate3d(0,-12vh,0) rotate(0deg); opacity: 0; }
      12% { opacity: .62; }
      88% { opacity: .48; }
      100% { transform: translate3d(var(--drift),110vh,0) rotate(520deg); opacity: 0; }
    }
    .wedding-petal { position:absolute; top:-20px; color:#c7a66a; font-size:14px; text-shadow:0 1px 4px rgba(255,250,243,.8); animation:petalDrift linear forwards; }
  `;
  document.head.appendChild(style);
  const spawn = () => {
    if (document.hidden || layer.childElementCount > 18) return;
    const petal = document.createElement("span");
    petal.className = "wedding-petal";
    petal.textContent = Math.random() > 0.45 ? "✦" : "❀";
    const duration = 9 + Math.random() * 8;
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.setProperty(
      "--drift",
      `${Math.round(Math.random() * 130 - 65)}px`,
    );
    petal.style.fontSize = `${9 + Math.random() * 9}px`;
    petal.style.animationDuration = `${duration}s`;
    layer.appendChild(petal);
    window.setTimeout(() => petal.remove(), duration * 1000 + 200);
  };
  for (let i = 0; i < 7; i++) window.setTimeout(spawn, i * 500);
  window.setInterval(spawn, 1200);
}

function initPhotoDetails() {
  const mainPhoto = document.getElementById("mainAlbumPreview");
  if (mainPhoto) {
    mainPhoto.setAttribute("tabindex", "0");
    mainPhoto.setAttribute("role", "button");
    mainPhoto.setAttribute("aria-label", "Bấm để phóng to ảnh cưới");
    const openPhoto = () => {
      const existing = document.getElementById("photoLightbox");
      if (existing) existing.remove();
      const overlay = document.createElement("div");
      overlay.id = "photoLightbox";
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-label", "Ảnh cưới phóng to");
      overlay.innerHTML = `<button type="button" class="lightbox-close" aria-label="Đóng ảnh">×</button><img src="${mainPhoto.src}" alt="Ảnh cưới Văn Đạt và Thanh Trúc">`;
      Object.assign(overlay.style, {
        position: "fixed",
        inset: "0",
        zIndex: "10000",
        background: "rgba(28,8,10,.94)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "22px",
        cursor: "zoom-out",
      });
      const image = overlay.querySelector("img");
      Object.assign(image.style, {
        maxWidth: "min(100%, 850px)",
        maxHeight: "86vh",
        objectFit: "contain",
        border: "8px solid #fffaf3",
        outline: "1px solid #c7a66a",
        boxShadow: "0 18px 60px rgba(0,0,0,.4)",
      });
      const close = overlay.querySelector("button");
      Object.assign(close.style, {
        position: "absolute",
        top: "14px",
        right: "18px",
        width: "42px",
        height: "42px",
        borderRadius: "50%",
        border: "1px solid #ead8ad",
        background: "#6e1618",
        color: "#fffaf3",
        fontSize: "30px",
        lineHeight: "1",
        cursor: "pointer",
      });
      close.addEventListener("click", () => overlay.remove());
      overlay.addEventListener("click", (event) => {
        if (event.target === overlay) overlay.remove();
      });
      document.addEventListener("keydown", function escClose(event) {
        if (event.key === "Escape") {
          overlay.remove();
          document.removeEventListener("keydown", escClose);
        }
      });
      document.body.appendChild(overlay);
    };
    mainPhoto.addEventListener("click", openPhoto);
    mainPhoto.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openPhoto();
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initPhotoDetails();
  // Small floating gold petals begin after the invitation is opened.
  const openBtn = document.getElementById("openInviteBtn");
  if (openBtn)
    openBtn.addEventListener(
      "click",
      () => window.setTimeout(addGentlePetals, 350),
      { once: true },
    );
});
