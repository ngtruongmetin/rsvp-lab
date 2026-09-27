Dùng prompt này cho Codex:

```text
Bạn hãy xây dựng một website đọc RSVP mới hoàn toàn từ đầu trong thư mục hiện tại. Không tái sử dụng kiến trúc room/session/adaptive/checkpoint của source RSVP Lab cũ, vì sản phẩm mới đơn giản hơn.

## Mục tiêu sản phẩm

Đây là nền tảng luyện đọc nhanh bằng RSVP.

Người dùng phải đăng ký và đăng nhập trước khi sử dụng. Sau khi đăng nhập, họ xem danh sách văn bản, chọn văn bản đã được mở khóa, cấu hình WPM và mức RSVP, đọc văn bản, sau đó trả lời câu hỏi tổng kết.

Admin có thể đăng nhập, đăng văn bản, cấu hình mức yêu cầu của văn bản, thêm câu hỏi và xem kết quả người dùng.

## Quy tắc mở khóa cấp độ

Mỗi văn bản có một `required_level` từ 1 đến 4.

- Văn bản level 1: mở khóa mặc định.
- Văn bản level 2: chỉ mở khóa sau khi người dùng hoàn thành đủ điều kiện ở level 1.
- Văn bản level 3: chỉ mở khóa sau khi người dùng hoàn thành đủ điều kiện ở level 2.
- Văn bản level 4: chỉ mở khóa sau khi người dùng hoàn thành đủ điều kiện ở level 3.

Mặc định, điều kiện hoàn thành một level là:

- Đã hoàn thành ít nhất một văn bản ở level trước.
- Đã đọc RSVP đến cuối văn bản.
- Đã trả lời toàn bộ câu hỏi.
- Điểm đúng tối thiểu 70%.

Hãy thiết kế logic mở khóa ở backend, không chỉ kiểm tra ở frontend. Người dùng không được gọi API trực tiếp để đọc văn bản bị khóa.

Nên cho phép admin thay đổi ngưỡng điểm tối thiểu sau này, nhưng MVP có thể dùng giá trị mặc định 70%.

## 4 mức RSVP

Mỗi session đọc có một `rsvp_level`:

- Level 1: hiển thị 1 từ mỗi lần.
- Level 2: hiển thị 2 từ mỗi lần.
- Level 3: hiển thị 5 từ mỗi lần.
- Level 4: hiển thị 1 câu mỗi lần.

WPM là tốc độ hiển thị do người dùng chọn.

Công thức thời gian:

```text
duration_ms = word_count / wpm * 60000
```

Ví dụ:

- 300 WPM
- chunk có 2 từ
- thời gian hiển thị = 400ms

Level 4 phải tách văn bản thành câu. Có thể xử lý bằng tokenizer đơn giản ở backend hoặc frontend. Không cần semantic chunk, checkpoint hoặc adaptive progression.

## Luồng người dùng

### Landing page

Tạo landing page theo phong cách Y2K Neo Brutalist, có:

- Logo/tên sản phẩm.
- Mô tả ngắn.
- CTA Đăng ký.
- CTA Đăng nhập.
- Giải thích ngắn gọn RSVP.
- Preview giao diện reader.
- Responsive tốt trên desktop và mobile.

### Authentication

Tạo:

- Đăng ký bằng email, username và password.
- Đăng nhập.
- Đăng xuất.
- Route protection.
- Password hash ở backend.
- Session hoặc JWT.
- User role: `user` và `admin`.

### User dashboard

Sau khi đăng nhập, hiển thị:

- Level hiện tại.
- Tiến trình mở khóa.
- Danh sách văn bản.
- Văn bản đã mở khóa.
- Văn bản bị khóa.
- Điểm cao nhất.
- Số văn bản đã hoàn thành.
- WPM gần đây.

Mỗi văn bản cần hiển thị:

- Tiêu đề.
- Mô tả.
- Độ dài.
- Required level.
- Trạng thái unlocked/locked/completed.
- Điểm cao nhất.
- Nút Bắt đầu hoặc Đã khóa.

### Reading setup

Trước khi đọc:

- Chọn WPM bằng input hoặc preset.
- Chọn RSVP level từ 1 đến 4.
- Chỉ cho chọn các mức phù hợp với văn bản đã mở khóa.
- Hiển thị thời lượng ước tính.
- Hiển thị số từ và số câu.
- Nút bắt đầu.

### RSVP reader

Reader cần:

- Hiển thị chunk lớn ở giữa màn hình.
- Không hiển thị toàn bộ văn bản cùng lúc.
- Pause/resume.
- Restart.
- Thanh tiến trình.
- Hiển thị WPM.
- Hiển thị RSVP level.
- Hiển thị số chunk hiện tại.
- Keyboard shortcuts:
  - Space: pause/resume.
  - Escape: thoát.
- Khi đọc xong, chuyển sang trang câu hỏi.
- Lưu tiến trình cơ bản để refresh không làm mất session.

Không có checkpoint question trong khi đọc.

### Questions

Sau khi đọc xong:

- Hiển thị toàn bộ câu hỏi của văn bản.
- Mỗi câu có 4 đáp án.
- Người dùng phải trả lời toàn bộ.
- Backend chấm điểm.
- Không hiển thị đáp án đúng trước khi submit.
- Có thể cho phép sửa đáp án trước khi nộp.
- Sau khi submit, lưu kết quả.

### Result page

Hiển thị:

- Điểm số.
- Số câu đúng/tổng số câu.
- WPM.
- RSVP level.
- Thời gian đọc.
- Trạng thái pass/fail.
- Level tiếp theo có được mở khóa hay chưa.
- Nút đọc văn bản khác.
- Nút xem dashboard.

## Admin

Tạo admin dashboard riêng với:

- Tổng số người dùng.
- Tổng số văn bản.
- Số session đọc.
- Tỷ lệ hoàn thành.
- Điểm trung bình.
- Danh sách văn bản.

Admin quản lý văn bản:

- Tạo văn bản.
- Sửa tiêu đề.
- Sửa mô tả.
- Sửa nội dung.
- Chọn `required_level` 1-4.
- Publish/unpublish.
- Xóa văn bản.

Admin quản lý câu hỏi:

- Thêm câu hỏi.
- Sửa câu hỏi.
- Xóa câu hỏi.
- Chọn đáp án đúng.
- Sắp xếp thứ tự.

Admin xem kết quả:

- Người dùng.
- Văn bản.
- WPM.
- RSVP level.
- Điểm.
- Thời gian hoàn thành.
- Trạng thái pass/fail.

## Database

Thiết kế database đơn giản, gồm tối thiểu:

```text
users
- id
- email
- username
- password_hash
- role
- created_at

