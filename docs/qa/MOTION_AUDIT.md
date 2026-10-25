# Kiểm tra motion Skillcetera

Ngày: 25/10/2026. Mã nguồn được kiểm tra: commit `628b708`.

**Cập nhật:** Các lỗi trong báo cáo này đã được xử lý trong đợt sửa tiếp theo. Xem [MOTION_FIXES.md](MOTION_FIXES.md) để đối chiếu cách sửa và 40 kiểm tra hồi quy. Các số đo dưới đây giữ nguyên làm bằng chứng trước khi sửa.

Phạm vi: chẩn đoán motion của bản local hiện tại; không chỉnh mã nguồn ứng dụng. Đã chạy Chrome headless trên website được phục vụ từ `127.0.0.1:4173`, kết hợp một lượt review mã nguồn độc lập.

## Kết quả chính

Đã tái hiện lỗi ở quá trình đổi breakpoint, khôi phục từ bộ nhớ trang khi Back, giảm chuyển động và hiệu ứng footer. Mẫu tải trang đầu ở desktop vẫn ghim ESC/TEDx đúng khoảng 77 px; lỗi xuất hiện khi vòng đời trang hoặc bố cục thay đổi. Không ghi nhận JavaScript exception trong lượt đo chính.

| Ưu tiên | Vấn đề | Bằng chứng |
|---|---|---|
| P1 | ESC mất tọa độ ghim đúng sau resize và điều hướng sai | Start đổi từ 1504 thành -385 dù scene vẫn ở tọa độ tài liệu 1580; nút ESC sau đó cuộn về y=0 |
| P1 | Số liệu sự kiện trở về 0 sau khi chuyển sang mobile | ESC 200+/20+/50+ triệu trở thành 0+/0+/0+ triệu; TEDx cũng giữ các số 0 |
| P1 | Back khôi phục trang chủ nhưng không khôi phục motion | `pageshow.persisted=true`; số pin từ 2 xuống 0, API motion biến mất |
| P2 | Animation trang trí tiếp tục chạy khi giảm chuyển động hoặc destroy | 87 tween lặp vô hạn vẫn tồn tại; opacity của ô vuông tiếp tục thay đổi |
| P2 | Ảnh sân khấu chưa phủ kín phần đầu cảnh | Ở tiến độ 0, mép ảnh thấp hơn mép khung 28,8 px |
| P2 | Logo footer chuyên trang hiện rồi biến mất để chạy animation | Khi mới lộ 6 px, opacity=1; vào ngưỡng kích hoạt, opacity về 0 rồi tăng lại |
| P2 | Pha đọc ngắn hơn đặc tả và khác nhau giữa hai sự kiện | ESC ổn định khoảng 51–68%, TEDx khoảng 48–68% của timeline |
| P2 | Cùng motif ô vuông nhưng homepage và chuyên trang có hai cách triển khai | Trang chủ có tween và mask; chuyên trang tạo ô tĩnh với kích thước và vị trí khác |

P1: ảnh hưởng trực tiếp tới điều hướng, thông tin hoặc khả năng sử dụng. P2: hành vi tiếp cận, chất lượng chuyển cảnh hoặc sự nhất quán cần xử lý.

## 1. Tọa độ ghim ESC hỏng sau resize

Vị trí cần điều tra: `src/motion.js:271` (setupPins), `:404` (khởi tạo trong media callback), `:216` (refresh) và `:180` (đích anchor dựa vào start/end).

Cách tái hiện:

1. Mở trang chủ ở 1366×900, bấm hoặc gọi điều hướng tới ESC.
2. Trang cuộn tới y=1889, ở pha đọc; `.event-inner` nằm tại y≈77 trong viewport.
3. Đổi viewport sang 390×844 rồi trở lại 1366×900.
4. Bấm ESC một lần nữa.

Kết quả đo:

