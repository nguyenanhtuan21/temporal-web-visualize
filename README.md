# Temporal Flow

Ứng dụng web hiện đại giúp trực quan hóa (visualize) và theo dõi các workflow của Temporal dưới dạng biểu đồ logic (Logical Graph) và bảng lịch sử chi tiết.

<div align="center">
  <img src="/client/public/vite.svg" alt="Logo" width="80" height="80" />
</div>

## 🌟 Tính năng nổi bật

-   **Dashboard Hiện đại**: Tìm kiếm thông minh và xem danh sách Workflow với trạng thái trực quan.
-   **Logical Graph (Biểu đồ Logic)**: 
    -   Thay vì hiển thị hàng trăm event rời rạc, ứng dụng gom nhóm chúng thành các **Logical Node** (Workflow, Activity, Timer).
    -   Dễ dàng hình dung luồng đi của dữ liệu và thứ tự thực thi.
    -   Hiển thị thông tin quan trọng: Duration, Status, Queue Name ngay trên Node.
-   **History Table**: Chế độ xem bảng chi tiết cho những ai muốn debug sâu từng sự kiện.
-   **Node Details**: Sidebar hiển thị JSON Raw của input/output/result khi click vào bất kỳ node nào.
-   **Chrome Extension**: Tích hợp nút bấm "Open in Flow" ngay trên giao diện Temporal Cloud/Local.

## 🛠 Yêu cầu hệ thống

-   **Node.js**: v18 trở lên.
-   **Temporal Server**: Đang chạy (Localhost hoặc Cloud).
-   **Temporal Web UI**: Để server có thể fetch dữ liệu API (cần truy cập được port HTTP, ví dụ 8080 hoặc 8233).

## 🚀 Hướng dẫn Cài đặt & Chạy

Hệ thống gồm 2 thành phần: **Server** (Backend Proxy) và **Client** (Frontend React). Bạn cần chạy song song cả hai.

### Phân hệ 1: Server (Backend)

Server này đóng vai trò Proxy để gọi Temporal API và xử lý CORS.

1.  Di chuyển vào thư mục server:
    ```bash
    cd server
    ```
2.  Cài đặt dependencies:
    ```bash
    npm install
    ```
3.  Cấu hình kết nối:
    Mở file `.env` (hoặc tạo mới) và cấu hình địa chỉ Temporal Web UI của bạn (Lưu ý: đây là port Web HTTP, không phải port GRPC 7233):
    ```env
    # Ví dụ nếu Temporal Web chạy ở localhost:8080
    TEMPORAL_ENDPOINT=localhost:8080
    ```
4.  Chạy Server:
    ```bash
    npm run dev
    ```
    ✅ Server sẽ lắng nghe tại `http://localhost:7531`.

### Phân hệ 2: Client (Frontend)

Giao diện người dùng được xây dựng bằng React + Vite + React Flow.

1.  Mở terminal mới, di chuyển vào thư mục client:
    ```bash
    cd client
    ```
2.  Cài đặt dependencies:
    ```bash
    npm install
    ```
3.  Chạy ứng dụng:
    ```bash
    npm run dev
    ```
    ✅ Truy cập ứng dụng tại `http://localhost:5173`.

## 📖 Hướng dẫn sử dụng

1.  **Truy cập**: Vào `http://localhost:5173`.
2.  **Tìm kiếm**:
    -   Nhập `WorkflowId` vào ô tìm kiếm.
    -   Hoặc để trống và nhấn **Search** để lấy danh sách các workflow gần nhất.
3.  **Xem chi tiết**:
    -   Click vào một dòng Workflow để mở trang chi tiết.
    -   Mặc định bạn sẽ thấy **Graph View**.
    -   Sử dụng nút Toggle góc trên phải để chuyển sang **History Table**.
4.  **Debug**:
    -   Click vào một Node trên biểu đồ để xem Input/Output/Result trong Sidebar bên phải.

## 🧩 Cài đặt Chrome Extension (Tùy chọn)

Giúp mở nhanh Workflow đang xem trên Temporal Web UI sang Temporal Flow.

1.  Mở Chrome, truy cập `chrome://extensions`.
2.  Bật chế độ **Developer mode** (góc trên phải).
3.  Bấm **Load unpacked** và chọn thư mục `chrome-extension` trong source code này.
4.  Bây giờ khi vào trang chi tiết workflow trên Temporal Web, bạn sẽ thấy nút **"Flow View"**.

## 🏗 Công nghệ sử dụng

-   **Frontend**: React, TypeScript, Vite.
-   **UI/UX**: TailwindCSS, Shadcn/UI, Lucide Icons.
-   **Visualization**: React Flow, Dagre (Auto Layout).
-   **State Management**: TanStack Query (React Query).
-   **Backend**: Express, Temporal Client SDK.
