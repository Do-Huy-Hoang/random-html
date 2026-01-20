# Random Value Picker

Một trang web đơn giản để random giá trị từ danh sách được cấu hình sẵn.

## 🚀 Deploy lên GitHub Pages

### Bước 1: Tạo repository trên GitHub
1. Đăng nhập vào GitHub
2. Tạo repository mới (ví dụ: `random-picker`)
3. Chọn **Public**

### Bước 2: Upload files
Upload các file sau vào repository:
- `index.html`
- `style.css`
- `script.js`
- `config.js`
- `icon.png` (file icon của bạn)
- `README.md`

### Bước 3: Bật GitHub Pages
1. Vào **Settings** của repository
2. Chọn **Pages** ở menu bên trái
3. Trong phần **Source**, chọn **main** branch
4. Click **Save**
5. Đợi vài phút, trang web sẽ được deploy tại: `https://[username].github.io/[repo-name]`

## 📁 Cấu trúc thư mục

```
random-picker/
│
├── index.html          # File HTML chính
├── style.css           # File CSS styling
├── script.js           # File JavaScript logic
├── config.js           # File cấu hình (CHỈNH SỬA TẠI ĐÂY)
├── icon.png            # Icon hiển thị (THAY ĐỔI FILE NÀY)
└── README.md           # Hướng dẫn
```

## ⚙️ Cách chỉnh sửa

### 1. Thay đổi danh sách giá trị random
Mở file `config.js` và chỉnh sửa mảng `values`:

```javascript
values: [
    "Giá trị 1",
    "Giá trị 2", 
    "Giá trị 3",
    // Thêm hoặc bớt giá trị tại đây
]
```

### 2. Thay đổi icon
- Chuẩn bị file icon (PNG, JPG, hoặc SVG)
- Đặt tên file là `icon.png`
- Thay thế file `icon.png` cũ trong repository
- Hoặc đổi tên file icon trong `index.html` (dòng `<img src="icon.png">`)

### 3. Thay đổi màu nền
Mở file `style.css` và tìm dòng:

```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

Thay đổi mã màu `#667eea` và `#764ba2` theo ý muốn.

Hoặc chỉnh trong `config.js`:

```javascript
colors: {
    primary: "#667eea",    // Màu chính
    secondary: "#764ba2"   // Màu phụ
}
```

### 4. Thay đổi text và emoji
Mở file `config.js`:

```javascript
ui: {
    title: "Tên trang của bạn",
    buttonText: "Tên nút",
    buttonEmoji: "🎲",
    placeholder: "Text hiển thị ban đầu"
}
```

## 🎨 Customization nâng cao

### Thay đổi font chữ
Trong `style.css`, thay đổi:
```css
font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
```

### Thay đổi kích thước icon
Trong `style.css`, tìm `.icon` và chỉnh:
```css
.icon {
    width: 80px;    /* Thay đổi số này */
    height: 80px;   /* Thay đổi số này */
}
```

## 📱 Responsive
Trang web tự động responsive trên mobile, tablet và desktop.

## 🛠️ Công nghệ sử dụng
- HTML5
- CSS3 (với Gradient & Animation)
- Vanilla JavaScript (không cần thư viện)

## 📄 License
Free to use - Sử dụng tự do cho mục đích cá nhân và thương mại.

## 💡 Tips
- Để thay đổi nhanh, chỉ cần chỉnh file `config.js`
- Icon nên là hình vuông (1:1) để hiển thị đẹp
- File icon khuyến nghị kích thước 256x256px hoặc 512x512px
- Có thể thêm favicon bằng cách thêm vào `<head>`: `<link rel="icon" href="icon.png">`