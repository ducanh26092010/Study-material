import { db, auth } from "./firebase-config.js";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
  getDoc,
  increment,
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

const WAIT_TIMES = 2 * 60 * 1000;

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    alert("Vui lòng đăng nhập");
    location.href = "./login.html";
    return;
  }

  loadOrders(user.uid);
});

async function loadOrders(uid) {
  const q = query(collection(db, "orders"), where("created_by", "==", uid));

  const snap = await getDocs(q);

  const container = document.getElementById("history-list");

  container.innerHTML = "";

  snap.forEach(async (docSnap) => {
    const data = docSnap.data();
    const id = docSnap.id;

    const createdAt = data.created_at?.toDate?.() || new Date();

    let status = data.status;

    /* =====================
       Auto complete sau 10p
    ===================== */
    if (status === "pending") {
      const diff = Date.now() - createdAt.getTime();

      if (diff > WAIT_TIMES) {
        await updateDoc(doc(db, "orders", id), {
          status: "completed",
        });
        status = "completed";
      }
    }

    renderOrder(container, id, data, status, createdAt);
  });
}

function renderOrder(container, id, data, status, date) {
  let badge = "";
  let button = "";

  if (status === "completed") {
    badge = `<span class="badge bg-success py-2 px-3 rounded-pill fw-normal">Đã hoàn thành</span>`;

    button = `<button class="btn btn-sm btn-outline-secondary rounded-pill w-100" disabled>
        Hoàn tất
      </button>`;
  }

  if (status === "pending") {
    badge = `<span class="badge bg-warning text-dark py-2 px-3 rounded-pill fw-normal">Chờ xác nhận</span>`;

    button = `<button onclick="cancelOrder('${id}')" 
       class="btn btn-sm btn-outline-danger rounded-pill w-100">
        Hủy đơn
      </button>`;
  }

  if (status === "cancelled") {
    badge = `<span class="badge bg-danger py-2 px-3 rounded-pill fw-normal">Đã hủy</span>`;

    button = `<button class="btn btn-sm btn-outline-secondary rounded-pill w-100" disabled>
        Đã hủy
      </button>`;
  }

  container.innerHTML += `
  <div class="col">
    <div class="card h-100 shadow-sm">
      <div class="card-body">

        <div class="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h5 class="card-title text-primary fw-bold mb-1">
              ${data.title}
            </h5>
            <p class="card-text text-muted small">
              Mã giao dịch: ${id}
            </p>
          </div>
          ${badge}
        </div>

        <p class="mb-1">
          <i class="bi bi-calendar-check me-2 text-secondary"></i>
          Ngày mua: ${date.toLocaleString()}
        </p>

        <p class="mb-3">
          <i class="bi bi-tag-fill me-2 text-secondary"></i>
          Giá: <strong>${data.price} coin</strong>
        </p>

        ${button}

      </div>
    </div>
  </div>
  `;
}

window.cancelOrder = async function (orderId) {
  if (!confirm("Bạn muốn hủy đơn?")) return;

  const user = auth.currentUser;
  if (!user) return;

  try {
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      alert("Không tìm thấy đơn hàng");
      return;
    }

    const orderData = orderSnap.data();

    // Chỉ hoàn tiền nếu đang pending
    if (orderData.status !== "pending") {
      alert("Đơn này không thể hủy");
      return;
    }

    const priceCoin = Number(orderData.price) || 0;

    /* 1️⃣ Cập nhật trạng thái */
    await updateDoc(orderRef, {
      status: "cancelled",
    });

    /* 2️⃣ Hoàn coin cho user */
    const userRef = doc(db, "users", user.uid);

    await updateDoc(userRef, {
      coin: increment(priceCoin),
    });

    alert(`Đã hoàn ${priceCoin} coin 🎉`);

    location.reload();
  } catch (err) {
    console.error(err);
    alert("Có lỗi xảy ra khi hủy đơn");
  }
};
