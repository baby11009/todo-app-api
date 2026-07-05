# Todo API — Express + TypeScript + Mongoose + MongoDB Atlas

Backend cho ứng dụng Todo List, cung cấp đầy đủ API cho các chức năng: liệt kê (có tìm kiếm/lọc/sắp xếp/phân trang), thêm, sửa, xoá, đánh dấu hoàn thành.

## 1. Cài đặt

```bash
npm install
cp .env.example .env
```

Mở file `.env` vừa tạo và điền connection string MongoDB Atlas của bạn (xem hướng dẫn bên dưới).

## 2. Lấy connection string từ MongoDB Atlas

1. Đăng nhập [MongoDB Atlas](https://cloud.mongodb.com), tạo một **Cluster** (dùng tier free M0 là đủ cho project này).
2. Vào **Database Access** → tạo một Database User (username/password) — nhớ lưu lại mật khẩu.
3. Vào **Network Access** → **Add IP Address** → chọn "Allow access from anywhere" (`0.0.0.0/0`) cho môi trường dev, hoặc thêm IP cụ thể cho production.
4. Vào **Database** → nhấn **Connect** trên cluster → chọn **Drivers** → copy connection string dạng:
   ```
   mongodb+srv://<username>:<password>@<cluster-url>/?retryWrites=true&w=majority&appName=...
   ```
5. Dán vào `MONGODB_URI` trong `.env`, thay `<username>`, `<password>` bằng thông tin ở bước 2, và thêm tên database vào sau `.net/` (ví dụ `.../todo_app?retryWrites=...`).

Ví dụ `.env` hoàn chỉnh:
```
PORT=5000
MONGODB_URI=mongodb+srv://todoUser:MatKhauCuaBan@cluster0.abcde.mongodb.net/todo_app?retryWrites=true&w=majority&appName=todo-app
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
```

## 3. Chạy dự án

```bash
# Chạy dev (tự reload khi sửa code)
npm run dev

# Build sang JS thuần
npm run build

# Chạy bản đã build
npm start
```

Server mặc định chạy tại `http://localhost:5000`. Kiểm tra nhanh: `GET http://localhost:5000/health`.

## 4. Cấu trúc thư mục

```
src/
├─ config/db.ts               # Kết nối MongoDB Atlas qua Mongoose
├─ models/Todo.model.ts       # Schema + Model Mongoose cho Todo
├─ types/todo.types.ts        # Kiểu dữ liệu dùng chung (DTO, query, pagination...)
├─ controllers/todo.controller.ts  # Xử lý logic từng API
├─ routes/todo.routes.ts      # Khai báo route + gắn middleware validate
├─ middlewares/
│  ├─ validate.ts             # Middleware validate body/params/query bằng Zod
│  ├─ errorHandler.ts         # Bắt lỗi tập trung, trả JSON đồng nhất
│  └─ notFound.ts             # Xử lý route không tồn tại
├─ utils/
│  ├─ ApiError.ts             # Lớp lỗi tuỳ chỉnh có statusCode
│  ├─ asyncHandler.ts         # Bọc async controller để tự next(error)
│  ├─ toTodoDTO.ts            # Chuyển Mongoose document -> object trả về client
│  └─ todo.validators.ts      # Zod schema cho từng loại request
├─ app.ts                     # Cấu hình Express (middleware, route, cors)
└─ server.ts                  # Entry point: load .env, connect DB, start server
```

## 5. Danh sách API

Base URL: `http://localhost:5000/api/todos`

Mọi response đều có dạng:
```json
{ "success": true, "data": ... }
```
hoặc khi lỗi:
```json
{ "success": false, "message": "...", "details": [...] }
```

### GET `/api/todos` — Danh sách công việc (tìm kiếm, lọc, sắp xếp, phân trang)

Query params (tất cả đều optional):

| Param    | Giá trị                                  | Mặc định  |
|----------|-------------------------------------------|-----------|
| `status` | `all` \| `active` \| `completed`          | `all`     |
| `search` | chuỗi tìm theo tên/mô tả                  | —         |
| `sort`   | `newest` \| `oldest` \| `az` \| `za`      | `newest`  |
| `page`   | số trang, bắt đầu từ 1                    | `1`       |
| `limit`  | số item/trang (tối đa 50)                 | `5`       |

Ví dụ:
```
GET /api/todos?status=active&search=báo cáo&sort=az&page=1&limit=5
```

Response:
```json
{
  "success": true,
  "data": [
    { "id": "665f...", "title": "Hoàn thành báo cáo", "description": "...", "completed": false, "createdAt": 1719999999999, "updatedAt": 1719999999999 }
  ],
  "pagination": { "page": 1, "limit": 5, "totalItems": 12, "totalPages": 3 },
  "stats": { "total": 12, "active": 7, "completed": 5 }
}
```

### GET `/api/todos/:id` — Chi tiết một công việc

### POST `/api/todos` — Thêm công việc mới

Body:
```json
{ "title": "Hoàn thành báo cáo tuần", "description": "Gửi trước 17h thứ 6" }
```
Validate: `title` bắt buộc, 3–100 ký tự; `description` tối đa 300 ký tự (tuỳ chọn).

### PUT `/api/todos/:id` — Sửa tên/mô tả công việc

Body giống POST (có thể gửi từng phần).

### PATCH `/api/todos/:id/toggle` — Đánh dấu hoàn thành / chưa hoàn thành

Không cần body — API tự đảo trạng thái `completed` hiện tại.

### DELETE `/api/todos/:id` — Xoá công việc

### GET `/api/todos/stats` — Thống kê nhanh (tổng/chưa xong/đã xong)

## 6. Kết nối với frontend React

Trong project frontend, thay các thao tác CRUD trong `TodoContext` bằng gọi API tới base URL này (ví dụ dùng `fetch`/`axios`), đồng thời truyền `search`, `filter`, `sort`, `page` hiện tại thành query params cho `GET /api/todos`. Nhớ cấu hình `CLIENT_ORIGIN` trong `.env` của backend đúng domain frontend đang chạy để không bị chặn CORS.
