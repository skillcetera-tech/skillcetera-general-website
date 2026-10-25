# ESC/TEDx: bắt khung ngay và chạy số theo lượt vào

> Cơ chế kéo trang và kết quả dưới đây ghi nhận phiên bản trước. Cơ chế hiện tại dùng một controller chung cho tất cả chương: xem [CHAPTER_SCROLL.md](CHAPTER_SCROLL.md). Số liệu 2 giây và fallback tiếp tục được giữ.

Triển khai theo điều chỉnh của người dùng ngày 25/10/2026.

## Hành vi hiện tại

- Hai sự kiện ở luồng cuộn bình thường; bỏ quãng ghim bổ sung, zoom ảnh và việc tự chuyển focus khi tới sự kiện.
- Trên desktop từ 1024×760 trở lên, khung chiếm phần viewport còn lại dưới thanh điều hướng, nếu toàn bộ nội dung vừa khung. Ở viewport 1366×900, khung cao 824 px; trên monitor 1920×1080, khung cao 1004 px.
- Khi cuộn xuống từ khung phía trên, bắt ngay trong sự kiện wheel khi mép khung còn cách đáy viewport tối đa 80 px. Đoạn căn dài 120 ms, cho phép quán tính wheel cùng hướng và hủy ngay nếu cuộn ngược. Scroll từ bàn phím bắt trong vùng bằng 80% chiều cao khung, tối đa 720 px; dừng cuộn 100 ms là fallback. Không chặn wheel/touch; Ctrl+wheel không kích hoạt căn.
- Căn khung và đếm số có vòng đời riêng. Sau khi rời vùng nhận diện thêm 80 px, quay lại có thể căn tiếp. Trong cùng lượt đọc, cuộn ra khỏi vị trí đã căn không bị hút trở lại. Viền xanh ESC/đỏ TEDx xuất hiện khi khung khớp dưới thanh điều hướng và khôi phục khi Back.
- Cuộn ngược, hủy thao tác con trỏ, resize hoặc chuyển cửa sổ sẽ hủy việc căn đang diễn ra. Sau khi căn, cuộn tiếp thoát bình thường. Cơ chế không bắt người dùng đi qua một số nấc cuộn.
- Khi khung đã ổn định, số chạy trong 2 giây theo thời gian, độc lập với tiến độ cuộn. Mỗi lượt bắt khung mới chạy lại số từ đầu; di chuyển nhẹ trong cùng lượt đọc không phát lại. Back qua BFCache và resize không tự phát lại. Fallback bố cục không đánh dấu là đã chạy hiệu ứng.
- Cuộn nhẹ vẫn giữ số đang chạy. Nếu khung còn dưới 35% chiều cao trong vùng nhìn, resize, ẩn tab hoặc bật reduced motion, số được hoàn tất ngay. Không để số 0 hoặc số trung gian bị giữ lại.
- Trên mobile, màn hình thấp, nội dung quá cao và reduced motion, không tự căn hoặc đếm. Hiển thị ngay giá trị đầy đủ.
- Phần chữ dành cho công cụ hỗ trợ luôn chứa giá trị thật. Chỉ phần số trang trí được thay đổi trong hiệu ứng; không phát thông báo số liên tục cho người dùng trình đọc màn hình.
- Điều hướng chủ động bằng bàn phím vẫn chuyển focus tới tiêu đề phù hợp. Cuộn tự nhiên và click chuột không tự kéo focus vào tiêu đề sự kiện.

## Các file liên quan

- `src/event-scenes.js`: bắt khung trên wheel/scroll, kiểm tra khung vừa nội dung, counter theo lượt vào và cleanup.
- `src/motion.js`: kết nối controller vào vòng đời motion và điều hướng; giữ reveal/hero của các phần còn lại.
- `src/main.js`: phân biệt điều hướng bằng chuột và bàn phím.
- `src/styles.css`: chiều cao khung theo viewport và phần số đọc được bởi công cụ hỗ trợ.
- `scripts/qa-event-scenes.mjs`: kiểm tra trên trình duyệt; `scripts/qa-motion.mjs` giữ vai trò entry point để chạy bộ kiểm tra hiện tại.

## Kiểm tra

Lỗi được xác định trước lần sửa này: `eventSnapSeen` khóa căn khung vĩnh viễn sau lần đầu; ngưỡng nhận diện 140 px quá hẹp; bộ lọc cộng dồn quãng cuộn coi nhiều lượt cuộn chuột thông thường là cuộn nhanh. Controller hiện dùng trạng thái cho phép căn lại theo khoảng cách rời khung, không dùng tổng quãng wheel để loại bỏ một lượt tiếp cận.

Các trường hợp được kiểm tra bằng Chrome headless: wheel thật rồi dừng, số chạy sau khi căn, không chuyển focus, cuộn ngược, cuộn nhanh, ngắt căn bằng thao tác mới, điều hướng chuột/bàn phím, nhiều kích thước màn hình, resize giữa lúc đếm, reduced motion, Back hai lượt và footer dùng chung. Có mô phỏng pointercancel/blur để kiểm tra giải phóng trạng thái thao tác.

Kết quả: **59/59 kiểm tra đạt**, gồm 10 lượt bắt khung và chạy lại số cho mỗi sự kiện từ hai hướng (dừng gửi wheel khi khung bắt đầu căn), kích hoạt trong chính sự kiện wheel khi khung còn dưới viewport, số vẫn chạy sau 1,5 giây, cuộn nhẹ không kết thúc số sớm, fallback ban đầu không đánh dấu đã phát, và viền khung sau Back. Không có JavaScript exception trong các trang của lượt thử. `npm run check`, `npm run build` và `git diff --check` đều đạt.

Kết quả lượt kiểm tra hiện tại được lưu tại [event-scenes/results.json](event-scenes/results.json). Chạy lại bằng `node scripts/qa-motion.mjs` khi server local đang mở; cấu hình `PLAYWRIGHT_MODULE`, `BROWSER_EXECUTABLE` và `PREVIEW_URL` theo môi trường nếu cần.

Giới hạn: viewport và thao tác trình duyệt được mô phỏng trên Chrome; chưa kiểm tra phần này trên điện thoại vật lý, Safari hoặc Firefox. Đợt này không thực hiện deploy.
