// =======================================================
// KHỞI TẠO DỮ LIỆU BAN ĐẦU VÀ HÀM HELPER
// =======================================================

/** Lấy dữ liệu từ Local Storage */
const getLS = (key) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
};
/** Lưu dữ liệu vào Local Storage */
const setLS = (key, data) => localStorage.setItem(key, JSON.stringify(data));
/** Tạo ID ngẫu nhiên đơn giản */
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

// Khởi tạo các mảng dữ liệu nếu chưa có
const initializeData = () => {
    if (!localStorage.getItem('users')) setLS('users', [
        { id: 'admin', username: 'Admin', email: 'admin@moon.vn', password: '123', isPublic: true, balance: 1000000 },
        { id: 'guest', username: 'Guest', email: 'guest@moon.vn', password: '123', isPublic: true, balance: 50000 }
    ]);
    if (!localStorage.getItem('documents')) setLS('documents', [
        { id: 'doc1', title: 'Tài liệu Mẫu Toán', authorId: 'admin', price: 50000, content: 'Nội dung toán học chi tiết.', comments: [], reactions: {} },
        { id: 'doc2', title: 'Tài liệu Mẫu Lý', authorId: 'guest', price: 0, content: 'Nội dung vật lý miễn phí.', comments: [], reactions: {} }
    ]);
};

// =======================================================
// CHỨC NĂNG 1: ĐĂNG KÝ, ĐĂNG NHẬP, ĐĂNG XUẤT
// =======================================================

const Auth = {
    /** Đăng ký người dùng mới */
    register(username, password, email) {
        const users = getLS('users');
        if (users.find(u => u.email === email)) {
            return alert('Email đã tồn tại!');
        }
        const newUser = { 
            id: generateId(), 
            username, 
            email, 
            password, 
            isPublic: true,
            balance: 100000, // Số dư ban đầu
        };
        users.push(newUser);
        setLS('users', users);
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        window.location.href = 'auth.html'; // Chuyển về trang đăng nhập
    },

    /** Đăng nhập và lưu currentUser */
    login(email, password) {
        const users = getLS('users');
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            setLS('currentUser', user); 
            alert(`Chào mừng, ${user.username}! Đăng nhập thành công.`);
            updateUI(user); 
            window.location.href = 'index.html';
        } else {
            alert('Email hoặc mật khẩu không đúng!');
        }
    },

    /** Đăng xuất và remove currentUser */
    logout() {
        localStorage.removeItem('currentUser');
        alert('Đã đăng xuất.');
        updateUI(null);
        window.location.href = 'index.html';
    },

    /** Lấy thông tin người dùng đang đăng nhập */
    getCurrentUser() {
        return getLS('currentUser');
    }
};

// =======================================================
// CHỨC NĂNG 2: QUẢN LÝ TÀI KHOẢN (EDIT & VISIBILITY)
// =======================================================

const Profile = {
    /** Chỉnh sửa thông tin người dùng */
    edit(newUsername, newPassword) {
        let user = Auth.getCurrentUser();
        if (!user) return alert('Vui lòng đăng nhập.');

        const users = getLS('users');
        const userIndex = users.findIndex(u => u.id === user.id);
        
        users[userIndex].username = newUsername || user.username;
        if (newPassword) users[userIndex].password = newPassword;

        setLS('users', users);
        setLS('currentUser', users[userIndex]);
        alert('Cập nhật thông tin thành công!');
        updateProfileDisplay(users[userIndex]);
        updateUI(users[userIndex]);
    },

    /** Thay đổi chế độ Public/Private */
    toggleVisibility() {
        let user = Auth.getCurrentUser();
        if (!user) return alert('Vui lòng đăng nhập.');
        
        const users = getLS('users');
        const userIndex = users.findIndex(u => u.id === user.id);
        
        users[userIndex].isPublic = !users[userIndex].isPublic;
        
        setLS('users', users);
        setLS('currentUser', users[userIndex]);
        alert(`Chế độ hiển thị: ${users[userIndex].isPublic ? 'Công khai' : 'Riêng tư'}`);
        updateProfileDisplay(users[userIndex]);
    },

    /** Hiển thị thông tin người dùng (kiểm tra Public/Private) */
    display(targetUserId) {
        const users = getLS('users');
        const user = users.find(u => u.id === targetUserId);
        
        if (!user) return 'Người dùng không tồn tại.';
        
        if (!user.isPublic) {
            return Auth.getCurrentUser() && Auth.getCurrentUser().id === targetUserId 
                ? `Tài khoản ${user.username} (Email: ${user.email} | Số dư: ${user.balance} VNĐ) - Đang là RIÊNG TƯ`
                : 'Thông tin tài khoản này đang được đặt ở chế độ Riêng tư.';
        }
        
        return `Tên: ${user.username}, Email: ${user.email}, Số dư: ${user.balance} VNĐ`;
    }
};