| Trạng thái | ScrollY | ESC start/end | Tọa độ tài liệu của scene | Vị trí khung trong viewport |
|---|---:|---|---:|---:|
| Ban đầu | 0 | 1504 / 2359 | 1580 | 1581 |
| Đang đọc ESC | 1889 | 1504 / 2359 | 1580 | 77 |
| Sau mobile → desktop | 1889 | -385 / 470 | 1580 | 547 |
| Bấm ESC sau resize | 0 | -385 / 470 | 1580 | 77 |

Đích tính từ start âm bị chặn ở 0 bởi `Math.max(0, top)`, vì vậy điều hướng đưa về đầu trang và ghim nội dung không đúng vị trí tài liệu. Gọi thêm `ScrollTrigger.refresh()` thủ công trong lượt thử không sửa được trạng thái này.

Đã xác nhận hiện tượng và khoanh vùng pipeline rebuild/refresh. Chưa đủ bằng chứng quy nguyên nhân cuối cùng cho một phép tính cụ thể hoặc cho thư viện GSAP.

Ảnh: [sau resize](motion-audit/pin-after-resize.png), [sau điều hướng ESC](motion-audit/anchor-after-resize.png).

## 2. Counter bị giữ ở số 0

Vị trí: `src/motion.js:261` ghi `textContent`; `:283` revert context; `:407` chỉ khôi phục số hoàn chỉnh cho reduced motion.

Khi pin timeline bị gỡ, tween proxy quay về trạng thái đầu và callback cập nhật số liệu thành 0. Nhánh mobile thông thường không đặt lại giá trị cuối. Trong phép thử, ESC đang hiển thị 120+/12+/30+ triệu ở 10% timeline; sau resize giữ 0+/0+/0+ triệu. Lượt thử bắt đầu từ pha đã hoàn thành 200+/20+/50+ triệu cũng tái hiện số 0.

Đây là lỗi dữ liệu hiển thị, không chỉ là hiệu ứng chưa đẹp. Cần bảo toàn giá trị thật và đặt rõ trạng thái cuối khi không còn animation.

## 3. Back bằng BFCache làm mất motion

Vị trí: `src/main.js:174` xử lý pagehide; `src/motion.js:235` destroy. Không có pageshow tương ứng để khôi phục.

Lượt kiểm tra cho phép BFCache: trang chủ → `/about` → Back. Sự kiện pageshow ghi `[false, true]`, xác nhận trang được phục hồi từ cache. Trước khi rời trang: API tồn tại, có hai pin. Sau Back: API không tồn tại, không còn pin; 87 tween trang trí vẫn còn.

Khi tải lại toàn bộ trang, motion hoạt động trở lại. Vì vậy trải nghiệm có thể thay đổi theo cách người dùng quay lại trang.

## 4. Reduced motion và cleanup không quản lý toàn bộ animation

Vị trí: `src/motion.js:66` và `:108` tạo animation trước matchMedia/context; `:235` chỉ revert media; `src/cursor-squares.js:7` chỉ kiểm tra media khi khởi tạo.

Quan sát runtime:

- Ban đầu có 87 tween lặp vô hạn của các ô vuông và lớp glass.
- Bật reduced motion: pin/reveal bị gỡ nhưng vẫn có 87 tween lặp.
- Opacity một ô tiếp tục thay đổi từ 0,4516 xuống 0 trong 650 ms.
- Gọi destroy cũng không gỡ 87 tween này.

CSS tắt animation CSS không dừng được các tween JavaScript. Cần cùng một lifecycle để khởi tạo, dừng và phục hồi các lớp trang trí. Tài liệu [GSAP matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/) mô tả việc tự revert các animation được tạo bên trong callback; các tween đang nằm ngoài phạm vi đó.

Chưa đo FPS hoặc thời lượng frame, nên số lượng tween này chứng minh animation còn chạy, không chứng minh một mức tụt FPS cụ thể trên máy người dùng.

