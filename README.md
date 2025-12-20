<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description
🛡️ Báo Cáo Thực Nghiệm Bảo Mật & Hiệu Năng (Security & Performance Report)
Dự án: Bookshelf API Công nghệ: NestJS, PostgreSQL, TypeORM, Cloudflare

Tài liệu này ghi lại các biện pháp bảo mật đã được triển khai, quy trình kiểm thử (Penetration Testing) và kết quả thực tế để bảo vệ hệ thống khỏi các cuộc tấn công phổ biến.

📑 Mục lục
Chống tấn công từ chối dịch vụ (DDoS Protection)

Thực nghiệm SQL Injection

Các biện pháp bảo mật khác (Future Roadmap)

1. Chống tấn công từ chối dịch vụ (DDoS Protection)
🔒 Giải pháp: Cloudflare WAF (Web Application Firewall)
Hệ thống sử dụng Cloudflare làm lớp lá chắn đầu tiên để lọc lưu lượng truy cập trước khi đến Server gốc (Render).

Cấu hình WAF:

Rule Name: Challenge Non-VN (Hoặc Block Foreign IP).

Cơ chế: Chặn hoặc yêu cầu xác thực (Managed Challenge) đối với tất cả các IP không đến từ Việt Nam.

Mục đích: Ngăn chặn các Botnet quốc tế và giảm tải cho Server.

💥 Công cụ kiểm thử: Loader.io
Sử dụng Loader.io để giả lập tấn công (Stress Test) từ các Server tại Mỹ.

Cấu hình tấn công:

Mode: Clients per second (Mô phỏng DDoS).

Load: 50 - 250 request/giây.

Target: https://api.zenly.id.vn.

📊 Kết quả Demo
Khi bật WAF Rule, hệ thống chặn thành công phần lớn lưu lượng tấn công từ Loader.io.

Tỷ lệ lỗi (Error Rate): ~71% (Đây là kết quả tốt, thể hiện số lượng request bị chặn).

Mã phản hồi: Chủ yếu là 403 Forbidden (Cloudflare chặn) thay vì 200 OK hoặc 500 Server Error.

![Biểu đồ Loader.io](bieudoDD.jpg)

2. Thực nghiệm SQL Injection
Đã thực hiện dựng lại hiện trường lỗ hổng SQL Injection để hiểu rõ cơ chế tấn công và cách phòng chống.

🧪 Kịch bản kiểm thử
Mục tiêu là tấn công vào API tìm kiếm sách để lấy toàn bộ dữ liệu database thay vì một quyển sách cụ thể.

Endpoint: GET /books

Param: name (hoặc title)

❌ Code Lỗ hổng (Vulnerable Code)
Sử dụng nối chuỗi trực tiếp (String Concatenation) tạo điều kiện cho hacker chèn mã độc.

TypeScript

// books.service.ts
async findAll(name: string) {
  // Lỗi bảo mật nghiêm trọng: Cộng chuỗi trực tiếp
  const sql = `
    SELECT * FROM books
    WHERE books.name = '${name}' 
    ORDER BY books."createdAt" DESC
  `;
  return this.bookRepository.query(sql);
}
💣 Phương thức tấn công (Payload)
Hacker sử dụng kỹ thuật "Always True" (Luôn đúng) để vô hiệu hóa bộ lọc.

URL Tấn công:

/books?name=abc' OR '1'='1
Câu lệnh SQL thực tế chạy trong Database:

SQL

SELECT * FROM books WHERE books.name = 'abc' OR '1'='1' ...
Kết quả: API trả về TOÀN BỘ DANH SÁCH SÁCH thay vì rỗng.
![SQL Injection](SQL_IJ.jpg)
📷 [Chèn ảnh Postman/Trình duyệt hiện full danh sách sách khi hack tại đây]

✅ Code An toàn (Secure Code)
Sử dụng cơ chế Parameter Binding của TypeORM hoặc thư viện Database Driver để tự động xử lý ký tự đặc biệt.

TypeScript

// books.service.ts (Fixed)
async findAll(name: string) {
  // Sử dụng TypeORM Query Builder hoặc Find Options
  return this.bookRepository.find({
    where: { name: name } // An toàn tuyệt đối
  });
}
Kết quả sau khi fix: Nếu nhập Payload tấn công, hệ thống sẽ tìm quyển sách có tên đúng y hệt như payload => Trả về rỗng (An toàn).

3. Các biện pháp bảo mật khác
Hệ thống đang tiếp tục được nâng cấp với các tiêu chuẩn bảo mật sau:

SSL/TLS (HTTPS): Đã kích hoạt qua Cloudflare (Hiển thị ổ khóa an toàn, chống nghe lén Man-in-the-Middle).

CORS: Cấu hình chặt chẽ chỉ cho phép domain Frontend (zenly.id.vn) được gọi API.

Rate Limiting: Giới hạn số lượng request/phút từ 1 IP để chống spam từ nội địa.

XSS: loại bỏ các script khi người dùng cố ý nhập 1 dãy script