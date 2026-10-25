# Kế hoạch thiết kế website Skillcetera

Trạng thái: đã xây dựng bản xem trước hoàn chỉnh, tích hợp dữ liệu nguồn và kiểm thử QA trên trình duyệt.

## 1. Hướng thiết kế

**Skillcetera in Motion**: website giới thiệu câu lạc bộ cho sinh viên, người tham dự sự kiện và đối tác, sử dụng chữ lớn, ảnh hoạt động thật và các chương chuyển tiếp theo thao tác cuộn.

Trắng và đen tạo nhận diện chung. ESC có điểm nhấn xanh dương; TEDxFPTUniversityHCMC có điểm nhấn đỏ. Hai sự kiện thường niên là hai chương trọng tâm, có mức độ đầu tư hình ảnh và chuyển động tương đương.

Người xem cần hiểu được ba điều: Skillcetera là ai, câu lạc bộ tạo ra những trải nghiệm gì, và làm thế nào để tham gia hoặc liên hệ.

Thông số định hướng nội bộ: DESIGN_VARIANCE 7/10, MOTION_INTENSITY 8/10 trên desktop và 4/10 trên mobile, VISUAL_DENSITY 3/10. Chuyển động phức tạp tập trung ở hai chương sự kiện; các phần đọc thông tin dùng chuyển động nhẹ.

Ngôn ngữ giao diện đề xuất: tiếng Việt. Tên sự kiện và tên chủ đề giữ nguyên. Nội dung tiếng Anh gốc được lưu cùng dữ liệu để thuận tiện bổ sung bản EN khi cần.

## 2. Hệ thống thị giác

### Màu sắc

| Vai trò | Màu đề xuất | Cách sử dụng |
|---|---|---|
| Nền chính | #FFFFFF | Nền xuyên suốt của bản giao diện sáng |
| Chữ chính | #101010 | Tiêu đề, nội dung, điều hướng, CTA chung |
| Bề mặt phụ | #F3F3F3 | Vùng ảnh chờ tải và các vùng phân nhóm nhẹ |
| Chữ phụ | #666666 | Chú thích và nguồn số liệu |
| ESC | #2457FF | Tên chương, đường nhấn, đồ họa giọng nói, CTA của ESC |
| TEDx | #EB0028 | Màu đỏ theo hướng dẫn TEDx hiện hành; dùng cùng logo chính thức |

Mục tiêu khoảng 85% diện tích giao diện là trắng, đen và xám; 15% còn lại dành cho hai màu sự kiện. Đây là định hướng thị giác, không phải giới hạn cứng đối với ảnh chụp.

