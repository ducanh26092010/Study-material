// ==============================
// CẤU HÌNH VÀ BIẾN TOÀN CỤC
// ==============================
let chatHistory = [];
let isGenerating = false;


const GEMINI_API_KEY = "AQ.Ab8RN6LdaDi23l5mVijzlgRkKHgPlXHf3ntOz0JDnSJSLFgxeA"; 
const MODEL_NAME = "gemini-flash-latest"; 
const CHAT_WINDOW = document.getElementById("chat-window");
const USER_INPUT = document.getElementById("user-input");
const SEND_BUTTON = document.getElementById("send-button");
const CLEAR_BUTTON = document.getElementById("clear-chat-btn");

initApp();

function initApp() {
  if (!CHAT_WINDOW || !USER_INPUT || !SEND_BUTTON) return;
  SEND_BUTTON.disabled = true; 
  CHAT_WINDOW.innerHTML = ""; 
  displayWelcomeMessage(); 
  setupEventListeners(); 
}

function setupEventListeners() {
  USER_INPUT.addEventListener("input", () => {
    autoResizeTextarea();
    SEND_BUTTON.disabled = USER_INPUT.value.trim() === "";
  });
  USER_INPUT.addEventListener("keydown", handleKey);
  SEND_BUTTON.addEventListener("click", sendMessage);
  if (CLEAR_BUTTON) CLEAR_BUTTON.addEventListener("click", clearChat);
}

function autoResizeTextarea() {
  USER_INPUT.style.height = "auto";
  USER_INPUT.style.height = USER_INPUT.scrollHeight + "px";
}

// ============================
// HÀM GỌI API
// ============================
async function generateGeminiResponse() {
  // Kiểm tra key trước khi gọi
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "DIEN_API_KEY_CUA_BAN_VAO_DAY") {
    throw new Error("Vui lòng cấu hình API Key hợp lệ trong file gemini.js");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;
  const systemPrompt = `Bạn là StudyBot — trợ lý học tập thông minh. Chỉ trả lời những câu hỏi liên quan đến Toán Học, Ngữ Văn, Tiếng Anh, Vật Lý, Hóa Học, Sinh Học, Địa Lý, Lịch Sử.
   Nếu người dùng hỏi những chủ đề khác hãy khéo léo từ chối và nói rằng chỉ hỗ trợ học tập. [Vai trò & Nhiệm vụ]: Bạn là một chuyên gia giáo dục. Hãy giải đáp chi tiết, dễ hiểu bài tập/lý thuyết dưới đây.
[Yêu cầu định dạng & Trình bày]:
1. Cấu trúc: Chia các bước rõ ràng bằng Markdown (Tóm tắt đề bài/Bố cục -> Công thức/Luận điểm -> Trình bày chi tiết/Thế số -> Kết quả/Kết luận). Bôi đậm thuật ngữ quan trọng.
2. Toán & Vật Lý & Hóa Học: 
   - CHỈ DÙNG LaTeX cho công thức, phương trình, phân số, căn thức, tích phân phức tạp. 
   - KHÔNG dùng LaTeX cho số đơn lẻ hay từ ngữ thông thường (VD: ghi thẳng "số 9" hoặc "3", KHÔNG ghi $9$ hay $3$).
   - Dùng LaTeX chuẩn: $...$ cho công thức cùng dòng, $$...$$ cho phương trình/hệ phương trình/tích phân riêng dòng.
   - Vật Lý: Phải ghi rõ đơn vị đo lường ở kết quả.
   - Hóa Học: Phương trình phải cân bằng, có điều kiện (nhiệt độ, xúc tác) và trạng thái (rắn, lỏng, khí, kết tủa/bay hơi).
3. Sinh Học & Địa Lý & Lịch Sử:
   - Sinh Học: In nghiêng danh pháp khoa học (*Homo sapiens*).
   - Lịch Sử: Trình bày diễn biến theo mốc thời gian (Timeline) dạng bullet points bôi đậm năm (**1945**).
   - Địa Lý: Dùng Bảng (Table) khi so sánh số liệu/vùng miền (kèm đơn vị và năm cập nhật).
4. Ngữ Văn & Tiếng Anh:
   - Ngữ Văn: Trích dẫn thơ/văn xuôi đặt trong Blockquote (> ...).
   - Tiếng Anh: Dùng Bảng [Word | IPA | Part of Speech | Meaning | Example] cho từ vựng; bôi đậm lỗi sai/từ cần điền trong bài tập ngữ pháp.
`;

  const cleanHistory = chatHistory.map(item => ({
    role: item.role === "user" ? "user" : "model",
    parts: [{ text: item.parts[0].text }]
  }));

  const payload = {
    contents: cleanHistory,
    systemInstruction: { parts: [{ text: systemPrompt }] }
  };


  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Lỗi API chi tiết:", errorData);
    throw new Error(errorData.error?.message || "Lỗi không xác định");
  }

  const result = await response.json();
  removeLoadingIndicator();

  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

  if (text) {
    chatHistory.push({ role: "model", parts: [{ text }] });
    displayMessage("bot", text);
  } else {
    displayMessage("bot", "Xin lỗi, tôi không thể xử lý yêu cầu này.");
  }
}

async function sendMessage() {
  const text = USER_INPUT.value.trim();
  if (!text || isGenerating) return;
  displayMessage("user", text);
  chatHistory.push({ role: "user", parts: [{ text }] });
  displayMessage("bot", "...");
  isGenerating = true;
  try {
    await generateGeminiResponse();
  } catch (err) {
    removeLoadingIndicator();
    displayMessage("bot", `Lỗi: ${err.message}. Kiểm tra Console (F12) để biết chi tiết.`);
  } finally {
    isGenerating = false;
  }
}

function displayMessage(sender, text) {
  let content = text === "..." ? text : formatMarkdown(text);
  appendMessageElement(sender, content);
  if (sender === "user") { USER_INPUT.value = ""; USER_INPUT.style.height = "auto"; SEND_BUTTON.disabled = true; }
}

function appendMessageElement(sender, content) {
  const div = document.createElement("div");
  div.className = "w-100 d-flex flex-column";
  if (sender === "bot" && content === "...") div.id = "loading-indicator";
  div.innerHTML = `<div class="msg-card rounded-4 p-3 mb-3 ${sender === "user" ? "text-end ms-auto bg-primary text-white" : "text-start me-auto bg-white text-dark shadow-sm"}">${content}</div>`;
  CHAT_WINDOW.appendChild(div);
}

function removeLoadingIndicator() {
  const el = document.getElementById("loading-indicator");
  if (el) el.remove();
}

function formatMarkdown(text) {
  return typeof marked !== 'undefined' ? marked.parse(text) : text;
}
function displayWelcomeMessage() { appendMessageElement("bot", "Xin chào! Mình là StudyBot — trợ lý học tập thông minh và là người bạn đồng hành tin cậy trên con đường chinh phục kiến thức của bạn."); }
function handleKey(e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (!SEND_BUTTON.disabled) sendMessage(); } }
function clearChat() { chatHistory = []; CHAT_WINDOW.innerHTML = ""; displayWelcomeMessage(); }