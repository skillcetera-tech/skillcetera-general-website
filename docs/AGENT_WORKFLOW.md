# Agent và skill cho Skillcetera

## Cấu trúc

Bộ này có sáu vai trò: lead ở phiên chính và năm custom agent chuyên môn. Mỗi chuyên môn có một skill ngắn, dùng được trực tiếp hoặc thông qua agent. `AGENTS.md` chứa các quy tắc chung, `DESIGN_PLAN.md` chứa định hướng giao diện, và `docs/content/source-baseline.md` chứa bản ghi nội dung nguồn.

| Vai trò | Gọi khi | Đầu ra chính |
|---|---|---|
| Lead | Công việc gồm nhiều phần hoặc cần tích hợp | Phạm vi, phân công, hợp đồng dùng chung và bản bàn giao |
| Content | Nhập nội dung, biên tập, cập nhật mùa hoặc CTA | Nội dung có nguồn, dữ liệu mùa và danh sách điểm chưa xác minh |
| Design | Storyboard, typography, màu, bố cục responsive | Bố cục desktop/mobile và token thiết kế |
| Frontend | Xây giao diện, menu, section, thành phần tương tác | HTML ngữ nghĩa, component responsive và tích hợp dữ liệu |
| Motion | Slideshow theo cuộn, pin, chuyển cảnh và fallback | Timeline cuộn cùng trạng thái đọc ổn định |
| Review | Kiểm tra một thay đổi hoặc bản website cụ thể | Phát hiện có bằng chứng, cách tái hiện và mức ưu tiên |

Agent là người nhận một phần việc; skill là hướng dẫn thực hiện phần việc đó. Review dùng cùng một skill cho cả kiểm tra kế hoạch và website, nhưng bằng chứng phải phù hợp với tài sản đang có.

## File và cơ chế nạp

```text
AGENTS.md
DESIGN_PLAN.md
.codex/agents/
  skillcetera_content.toml
  skillcetera_design.toml
  skillcetera_frontend.toml
  skillcetera_motion.toml
  skillcetera_review.toml
.agents/skills/
  skillcetera-content/SKILL.md
  skillcetera-design/SKILL.md
  skillcetera-frontend/SKILL.md
  skillcetera-motion/SKILL.md
  skillcetera-review/SKILL.md
docs/
  AGENT_WORKFLOW.md
  content/source-baseline.md
```

Các file TOML dùng `name`, `description`, `developer_instructions`; model và quyền thực thi kế thừa phiên hiện tại. Không cần đổi cấu hình người dùng toàn cục cho bộ dự án này. Định dạng tham chiếu: [OpenAI: Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents).

