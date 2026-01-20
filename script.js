// Khởi tạo các element
const ballContainer = document.getElementById('ballContainer');
const resultDiv = document.getElementById('result');
const randomBtn = document.getElementById('randomBtn');
const historyList = document.getElementById('historyList');

let history = [];
let balls = [];

// Load config vào UI
document.querySelector('h1').textContent = CONFIG.ui.title;
document.querySelector('.random-btn').textContent = CONFIG.ui.buttonText;
resultDiv.textContent = CONFIG.ui.placeholder;

// Hàm tính kích thước bóng dựa trên số lượng
function calculateBallSize() {
    const count = CONFIG.values.length;
    if (count <= 10) return 70;
    if (count <= 20) return 60;
    if (count <= 40) return 50;
    if (count <= 60) return 40;
    if (count <= 80) return 35;
    return 30; // Cho 100+ giá trị
}

// Hàm tính font size dựa trên kích thước bóng
function calculateFontSize(ballSize) {
    if (ballSize >= 60) return 13;
    if (ballSize >= 50) return 11;
    if (ballSize >= 40) return 9;
    if (ballSize >= 35) return 8;
    return 7;
}

// Hàm tạo các quả bóng
function createBalls() {
    ballContainer.innerHTML = '';
    balls = [];
    
    const ballSize = calculateBallSize();
    const fontSize = calculateFontSize(ballSize);
    const containerWidth = ballContainer.offsetWidth;
    const containerHeight = ballContainer.offsetHeight;
    
    // Tạo lưới để phân bố bóng đều hơn
    const cols = Math.ceil(Math.sqrt(CONFIG.values.length * (containerWidth / containerHeight)));
    const rows = Math.ceil(CONFIG.values.length / cols);
    const cellWidth = containerWidth / cols;
    const cellHeight = containerHeight / rows;
    
    CONFIG.values.forEach((value, index) => {
        const ball = document.createElement('div');
        ball.className = 'ball';
        ball.textContent = value;
        ball.style.width = ballSize + 'px';
        ball.style.height = ballSize + 'px';
        ball.style.fontSize = fontSize + 'px';
        
        // Set màu nền cho bóng
        const color = CONFIG.ballColors[index % CONFIG.ballColors.length];
        ball.style.background = `
            radial-gradient(circle at 30% 30%, 
                rgba(255,255,255,0.4), 
                ${color} 40%, 
                ${color} 100%
            )
        `;
        
        // Phân bố theo lưới với random nhẹ để tự nhiên
        const col = index % cols;
        const row = Math.floor(index / cols);
        const baseX = col * cellWidth + (cellWidth - ballSize) / 2;
        const baseY = row * cellHeight + (cellHeight - ballSize) / 2;
        
        // Thêm random nhẹ trong cell
        const randomOffsetX = (Math.random() - 0.5) * (cellWidth * 0.3);
        const randomOffsetY = (Math.random() - 0.5) * (cellHeight * 0.3);
        
        const x = Math.max(0, Math.min(baseX + randomOffsetX, containerWidth - ballSize));
        const y = Math.max(0, Math.min(baseY + randomOffsetY, containerHeight - ballSize));
        
        ball.style.left = x + 'px';
        ball.style.top = y + 'px';
        ball.style.zIndex = index + 1;
        
        ballContainer.appendChild(ball);
        balls.push({ element: ball, value: value, size: ballSize });
    });
}

// Hàm lắc tất cả các bóng - tối ưu cho nhiều bóng
function shakeBalls() {
    const containerWidth = ballContainer.offsetWidth;
    const containerHeight = ballContainer.offsetHeight;
    const ballSize = balls[0].size;
    const valueCount = CONFIG.values.length;
    
    // Giảm số frame cho hiệu suất tốt hơn khi có nhiều bóng
    const frameCount = valueCount > 50 ? 6 : 10;
    
    balls.forEach((ball, index) => {
        // Tạo animation chuyển động
        const animationName = `shake-${index}-${Date.now()}`;
        
        // Tạo các điểm chuyển động
        const points = [];
        for (let i = 0; i <= frameCount; i++) {
            const randomX = Math.random() * (containerWidth - ballSize);
            const randomY = Math.random() * (containerHeight - ballSize);
            const randomRotate = (Math.random() - 0.5) * 180; // Giảm góc xoay
            const randomScale = valueCount > 50 ? 1 : (0.95 + Math.random() * 0.1); // Giảm scale khi nhiều bóng
            
            points.push({
                percent: i * (100 / frameCount),
                x: randomX,
                y: randomY,
                rotate: randomRotate,
                scale: randomScale
            });
        }
        
        const keyframes = `
            @keyframes ${animationName} {
                ${points.map(p => `
                    ${p.percent}% {
                        left: ${p.x}px;
                        top: ${p.y}px;
                        transform: rotate(${p.rotate}deg) scale(${p.scale});
                    }
                `).join('')}
            }
        `;
        
        // Thêm keyframes
        const styleSheet = document.styleSheets[0];
        styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
        
        // Apply animation với timing function mượt hơn
        const delay = Math.random() * 0.2;
        ball.element.style.animation = `${animationName} ${CONFIG.timing.shakeDuration / 1000}s cubic-bezier(0.45, 0.05, 0.55, 0.95) ${delay}s`;
        ball.element.style.zIndex = Math.floor(Math.random() * balls.length);
    });
}

// Hàm dừng lắc và reset z-index
function stopShaking() {
    balls.forEach((ball, index) => {
        ball.element.style.animation = 'none';
        ball.element.style.zIndex = index + 1;
    });
}

// Hàm lấy thời gian hiện tại
function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
}

// Hàm thêm vào lịch sử
function addToHistory(value) {
    const time = getCurrentTime();
    history.unshift({ value, time });
    
    // Giới hạn lịch sử 10 mục
    if (history.length > 10) {
        history.pop();
    }
    
    updateHistoryDisplay();
}

// Hàm cập nhật hiển thị lịch sử
function updateHistoryDisplay() {
    historyList.innerHTML = '';
    
    history.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="value">${item.value}</span>
            <span class="time">${item.time}</span>
        `;
        historyList.appendChild(li);
    });
}

// Hàm chính: Random và làm bóng rơi
function randomAndFall() {
    randomBtn.disabled = true;
    resultDiv.textContent = CONFIG.ui.shakingText;
    
    // Bắt đầu lắc bóng
    shakeBalls();
    
    setTimeout(() => {
        // Dừng lắc
        stopShaking();
        
        // Chọn ngẫu nhiên 1 bóng
        const randomIndex = Math.floor(Math.random() * balls.length);
        const selectedBall = balls[randomIndex];
        
        // Làm bóng được chọn rơi xuống
        selectedBall.element.classList.add('falling');
        
        setTimeout(() => {
            // Hiển thị kết quả
            resultDiv.textContent = selectedBall.value;
            addToHistory(selectedBall.value);
            
            // Reset lại các bóng sau khi hoàn thành
            setTimeout(() => {
                createBalls();
                randomBtn.disabled = false;
            }, CONFIG.timing.resetDelay);
            
        }, CONFIG.timing.fallDuration);
        
    }, CONFIG.timing.shakeDuration);
}

// Xử lý sự kiện click nút Random
randomBtn.addEventListener('click', randomAndFall);

// Khởi tạo ban đầu
createBalls();
updateHistoryDisplay();