Màu xanh của ESC là đề xuất, cần đối chiếu với bộ nhận diện gốc trước khi triển khai. Màu đỏ TEDx và cách đặt logo cần theo tài sản thương hiệu chính thức. Nguồn: [TEDx: Design and promote event](https://www.ted.com/tedx/organizer-guide/design-and-promote-event).

Chuyển chương ESC sang TEDx qua nền trắng trung tính. Màu chung của website giữ ổn định; màu sự kiện chỉ xuất hiện tại nội dung liên quan. Logo của các dự án khác giữ màu gốc trong tài sản chính thức.

Bản sáng là bản storyboard chính. Các token cũng có bản tối: nền #101010, chữ #FAFAFA, giữ nhận diện đỏ và xanh. Nếu dùng tùy chọn giao diện tối, áp dụng ở cấp toàn trang; không đổi sáng/tối tự động theo từng chương.

### Chữ, ảnh và bố cục

- Font đề xuất: Be Vietnam Pro cho cả tiêu đề và nội dung. Tiêu đề 700–800, nội dung 400–500. Logo sử dụng file gốc.
- Tiêu đề mở đầu khoảng 64–96 px trên desktop, 38–52 px trên mobile; tối đa hai dòng trên laptop. Cỡ cụ thể điều chỉnh theo nội dung và chiều rộng thật.
- Nội dung chính 17–19 px trên desktop, tối thiểu 16 px trên mobile; mỗi đoạn đọc nhanh có khoảng 35–60 từ.
- Lưới desktop 12 cột, vùng nội dung tối đa khoảng 1440 px. Mobile một cột, lề 20–24 px.
- Khung ảnh và nút có góc vuông hoặc bo nhẹ trong cùng thang 0–4 px. Phân nhóm bằng khoảng trắng và đường nét mảnh.
- Ảnh tập thể, hậu trường, thí sinh và diễn giả là chất liệu chính. Ảnh cộng đồng có thể xử lý đen trắng; ảnh sự kiện giữ màu khi cần truyền đạt nhận diện.
- Logo và ảnh tư liệu sự kiện lấy từ nguồn thật. Khi thiếu ảnh, storyboard ghi rõ ô cần tài sản thay vì tạo bằng chứng hoạt động giả.

## 3. Storyboard trang chủ: bảy chương

| Chương | Nội dung giữ lại hoặc biên tập từ nguồn | Bố cục | Motion chính |
|---|---|---|---|
| 1. Mở đầu | Tên CLB, trực thuộc FPT University HCMC, thông điệp chia sẻ kiến thức | Tiêu đề lớn trên nền trắng, ảnh tập thể rộng đặt lệch; một CTA khám phá sự kiện | Ảnh mở khung bằng dịch chuyển và phóng nhẹ; tiêu đề rời vị trí khi chương tiếp theo tiến lên |
| 2. Chúng tôi là ai | Giới thiệu, ba sứ mệnh: phát triển cộng đồng, tổ chức sự kiện chuyên nghiệp, môi trường cởi mở | Chữ theo ba ý nối tiếp, kèm ảnh sinh hoạt | Từng ý hiện theo dòng; mỗi ý ổn định trước khi chuyển sang ý kế tiếp |
| 3. ESC | English Speaking Competition, đối tượng tham gia, ảnh cuộc thi, số liệu và liên kết hiện có | Khung vừa vùng màn hình dưới điều hướng, ảnh thí sinh, số liệu và CTA | Căn nhẹ khi dừng cuộn gần khung; số liệu chạy một lần sau khi khung ổn định |
| 4. TEDxFPTUniversityHCMC | Vai trò tổ chức, ảnh diễn giả, các mùa 2021–2025, số liệu và liên kết | Khung vừa màn hình, nhận diện đỏ, ảnh tư liệu và phần xem các mùa | Cùng cơ chế căn nhẹ và đếm số độc lập với cuộn; ảnh và logo giữ ổn định |
| 5. Các trải nghiệm khác | Discussion Forum, Scavenger Hunt, Meditation Retreat, S-Store, The MoneyVerse | Danh sách năm dự án có mô tả đầy đủ; desktop có vùng ảnh xem trước bên cạnh | Vùng ảnh bám trong phạm vi phần dự án và đổi theo mục đang đọc; chữ vẫn cuộn tự nhiên |
| 6. Con người và dấu ấn | Ảnh hoạt động, các thành tích đã có nguồn | Bộ ảnh bất đối xứng với một số số liệu chọn lọc, ghi rõ thuộc dự án nào | Ảnh xuất hiện lệch nhịp nhẹ; số liệu hiện trực tiếp, không chạy bộ đếm |
| 7. Tham gia và liên hệ | Join us, Contact, liên kết About Skillcetera và Projects | Lời mời rõ ràng, nút tham gia, kênh liên hệ và footer gọn | Chuyển động vào cảnh một lần; nút và thông tin giữ yên để thao tác |

Copy hero đề xuất: **“Ý tưởng đáng lan tỏa. Kiến thức đáng sẻ chia.”** Đây là bản biên tập từ thông điệp nguồn, cần đưa vào storyboard để kiểm tra độ dài thật.

Thanh điều hướng desktop: logo Skillcetera, Giới thiệu, ESC, TEDxFPTUniversityHCMC, Dự án, Liên hệ. Mỗi mục dẫn đến vị trí nội dung đọc được ngay. Tại chiều rộng không đủ, chuyển sang menu thu gọn.

### Chi tiết chương ESC

- Trạng thái đầu: chữ ESC lớn màu xanh, tên đầy đủ, ảnh thí sinh hoặc sân khấu.
- Theo cuộn: ba đến năm thanh xanh chuyển vị trí để mở khung ảnh, gợi nhịp nói. Đây là đồ họa trang trí theo cuộn, không giả làm biểu đồ âm thanh đang phát.
- Trạng thái đọc: giới thiệu cuộc thi, số liệu đã xác minh, nút “Khám phá ESC”.
- Dữ liệu nguồn hiện có: hơn 200 thí sinh, hơn 20 trường, tổng giải thưởng hơn 50 triệu đồng. Khi xuất bản cần ghi mốc thống kê phù hợp.
- Chỉ dùng CTA đăng ký khi có đợt thực sự đang mở và liên kết được xác nhận; trạng thái mặc định dẫn đến thông tin cuộc thi hoặc tư liệu mùa trước.

### Chi tiết chương TEDx

- Trạng thái đầu: logo đầy đủ, thông điệp về chia sẻ ý tưởng, ảnh diễn giả hoặc khán phòng.
- Theo cuộn: khung hoặc đường nét đỏ đưa mắt đến hình ảnh, sau đó rút về vị trí nhấn cạnh nội dung. Chuyển động tác động lên bố cục xung quanh logo.
- Trạng thái đọc: thông tin chương trình, số liệu có nguồn và lựa chọn năm.
- Các mùa có trong nguồn: 2021 EXTRAORDINARY STEPS; 2022 VALUE TRANSITION; 2023 WITH OR WITHOUT; 2024 START SMALL; 2025 ALL THE WAY.
- Các nút chọn năm có nhãn rõ ràng, dùng được bằng chạm và bàn phím. Chỉ đổi phần tư liệu; không bắt người xem cuộn qua từng mùa để đến phần tiếp theo.
- Logo dùng file chính thức, có vùng trống, trên nền trắng hoặc đen đặc theo [hướng dẫn TEDx](https://www.ted.com/tedx/organizer-guide/design-and-promote-event).

## 4. Cơ chế slideshow và chuyển cảnh

### Desktop

Trang giữ cuộn dọc tự nhiên. Vị trí cuộn điều khiển tiến độ cảnh; cuộn ngược quay lại cảnh trước. Người xem có thể dừng ở bất kỳ chỗ nào để đọc.

Theo điều chỉnh mới nhất của người dùng, ESC và TEDx nằm trong luồng cuộn bình thường, không có quãng ghim bổ sung và không zoom/focus riêng. Trên desktop đủ không gian đọc, mỗi khung cao bằng vùng màn hình còn lại dưới thanh điều hướng.

Theo điều chỉnh mới nhất, toàn bộ 10 chương trang chủ dùng chung một controller chuyển khung hai chiều. Sau ít nhất 80 px wheel tích lũy cùng hướng (ngắt quá 220 ms thì tính lại), chuyển xuống nếu khung kế tiếp còn cách tối đa 76% vùng đọc; chuyển lên khi đang trong 24% đầu vùng đọc của chương hiện tại. Phần dài giữ toàn bộ quãng đọc trước khi tới ngưỡng. Khi chuyển lên phần dài, căn tới đoạn cuối của phần đó để tiếp tục đọc theo chiều ngược. Footer tham gia với điểm đến giới hạn ở đáy tài liệu.

Chuyển động dài khoảng 620–780 ms, dùng đường cong smootherstep có vận tốc và gia tốc bằng 0 ở hai đầu. Quán tính cùng hướng không khởi động thêm chuyển động; cuộn ngược hủy ngay. Một khoảng nghỉ 220 ms sau chuyển giúp tránh nhảy liên tiếp nhiều chương. Không gọi preventDefault hoặc chuyển focus. Menu, phím, pointer, touch, resize và reduced motion hủy chuyển đang chạy. Vùng cuộn riêng được ưu tiên. ESC/TEDx không còn tự kéo trang bằng controller thứ hai; controller sự kiện chỉ quản lý khung vừa màn hình và đếm số khi tới nơi.

Sau mỗi lượt bắt khung mới, số liệu ESC và TEDx chạy từ đầu trong khoảng 2 giây theo thời gian. Cuộn nhẹ trong cùng lượt đọc không chạy lại hoặc hoàn tất số sớm; chỉ rời gần hết khung (còn dưới 35% chiều cao hiển thị), resize, ẩn tab hoặc bật reduced motion mới hoàn tất ngay. Bố cục tạm thời chưa vừa khung không được đánh dấu là đã phát hiệu ứng. Back và resize giữ giá trị cuối, không tự phát lại nếu chưa có lượt vào mới. Công cụ hỗ trợ đọc màn hình luôn nhận giá trị thật.

Ảnh, chữ và CTA của hai sự kiện giữ ổn định khi đọc. Cuộn tiếp đi tới phần kế tiếp bằng luồng trang bình thường. Menu đưa người xem tới đúng khung; chỉ điều hướng chủ động bằng bàn phím mới chuyển focus tới tiêu đề phù hợp.

### Các tương tác nhỏ

- Nút: mũi tên dịch 3–4 px, nền hoặc đường viền đổi trong 160–220 ms.
- Liên kết: gạch chân xuất hiện bằng transform; trạng thái focus có viền rõ.
- Ảnh dự án: phóng nhẹ khi hover trên thiết bị có con trỏ; mobile dùng nhấn để mở chi tiết.
- Điều hướng: đánh dấu mục đang xem bằng chữ hoặc gạch chân; màu xanh và đỏ chỉ áp dụng cho mục sự kiện tương ứng.
- Video nếu có: ảnh poster trước, bấm mới phát; âm thanh do người dùng chủ động bật.

### Mobile, màn hình thấp và giảm chuyển động

- Dưới khoảng 768 px, dùng các phần xếp dọc với chiều cao theo nội dung. Tablet áp dụng tùy chiều cao và không gian đọc thực tế.
- Không căn khung tự động hoặc đếm số trên điện thoại/màn hình thấp. Số liệu hiển thị đầy đủ; cả năm dự án đều có tên, ảnh và mô tả trong luồng dọc.
- Khi viewport thấp hoặc chữ phóng to làm nội dung vượt khung, tự chuyển sang luồng cuộn thường.
- Với prefers-reduced-motion, nội dung hiện đầy đủ và bỏ pin, parallax, scrub. Liên kết neo vẫn dẫn đúng vị trí.
- Nội dung đọc và thứ tự focus nhất quán; phần hoàn toàn ẩn không nhận focus. Khi điều hướng bằng bàn phím, nội dung được focus phải hiện ra và nằm trong viewport.
- Cấu trúc HTML vẫn đọc được khi JavaScript chưa tải hoặc animation không khởi tạo.

## 5. Bảo toàn nội dung và dữ liệu

Nguồn chính đã đọc: [Skillcetera /2025](https://skillcetera.notion.site/2025).

Giữ đủ bảy dự án/sự kiện và ba sứ mệnh. Trang chủ rút gọn đoạn văn thành các ý dễ đọc; thông tin chi tiết và đường dẫn tiếp tục truy cập được từ từng dự án. Đọc thêm bốn trang con About Skillcetera, Projects, Join us và Contact trong giai đoạn kiểm kê trước khi quyết định nội dung cuối.

Những điểm cần xử lý trước khi xuất bản:

- Nguồn TEDx có câu “four seasons” nhưng danh sách chứa năm mùa 2021–2025; cần biên tập lại cho nhất quán.
- Số người tham dự, lượng bán hàng, lượt xem và lượt theo dõi là dữ liệu trên trang nguồn; cần mốc thống kê trước khi trình bày như số liệu hiện hành.
- Không cộng các số liệu của dự án thành một tổng người tham gia chung khi chưa loại trùng.
- “ALL THE WAY” được ghi là chủ đề năm 2025. Thông tin về mùa mới cần dữ liệu mới.
- Địa chỉ email TEDx trong nguồn là kênh của sự kiện; kênh liên hệ chung của CLB phải lấy từ trang Contact.
- Liên kết tuyển thành viên, vé, đăng ký cuộc thi và cửa hàng cần đối chiếu trạng thái thực tế.

Tài sản cần có: logo Skillcetera, logo ESC và TEDx chính thức; ảnh tập thể; ảnh thí sinh/diễn giả; ảnh cho năm dự án còn lại; thông tin mùa sự kiện; liên kết liên hệ và đăng ký đã xác nhận.

## 6. Phương án kỹ thuật đề xuất

- Next.js/React cho nội dung và điều hướng; CSS variables cho màu, chữ, khoảng cách và theme.
- GSAP ScrollTrigger cho hero và reveal các phần khác. ESC/TEDx dùng controller riêng cho căn khung sau khi dừng cuộn và số liệu chạy một lần; dùng CSS cho hover/focus.
- gsap.matchMedia quản lý phiên bản desktop, mobile và reduced motion cùng việc dọn animation khi điều kiện thay đổi. [Tài liệu matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/).
- Dữ liệu CLB, dự án và mùa sự kiện tách khỏi component dưới dạng file dữ liệu có cấu trúc. Sự kiện có tên, năm, chủ đề, trạng thái, ảnh, số liệu kèm nguồn/mốc và URL CTA.
- Phiên bản đầu dùng trang chủ kể chuyện cùng các đường dẫn chi tiết phù hợp với nội dung đã có. Việc tạo trang sự kiện riêng dựa trên lượng nội dung thực tế sau kiểm kê.
- Render nội dung trước; motion nâng cấp trải nghiệm sau khi trang sẵn sàng. Chỉ khởi tạo animation trong các component cần tương tác.
- Tối ưu ảnh AVIF/WebP và kích thước theo thiết bị. Ưu tiên ảnh đầu trang; tải muộn ảnh, video và phần tương tác bên dưới.
- Đo kích thước sau khi font/ảnh ổn định, cập nhật lại khi resize; cleanup animation khi chuyển trang. Ưu tiên transform/opacity và giữ chỗ cho ảnh để giảm nhảy bố cục.

## 7. Thứ tự thực hiện và tiêu chí hoàn thành

| Giai đoạn | Công việc | Đầu ra |
|---|---|---|
| 1. Kiểm kê | Đọc trang con, gom ảnh/logo, rà số liệu, CTA và thông tin mùa | Bảng nội dung, danh sách tài sản, dữ liệu đã đánh dấu nguồn |
| 2. Storyboard | Thiết kế bảy chương ở desktop và mobile, chọn type scale và màu | Bộ khung hình thể hiện bố cục, nội dung và trạng thái trước/sau chuyển cảnh |
| 3. Prototype motion | Làm trước Hero → ESC → TEDx, thử chuyển cảnh và thao tác menu | Prototype cuộn dùng để đánh giá nhịp đọc, độ rõ nhận diện và trải nghiệm điện thoại |
| 4. Hoàn thiện | Ghép đủ dự án, ảnh, dữ liệu mùa, Join us và Contact | Website có nội dung đầy đủ và các trạng thái cần thiết |
| 5. Kiểm tra | Rà luồng đọc, bàn phím, reduced motion, link và hiệu năng | Bản sẵn sàng xem xét xuất bản |

Tiêu chí kiểm tra đề xuất:

- Hero và CTA hiển thị trọn vẹn trên laptop 1366×768; nội dung không bị cắt trên các kích thước mobile phổ biến.
- Người dùng đi thẳng tới ESC, TEDx hoặc liên hệ bằng menu, và quay lại được bằng thao tác cuộn bình thường.
- Tên, nội dung và liên kết của cả bảy dự án đều tìm thấy được, kể cả khi animation bị tắt.
- Chuột, trackpad, cảm ứng và bàn phím đều dùng được; mức phóng to 200% không làm mất nội dung.
- Độ tương phản chữ và nút đạt yêu cầu tiếp cận tương ứng; logo vẫn dùng đúng tài sản thương hiệu.
- Mục tiêu hiệu năng triển khai: LCP ≤ 2,5 giây, INP ≤ 200 ms, CLS ≤ 0,1; đây là mục tiêu cần đo, chưa phải kết quả của một website đã xây dựng.
- Kiểm tra cả giao diện sáng và tối nếu phát hành cả hai, cùng các trạng thái đang mở/đã đóng/chưa công bố của sự kiện.

Phạm vi kế hoạch hiện tại là thiết kế và xây dựng bản xem trước. Quyết định xuất bản được thực hiện sau khi có giao diện và nội dung cụ thể để xem xét.
