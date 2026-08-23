import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs 
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

// ==============================
// CẤU HÌNH FIREBASE
// ==============================
const firebaseConfig = {
  apiKey: "AIzaSyDb7gA13iZ_1Tom8zaIWRtfJoYrjSzMfw0",
  authDomain: "jsi40-d42b6.firebaseapp.com",
  projectId: "jsi40-d42b6",
  storageBucket: "jsi40-d42b6.firebasestorage.app",
  messagingSenderId: "1088752303047",
  appId: "1:1088752303047:web:8ca13c16f8038148e4f7e2",
};

// Khởi tạo Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Tạo hoặc lấy Session ID để quản lý lịch sử chat của phiên làm việc hiện tại
let sessionId = localStorage.getItem("chat_session_id");
if (!sessionId) {
  sessionId = "session_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
  localStorage.setItem("chat_session_id", sessionId);
}

// ==============================
// CẤU HÌNH VÀ BIẾN TOÀN CỤC
// ==============================
let chatHistory = [];
let isGenerating = false;

const GEMINI_API_KEY = "AQ.Ab8RN6LHPbDLq_4sBXx8BN1z5dRqy1Y7xDC-F6d2NEdNWqWgSw"; 
const MODEL_NAME = "gemini-3.1-flash-lite"; 
const CHAT_WINDOW = document.getElementById("chat-window");
const USER_INPUT = document.getElementById("user-input");
const SEND_BUTTON = document.getElementById("send-button");
const CLEAR_BUTTON = document.getElementById("clear-chat-btn");

initApp();

async function initApp() {
  if (!CHAT_WINDOW || !USER_INPUT || !SEND_BUTTON) return;
  SEND_BUTTON.disabled = true; 
  CHAT_WINDOW.innerHTML = ""; 
  displayWelcomeMessage(); 
  setupEventListeners(); 
  
  // Tải lịch sử chat từ Firebase khi ứng dụng khởi chạy
  await loadChatHistoryFromFirebase();
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
// HÀM TƯƠNG TÁC FIREBASE
// ============================

async function saveMessageToFirebase(sender, text) {
  try {
    await addDoc(collection(db, "chat_messages"), {
      sessionId: sessionId,
      sender: sender, 
      text: text,
      createdAt: Date.now()
    });
  } catch (error) {
    console.error("Lỗi khi lưu tin nhắn vào Firebase:", error);
  }
}

async function loadChatHistoryFromFirebase() {
  try {
    const q = query(
      collection(db, "chat_messages"),
      where("sessionId", "==", sessionId)
    );

    const querySnapshot = await getDocs(q);
    
    const messages = [];
    querySnapshot.forEach((doc) => {
      messages.push(doc.data());
    });

    messages.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

    chatHistory = [];
    
    messages.forEach((data) => {
      chatHistory.push({
        role: data.sender === "user" ? "user" : "model",
        parts: [{ text: data.text }]
      });
      displayMessageElementOnly(data.sender, data.text);
    });
  } catch (error) {
    console.error("Lỗi khi tải lịch sử từ Firebase:", error);
  }
}

// ============================
// HÀM GỌI API GEMINI
// ============================
async function generateGeminiResponse() {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "DIEN_API_KEY_CUA_BAN_VAO_DAY") {
    throw new Error("Vui lòng cấu hình API Key hợp lệ trong file script");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;
  
  const systemPrompt = `Bạn là StudyBot — trợ lý học tập thông minh. Chỉ trả lời những câu hỏi liên quan đến Toán Học, Ngữ Văn, Tiếng Anh, Vật Lý, Hóa Học, Sinh Học, Địa Lý, Lịch Sử. Nếu người dùng hỏi những chủ đề khác hãy khéo léo từ chối và nói rằng chỉ hỗ trợ học tập.

[Yêu cầu định dạng & Trình bày]:
1. Cấu trúc: Chia các bước rõ ràng bằng Markdown (Tóm tắt đề bài/Bố cục -> Công thức/Luận điểm -> Trình bày chi tiết/Thế số -> Kết quả/Kết luận). Bôi đậm thuật ngữ quan trọng.
2. Toán & Vật Lý & Hóa Học: 
   - CHỈ DÙNG LaTeX cho công thức, phương trình, phân số, căn thức, tích phân phức tạp.
   - KHÔNG dùng LaTeX cho số đơn lẻ hay từ ngữ thông thường (Ví dụ: viết "số 9", KHÔNG viết $9$).
   - Dùng LaTeX chuẩn: $...$ cho công thức cùng dòng, $$...$$ cho phương trình riêng dòng.
   - Vật Lý: Phải ghi rõ đơn vị đo lường ở kết quả.
   - Hóa Học: Phương trình phải cân bằng, có điều kiện và trạng thái.
3. Sinh Học & Địa Lý & Lịch Sử:
   - Sinh Học: In nghiêng danh pháp khoa học (*Homo sapiens*).
   - Lịch Sử: Trình bày diễn biến theo mốc thời gian dạng bullet points bôi đậm năm (**1945**).
   - Địa Lý: Dùng Bảng (Table) khi so sánh số liệu/vùng miền.
4. Ngữ Văn & Tiếng Anh:
   - Ngữ Văn: Trích dẫn thơ/văn xuôi đặt trong Blockquote (> ...).
   - Tiếng Anh: Dùng Bảng [Word | IPA | Part of Speech | Meaning | Example] cho từ vựng.`;

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
    await saveMessageToFirebase("bot", text);
  } else {
    const fallbackText = "Xin lỗi, tôi không thể xử lý yêu cầu này.";
    displayMessage("bot", fallbackText);
    await saveMessageToFirebase("bot", fallbackText);
  }
}

