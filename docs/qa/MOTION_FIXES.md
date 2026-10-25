# Khắc phục motion Skillcetera

Ngày thực hiện: 25/10/2026. Đối chiếu [báo cáo ban đầu](MOTION_AUDIT.md).

**Điều chỉnh tiếp theo:** Theo yêu cầu mới, ESC/TEDx đã chuyển từ sticky/scrub sang khung cuộn thường, căn nhẹ khi dừng cuộn và đếm số một lần độc lập. Xem [EVENT_SCENES.md](EVENT_SCENES.md). Các bảng bên dưới là kết quả của đợt khắc phục trước điều chỉnh đó.

## Những thay đổi đã thực hiện

| Vấn đề | Cách khắc phục | Kết quả kiểm tra |
|---|---|---|
| ESC lệch vị trí và điều hướng sai sau resize | CSS sticky quản lý khung; GSAP chỉ scrub nội dung. Start/end dùng tọa độ tài liệu; kích thước được cập nhật khi resize/font/ảnh thay đổi | Sau desktop → mobile → desktop, ESC start vẫn 1504, không còn âm. Điều hướng về đúng pha đọc, khung ở y=76 |
| Counter về 0 hoặc giữ số trung gian | Giữ giá trị thật từ data-to, không buộc số liệu vào tiến độ cuộn; khôi phục giá trị khi teardown/rebuild | Cả ESC và TEDx giữ số đúng ở mọi viewport và chế độ đã thử |
| Back bằng BFCache làm mất motion | Dọn scene/ambient/cursor khi pagehide; khởi tạo lại khi pageshow.persisted, giữ listener chức năng một lần | Hai lượt khôi phục BFCache liên tiếp giữ đủ hai cảnh, một lớp cursor và số phần tử trang trí không tăng |
| Reduced motion hoặc destroy không dừng toàn bộ animation | Bỏ GSAP loop ngoài context; dùng ambient controller chung với cleanup, live media query, pause khi ngoài viewport hoặc tab ẩn | GSAP infinite tween từ 87 về 0. Bật reduced motion: không còn loop đang chạy, không còn cursor particles và không ghim cảnh |
| Ảnh sân khấu hở mép | Giảm translation, tính overscan đủ cho toàn bộ quãng di chuyển | Ảnh phủ kín ở tiến độ 0/10/30/70/90/100% và khi cuộn ngược cho cả hai sự kiện |
| Footer logo hiện → mất → hiện | Dùng cùng controller cho trang chủ/chuyên trang; chỉ animate nhẹ ảnh bên trong, không đưa opacity về 0 | Opacity logo luôn bằng 1 tại các ngưỡng vừa vào màn hình đã thử |
| Pha đọc ngắn và khác nhau giữa hai sự kiện | Chung timeline vào 0–20%, giữ 20–80%, ra 80–100%; chữ và CTA luôn rõ | Transform ảnh tại 30% và 70% giống nhau; CTA nhìn thấy, headline opacity=1 |
| Motif ô vuông không đồng nhất | Dùng chung ambient-motion.js cho trang chủ và chuyên trang, cùng CSS kích thước/lưới và lifecycle | Cùng initializer; không tăng phần tử khi Back/reinit; chuyên trang cũng tắt loop khi giảm chuyển động |

## Cấu trúc triển khai

- `src/motion.js`: scene sticky, hiệu ứng theo cuộn, trạng thái đọc, anchor/focus, resize và cleanup.
- `src/ambient-motion.js`: motif nền, glass, petals, drift và phản hồi footer dùng chung. WAAPI chỉ chạy khi nhóm trong viewport và tài liệu đang hiện.
- `src/cursor-squares.js`: phản hồi con trỏ tùy chọn, xử lý thay đổi pointer/reduced motion, dọn rAF và timeout.
- `src/main.js`, `src/subpage.js`: quản lý vòng đời trang và BFCache.
- `src/styles.css`, `src/tokens.css`: sticky layout và thông số motion dùng chung.

Menu trang chủ cũng đóng khi focus rời header hoặc chuyển về breakpoint desktop. Nội dung và liên kết sự kiện không được thay đổi trong đợt sửa này.

## Kiểm tra đã chạy

- `npm run check`: đạt.
- `npm run build`: đạt; bản static được cập nhật trong dist.
- `git diff --check`: không có lỗi khoảng trắng; Git có thông báo chuyển đổi dòng LF/CRLF theo cấu hình Windows.
- `scripts/qa-motion.mjs`: **40/40 kiểm tra đạt**, không có JavaScript exception trên trang chủ trong lượt chạy.
- Review mã nguồn độc lập không phát hiện regression chắc chắn trong các luồng đã rà.

Viewport đã dùng: 1366×900, 390×844, 1023×760, 1024×760, 844×390, 1366×768. Có kiểm tra resize giữa cảnh, cuộn thuận/ngược, vùng ảnh, CTA, khoảng giữ để đọc, thay reduced motion trực tiếp, menu điện thoại và BFCache hai lượt.

Khi chạy lại, khởi động server local, cung cấp Playwright qua môi trường `PLAYWRIGHT_MODULE` nếu chưa có trong project, chỉ định `BROWSER_EXECUTABLE` khi cần, rồi chạy `node scripts/qa-motion.mjs`. URL mặc định là http://127.0.0.1:4173; có thể đổi qua `PREVIEW_URL`.

- [Kết quả kiểm tra chi tiết](motion-fix/regression-results.json).
- [Ảnh ESC trên desktop](motion-fix/esc-desktop.png).
- [Ảnh viewport điện thoại](motion-fix/mobile.png).

Giới hạn: kiểm tra runtime dùng Chrome headless và viewport mô phỏng; chưa xác nhận trên điện thoại vật lý, Safari hoặc Firefox. Chưa đo FPS hay Core Web Vitals trên thiết bị thực tế. Không có thay đổi hoặc xác nhận deploy trong đợt sửa này.
