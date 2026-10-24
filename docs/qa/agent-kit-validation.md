# Kiểm tra bộ agent và skill

Ngày thực hiện: 24/10/2026.

## Kiểm tra file

- Năm skill đã qua `quick_validate.py` của skill-creator, chạy bằng Python ở chế độ UTF-8.
- Năm cấu hình custom agent đã được phân tích bằng `tomllib`: có đủ `name`, `description`, `developer_instructions`; tên duy nhất và khớp tên file.
- Đã kiểm tra đường dẫn từ agent đến skill và các tài liệu chung tại vị trí cài đặt thực tế.
- Mỗi file cài đặt được đối chiếu hash với bản đã kiểm tra trước khi dọn bản tạm.

## Thử hành vi độc lập

Một subagent thông thường đọc các skill và tài liệu nguồn để xử lý bốn yêu cầu giả lập, không sửa file, truy cập mạng hoặc chạy ứng dụng:

| Yêu cầu | Kết quả quan sát |
|---|---|
| Biên tập ESC/TEDx từ dữ liệu /2025 | Giữ năm của chủ đề, không tạo số liệu hiện hành, không tự mở đăng ký; phân biệt nhãn CTA và đích chưa kiểm tra |
| Thiết kế Hero cùng hai khung sự kiện | Giữ nền trắng đen, ESC xanh, TEDx đỏ; có bố cục mobile, ảnh chờ tài sản và trạng thái đọc |
| Xử lý anchor/Tab, màn hình thấp và reduced motion | Đề xuất landing tại pha đọc, focus thấy được, trả về luồng dọc và cleanup; tôn trọng frontend đang sở hữu section |
| Review khi mới có tài liệu/cấu hình | Báo kiểm tra tĩnh và các điểm chưa xác minh; không tuyên bố đã chạy website, browser hay đo hiệu năng |

Lượt này phát hiện cần định nghĩa rõ thế nào là đích CTA đã được kiểm tra. Skill content đã bổ sung tiêu chí cho anchor nội bộ, liên kết ngoài, trạng thái đăng ký và thời điểm kiểm tra lại.

Lượt thử hẹp sau cập nhật: khi tình huống cung cấp hai anchor hoạt động `#esc` và `#tedx`, agent dùng chúng cho CTA giới thiệu; giữ trạng thái đăng ký là `unknown` và chưa tạo CTA đăng ký. Agent phân biệt dữ kiện được cung cấp với kiểm tra browser do chính nó thực hiện.

## Giới hạn của lượt kiểm tra tĩnh ban đầu

Phần trên là kiểm tra cấu trúc và hành vi của hướng dẫn trước khi dựng giao diện.

## Kiểm thử giao diện và tương tác trên trình duyệt (24/10/2026)

Sau khi hoàn thiện bản dựng website theo phong cách Petalyx (`index.html`, `src/content/site-data.js`, `public/data/content.json`, `src/styles.css`, `src/tokens.css`, `src/main.js`, `src/motion.js`) cùng hệ thống 6 chuyên trang nội dung nội bộ (`pages/about.html`, `pages/esc.html`, `pages/tedx.html`, `pages/projects.html`, `pages/join.html`, `pages/contact.html`) và trang Quản trị & Upload Ảnh Chất lượng cao (`pages/studio.html`, `src/subpage.css`, `src/subpage.js`, `src/studio.css`, `src/studio.js`), kịch bản `scripts/qa-preview.mjs` đã chạy trên trình duyệt Chromium thực tế (`http://localhost:4173`) và lưu kết quả tại `.preview/qa-results.json`:

- **HTTP & Tài sản:** Mã phản hồi `200`, `errors: []`, toàn bộ ảnh tải và giải mã hoàn tất (`images: []`).
- **Desktop (`1366×900`) & Laptop (`1366×768`):** Không tràn ngang (`horizontalOverflow: false`); cả hai chương sự kiện `#esc` và `#tedx` đều khớp chiều cao khả dụng (`779px/824px` trên desktop và `675px/692px` trên laptop) và kích hoạt đủ 2 pin (`pins: 2`). Điều hướng neo `#esc` đưa khung ghim về đúng vị trí đọc ngay dưới thanh header (`top: 77px`).
- **Tương tác dữ liệu:** Bộ chọn năm TEDx (`2021` → `EXTRAORDINARY STEPS`), bộ chọn dự án (`Meditation Retreat`) và 3-panel hover accordion cho 3 sứ mệnh hoạt động chính xác.
- **Mobile (`390×844`), Landscape thấp (`844×390`) & Reduced Motion:** Tự động tắt pin (`pins: 0`), không tràn ngang (`overflow: false`), không có phần tử `.reveal` nào bị ẩn (`hiddenContent: 0`), menu điện thoại mở và đóng bằng phím `Escape` hoạt động chính xác (`mobileMenu: true`, `menuClosed: true`).
- **7 Chuyên trang nội bộ & Studio (`/about`, `/esc`, `/tedx`, `/projects`, `/join`, `/contact`, `/studio`):** Tất cả trả về HTTP `200`, `overflow: false`, `brokenImages: []`, thay thế hoàn toàn các liên kết phải chuyển hướng sang `skillcetera.notion.site`, tích hợp trình xem ảnh gốc độ phân giải đầy đủ (`#hq-lightbox`) và API quản trị nội dung (`GET/PUT /api/content`, `POST /api/upload`).
