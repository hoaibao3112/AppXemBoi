<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# QUY TRÌNH PHÁT TRIỂN PHẦN MỀM BẮT BUỘC (MANDATORY DEVELOPMENT WORKFLOW)

Mọi tác nhân AI khi làm việc trên dự án này **PHẢI** tuân thủ nghiêm ngặt quy trình 9 bước dưới đây. Trước khi thực hiện bất kỳ hành động nào hoặc đề xuất code mới, AI phải xác định rõ mình đang ở bước nào và báo cáo tiến độ cho người dùng.

## 9 Bước Quy Trình Code Chi Tiết:

### Bước 1: Nhận task và Viết Implementation Plan
- AI nhận yêu cầu từ người dùng, tiến hành phân tích hệ thống.
- Viết hoặc cập nhật file `implementation_plan.md` chi tiết (mục tiêu, các file bị ảnh hưởng, thiết kế).
- **Cấm tự ý sửa code** khi chưa có plan được người dùng duyệt (trừ phi đó là hotfix cực nhỏ dưới 5 phút).

### Bước 2: Viết Unit Test theo nghiệp vụ
- Dựa trên plan nghiệp vụ, AI viết các unit test bao phủ các case thành công và thất bại trước khi viết code logic.
- Giữ nguyên các test case nghiệp vụ đã có trong dự án, chỉ bổ sung hoặc cập nhật cho đúng nghiệp vụ mới.

### Bước 3: Code Logic
- Tiến hành viết code logic trong source code để hiện thực hóa tính năng theo đúng thiết kế của plan.

### Bước 4: Chạy Unit Test đến khi pass hết
- Chạy unit test của module đang làm và các unit test liên quan.
- Nếu test fail, tiến hành sửa code logic cho đến khi toàn bộ test pass 100%. Giữ nguyên các test case nghiệp vụ.

### Bước 5: Chạy `git diff --stat` & Đối chiếu, Cập nhật Plan
- Chạy lệnh `git diff --stat` (hoặc kiểm tra các file đã chỉnh sửa).
- Đối chiếu danh sách các file thực tế đã sửa với danh sách file dự kiến trong `implementation_plan.md`.
- Nếu có sự sai lệch (ví dụ: sửa thêm file khác ngoài dự kiến, thay đổi logic thiết kế ban đầu), AI **phải** cập nhật lại `implementation_plan.md` cho khớp thực tế và giải thích lý do cho người dùng.

### Bước 6: Viết & Chạy ít nhất 1 Integration Test
- Thiết kế và viết ít nhất 1 integration test (kiểm thử tích hợp end-to-end) cho luồng nghiệp vụ chính của task vừa làm.
- Chạy và đảm bảo integration test này pass thành công.

### Bước 7: AI Review & Nhờ AI khác review (Cross-Review)
- AI thực hiện tự review lại code thực tế (đọc trực tiếp nội dung các file đã chỉnh sửa, không chỉ đọc plan).
- Nếu `git diff` cho thấy có chỉnh sửa chạm vào các file "ngoài phạm vi ban đầu", AI **phải** chủ động đọc các file bị ảnh hưởng đó để đánh giá tác động lan truyền.
- **BẮT BUỘC:** AI phải nhắc nhở người dùng:
  > [!IMPORTANT]
  > Quy trình yêu cầu bạn cần nhờ một AI khác review lại code thực tế này (ví dụ: đưa code/diff cho Claude 3.5 Sonnet) để đảm bảo chất lượng kiểm thử độc lập trước khi deploy.

### Bước 8: Sửa lỗi từ Review (nếu có)
- Nếu quá trình review phát hiện lỗi hoặc điểm chưa tối ưu, AI đưa ra giải pháp/prompt sửa lỗi -> tiến hành fix -> quay lại **Bước 4** (chạy lại test).

### Bước 9: Tạo Checklist thủ công trước khi Deploy
- AI biên soạn một checklist thủ công ngắn gọn về các phần bị chạm gián tiếp (ví dụ: các luồng cũ dùng chung schema/regex, các api, các cấu hình dùng chung) để người dùng kiểm tra nhanh bằng tay trước khi deploy.

---

## Chỉ Thị Thực Thi Cứng Cho AI:
1. **Báo cáo trạng thái:** Trong mỗi phản hồi, AI phải ghi rõ tiêu đề ở đầu câu trả lời: `[Tiến độ: Bước X/9 - Tên Bước]` để người dùng biết đang ở đâu trong quy trình.
2. **Cảnh báo thiếu bước:** Nếu AI hoặc người dùng có xu hướng bỏ qua bước nào (ví dụ: chưa chạy unit test hoặc chưa viết integration test mà đã đòi deploy hoặc hoàn thành task), AI **phải dừng lại** và thông báo ngay cho người dùng: *"Tôi phát hiện chúng ta đang thiếu Bước X trong quy trình. Hãy hoàn thành Bước X trước khi tiếp tục."*
