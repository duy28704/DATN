# NEXUS Tech - Premium Modern Tech E-Commerce Platform

NEXUS Tech là nền tảng thương mại điện tử chuyên cung cấp thiết bị công nghệ cao cấp bậc nhất. Dự án được thiết kế với phong cách Glassmorphism hiện đại, tông màu tối ưu tối giản sang trọng kết hợp màu đỏ Neon phản quang (`#ff003c`) cùng các hiệu ứng động mượt mà bằng thư viện Framer Motion.

Tài liệu này cung cấp toàn bộ chi tiết kiến trúc dự án, các tính năng chính, bộ quy tắc xác thực (validation) dữ liệu và hướng dẫn vận hành/phát triển.

---

## 🚀 Các Tính Năng Cốt Lõi

### 1. Hệ Thống Trả Góp Phong Cách VinFast
Trang **Dịch vụ Trả góp** (`Installments`) được mô phỏng chi tiết theo bảng tính toán tài chính xe của VinFast:
- **Cấu hình động**: Cho phép người dùng chọn sản phẩm công nghệ, kéo thả % số tiền trả trước (20% - 80%), và chọn kỳ hạn vay linh hoạt (6, 12, 18, 24, 36 tháng).
- **Gói vay ưu đãi tài chính**: Hỗ trợ 3 gói vay (Niên kim cố định, Dư nợ gốc giảm dần, và Gói trả góp 0% lãi suất của Techcombank).
- **So sánh ngân hàng hợp tác**: Tự động tính toán theo lãi suất của các đối tác lớn như *Techcombank (5.9%)*, *MB Bank (6.5%)*, *BIDV (6.9%)*, và *Vietcombank (7.2%)*.
- **Bảng khấu hao hàng tháng chi tiết**: Hiển thị bảng kê chi tiết số tiền gốc, tiền lãi, số tiền thanh toán hàng tháng và dư nợ cuối kỳ cho từng tháng trong suốt thời gian vay.
- **Form đăng ký nhận tư vấn**: Form đăng ký thông minh tự động điền sẵn thông tin khi tài khoản đã đăng nhập, liên kết trực tiếp với Database/API.

### 2. Dashboard Hồ Sơ Cá Nhân Đa Tab
Khu vực quản lý khách hàng sau khi đăng nhập được chia thành 3 chuyên mục chính:
- **Hồ sơ cá nhân**: Xem và cập nhật trực tiếp thông tin (Họ tên, SĐT nhận hàng, địa chỉ mặc định, ngày sinh, giới tính). Địa chỉ mặc định này sẽ được tự động điền khi thanh toán giỏ hàng.
- **Lịch sử đơn hàng**: Liệt kê mọi hóa đơn ảo đã giao dịch thành công. Mỗi đơn hàng hỗ trợ chức năng mở rộng để xem:
  - Chi tiết từng sản phẩm (ảnh, tên, màu sắc, số lượng, giá bán).
  - Thanh trạng thái tiến trình giao hàng (Đã đặt hàng -> Đang vận chuyển -> Đã giao hàng).
  - Thông tin người nhận và phương thức thanh toán tương ứng.
- **Yêu cầu trả góp**: Theo dõi tiến độ phê duyệt hồ sơ đăng ký tư vấn trả góp đã gửi đi (Trạng thái: Chờ duyệt, Đang thẩm định, Đã phê duyệt).

### 3. Thanh Toán Đa Phương Thức & Giỏ Hàng
Hộp thoại trượt slide-out của giỏ hàng tích hợp quy trình mua hàng trực quan:
- **COD**: Thanh toán tiền mặt khi nhận hàng kèm hướng dẫn chi tiết.
- **Thẻ Quốc Tế (Visa / Mastercard)**: Form nhập thông tin thẻ mô phỏng thực tế. Áp dụng thuật toán **Checksum Luhn** kiểm tra tính hợp lệ của số thẻ.
- **ATM Nội Địa / Internet Banking**: Lựa chọn danh sách ngân hàng lớn qua cổng Napas.
- **Ví Điện Tử (MoMo)**: Hiển thị mã QR Code mockup thanh toán tương thích hoàn hảo.

---

