# Chuyển khung hai chiều trên trang chủ

Thay thế cơ chế căn riêng ESC/TEDx theo yêu cầu chuyển các phần của trang mượt theo ngưỡng cuộn.

- Các điểm đến: Home, About, ESC, các mùa ESC, TEDx, các mùa TEDx, Projects, Community, Connect và Footer. Ghi chú nguồn ESC nằm trong quãng đọc trước các mùa ESC.
- Tích lũy ít nhất 80 px wheel cùng hướng; ngắt quá 220 ms hoặc đổi hướng thì tính lại. Chuyển xuống trong vùng cách khung kế tiếp không quá 76% viewport đọc; chuyển lên khi ở 24% đầu vùng đọc của chương hiện tại.
- Phần dài vẫn cuộn tự nhiên tới gần cuối. Khi đi ngược về phần dài, tới đoạn cuối để không bỏ nội dung. Điểm footer giới hạn ở đáy tài liệu.
- Chuyển trong 620–780 ms bằng smootherstep, không gọi preventDefault. Đọc vị trí trong wheel đồng bộ để không chọn nhầm chương sau bước cuộn mặc định. Điểm bắt đầu animation lấy từ vị trí native thực tế ở frame đầu để tránh giật trở lại.
- Cuộn ngược, pointer, phím, touch, resize, ẩn tab hoặc reduced motion hủy animation. Mobile/màn hình thấp không tự chuyển. Ưu tiên input và vùng cuộn lồng nhau; bỏ qua Ctrl+wheel và cuộn ngang.
- Chỉ một controller điều khiển scroll. Controller ESC/TEDx tiếp tục khung vừa viewport, viền màu và số liệu 2 giây sau khi tới nơi; có thể phát lại khi vào từ lượt mới.

Chrome headless: **39/39 kiểm tra đạt**, gồm chuyển xuống/lên giữa mọi cặp chương, kiểm tra trạng thái giữa animation và điểm dừng, số ESC/TEDx, cuộn nhỏ dưới ngưỡng, phần dài, hủy khi đảo hướng, vùng cuộn riêng, reduced motion, mobile, menu và resize. Không có JavaScript exception. Đây là kiểm tra viewport mô phỏng, chưa xác nhận trên thiết bị vật lý hoặc Safari/Firefox.

Chạy `node scripts/qa-motion.mjs` khi preview hoạt động; cấu hình `PLAYWRIGHT_MODULE`, `BROWSER_EXECUTABLE`, `PREVIEW_URL` nếu cần. Bằng chứng: [chapter-scroll/results.json](chapter-scroll/results.json). Bộ kiểm tra cũ `qa-event-scenes.mjs` lưu hợp đồng căn khung trước đây, không còn là entry point hiện tại.
