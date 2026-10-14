/* Kết nối biểu mẫu thiệp cưới với Google Sheets qua Apps Script Web App. */
// Dán URL Web App kết thúc bằng /exec vào biến dưới đây sau khi triển khai Apps Script.
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxqp1RYWjGkCurYenZnTCZdMJqh4mTkc9AgXBidqgEwqbU0GEB11pQjSQThyM1Sg2jj/exec";
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
function configured() {
  return (
    GOOGLE_SCRIPT_URL.startsWith("https://script.google.com/macros/s/") &&
    GOOGLE_SCRIPT_URL.endsWith("/exec")
  );
}
function submitToSheets(data, done, failed) {
  // Hidden iframe + HTML form avoids reading cross-origin Apps Script responses.
  const frameName = "sheetsSubmitFrame_" + Date.now();
  const frame = document.createElement("iframe");
  frame.name = frameName;
  frame.title = "Kết quả gửi biểu mẫu";
  frame.style.display = "none";
  const form = document.createElement("form");
  form.method = "POST";
  form.action = GOOGLE_SCRIPT_URL;
  form.target = frameName;
  form.style.display = "none";
  Object.entries(data).forEach(([key, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = String(value ?? "");
    form.appendChild(input);
  });
  const trap = document.createElement("input");
  trap.type = "hidden";
  trap.name = "website";
  trap.value = "";
  form.appendChild(trap);
  let stage = 0; // 0 = wait for initial about:blank load, 1 = wait for Apps Script response
  let finished = false;
  const cleanup = () => {
    frame.remove();
    form.remove();
  };
  const timer = setTimeout(() => {
    if (finished) return;
    finished = true;
    cleanup();
    failed(
      "Chưa xác minh được phản hồi từ Google. Hãy mở Google Sheets kiểm tra dữ liệu trước khi gửi lại.",
    );
  }, 15000);
  frame.onload = () => {
    if (stage === 0) {
      stage = 1;
      form.dataset.submitted = "1";
      form.submit();
      return;
    }
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    cleanup();
    done();
  };
  document.body.append(frame, form);
  // The iframe's first load fires before the form is submitted.
}

function ensureConfig() {
  if (!configured()) {
    showFeedback(
      "rsvpFeedback",
      "Bạn cần dán URL Apps Script vào sheets-public.js trước khi gửi.",
      true,
    );
    showFeedback(
      "wishFeedback",
      "Bạn cần dán URL Apps Script vào sheets-public.js trước khi gửi.",
      true,
    );
    if (publishedWishes)
      publishedWishes.innerHTML =
        '<p class="wishes-loading">Hãy kết nối Google Sheets để tải lời chúc đã duyệt.</p>';
    return false;
  }
  return true;
}

if (rsvpForm)
  rsvpForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!ensureConfig()) return;
    const name = document.getElementById("rsvpName").value.trim();
    const attendance =
      rsvpForm.querySelector('input[name="attendance"]:checked')?.value || "";
    const guestCount = Number(document.getElementById("guestCount").value || 1);
    if (name.length < 2 || !attendance)
      return showFeedback(
        "rsvpFeedback",
        "Vui lòng nhập tên và chọn trạng thái tham dự.",
        true,
      );
    setBusy("rsvpSubmit", true, "ĐANG GỬI...");
    submitToSheets(
      { type: "rsvp", name, attendance, guestCount },
      () => {
        rsvpForm.reset();
        showFeedback(
          "rsvpFeedback",
          "Cảm ơn bạn! Hãy kiểm tra bảng RSVP trong Google Sheets để xác nhận dữ liệu đã được lưu ❤️",
        );
        setBusy("rsvpSubmit", false);
      },
      (msg) => {
        showFeedback("rsvpFeedback", msg, true);
        setBusy("rsvpSubmit", false);
      },
    );
  });

if (wishForm)
  wishForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!ensureConfig()) return;
    const name = document.getElementById("wishName").value.trim();
    const message = document.getElementById("wishMessage").value.trim();
    if (name.length < 2 || message.length < 2)
      return showFeedback(
        "wishFeedback",
        "Vui lòng nhập tên và lời chúc.",
        true,
      );
    setBusy("wishSubmit", true, "ĐANG GỬI...");
    submitToSheets(
      { type: "wish", name, message },
      () => {
        wishForm.reset();
        showFeedback(
          "wishFeedback",
          "Cảm ơn lời chúc! Lời chúc sẽ xuất hiện sau khi được duyệt ❤️",
        );
        setBusy("wishSubmit", false);
      },
      (msg) => {
        showFeedback("wishFeedback", msg, true);
        setBusy("wishSubmit", false);
      },
    );
  });

function loadApprovedWishes() {
  if (!publishedWishes) return;
  if (!configured()) {
    publishedWishes.innerHTML =
      '<p class="wishes-loading">Kết nối Google Sheets để xem lời chúc.</p>';
    return;
  }
  const callback = "weddingWishesCallback";
  window[callback] = (result) => {
    const old = document.getElementById("sheetsWishesJsonp");
    if (old) old.remove();
    if (!result || !result.ok || !Array.isArray(result.wishes)) {
      publishedWishes.innerHTML =
        '<p class="wishes-loading">Chưa tải được lời chúc. Hãy kiểm tra URL Apps Script và quyền truy cập.</p>';
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
      const message = document.createElement("p");
      message.textContent = wish.message || "";
      card.append(heading, message);
      if (wish.date) {
        const time = document.createElement("time");
        time.dateTime = wish.date;
        time.textContent = new Date(wish.date).toLocaleDateString("vi-VN");
        card.appendChild(time);
      }
      publishedWishes.appendChild(card);
    });
  };
  const script = document.createElement("script");
  script.id = "sheetsWishesJsonp";
  script.onerror = () => {
    publishedWishes.innerHTML =
      '<p class="wishes-loading">Không tải được lời chúc. Kiểm tra Apps Script đã triển khai phiên bản mới nhất chưa.</p>';
    script.remove();
  };
  script.src =
    GOOGLE_SCRIPT_URL +
    "?action=wishes&callback=" +
    callback +
    "&t=" +
    Date.now();
  document.body.appendChild(script);
}
loadApprovedWishes();
