        document.getElementById('login-form').addEventListener('submit', function(event) {
            event.preventDefault(); // Ngăn form gửi đi theo cách truyền thống

            const email = document.getElementById('signinEmail').value;
            const password = document.getElementById('signinPassword').value;
            

            // Mô phỏng kiểm tra đăng nhập
            if (email === "test@example.com" && password === "password123") {
                messageContainer.textContent = 'Đăng nhập thành công! Đang chuyển hướng...';
                messageContainer.classList.add('text-green-600');
                
                
                // Chuyển hướng sau 2 giây
                setTimeout(() => {
                    // window.location.href = '/dashboard'; // Thay đổi thành trang của bạn
                    console.log('Chuyển hướng đến trang chính...');
                }, 2000);

            } else {
                messageContainer.textContent = 'Email hoặc mật khẩu không chính xác.';
                messageContainer.classList.add('text-red-600');
            }
        });