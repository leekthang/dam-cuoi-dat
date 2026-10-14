/* Kết nối biểu mẫu thiệp cưới với Google Sheets qua Apps Script Web App (Fetch API) */
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwOXnQWfsxFLhkzS7gGBkkRP8YprC_DH6LoJI--Df6rrIX2Uv-TkP3-Wbt7Wi2b3PnqSQ/exec";

const rsvpForm = document.getElementById("rsvpForm");
const wishForm = document.getElementById("wishForm");
const publishedWishes = document.getElementById("publishedWishes");

function showFeedback(id, message, error = false) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = message;
    el.style.color = error ? "#a32626" : "#6e1618";
  }
}

function setBusy(id, busy, label) {
  const button = document.getElementById(id);
  if (!button) return;
  if (busy) {
    button.dataset.oldText = button.textContent;
    button.textContent = label;
    button.disabled = true;
  } else {
    button.textContent = button.dataset.oldText || button.textContent;
    button.disabled = false;
  }
}

function submitToSheets(data, successCallback, errorCallback) {
  // Gửi POST trực tiếp bằng fetch lên Apps Script
  const formData = new URLSearchParams();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });

  fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors", // Bắt buộc đối với Google Apps Script Web App để tránh lỗi CORS
    body: formData,
  })
    .then(() => {
      // Vì dùng mode 'no-cors', ta không đọc được body trả về nhưng request đã gửi thành công
      successCallback();
    })
    .catch((err) => {
      errorCallback(err.message || "Lỗi kết nối đến Google Sheets.");
    });
}

// 1. Xử lý form RSVP
if (rsvpForm) {
  rsvpForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("rsvpName").value.trim();
    const attendance =
      rsvpForm.querySelector('input[name="attendance"]:checked')?.value || "";
    const guestCount = Number(document.getElementById("guestCount").value || 1);

    if (name.length < 2 || !attendance) {
      return showFeedback(
        "rsvpFeedback",
        "Vui lòng nhập tên và chọn trạng thái tham dự.",
        true,
      );
    }

    setBusy("rsvpSubmit", true, "ĐANG GỬI...");
    submitToSheets(
      { type: "rsvp", name, attendance, guestCount },
      () => {
        rsvpForm.reset();
        showFeedback(
          "rsvpFeedback",
          "Cảm ơn bạn! Xác nhận tham dự đã được lưu vào Google Sheets ❤️",
        );
        setBusy("rsvpSubmit", false);
      },
      (msg) => {
        showFeedback("rsvpFeedback", msg, true);
        setBusy("rsvpSubmit", false);
      },
    );
  });
}

// 2. Xử lý form Gửi lời chúc
if (wishForm) {
  wishForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("wishName").value.trim();
    const message = document.getElementById("wishMessage").value.trim();

    if (name.length < 2 || message.length < 2) {
      return showFeedback(
        "wishFeedback",
        "Vui lòng nhập tên và lời chúc hợp lệ.",
        true,
      );
    }

    setBusy("wishSubmit", true, "ĐANG GỬI...");
    submitToSheets(
      { type: "wish", name, message },
      () => {
        wishForm.reset();
        showFeedback(
          "wishFeedback",
          "Cảm ơn lời chúc của bạn! Lời chúc đã được ghi nhận ❤️",
        );
        setBusy("wishSubmit", false);
      },
      (msg) => {
        showFeedback("wishFeedback", msg, true);
        setBusy("wishSubmit", false);
      },
    );
  });
}

// 3. Tải danh sách lời chúc đã duyệt
function loadApprovedWishes() {
  if (!publishedWishes) return;

  fetch(GOOGLE_SCRIPT_URL + "?action=wishes")
    .then((res) => res.json())
    .then((result) => {
      if (!result || !result.ok || !Array.isArray(result.wishes)) {
        publishedWishes.innerHTML =
          '<p class="wishes-loading">Chưa tải được lời chúc.</p>';
        return;
      }
      publishedWishes.replaceChildren();
      if (!result.wishes.length) {
        const p = document.createElement("p");
        p.className = "wishes-loading";
        p.textContent = "Hãy là người đầu tiên gửi lời chúc ❤️";
        publishedWishes.appendChild(p);
        return;
      }
      result.wishes.forEach((wish) => {
        const card = document.createElement("article");
        card.className = "wish-card";
        const heading = document.createElement("h4");
        heading.textContent = wish.name || "Một người bạn";
        const textP = document.createElement("p");
        textP.textContent = wish.message || "";
        card.append(heading, textP);
        publishedWishes.appendChild(card);
      });
    })
    .catch(() => {
      publishedWishes.innerHTML =
        '<p class="wishes-loading">Không tải được lời chúc.</p>';
    });
}

loadApprovedWishes();