// =======================================================
// CHỨC NĂNG 3: QUẢN LÝ TÀI LIỆU (CRUD + API MÔ PHỎNG)
// =======================================================

const Document = {
    /** Mô phỏng API Fetch danh sách tài liệu */
    fetchListSimulated() {
        return new Promise(resolve => {
            setTimeout(() => {
                const documents = getLS('documents');
                // Trả về dữ liệu công khai (giả lập)
                const publicDocs = documents.map(doc => ({ 
                    id: doc.id, 
                    title: doc.title, 
                    authorId: doc.authorId,
                    price: doc.price,
                    totalComments: doc.comments.length,
                    totalReactions: Object.values(doc.reactions).reduce((sum, count) => sum + count, 0)
                }));
                resolve(publicDocs);
            }, 500); 
        });
    },

    /** Mô phỏng API Fetch thông tin chi tiết 1 tài liệu */
    fetchSingleSimulated(docId) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const documents = getLS('documents');
                const doc = documents.find(d => d.id === docId);
                if (doc) {
                    resolve(doc);
                } else {
                    reject({ message: 'Tài liệu không tìm thấy!' });
                }
            }, 300); 
        });
    },

    /** Thêm tài liệu mới */
    add(title, content, price) {
        const user = Auth.getCurrentUser();
        if (!user) return alert('Vui lòng đăng nhập để thêm tài liệu.');
        
        const newDoc = {
            id: generateId(),
            title,
            content,
            price: Number(price),
            authorId: user.id,
            comments: [],
            reactions: {}, 
            buyers: [],
        };
        const documents = getLS('documents');
        documents.push(newDoc);
        setLS('documents', documents);
        alert('Thêm tài liệu thành công!');
    },

    /** Xóa tài liệu (chỉ tác giả mới xóa được) */
    delete(docId) {
        const user = Auth.getCurrentUser();
        if (!user) return alert('Vui lòng đăng nhập.');

        let documents = getLS('documents');
        const docIndex = documents.findIndex(d => d.id === docId && d.authorId === user.id);

        if (docIndex === -1) return alert('Bạn không có quyền hoặc tài liệu không tồn tại.');

        documents.splice(docIndex, 1);
        setLS('documents', documents);
        alert('Xóa tài liệu thành công!');
        // Cần render lại danh sách
    }
};

// =======================================================
// CHỨC NĂNG 4: BÌNH LUẬN VÀ REACTION
// =======================================================

const Interaction = {
    /** Thêm bình luận vào tài liệu */
    addComment(docId, commentText) {
        const user = Auth.getCurrentUser();
        if (!user) return alert('Vui lòng đăng nhập để bình luận.');
        if (!commentText) return;
        
        const documents = getLS('documents');
        const docIndex = documents.findIndex(d => d.id === docId);
        
        if (docIndex === -1) return alert('Tài liệu không tồn tại.');

        documents[docIndex].comments.push({
            id: generateId(),
            userId: user.id,
            username: user.username,
            text: commentText,
            timestamp: new Date().toISOString()
        });
        setLS('documents', documents);
        alert(`Đã thêm bình luận: "${commentText}"`);
    },
    
    /** Thêm Reaction vào tài liệu */
    addReaction(docId, reactionType = '❤️') {
        const user = Auth.getCurrentUser();
        if (!user) return alert('Vui lòng đăng nhập để bày tỏ cảm xúc.');

        const documents = getLS('documents');
        const docIndex = documents.findIndex(d => d.id === docId);

        if (docIndex === -1) return alert('Tài liệu không tồn tại.');
        
        if (!documents[docIndex].reactions[reactionType]) {
            documents[docIndex].reactions[reactionType] = 1;
        } else {
            documents[docIndex].reactions[reactionType]++;
        }
        
        setLS('documents', documents);
        alert(`Đã thêm reaction ${reactionType} cho tài liệu!`);
    }
};

// =======================================================
// CHỨC NĂNG 5: MUA BÁN & DỊCH NGÔN NGỮ (MÔ PHỎNG)
// =======================================================