## 🛠️ Kiến Trúc Dữ Liệu & Bộ Xác Thực (Validation)

Toàn bộ các quy tắc logic nghiệp vụ và trao đổi dữ liệu với Server được đóng gói tập trung tại lớp dịch vụ [api.js](file:///d:/New%20folder%20(2)/src/services/api.js).

### 1. Bộ Quy Tắc Xác Thực (Validators)
Dự án áp dụng bộ quy tắc kiểm tra nghiêm ngặt cho từng hạng mục trước khi đẩy dữ liệu vào Database:
- **Email**: Phải tuân theo định dạng chuẩn (`name@example.com`).
- **Số điện thoại**: Định dạng 10 chữ số bắt đầu bằng đầu số di động Việt Nam (`03`, `05`, `07`, `08`, `09`).
- **Họ và tên**: Tối thiểu 2 ký tự, chỉ chứa chữ cái tiếng Việt và khoảng trắng, không chứa số hay ký tự đặc biệt.
- **Tuổi tác**: Bắt buộc người dùng phải từ **đủ 15 tuổi trở lên** mới được phê duyệt sửa hồ sơ cá nhân hoặc nộp đơn trả góp.
- **Địa chỉ**: Tối thiểu 10 ký tự để đảm bảo thông tin giao nhận rõ ràng.
- **Mật khẩu**: Tối thiểu 6 ký tự, bắt buộc chứa ít nhất 1 chữ cái và 1 chữ số để tăng bảo mật.
- **Thẻ tín dụng**: Áp dụng **thuật toán Luhn** kiểm tra checksum 16 số thẻ, bắt buộc định dạng ngày hết hạn `MM/YY` phải ở tương lai và mã CVC/CVV gồm đúng 3 chữ số.

### 2. Mock Database Engine (Dữ liệu mẫu)
Để nền tảng hoạt động trơn tru ngay cả khi không có kết nối Internet hoặc chưa dựng Server, chúng tôi đã xây dựng hệ thống Cơ sở dữ liệu ảo liên kết với `localStorage`:
- **Nạp sẵn tài khoản thử nghiệm**:
  - Email: `test@nexus.com` | Mật khẩu: `Password123` (Developer account)
  - Email: `vinfast@nexus.com` | Mật khẩu: `Vinfast2026`
- **So khớp mật khẩu đăng nhập**: Khi đăng nhập, API tìm tài khoản trong DB, thực hiện so sánh mật khẩu chính xác mới cấp quyền (nếu sai mật khẩu sẽ trả về lỗi tương ứng).
- **Đăng ký tài khoản mới**: Tài khoản đăng ký mới sẽ được lưu trực tiếp vào Mock DB của hệ thống và dùng để đăng nhập bình thường.
- **Đồng bộ hóa**: Khi bạn đặt hàng hoặc gửi hồ sơ trả góp, dữ liệu sẽ tự động gắn kèm với email tài khoản đang đăng nhập để hiển thị ngay lập tức trong trang Hồ sơ cá nhân.

---

## 💻 Công Nghệ Sử Dụng

- **Core**: React 19, JavaScript (ES6+).
- **Bundler**: Vite.
- **Styling**: Bootstrap 5 (CSS), Custom CSS Variables (tạo hệ thống giao diện cao cấp).
- **Hiệu ứng**: Framer Motion (chuyển đổi trang mượt mà, slide-out drawer, dropdown).
- **Biểu tượng (Icons)**: Lucide React.
- **Quản lý trạng thái**: React Context API (`AuthContext`, `CartContext`).

---

## 🛠️ Hướng Dẫn Cài Đặt & Chạy Dự Án

### 1. Cài đặt các gói phụ thuộc:
```bash
npm install
```

### 2. Khởi chạy môi trường phát triển (Local Server):
```bash
npm run dev
```
Sau đó truy cập theo đường dẫn hiển thị trên terminal (thông thường là `http://localhost:5173`).

### 3. Đóng gói mã nguồn cho sản xuất (Build):
```bash
npm run build
```
Bản dựng sẽ được xuất ra thư mục `/dist` tối ưu hóa dung lượng.

### 4. Kiểm tra cục bộ bản build:
```bash
npm run preview
```