## 5. Ảnh tạo dải hở ở đầu sân khấu

Vị trí: `src/motion.js:315` bắt đầu ảnh ở yPercent=12, scale=1,16; `src/styles.css:722` là khung ảnh absolute kín cảnh.

Với cảnh cao 720 px, translation và scale hiện tại để mép trên ảnh thấp hơn mép khung 28,8 px. Tại 10% timeline vẫn hở khoảng 7,1 px; ở pha đọc ảnh mới phủ vượt mép khung. Đã đo ở cả ESC và TEDx.

Lớp overlay che phần nào dải hở nhưng không làm ảnh phủ kín. Cần bảo đảm vùng ảnh dư đủ cho toàn bộ quãng parallax.

## 6. Footer chuyên trang bị nháy

Vị trí: `src/subpage.js:398`, `src/styles.css:1543`.

Logo mặc định hiển thị. IntersectionObserver chỉ thêm animation khi tỷ lệ nhìn thấy đạt 15%; keyframe đầu lại đưa logo về opacity=0, scale=0,6. Đo khi cuộn chậm trên `/esc`: logo vừa lộ ra có opacity=1; bước tiếp theo class `f-logo-revealed` được thêm và opacity=0; sau đó tăng lên khoảng 0,282.

Trang chủ dùng GSAP chuẩn bị trạng thái đầu của logo trước khi vào viewport. Hai cách khởi tạo tạo nhịp vào khác nhau; chuyên trang có bước hiện → ẩn → hiện.

## 7. Nhịp đọc không còn theo đặc tả

Vị trí: `src/motion.js:314`–`:396`; đối chiếu `DESIGN_PLAN.md` mục 4.

Đặc tả dự kiến 20% vào / 60% đọc / 20% ra. Timeline hiện tại: ảnh vào tới 38%, stagger card tới khoảng 48%, bars ESC tới khoảng 51%; hiệu ứng ra bắt đầu từ 68%.

Vì vậy khoảng các thành phần chính cùng ổn định chỉ còn khoảng 17% cho ESC và 20% cho TEDx, chưa tính các tween trang trí vẫn lặp. Đây là sai khác giữa bản thiết kế và implementation, có thể làm người xem thấy cảnh luôn chuyển động và ít khoảng nghỉ.

## 8. Motif chung có hai hợp đồng motion

Vị trí: `src/motion.js:66` và `src/subpage.js:40`.

Trang chủ tạo ô 46 px theo lưới cố định, cao 42% vùng chứa, có mask và tween nhấp nháy. Chuyên trang tạo ô 28–63 px theo tọa độ phần trăm và không có tween; trang `/esc` không tải GSAP. Cùng class sq-field nhưng kích thước, mật độ và nhịp hiển thị thay đổi khi chuyển trang.

Sự khác biệt giữa trang giới thiệu và trang đọc chi tiết có thể là chủ ý; hiện chưa có quy định motion chung để giải thích và duy trì khác biệt đó. Cần chốt token thời lượng/easing và hành vi của các component dùng chung trước khi thêm hiệu ứng.

## Phạm vi kiểm tra và bằng chứng

- Các viewport: 1366×900, 1366×768, 1024×760, 1023×760, 901×700, 900×700, 390×844.
- Điều khiển cảnh tại các tiến độ 0%, 10%, 45%, 75%, 100%; thử resize, reduced motion, destroy, Back, footer chuyên trang.
- [Số đo runtime](motion-audit/runtime-measurements.json).
- [Số đo lifecycle và footer](motion-audit/lifecycle-measurements.json).
- Chưa đo trên thiết bị điện thoại thật, chưa chạy trace hiệu năng và chưa kiểm tra bản deploy.

Thứ tự xử lý đề xuất: lifecycle pin/resize và BFCache → khôi phục giá trị counter → reduced motion/cleanup → phủ ảnh và footer → chuẩn hóa nhịp đọc và component motion dùng chung.