const Transaction = {
    /** Mua tài liệu (Mô phỏng trừ tiền trong Local Storage) */
    buyDocumentSimulated(docId) {
        let user = Auth.getCurrentUser();
        if (!user) return alert('Vui lòng đăng nhập để mua tài liệu.');
        
        const documents = getLS('documents');
        const doc = documents.find(d => d.id === docId);
        
        if (!doc) return alert('Tài liệu không tồn tại.');
        if (doc.price === 0) return alert('Tài liệu này miễn phí!');
        if (doc.buyers && doc.buyers.includes(user.id)) return alert('Bạn đã mua tài liệu này rồi.');
        if (user.balance < doc.price) return alert(`Số dư không đủ. Cần ${doc.price} VNĐ.`);
        
        // Bắt đầu giao dịch (Frontend mô phỏng)
        user.balance -= doc.price; // Trừ tiền người mua
        doc.buyers.push(user.id);  // Thêm vào danh sách người mua
        
        // Cập nhật Local Storage cho users và documents
        const users = getLS('users');
        const userIndex = users.findIndex(u => u.id === user.id);
        
        users[userIndex] = user;
        setLS('users', users);
        setLS('currentUser', user);
        setLS('documents', documents);
        
        alert(`Mua thành công tài liệu "${doc.title}"! Số dư còn lại: ${user.balance.toLocaleString('vi-VN')} VNĐ`);
    }
};

const Utility = {
    /** Mô phỏng API Chuyển ngôn ngữ (Dịch Anh-Việt) */
    translateSimulated(text) {
        return new Promise(resolve => {
            setTimeout(() => {
                let translatedText = text;
                translatedText = translatedText.replace(/hello/gi, 'Chào');
                translatedText = translatedText.replace(/document/gi, 'tài liệu');
                translatedText = translatedText.replace(/book/gi, 'sách');
                translatedText = translatedText.replace(/teacher/gi, 'giáo viên');
                resolve(`[Dịch mô phỏng] ${translatedText}`);
            }, 700);
        });
    }
};

// Hàm gọi dịch thuật và hiển thị kết quả
const translateAndDisplay = async () => {
    const input = document.getElementById('translate-input').value;
    const output = document.getElementById('translation-output');
    if (!input) return;
    output.innerText = 'Đang dịch...';
    try {
        const result = await Utility.translateSimulated(input);
        output.innerText = result;
    } catch (e) {
        output.innerText = 'Lỗi dịch thuật mô phỏng.';
    }
};

// =======================================================
// INITIALIZATION VÀ CÁC HÀM CẬP NHẬT GIAO DIỆN
// =======================================================

/** Cập nhật nút Đăng nhập/Đăng ký trên Header */
const updateUI = (user) => {
    const authContainer = document.getElementById('auth-buttons');
    if (!authContainer) return;
    
    if (user) {
        authContainer.innerHTML = `
            <a href="account.html" class="btn btn-outline-light me-2">Tài khoản (${user.username})</a>
            <button class="btn btn-warning" onclick="Auth.logout()">Đăng xuất</button>
        `;
    } else {
        authContainer.innerHTML = `
            <a href="auth.html" class="btn btn-outline-light me-2 d-none d-sm-inline-block">Đăng nhập</a>
            <a href="auth.html" class="btn btn-warning">Đăng ký</a>
        `;
    }
};

/** Cập nhật thông tin Public/Private trên trang Account */
const updateProfileDisplay = (user) => {
    // Chỉ hoạt động trên trang account.html
    const profileDisplay = document.getElementById('public-profile-display');
    const visibilityStatus = document.getElementById('profile-visibility');
    if (profileDisplay && user) {
        profileDisplay.innerHTML = Profile.display(user.id);
        visibilityStatus.innerText = user.isPublic ? 'Công khai' : 'Riêng tư';
    }
};


document.addEventListener('DOMContentLoaded', () => {
    initializeData();
    const currentUser = Auth.getCurrentUser();
    updateUI(currentUser);
    
    // Nếu ở trang account.html, gọi hàm cập nhật profile
    if (window.location.pathname.includes('account.html') && currentUser) {
        updateProfileDisplay(currentUser);
    }
    
    // Ví dụ về việc gọi API mô phỏng khi trang tải
    Document.fetchListSimulated().then(data => {
        console.log('Danh sách tài liệu đã fetch (mô phỏng API):', data);
        // Ở đây bạn sẽ viết code để render data lên DOM
    });
});