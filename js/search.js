import { renderDocuments } from "./index.js";

// Hàm lấy keyword từ URL
function getKeywordFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("keyword") || "";
}

// lay subject tu url
function getSubjectFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("subject") || "Tất cả";
}

// Khi trang được tải, hiển thị tài liệu dựa trên subject và keyword
document.addEventListener("DOMContentLoaded", () => {
  const subject = getSubjectFromURL();
  const keyword = getKeywordFromURL();
  renderDocuments(keyword, subject);
});
