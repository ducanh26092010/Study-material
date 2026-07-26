import { db, auth } from "./firebase-config.js";
import {
  doc,
  updateDoc,
  getDoc,
  increment,
  addDoc,
  collection,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { subjects, DOCUMENT_DATA } from "./data.js";

// 1. Hiển thị tài liệu và Filter
export function renderDocuments(keyword, filterSubject = "Tất cả") {
  const container = document.getElementById("document-list");
  if (!container) return;

  container.innerHTML = "";
  const filteredData =
    filterSubject === "Tất cả"
      ? DOCUMENT_DATA
      : DOCUMENT_DATA.filter((doc) => doc.subject === filterSubject);

  const finalData = keyword
    ? filteredData.filter((doc) =>
        doc.title.toLowerCase().includes(keyword.toLowerCase()),
      )
    : filteredData;

  if (finalData.length === 0) {
    showNoResultsMessage();
    return;
  }
  finalData.forEach((item) => {
    const subjectName =
      subjects.find((s) => s.id === item.subject)?.name || item.subject;
    container.innerHTML += `
            <div class="col-md-4 mb-4">
                <div class="card h-100 shadow-sm border-0">
                    <div class="card-body">
                        <span class="badge bg-primary-subtle text-primary mb-2">${subjectName}</span>
                        <h5 class="card-title" style="font-size: 1.1rem; font-weight: 600; height: 80px;">${item.title}</h5>
                        <p class="text-muted small">${item.grade || "Tài liệu THPT"}</p>
                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <span class="text-danger fw-bold">${item.price.toLocaleString()} coin</span>
                            <button onclick="buyDoc('${item.id}', '${item.title}', ${item.price})" 
                                    class="btn btn-sm btn-info text-white rounded-pill px-3">
                                <i class="bi bi-cart"></i> Mua ngay
                            </button>
                        </div> 
                    </div>
                </div>
            </div>
        `;
  });
}

// hien thi rỗng nếu không có kết quả nào
function showNoResultsMessage() {
  const container = document.getElementById("document-list");
  if (container) {
    container.innerHTML = `
      <div class="col w-100">
        <div class="text-center" role="alert">
          Không tìm thấy tài liệu nào phù hợp với tiêu chí của bạn.
        </div>
      </div>
    `;
  }
}

// 2. Hàm mua hàng (Lưu vào Firestore)
window.buyDoc = async function (docId, title, price) {
  const user = auth.currentUser;

  if (!user) {
    alert("Bạn cần đăng nhập!");
    location.href = "./pages/login.html";
    return;
  }

  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    const currentCoin = userSnap.data()?.coin || 0;

    /* =========================
       Không đủ coin
    ========================= */
    if (currentCoin < price) {
      alert("Không đủ coin. Hãy nạp thêm coin!");
      location.href = "./pages/coin.html";
      return;
    }

    /* =========================
       Trừ coin
    ========================= */
    await updateDoc(userRef, {
      coin: increment(-price),
    });

    /* =========================
       Tạo order
    ========================= */
    await addDoc(collection(db, "orders"), {
      document_data_id: docId,
      title: title,
      price: price,
      created_at: serverTimestamp(),
      created_by: user.uid,
      status: "pending",
    });

    alert("Đơn hàng đã tạo! Đang chờ xác nhận.");
  } catch (err) {
    console.error(err);
    alert("Lỗi khi mua");
  }
};

// 3. Lắng nghe sự kiện click vào Menu Filter (Toán, Văn, Anh)
document.addEventListener("DOMContentLoaded", () => {
  renderDocuments(); // Load lần đầu
});
