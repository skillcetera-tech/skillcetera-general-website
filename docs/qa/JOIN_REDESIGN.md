# Hallmark redesign: `/join`

Ngày: 28/10/2026, Asia/Saigon. Phạm vi: một trang, redesign toàn diện theo hướng editorial trắng–đen đã được người dùng chọn. Lead trực tiếp thực hiện; review trong cùng phiên theo hướng dẫn Codex của Hallmark, không dùng subagent.

## Kết quả

- Hero dùng chữ lớn cạnh poster Desert Storm nguyên vẹn, đúng tỷ lệ 512 × 640. CTA xuất hiện trong màn hình đầu ở 1280 × 800, 1440 × 900 và 1920 × 1080.
- Lịch tuyển quân dùng bốn cột trên desktop, hai cột trên tablet và một cột trên điện thoại nhỏ.
- Năm ban nằm trong danh sách nền đen. Tất cả JD được giữ; JavaScript chỉ tăng cường thao tác đóng/mở. Tắt JavaScript vẫn đọc được cả năm JD.
- Form giữ nguyên iframe Fillout và có liên kết mở trực tiếp luôn hiện. ESC xanh, TEDx đỏ, logo gốc và font Be Vietnam Pro được giữ.
- Các style mới chỉ được trang Join tải. Không sửa source của trang chủ hoặc các trang khác. `index.html` đã có thay đổi từ trước; byte gốc của working copy được bảo toàn khi chạy build.

## Kiểm tra thực tế

| Kiểm tra | Kết quả |
| --- | --- |
| `npm run check` | Qua |
| Build (`scripts/build.mjs`, qua wrapper bảo toàn shared source) | Qua; tạo `dist/join.html`, `dist/join/index.html`, `dist/pages/join.html` |
| Hallmark static, `--render --kept` | 0 FAIL, 0 REFLEX đang mở; 12/12 đích liên kết giữ nguyên |
| Bảo toàn markup | 16/16 ID, hai module script, iframe, năm bộ JD và 58/58 mục công việc/yêu cầu được giữ |
| Chrome headless qua Playwright | Đã chạy, không phải kiểm tra tĩnh |
| Chiều rộng 320, 375, 414, 768, 1024, 1280, 1440, 1920 px | Không tràn ngang, không cắt CTA hoặc nav, không có ảnh nội bộ hỏng |
| Năm accordion | Enter mở, Space đóng, click liên tiếp không lệch `aria-expanded`/`hidden` |
| Neo `#depts` | Tới đúng vùng nội dung với khoảng đọc 100px |
| Menu điện thoại | Mở, Escape đóng và trả focus về nút; chọn liên kết đóng menu |
| Reduced motion | Không có transition trên disclosure; nội dung dùng được |
| Tắt JavaScript | Cả năm JD và liên kết đăng ký trực tiếp còn truy cập được |
| Fillout trên desktop và điện thoại 375px | Màn hình bắt đầu thực tế đã tải; có nút Start, chưa gửi hồ sơ thử |
| Lỗi JavaScript/tài nguyên nội bộ | Không ghi nhận |

Lệnh Hallmark:

```powershell
node C:/Users/Roy/.agents/skills/hallmark/scripts/sloplint.mjs pages/join.html src/join-desert.css --genre editorial --render --kept --url http://localhost:4173/join
```

Hallmark không chạy được render tier tích hợp vì thiếu `puppeteer-core`. Browser QA và ảnh thực tế được thực hiện riêng bằng Playwright có sẵn và Chrome cài trên máy. Không coi static pass là render pass. Các stylesheet dùng chung không đổi nằm ngoài phạm vi lint source mới này.

Một cảnh báo nhãn dài được loại sau khi kiểm tra tám chiều rộng: hàng disclosure chủ ý chứa tên và mô tả ở hai dòng. F3 được trả lời bằng cách ngắt dòng display có chủ đích. Gate 58 là NOTE trong redesign: source giữ toàn bộ JD, còn giao diện có JavaScript thu gọn các JD theo yêu cầu đọc.

## Review và giới hạn

Hero review: giữ poster gốc, CTA và tương phản mới. Finish review phát hiện ba vấn đề và đã sửa, chụp lại: hiệu ứng con trỏ che chữ, tiêu đề ứng tuyển có một dòng chỉ một từ, và style footer cũ ghi đè nền/bố cục mới.

Màn hình bắt đầu của Fillout đã tải trên desktop và trong lượt kiểm tra riêng ở điện thoại 375px sau khi chờ dịch vụ ngoài phản hồi. Các yêu cầu challenge của Cloudflare có HTTP 401 nhưng không ngăn màn hình bắt đầu tải trong lần kiểm tra này. Ảnh `application-phone.png` và `phone.png` đã được chụp lại từ form thực tế. Chưa thử gửi hồ sơ hoặc xác minh mọi bước bên trong form. Link dự phòng luôn truy cập được; không tạo bản sao form hay trạng thái gửi thành công giả.

So với bản cũ, poster trên điện thoại xuất hiện sau tiêu đề và CTA thay vì đứng đầu. Người dùng đăng ký sớm hơn trong luồng đọc; toàn bộ poster vẫn hiện nguyên vẹn bên dưới. Không có nội dung hoặc chức năng thiết yếu nào bị loại.

Ảnh thực tế: `.hallmark/before/`, `.hallmark/after/`; so sánh: `.hallmark/compare.html`; số đo: `.hallmark/qa-join-results.json`. Các artifact này được git-ignore để không đưa ảnh QA vào mã sản phẩm.

## Nội dung được biên tập

| Trước | Sau / nơi bảo toàn thông tin |
| --- | --- |
| `Step Into Skillcetera · Recruitment 2026` | Hai phần caption dưới poster |
| `The Rising of Next Generation · Skillcetera 2026` | Giữ tên chủ đề trên poster và alt text; năm nằm ở caption |
| Đoạn hero về hai sự kiện, kỹ năng và khóa 2026 | `Produce ESC and TEDxFPTUniversityHCMC with Skillcetera’s class of 2026.`; chi tiết kỹ năng/công việc còn đầy đủ trong JD |
| `Apply now, The Awakening` | `Apply now`; tên vòng còn ở lịch và tiêu đề form |
| `The 2026 Recruitment Journey` | `The 2026 recruitment` |
| `JavaScript is required to display this form.` | `Form not loading?` với cùng link dự phòng, nay hiện cả khi JavaScript bật |
| Dấu nháy thẳng trong `club's` | Dấu nháy typographic trong `club’s` |
| Mũi tên trang trí sau nhãn CTA | Nhãn không có mũi tên; URL giữ nguyên |

Các mốc và trạng thái tuyển quân 2026 được giữ từ trang hiện có và poster chiến dịch, không suy ra từ ngày hiện tại. Bản source baseline cũ về đợt 2024–2025 được đọc riêng; không dùng nó để xác nhận hoặc phủ định trạng thái chiến dịch 2026. Không xác minh lại thông báo đăng ký công khai trong tác vụ giao diện này.

## Chất liệu

Không có ô ảnh chờ thay thế. Poster hero dùng tỷ lệ 4:5, tối đa rộng 456px ở desktop; logo dùng asset chính thức sẵn có. Không cần thêm chất liệu để bản hiện tại hoạt động. Nếu muốn nét hơn trên màn hình mật độ cao, tài liệu hữu ích nhất là poster gốc 4:5 rộng ít nhất 1024px; ảnh hiện có rộng 512px.