async function sendMessage() {
  const text = USER_INPUT.value.trim();
  if (!text || isGenerating) return;
  
  displayMessage("user", text);
  chatHistory.push({ role: "user", parts: [{ text }] });
  
  saveMessageToFirebase("user", text);

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
  if (sender === "user") { 
    USER_INPUT.value = ""; 
    USER_INPUT.style.height = "auto"; 
    SEND_BUTTON.disabled = true; 
  }
}

function displayMessageElementOnly(sender, text) {
  let content = formatMarkdown(text);
  appendMessageElement(sender, content);
}

function appendMessageElement(sender, content) {
  const div = document.createElement("div");
  div.className = "w-100 d-flex flex-column";
  if (sender === "bot" && content === "...") div.id = "loading-indicator";
  div.innerHTML = `<div class="msg-card rounded-4 p-3 mb-3 ${sender === "user" ? "text-end ms-auto bg-primary text-white" : "text-start me-auto bg-white text-dark shadow-sm"}">${content}</div>`;
  CHAT_WINDOW.appendChild(div);

  // Kích hoạt KaTeX để render công thức toán
  if (window.renderMathInElement && content !== "...") {
    renderMathInElement(div, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false },
        { left: "\\[", right: "\\]", display: true }
      ],
      throwOnError: false
    });
  }

  // Cuộn khung chat xuống cuối
  CHAT_WINDOW.scrollTop = CHAT_WINDOW.scrollHeight;
}

function removeLoadingIndicator() {
  const el = document.getElementById("loading-indicator");
  if (el) el.remove();
}

function formatMarkdown(text) {
  return typeof marked !== 'undefined' ? marked.parse(text) : text;
}

function displayWelcomeMessage() { 
  appendMessageElement("bot", "Xin chào! Mình là StudyBot — trợ lý học tập thông minh và là người bạn đồng hành tin cậy trên con đường chinh phục kiến thức của bạn."); 
}

function handleKey(e) { 
  if (e.key === "Enter" && !e.shiftKey) { 
    e.preventDefault(); 
    if (!SEND_BUTTON.disabled) sendMessage(); 
  } 
}

function clearChat() { 
  chatHistory = []; 
  CHAT_WINDOW.innerHTML = ""; 
  sessionId = "session_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
  localStorage.setItem("chat_session_id", sessionId);
  displayWelcomeMessage(); 
}