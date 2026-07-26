import { db, auth } from "../js/firebase-config.js";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
  getDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { coinPackages } from "./data.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

let selectedPackage = coinPackages[1];
let paymentMethod = "qr";

/* =========================
   UI chọn gói
========================= */
function renderCoinPackages() {
  const container = document.getElementById("coin-package-container");
  if (!container) return;

  coinPackages.forEach((pkg) => {
    const col = document.createElement("div");
    col.className = "col-6 col-md-4 col-xl-3";
    col.innerHTML = `
            <div class="recharge-card shadow-sm" onclick="selectGoi(this, '${pkg.price.toLocaleString("vi-VN")}', '${pkg.coins}')">
                <div class="amount">${pkg.price.toLocaleString("vi-VN")} đ</div>
                <div class="coin-value">
                    <i class="bi bi-coin"></i> ${pkg.coins} Coin
                </div>
            </div>
        `;
    container.appendChild(col);
  });
}

renderCoinPackages();

window.selectGoi = function (el, priceText, coinText) {
  document
    .querySelectorAll(".recharge-card")
    .forEach((item) => item.classList.remove("active"));

  el.classList.add("active");

  const coinNumber = parseInt(coinText.replace(".", ""));

  selectedPackage = coinPackages.find((p) => p.coins === coinNumber);

  document.getElementById("summary-coin").innerText =
    selectedPackage.coins + " Coin";

  document.getElementById("total-money").innerText =
    selectedPackage.price.toLocaleString("vi-VN") + " đ";
};

/* =========================
   UI chọn payment
========================= */
window.selectPT = function (el, pt) {
  document
    .querySelectorAll(".payment-card")
    .forEach((item) => item.classList.remove("active"));

  el.classList.add("active");

  paymentMethod = pt;
};

/* =========================
   Start payment
========================= */
window.startNạp = function () {
  if (!selectedPackage) return;

  if (paymentMethod === "card") {
    new bootstrap.Modal(document.getElementById("modalCard")).show();
  } else {
    document.getElementById("modal-price").innerText =
      selectedPackage.price.toLocaleString("vi-VN") + " đ";

    document.getElementById("modal-coin").innerText = selectedPackage.coins;

    new bootstrap.Modal(document.getElementById("modalQR")).show();
  }
};

/* =========================
   Save transaction
========================= */
async function saveTransaction() {
  const user = auth.currentUser;

  if (!user) {
    alert("Bạn cần đăng nhập");
    return;
  }

  try {
    /* Lưu lịch sử */
    await addDoc(collection(db, "coin_transactions"), {
      created_at: serverTimestamp(),
      created_by: user.uid,
      coin_id: selectedPackage.id,
    });

    /* Cộng coin user */
    const userRef = doc(db, "users", user.uid);

    await updateDoc(userRef, {
      coin: increment(selectedPackage.coins),
    });

    alert("Thanh toán thành công 🎉");
  } catch (err) {
    console.error(err);
    alert("Có lỗi xảy ra");
  }
}

/* =========================
   Fake payment (2s)
========================= */
function fakeProcessing(btn, textLoading) {
  btn.disabled = true;
  btn.innerText = textLoading;

  setTimeout(async () => {
    await saveTransaction();
    location.reload();
  }, 2000);
}

/* =========================
   Card payment
========================= */
document.addEventListener("click", function (e) {
  if (e.target.innerText.includes("THANH TOÁN AN TOÀN")) {
    fakeProcessing(e.target, "Đang xử lý...");
  }
});

/* =========================
   QR confirm
========================= */
document.addEventListener("click", function (e) {
  if (e.target.innerText.includes("TÔI ĐÃ CHUYỂN KHOẢN")) {
    fakeProcessing(e.target, "Đang kiểm tra...");
  }
});

// =========================
// Hiển thị số coin hiện tại của user
// =========================
onAuthStateChanged(auth, (user) => {
  if (!user) return;

  const ref = doc(db, "users", user.uid);

  onSnapshot(ref, (snap) => {
    if (!snap.exists()) return;

    document.getElementById("current-coin").innerText =
      snap.data().coin + " Coin";
  });
});
