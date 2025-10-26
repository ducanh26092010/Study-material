// ======================
// 🧠 QUẢN LÝ NGƯỜI DÙNG TRONG localStorage (key = email)
// ======================

// Hàm lấy thông tin người dùng theo email
function getUserByEmail(email) {
  const data = localStorage.getItem(email);
  return data ? JSON.parse(data) : null;
}

// Hàm lưu người dùng (key là email)
function saveUser(user) {
  localStorage.setItem(user.email, JSON.stringify(user));
}

// Hàm kiểm tra xem email đã tồn tại chưa
function userExists(email) {
  return localStorage.getItem(email) !== null;
}

// Hàm kiểm tra xem username đã tồn tại chưa
function usernameExists(username) {
  // Duyệt toàn bộ localStorage để tìm user có name trùng
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    // Bỏ qua "currentUser" vì đó không phải tài khoản thật
    if (key === "currentUser") continue;

    const user = JSON.parse(localStorage.getItem(key));
    if (user.name.toLowerCase() === username.toLowerCase()) {
      return true; // Có username trùng
    }
  }
  return false;
}

// ======================
// 🟡 XỬ LÝ ĐĂNG KÝ TÀI KHOẢN
// ======================

document.querySelector("#signup-pane form").addEventListener("submit", function (e) {
  e.preventDefault();

  // --- Lấy dữ liệu từ form ---
  const username = document.getElementById("registerUsername").value.trim();
  const email = document.getElementById("registerEmail").value.trim().toLowerCase();
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

  // --- Kiểm tra trùng email ---
  if (userExists(email)) {
    alert("⚠️ Email này đã được đăng ký. Vui lòng chọn email khác!");
    return;
  }

  // --- Kiểm tra trùng tên đăng nhập ---
  if (usernameExists(username)) {
    alert("⚠️ Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác!");
    return;
  }

  // --- Tạo user mới ---
  const newUser = {
    name: username,
    email: email,
    password: password,
    purchaseHistory: [],
  };

  // --- Lưu vào localStorage (key = email) ---
  saveUser(newUser);

  alert("🎉 Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.");

  // Reset form & chuyển sang tab Đăng nhập
  e.target.reset();
  const tabTrigger = new bootstrap.Tab(document.querySelector("#signin-tab"));
  tabTrigger.show();
});

// ======================
// 🔵 XỬ LÝ ĐĂNG NHẬP
// ======================

document.querySelector("#signin-pane form").addEventListener("submit", function (e) {
  e.preventDefault();

  const loginInput = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;

  // --- Lấy người dùng bằng email ---
  const user = getUserByEmail(loginInput);

  if (!user) {
    alert("❌ Email không tồn tại. Vui lòng kiểm tra lại!");
    return;
  }

  // --- Kiểm tra mật khẩu ---
  if (user.password !== password) {
    alert("❌ Mật khẩu không đúng!");
    return;
  }

  // --- Lưu người dùng đang đăng nhập ---
  localStorage.setItem("currentUser", JSON.stringify(user));

  alert(`✅ Xin chào ${user.name}! Đăng nhập thành công 🎉`);

  // 👉 Có thể chuyển hướng sang trang chính nếu cần:
  window.location.href = "../index.html";
});

// ======================
// 🛒 HÀM THÊM LỊCH SỬ MUA TÀI LIỆU
// ======================

function addPurchase(docId, status = "Đã mua") {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!currentUser) {
    alert("⚠️ Vui lòng đăng nhập trước khi mua tài liệu!");
    return;
  }

  // --- Lấy lại dữ liệu người dùng bằng email ---
  const user = getUserByEmail(currentUser.email);

  // --- Thêm lịch sử mua mới ---
  user.purchaseHistory.push({ id: docId, status });

  // --- Cập nhật lại localStorage ---
  saveUser(user);
  localStorage.setItem("currentUser", JSON.stringify(user)); // Cập nhật user đang đăng nhập

  alert(`🧾 Đã thêm tài liệu ${docId} vào lịch sử mua.`);
}