documents
- id
- title
- description
- content
- required_level
- status
- created_at
- updated_at

questions
- id
- document_id
- question_text
- option_a
- option_b
- option_c
- option_d
- correct_option
- order_index

reading_sessions
- id
- user_id
- document_id
- rsvp_level
- wpm
- status
- started_at
- completed_at
- reading_duration_ms
- score
- passed

answers
- id
- session_id
- question_id
- selected_option
- is_correct
- response_time_ms
```

Có thể thêm bảng `user_progress` nếu cần để quản lý việc mở khóa. Tuy nhiên backend phải kiểm tra tiến trình từ dữ liệu session, không tin dữ liệu do frontend gửi lên.

## API

Tạo API rõ ràng:

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout

GET  /api/documents
GET  /api/documents/:id
GET  /api/documents/:id/access

POST /api/sessions
GET  /api/sessions/:id
POST /api/sessions/:id/progress
POST /api/sessions/:id/complete
POST /api/sessions/:id/answers
POST /api/sessions/:id/submit

GET /api/me/progress
GET /api/me/history
GET /api/me/stats

GET    /api/admin/documents
POST   /api/admin/documents
PATCH  /api/admin/documents/:id
DELETE /api/admin/documents/:id

GET    /api/admin/documents/:id/questions
POST   /api/admin/documents/:id/questions
PATCH  /api/admin/questions/:id
DELETE /api/admin/questions/:id

GET /api/admin/analytics
```

## Thiết kế giao diện

Phong cách bắt buộc: Y2K Neo Brutalist.

- Border đen dày.
- Shadow cứng, không blur.
- Màu nền sáng.
- Màu nhấn cyan, lime, pink, orange.
- Typography mạnh, đậm, có tính editorial.
- Góc bo rất nhỏ hoặc không bo.
- Button lớn, có icon.
- Card chỉ dùng cho item lặp lại, không lồng card trong card.
- Không dùng gradient hiện đại kiểu SaaS.
- Không dùng layout landing page chung chung.
- Reader phải tập trung và dễ đọc.
- Responsive mobile-first.
- Có focus state và keyboard accessibility.
- Dùng icon library hiện có hoặc Lucide nếu cần.

## Yêu cầu kỹ thuật

- Đọc source hiện tại trước để hiểu môi trường, nhưng triển khai kiến trúc mới sạch.
- Giữ frontend và backend tách biệt rõ ràng.
- Không đưa đáp án đúng xuống client trước khi người dùng submit.
- Validate quyền truy cập ở backend.
- Validate dữ liệu đầu vào.
- Hash password đúng cách.
- Không lưu password plain text.
- Có loading, error, empty và success states.
- Có seed admin và dữ liệu demo.
- Viết migration/schema database.
- Viết test cho:
  - Đăng ký/đăng nhập.
  - Văn bản bị khóa.
  - Mở khóa level tiếp theo.
  - Tạo session.
  - Chấm điểm.
  - Không thể submit câu hỏi của session khác.
- Chạy build, lint và test trước khi hoàn tất.

## Cách làm việc

Trước khi code:

1. Kiểm tra cấu trúc repo.
2. Đề xuất cấu trúc mới ngắn gọn.
3. Xác định file nào sẽ tạo mới hoặc thay thế.
4. Sau đó triển khai đầy đủ, không để placeholder hoặc TODO giả.

Sau khi code:

1. Chạy backend.
2. Chạy frontend.
3. Kiểm tra các route chính.
4. Sửa lỗi build/type/test.
5. Báo cáo các file đã thay đổi và lệnh chạy dự án.
```

Điểm quan trọng nhất trong prompt này là việc “mở khóa level” phải được kiểm tra ở backend. Frontend chỉ hiển thị trạng thái; không được tự quyết định người dùng có quyền đọc văn bản hay chưa.