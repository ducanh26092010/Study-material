// ==============================
// CÁC BIẾN TOÀN CỤC VÀ HẰNG SỐ
// ==============================
let chatHistory = []; // Lưu lịch sử hội thoại (user và bot)
let isGenerating = false; // Cờ kiểm tra xem bot đang trả lời hay không

// Các phần tử giao diện
const CHAT_WINDOW = document.getElementById("chat-window");
const USER_INPUT = document.getElementById("user-input");
const SEND_BUTTON = document.getElementById("send-button");

// Thông tin mô hình và API
const API_MODEL = "gemini-2.5-flash-preview-09-2025"; // Mô hình Gemini được sử dụng
const API_KEY = "AIzaSyCfLo_FgfDfZI7XflpKbPEw0bfOzIbLRP8";

// =====================================================
// HÀM HỖ TRỢ: GỬI YÊU CẦU FETCH CÓ CƠ CHẾ THỬ LẠI (RETRY)
// =====================================================
const fetchWithRetry = async (url, options, maxRetries = 3) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // Nếu phản hồi thành công và không bị lỗi quá tải (429)
      if (response.ok && response.status !== 429) return response;

      // Nếu bị giới hạn tốc độ (429), thử lại sau một thời gian
      if (response.status === 429 && attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        console.warn(
          `Bị giới hạn tạm thời (429). Thử lại sau ${delay / 1000} giây...`
        );
        await new Promise((res) => setTimeout(res, delay));
        continue;
      }

      throw new Error(`Lỗi API: ${response.status}`);
    } catch (err) {
      if (attempt === maxRetries - 1) throw err; // Nếu đã thử hết thì báo lỗi
      const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
      console.warn(`Lỗi kết nối. Thử lại sau ${delay / 1000} giây...`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
};

// ============================
// KHỞI TẠO ỨNG DỤNG
// ============================
window.onload = () => {
  SEND_BUTTON.disabled = false; // Cho phép nhấn nút gửi
  displayWelcomeMessage(); // Hiển thị tin nhắn chào
  setupEventListeners(); // Gắn các sự kiện cho textarea và nút
};

// ============================
// HIỂN THỊ TIN NHẮN CHÀO ĐẦU
// ============================
function displayWelcomeMessage() {
  const msg = `
      <p class="fw-bold mb-1 text-primary">StudyBot</p>
      Xin chào! Tôi là <b>StudyBot</b> — trợ lý học tập AI của bạn.  
      Hãy hỏi tôi về <b>Toán, Văn, Anh, Khoa học</b> hoặc bất kỳ chủ đề học tập nào!
      <p class="mt-2 small text-muted">
        Ví dụ: "Giải phương trình bậc hai" hoặc "Tóm tắt truyện Chiếc thuyền ngoài xa".
      </p>
    `;
  displayMessage("bot", msg);
}

// ============================
// GẮN SỰ KIỆN CHO GIAO DIỆN
// ============================
function setupEventListeners() {
  USER_INPUT.addEventListener("input", autoResizeTextarea); // Tự động giãn chiều cao ô nhập
  USER_INPUT.addEventListener("keydown", handleKey); // Bấm Enter để gửi
  SEND_BUTTON.addEventListener("click", sendMessage); // Bấm nút gửi
}

// Tự động thay đổi chiều cao của ô nhập khi người dùng gõ
function autoResizeTextarea() {
  USER_INPUT.style.height = "auto";
  USER_INPUT.style.height = USER_INPUT.scrollHeight + "px";
}

// ============================
// HIỂN THỊ TIN NHẮN TRONG CỬA SỔ CHAT
// ============================
function displayMessage(sender, text, sources = null) {
  const messageClass = sender === "user" ? "user-message" : "bot-message";
  const senderName = sender === "user" ? "Bạn" : "StudyBot";
  const align = sender === "user" ? "align-items-end" : "align-items-start";

  // Nội dung chính của tin nhắn
  let html = `<p class="mb-0">${text}</p>`;

  // Nếu có danh sách nguồn (khi bot trích dẫn)
  if (sender === "bot" && sources?.length) {
    const sourceLinks = sources
      .map(
        (src, i) =>
          `<a href="${src.uri}" target="_blank" title="${src.title}">${
            i + 1
          }. ${src.title}</a>`
      )
      .join("");
    html += `<div class="sources"><small class="text-muted">Nguồn:</small>${sourceLinks}</div>`;
  }

  // Tạo phần tử chứa tin nhắn
  const msgDiv = document.createElement("div");
  msgDiv.className = `d-flex flex-column ${align}`;
  msgDiv.innerHTML = `
      <div class="message-bubble ${messageClass}">
        <p class="fw-bold mb-1 ${
          sender === "bot" ? "text-primary" : ""
        }">${senderName}</p>
        ${html}
      </div>
    `;

  CHAT_WINDOW.appendChild(msgDiv);
  CHAT_WINDOW.scrollTop = CHAT_WINDOW.scrollHeight; // Cuộn xuống cuối
}

// ============================
// HIỂN THỊ TRẠNG THÁI "ĐANG GÕ..."
// ============================
function displayLoading(id) {
  const loadingDiv = document.createElement("div");
  loadingDiv.id = id;
  loadingDiv.className = "d-flex flex-column align-items-start";
  loadingDiv.innerHTML = `
      <div class="message-bubble bot-message shadow-sm">
        <p class="fw-bold mb-1 text-primary">StudyBot</p>
        <div class="loading-dots"><div></div><div></div><div></div></div>
      </div>
    `;
  CHAT_WINDOW.appendChild(loadingDiv);
  CHAT_WINDOW.scrollTop = CHAT_WINDOW.scrollHeight;
}

// Xóa phần hiển thị "đang gõ..."
function removeLoading(id) {
  const el = document.getElementById(id);
  if (el) CHAT_WINDOW.removeChild(el);
}

// ============================
// XỬ LÝ SỰ KIỆN BẤM ENTER
// ============================
function handleKey(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage(event);
  }
}

