// gemini.js (Đã Sửa - CHÚ Ý: Đặt API Key trực tiếp không an toàn!)

// 1. Gán API Key trực tiếp.
const apiKey = 'AIzaSyBWK60NqsjB8CqZYLZcemcnFn5YItDyNo4'; 

async function main(promptText) { // Thêm promptText để có thể tái sử dụng
  const payload = {
    contents: [
      {
        parts: [
          { text: promptText || 'Explain how AI works in a few words' },
        ],
      },
    ],
  };

  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
  
  const options = {
    method: 'POST',
    // 2. Sử dụng fetch chuẩn. fetch không cần contentType nếu payload là JSON.stringify
    headers: {
      'Content-Type': 'application/json',
      // API Key được gửi qua header
      'x-goog-api-key': apiKey, 
    },
    body: JSON.stringify(payload) // fetch dùng body thay vì payload
  };

  try {
    // 3. Sử dụng await để chờ phản hồi từ API
    const response = await fetch(url, options); 

    // Lấy dữ liệu JSON từ response
    const data = await response.json(); 

    // Kiểm tra và xử lý phản hồi
    if (data && data.candidates && data.candidates.length > 0) {
        const content = data.candidates[0].content.parts[0].text;
        console.log("Phản hồi Gemini:", content);
        return content;
    } else {
        console.error("Lỗi phản hồi API:", data);
        return "Lỗi: Không nhận được nội dung từ Gemini.";
    }

  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    return "Lỗi kết nối API.";
  }
}

// Ví dụ gọi hàm:
// main("Viết một câu chuyện ngắn về một chú mèo máy.").then(result => console.log(result));