# Script Cập Nhật Vé Đã Sử Dụng

## Mô tả
Script này tự động kiểm tra và cập nhật trạng thái vé từ `confirmed` sang `used` khi suất chiếu đã qua thời gian.

## Cách sử dụng

### 1. Chạy thủ công
```bash
npm run update-used-tickets
```

### 2. Setup Cron Job (Linux/Mac)
Chạy script mỗi 5 phút:
```bash
# Mở crontab
crontab -e

# Thêm dòng sau (chạy mỗi 5 phút)
*/5 * * * * cd /path/to/your/project && npm run update-used-tickets

# Hoặc mỗi 10 phút
*/10 * * * * cd /path/to/your/project && npm run update-used-tickets
```

### 3. Windows Task Scheduler
1. Mở Task Scheduler
2. Create Basic Task
3. Set trigger: Every 5 minutes
4. Action: Start a program
5. Program: `node`
6. Arguments: `scripts/update-used-tickets.js`
7. Start in: `C:\Users\Admin\CascadeProjects\nextjs-dashboard`

## Logic hoạt động
1. Tìm tất cả vé có:
   - `status = 'confirmed'`
   - `payment_status = 'paid'`
   - `is_deleted = false`
   - `slots.show_time < now` (đã qua thời gian chiếu)

2. Cập nhật các vé tìm thấy thành:
   - `status = 'used'`
   - `note = 'Tự động cập nhật: Đã sử dụng...'`

## Logging
Script sẽ log:
- Số lượng vé cần cập nhật
- Chi tiết từng vé đã cập nhật (mã vé, phim, thời gian)
- Lỗi nếu có

## Lưu ý
- Script cần database connection string trong `.env`
- Chạy với user có quyền truy cập database
- Không ảnh hưởng đến vé đã hủy hoặc chưa thanh toán