// ============================
// LÀM MỚI CỬA SỔ CHAT
// ============================
window.clearChat = function () {
  chatHistory = [];
  CHAT_WINDOW.innerHTML = "";
  displayWelcomeMessage();
  USER_INPUT.value = "";
  autoResizeTextarea();
  console.log("Đã làm mới cuộc trò chuyện!");
};

// ============================
// GỬI TIN NHẮN NGƯỜI DÙNG
// ============================
async function sendMessage(event) {
  event.preventDefault();
  if (isGenerating || USER_INPUT.value.trim() === "") return;

  const query = USER_INPUT.value.trim();
  USER_INPUT.value = "";
  autoResizeTextarea();

  isGenerating = true;
  SEND_BUTTON.disabled = true;

  // 1. Hiển thị tin nhắn người dùng
  displayMessage("user", query);

  // 2. Lưu vào lịch sử hội thoại
  chatHistory.push({ role: "user", parts: [{ text: query }] });

  // 3. Hiển thị trạng thái "đang gõ..."
  const loadingId = `loading-${Date.now()}`;
  displayLoading(loadingId);

  // 4. Gọi API Gemini để sinh phản hồi
  try {
    await generateGeminiResponse();
  } catch (err) {
    console.error("Lỗi khi gọi Gemini API:", err);
    displayMessage("bot", "Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại sau.");
  } finally {
    removeLoading(loadingId);
    isGenerating = false;
    SEND_BUTTON.disabled = false;
  }
}

// ============================
// GỌI API GEMINI ĐỂ SINH CÂU TRẢ LỜI
// ============================
async function generateGeminiResponse() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${API_MODEL}:generateContent?key=${API_KEY}`;

  // Lời hướng dẫn hệ thống (giống như "prompt ẩn" giúp bot định hướng phong cách trả lời)
  const systemPrompt = `
      Bạn là StudyBot — trợ lý học tập thông minh và thân thiện. 
      Hãy giúp học sinh hiểu rõ hơn các môn Toán, Ngữ Văn, Tiếng Anh và Khoa học.
      Giải thích ngắn gọn, dễ hiểu, có thể sử dụng ký hiệu LaTeX cho công thức ($x^2 + y^2 = r^2$).
      Nếu cần, hãy trích dẫn nguồn thông tin rõ ràng.
    `;

  // Tạo nội dung yêu cầu gửi đến API
  const payload = {
    contents: chatHistory,
    systemInstruction: { parts: [{ text: systemPrompt }] },
    tools: [{ google_search: {} }], // Cho phép dùng công cụ tìm kiếm khi cần
  };

  // Gửi yêu cầu đến API Gemini
  const response = await fetchWithRetry(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  const candidate = result.candidates?.[0];

  // Nếu API có trả lời hợp lệ
  if (candidate?.content?.parts?.[0]?.text) {
    const text = candidate.content.parts[0].text;

    // Lấy thông tin nguồn (nếu có)
    const sources =
      candidate.groundingMetadata?.groundingAttributions
        ?.map((a) => ({
          uri: a.web?.uri,
          title: a.web?.title,
        }))
        .filter((s) => s.uri && s.title) || [];

    // Lưu câu trả lời vào lịch sử
    chatHistory.push({ role: "model", parts: [{ text }] });

    // Hiển thị lên giao diện
    displayMessage("bot", text, sources);
  } else {
    console.error("Phản hồi từ API rỗng:", result);
    displayMessage("bot", "Xin lỗi, tôi chưa có câu trả lời cho câu hỏi này.");
  }
}

// =======================================
// Xóa chat
// =======================================
function clearChat() {
  location.reload();
}
