// ======================
// 🧭 QUẢN LÝ TRẠNG THÁI ĐĂNG NHẬP TRÊN THANH NAV
// ======================

// Lấy các nút từ giao diện
const loginBtn = document.getElementById("login-btn");     // Nút "Đăng nhập"
const accountBtn = document.getElementById("account-btn"); // Nút hiển thị tên tài khoản

// Hàm kiểm tra và cập nhật giao diện theo trạng thái đăng nhập
function checkLoginStatus() {
  // Lấy thông tin người dùng hiện tại từ localStorage
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (currentUser) {
    // 🟢 ĐÃ đăng nhập
    loginBtn.style.display = "none"; // Ẩn nút "Đăng nhập"
    accountBtn.style.display = "inline-block"; // Hiện nút tài khoản
    accountBtn.textContent = currentUser.name; // Gán tên user làm nội dung nút

    // Khi người dùng click vào nút tài khoản => Đăng xuất
    accountBtn.onclick = function () {
      const confirmLogout = confirm("Bạn có chắc chắn muốn đăng xuất?");
      if (confirmLogout) {
        // Xóa người dùng đang đăng nhập
        localStorage.removeItem("currentUser");

        // Ẩn nút account, hiện lại nút login
        accountBtn.style.display = "none";
        loginBtn.style.display = "inline-block";

        alert("👋 Bạn đã đăng xuất thành công!");
      }
    };
  } else {
    // 🔴 CHƯA đăng nhập
    loginBtn.style.display = "inline-block"; // Hiện nút "Đăng nhập"
    accountBtn.style.display = "none"; // Ẩn nút tài khoản

    // Khi click nút đăng nhập -> chuyển đến trang đăng nhập
    loginBtn.onclick = function () {
      window.location.href = "/pages/login.html"; // 🔁 Thay đường dẫn nếu khác
    };
  }
}

// Gọi hàm khi trang được tải
checkLoginStatus();
