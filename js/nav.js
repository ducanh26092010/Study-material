import { auth } from "./firebase-config.js";
import { subjects } from "./data.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

// ------------------------------------
// lấy các nút bấm cần thêm chức năng
const loginBtn = document.getElementById("login-link");
const accountBtn = document.getElementById("account-link");
const homeBtn = document.getElementById("home-link");
const subjectListContainer = document.getElementById("subject-list-container");
const chatLink = document.getElementById("chat-link");
const coinLink = document.getElementById("coin-link");
const logoutBtn = document.getElementById("logout-link");
const signedInGroup = document.getElementById("signed-in-group");

const links = [
  { element: homeBtn, url: "./index.html" },
  { element: chatLink, url: "./pages/chat.html" },
  { element: coinLink, url: "./pages/coin.html" },
  { element: accountBtn, url: "./pages/history.html" },
  { element: loginBtn, url: "./pages/login.html" },
  { element: logoutBtn, url: "./index.html" },
];

let preURL = "";
// neu dang o trang con thi them "." vao truoc url
if (window.location.href.includes("/pages/")) {
  preURL = ".";
}
// ------------------------------------
// tạo danh sách môn học
function createSubjectList() {
  subjects.forEach((subject) => {
    const li = document.createElement("li");
    li.className = "nav-item mb-1";
    const a = document.createElement("a");
    a.className = "nav-link";
    a.href = preURL + `./pages/search.html?subject=${subject.id}`;
    a.innerText = subject.name;
    li.appendChild(a);
    subjectListContainer?.appendChild(li);
  });
}

// ------------------------------------
// thêm sự kiện click cho các nút

document.addEventListener("DOMContentLoaded", async () => {
  // thêm danh sách các môn học
  createSubjectList();
  // kiểm tra trạng thái đăng nhập của người dùng
  await auth.onAuthStateChanged((user) => {
    if (user) {
      loginBtn.classList.add("d-none");
      logoutBtn.classList.remove("d-none");
      logoutBtn.innerText = user.email;
      logoutBtn.onclick = () => {
        if (confirm("Đăng xuất?")) signOut(auth);
      };
      // hien phan signed-in-group
      signedInGroup?.classList.remove("d-none");
    } else {
      loginBtn.classList.remove("d-none");
      logoutBtn.classList.add("d-none");
      // an phan signed-in-group
      signedInGroup?.classList.add("d-none");
    }
  });

  // thêm sự kiện click cho các nút

  links.forEach(({ element, url }) => {
    if (element) {
      element.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = preURL + url;
      });
    }
  });

  // search form
  const searchForm = document.querySelector("#search-form");

  // Kiểm tra nếu không có ô search trên trang thì thoát
  if (!searchForm) return;

  searchForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Ngăn chặn submit form
    const keyword = e.target.querySelector("input").value.toLowerCase().trim();
    if (!keyword) {
      alert("Vui lòng nhập từ khóa để tìm kiếm!");
      return;
    }

    // chuyen toi trang search voi query param la keyword
    window.location.href = `./search.html?keyword=${encodeURIComponent(keyword)}`;
  });
});
