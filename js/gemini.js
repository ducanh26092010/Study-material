// ==============================
// CẤU HÌNH VÀ BIẾN TOÀN CỤC
// ==============================
let chatHistory = [];
let isGenerating = false;

// ⚠️ LƯU Ý: Hãy chắc chắn API Key này đã được cấp quyền truy cập Gemini API
const GEMINI_API_KEY = "AQ.Ab8RN6L1-RZBZmtL52FKbPzSKBDTEMB3eR-B1u8AZmJajoQp5w"; 

// Thử lại với gemini-1.5-flash (Đây là model chuẩn nhất hiện nay)
const MODEL_NAME = "gemini-2.5-flash"; 

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
// HÀM GỌI API (ĐÃ THÊM DEBUG LOG)
// ============================
async function generateGeminiResponse() {
  // URL chuẩn
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;
  
  // DEBUG: Kiểm tra URL trong console
  console.log("Đang gửi request tới URL:", url);

  const systemPrompt = "Bạn là StudyBot — trợ lý học tập thông minh. Trả lời chi tiết, trình bày đẹp mắt bằng Markdown.";

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

  // Nếu vẫn lỗi, in ra toàn bộ response để debug
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

// [Các hàm helper khác giữ nguyên như cũ...]
// Lưu ý: Đảm bảo bạn đã thêm các hàm displayMessage, removeLoadingIndicator, ... ở dưới đây nhé.
// (Tôi rút gọn phần này để bạn tập trung vào hàm generateGeminiResponse)

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
function displayWelcomeMessage() { appendMessageElement("bot", "Xin chào! Tôi là StudyBot."); }
function handleKey(e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (!SEND_BUTTON.disabled) sendMessage(); } }
function clearChat() { chatHistory = []; CHAT_WINDOW.innerHTML = ""; displayWelcomeMessage(); }