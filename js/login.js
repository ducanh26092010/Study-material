import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged, // Để theo dõi trạng thái đăng nhập
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  setDoc,
  doc,
  updateDoc,
  arrayUnion,
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
// ======================
// 🛠 CÁC HÀM HỖ TRỢ (HELPER FUNCTIONS)
// ======================

// Hàm kiểm tra xem username đã tồn tại trong Firestore chưa
async function checkUsernameExists(username) {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("name", "==", username)); // Giả sử field tên là 'name'
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

// ======================
// 🟡 XỬ LÝ ĐĂNG KÝ TÀI KHOẢN
// ======================

document
  .querySelector("#signup-pane form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    // --- Lấy dữ liệu từ form ---
    const username = document.getElementById("registerUsername").value.trim();
    const email = document
      .getElementById("registerEmail")
      .value.trim()
      .toLowerCase();
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // --- Kiểm tra hợp lệ ---
    if (!username || !email || !password) {
      alert("⚠️ Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    if (password.length < 6) {
      alert("⚠️ Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }
    if (password !== confirmPassword) {
      alert("⚠️ Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      // 1. Kiểm tra trùng tên đăng nhập (Query Firestore)
      const isUsernameTaken = await checkUsernameExists(username);
      if (isUsernameTaken) {
        alert("⚠️ Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác!");
        return;
      }

      // 2. Tạo tài khoản Authentication (Firebase sẽ tự check trùng email)
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 3. Lưu thông tin bổ sung vào Firestore (Không lưu password!)
      // Dùng UID làm ID của document để dễ truy xuất
      await setDoc(doc(db, "users", user.uid), {
        name: username,
        email: email,
        purchaseHistory: [],
        createdAt: new Date(),
      });

      alert("🎉 Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.");

      // Reset form & chuyển sang tab Đăng nhập
      e.target.reset();
      // Logic chuyển tab Bootstrap (giữ nguyên)
      const tabTrigger = new bootstrap.Tab(
        document.querySelector("#signin-tab")
      );
      tabTrigger.show();
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      if (error.code === "auth/email-already-in-use") {
        alert("⚠️ Email này đã được đăng ký. Vui lòng dùng email khác!");
      } else {
        alert("❌ Đã có lỗi xảy ra: " + error.message);
      }
    }
  });

// ======================
// 🔵 XỬ LÝ ĐĂNG NHẬP
// ======================

document
  .querySelector("#signin-pane form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document
      .getElementById("loginEmail")
      .value.trim()
      .toLowerCase();
    const password = document.getElementById("loginPassword").value;

    try {
      // 1. Đăng nhập qua Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 2. Lấy thông tin chi tiết từ Firestore (để lấy username)
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();

        // Tùy chọn: Lưu thông tin cơ bản vào localStorage nếu cần truy cập nhanh ở trang khác
        // (Nhưng tốt nhất nên dùng onAuthStateChanged ở trang đích)
        localStorage.setItem("currentUser", JSON.stringify(userData));

        alert(`✅ Xin chào ${userData.name}! Đăng nhập thành công 🎉`);

        // Chuyển hướng
        window.location.href = "../index.html";
      } else {
        alert(
          "⚠️ Đăng nhập thành công nhưng không tìm thấy dữ liệu người dùng!"
        );
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        alert("❌ Email hoặc mật khẩu không đúng!");
      } else {
        alert("❌ Lỗi đăng nhập: " + error.message);
      }
    }
  });

// ======================
// 🛒 HÀM THÊM LỊCH SỬ MUA TÀI LIỆU
// ======================

async function addPurchase(docId, status = "Đã mua") {
  // Lấy user hiện tại từ Firebase Auth (đáng tin cậy hơn localStorage)
  const currentUser = auth.currentUser;

  if (!currentUser) {
    alert("⚠️ Vui lòng đăng nhập trước khi mua tài liệu!");
    // Có thể redirect về trang login
    return;
  }

  try {
    const userRef = doc(db, "users", currentUser.uid);

    // Sử dụng arrayUnion để thêm vào mảng mà không bị ghi đè dữ liệu cũ
    await updateDoc(userRef, {
      purchaseHistory: arrayUnion({
        id: docId,
        status: status,
        purchasedAt: new Date(),
      }),
    });

    alert(`🧾 Đã thêm tài liệu ${docId} vào lịch sử mua.`);

    // Nếu bạn đang dùng localStorage để hiển thị UI, hãy cập nhật lại nó (tùy chọn)
    // Lưu ý: Cách tốt nhất là listen snapshot từ Firestore realtime.
  } catch (error) {
    console.error("Lỗi mua hàng:", error);
    alert("❌ Không thể lưu lịch sử mua: " + error.message);
  }
}

// (Tùy chọn) Theo dõi trạng thái đăng nhập toàn cục
// Giúp giữ trạng thái đăng nhập khi F5 trang
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("User đang đăng nhập:", user.email);
    // Có thể update UI ở đây (ví dụ: đổi nút Đăng nhập thành Avatar)
  } else {
    console.log("Chưa có user đăng nhập");
  }
});
