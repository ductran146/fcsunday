# FC Sunday V2

Ứng dụng PWA HTML/CSS/Vanilla JS theo design system Carbon Đỏ.

## Chạy local
Mở bằng VS Code Live Server hoặc bất kỳ static server nào.

## Deploy GitHub Pages
Upload toàn bộ thư mục lên repo, bật Pages. PWA cần chạy qua HTTPS để service worker hoạt động đầy đủ.

## Ghi chú
- Dữ liệu demo lưu trong `localStorage` key `fc-sunday-v2`.
- File `app.js` đã tách hàm lưu/đọc để có thể nối Firebase Realtime Database/Auth theo đặc tả.
- Pull-to-refresh trên mobile/PWA đang reload app và đọc lại dữ liệu local; khi nối Firebase, thay phần reload bằng fetch Firebase.