Skill đặt ở `.agents/skills` để host hỗ trợ Codex khám phá trong dự án. Có thể gọi bằng `$skill-name`; nếu skill mới chưa hiện trong danh sách, mở lại phiên Codex tại thư mục dự án. Định dạng và cơ chế khám phá: [OpenAI: Build skills](https://learn.chatgpt.com/docs/build-skills).

Việc phân tích cú pháp file không chứng minh host hiện tại đã nạp custom agent. Nếu host không hỗ trợ custom role, lead có thể đọc TOML và chuyển phần `developer_instructions` cho subagent thông thường cùng nhiệm vụ cụ thể. Nếu không có công cụ delegation, áp dụng skill trực tiếp theo cùng thứ tự.

## Cách dùng

Thiết kế trước:

> Dùng $skillcetera-design thiết kế storyboard bảy chương theo DESIGN_PLAN.md, gồm desktop và mobile. Chưa viết code.

Chuẩn hóa nội dung:

> Dùng $skillcetera-content lập nội dung website từ source-baseline.md và trang nguồn. Ghi rõ số liệu có mốc thời gian, liên kết còn thiếu và trạng thái CTA.

Xây bản tĩnh:

> Dùng $skillcetera-frontend dựng bố cục responsive theo storyboard hiện có, giữ đầy đủ nội dung và điều hướng.

Thêm chuyển động:

> Dùng $skillcetera-motion triển khai chuyển cảnh ESC và TEDx trên các section đã có. Giữ cuộn tự nhiên, hỗ trợ mobile, bàn phím và reduced motion.

Kiểm tra:

> Dùng $skillcetera-review kiểm tra bản hiện tại. Báo lỗi có bằng chứng và phân biệt những gì đã chạy với những gì chỉ kiểm tra tĩnh.

Giao việc cho cả nhóm khi bắt đầu xây:

> Làm lead xây bản xem trước Skillcetera theo DESIGN_PLAN.md. Giao nội dung cho skillcetera_content và storyboard cho skillcetera_design; sau khi có hợp đồng section, phối hợp skillcetera_frontend và skillcetera_motion, rồi dùng skillcetera_review kiểm tra bản tích hợp.

Đây là ví dụ yêu cầu cho các lượt sau. Tạo bộ agent/skill hiện tại không tự khởi động các việc đó.

## Hợp đồng bàn giao

Trước mỗi đợt làm song song, lead ghi trong nhiệm vụ:

```text
Mục tiêu:
Đầu vào cần đọc:
File được sửa:
File thuộc người khác:
Hợp đồng đã thống nhất:
Kết quả cần bàn giao:
```

Section contract tối thiểu gồm: ID ổn định, trường dữ liệu, chủ sở hữu markup, vùng đọc/CTA, wrapper/ref dành cho motion và cách hiển thị khi motion tắt. Chỉ ghi những thông tin cần cho công việc hiện tại.

Content và Design có thể chạy song song. Frontend làm cấu trúc section trước khi Motion tích hợp vào section đó; Motion có thể chuẩn bị timeline độc lập trong lúc chờ. Review nhận bản tích hợp và trả lỗi về đúng chủ sở hữu. Một file chỉ có một người sửa tại một thời điểm.

Lead là người mặc định sửa dependencies, lockfile và app entry point. Agent khác đưa đề xuất cụ thể, để tránh thay đổi cấu hình đồng thời. Phân công có thể được lead điều chỉnh theo công việc thực tế.

## Tiêu chí chất lượng riêng của dự án

- Nền trắng đen thống nhất; ESC xanh và TEDx đỏ có độ nổi bật tương đương.
- Có đủ ba sứ mệnh và bảy dự án/sự kiện; thông tin rút gọn vẫn có đường dẫn tới chi tiết phù hợp.
- Các mùa có năm rõ ràng; số liệu nguồn cũ không biến thành tuyên bố hiện tại.
- Logo sự kiện giữ đúng tài sản gốc; ảnh tư liệu phải có nguồn thật.
- Pin và scrub có khoảng đọc ổn định, cuộn ngược được, anchor và Tab dẫn tới nội dung thấy được.
- Mobile, viewport thấp và reduced motion vẫn đọc/nhấn được toàn bộ nội dung.
- Review không đánh dấu browser, Lighthouse hay live-link là đạt khi chưa thực sự thực hiện.

## Cách kiểm tra bộ hướng dẫn

Chạy trình `quick_validate.py` đi kèm skill-creator cho từng skill, bằng Python ở chế độ UTF-8 trên Windows. Phân tích năm TOML bằng `tomllib`; kiểm tra tên duy nhất và các đường dẫn tới skill có thật.

Kiểm tra hành vi bằng tình huống cụ thể: palette hai màu sự kiện; dữ liệu mùa cũ chưa có đăng ký; reduced motion; viewport thấp; xung đột quyền sửa file; review khi chưa có website chạy. Một agent độc lập đọc skill và trả cách xử lý giúp phát hiện hướng dẫn thiếu hoặc tự mở rộng phạm vi.

Kết quả kiểm tra ban đầu: [agent-kit-validation.md](qa/agent-kit-validation.md).
