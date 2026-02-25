const DOCUMENT_DATA = [
  // --- Toán học (Math) - 4 Documents ---
  {
    id: "MATH001",
    title: "Chuyên đề Hàm số và Đồ thị (Lớp 12)",
    subject: "math",
    grade: "Lớp 12",
    price: 249,
    description:
      "Tài liệu ôn thi Đại học tập trung vào chương Hàm số, bao gồm lý thuyết chi tiết và bài tập nâng cao.",
    previewLink: "/doc/math/chuyende_hamso.pdf",
    status: "Mới",
  },
  {
    id: "MATH002",
    title: "Tuyển tập 500 Bài tập Hình học Phẳng",
    subject: "math",
    grade: "Lớp 9",
    price: 129,
    description:
      "Hệ thống bài tập từ cơ bản đến nâng cao về Đường tròn, Tam giác đồng dạng và các định lý liên quan.",
    previewLink: "/doc/math/hinhhoc_phang.pdf",
    status: "Phổ biến",
  },
  {
    id: "MATH003",
    title: "Khóa học: Phương trình và Bất phương trình Mũ/Logarit",
    subject: "math",
    grade: "Lớp 12",
    price: 399,
    description:
      "Tập trung giải quyết các dạng toán Logarit khó, có video hướng dẫn chi tiết từng dạng.",
    previewLink: "/doc/math/mu_logarit.pdf",
    status: "Bán chạy",
  },
  {
    id: "MATH004",
    title: "Cẩm nang Giải tích Cơ bản cho Lớp 10",
    subject: "math",
    grade: "Lớp 10",
    price: 99,
    description:
      "Tóm tắt lý thuyết, công thức và bài tập mẫu về Bất đẳng thức Cauchy và Hệ phương trình.",
    previewLink: "/doc/math/giaitich_co_ban.pdf",
    status: "Mới",
  },

  // --- Tiếng Anh (English) - 3 Documents ---
  {
    id: "ENG005",
    title: "Ngữ pháp Chuyên sâu B2 (Dùng cho TOEIC & IELTS)",
    subject: "english",
    grade: "Cấp 3/Đại học",
    price: 199,
    description:
      "Tài liệu ôn luyện ngữ pháp nâng cao, tập trung vào các cấu trúc phức tạp thường gặp trong kỳ thi quốc tế.",
    previewLink: "/doc/english/nguphap_b2.pdf",
    status: "Phổ biến",
  },
  {
    id: "ENG006",
    title: "Bộ đề thi thử THPT Quốc gia (Có đáp án chi tiết)",
    subject: "english",
    grade: "Lớp 12",
    price: 299,
    description:
      "Gồm 10 đề thi thử mới nhất theo format chuẩn của Bộ Giáo dục và Đào tạo.",
    previewLink: "/doc/english/bo_de_thpt.pdf",
    status: "Bán chạy",
  },
  {
    id: "ENG007",
    title: "Từ vựng Căn bản và Luyện phát âm (Lớp 9)",
    subject: "english",
    grade: "Lớp 9",
    price: 79,
    description:
      "Giúp học sinh xây dựng nền tảng từ vựng vững chắc cho cấp học tiếp theo.",
    previewLink: "/doc/english/tuvung_l9.pdf",
    status: "Mới",
  },

  // --- Ngữ Văn (Literature) - 3 Documents ---
  {
    id: "LIT008",
    title: "Phân tích Truyện ngắn Nguyễn Tuân (Người lái đò Sông Đà)",
    subject: "literature",
    grade: "Lớp 12",
    price: 149,
    description:
      "Cung cấp dàn ý, bài văn mẫu, và các góc nhìn sâu sắc về tác phẩm.",
    previewLink: "/doc/van/nguyen_tuan.pdf",
    status: "Phổ biến",
  },
  {
    id: "LIT009",
    title: "Tổng hợp 100 Đề Nghị luận xã hội",
    subject: "literature",
    grade: "Cấp 3",
    price: 189,
    description:
      "Các chủ đề thời sự, đạo đức, và triết lý, kèm theo gợi ý triển khai ý.",
    previewLink: "/doc/van/nghiluan_xh.pdf",
    status: "Bán chạy",
  },
  {
    id: "LIT010",
    title: "Sơ đồ tư duy tác phẩm Văn học Lớp 10",
    subject: "literature",
    grade: "Lớp 10",
    price: 109,
    description:
      "Tóm tắt các tác phẩm chính bằng sơ đồ giúp dễ dàng ghi nhớ và hệ thống kiến thức.",
    previewLink: "/doc/van/sododu_l10.pdf",
    status: "Mới",
  },
];

const subjects = [
  { name: "Toán học", id: "math" },
  { name: "Vật lý", id: "physics" },
  { name: "Hóa học", id: "chemistry" },
  { name: "Sinh học", id: "biology" },
  { name: "Ngữ văn", id: "literature" },
  { name: "Lịch sử", id: "history" },
  { name: "Địa lý", id: "geography" },
  { name: "Tiếng Anh", id: "english" },
];

const coinPackages = [
  { id: 10, coins: 10, price: 10000 },
  { id: 50, coins: 50, price: 50000 },
  { id: 100, coins: 100, price: 100000 },
  { id: 500, coins: 500, price: 400000 },
];
// --------------------------------
export { DOCUMENT_DATA, subjects, coinPackages };
