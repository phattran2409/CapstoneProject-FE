# Match Room Hub - Tài Liệu SignalR Events

## Tổng Quan

Hub giao tiếp thời gian thực cho phòng thi đấu với hỗ trợ chat chung và kênh riêng theo đội.

- **Hub URL:** `/hubs/matchroom`
- **Authentication:** Bắt buộc (JWT Bearer Token)
- **Protocol:** SignalR WebSocket

---

## Mục Lục

- [Vòng Đời Kết Nối](#vòng-đời-kết-nối)
- [Client to Server Methods](#client-to-server-methods)
- [Server to Client Events](#server-to-client-events)
- [Data Models](#data-models)
- [Channel Types](#channel-types)
- [Group Naming Convention](#group-naming-convention)
- [Complete Usage Examples](#complete-usage-examples)
- [Error Handling](#error-handling)
- [Security](#security)
- [Best Practices](#best-practices)

---

## Vòng Đời Kết Nối

### OnConnectedAsync

Tự động kích hoạt khi client kết nối đến hub.

**Behavior:**

- Ánh xạ user ID với connection ID để theo dõi
- Thiết lập kết nối đã xác thực
- Không cần gọi thủ công

**Internal Process:**

```csharp
// Tự động thực thi
_connectionMapping.Add(userId, Context.ConnectionId);
```

### OnDisconnectedAsync

Tự động kích hoạt khi client ngắt kết nối khỏi hub.

**Behavior:**

- Xóa ánh xạ kết nối
- Dọn dẹp dữ liệu kết nối người dùng
- Xử lý ngắt kết nối bình thường và bất thường

**Parameters:**

- `exception`: Đối tượng Exception nếu ngắt kết nối do lỗi (có thể null)

---

## Client to Server Methods

### 1. JoinRoomGroup

Tham gia phòng thi đấu và đăng ký các kênh chat của phòng.

**Method Name:** `JoinRoomGroup`

**Parameters:**

| Tên            | Kiểu          | Bắt buộc | Mô tả                                      |
| -------------- | ------------- | -------- | ------------------------------------------ |
| roomId         | Guid (string) | Có       | Định danh duy nhất của phòng               |
| teamAssignment | string        | Không    | Phân đội: "A", "B", hoặc null cho khán giả |

**What Happens:**

- Tham gia nhóm phòng chính cho các sự kiện cấp phòng
- Tham gia kênh chat chung (tất cả đều truy cập được)
- Tham gia kênh chat riêng theo đội nếu được phân đội
  - Thành viên Đội A tham gia kênh TeamA
  - Thành viên Đội B tham gia kênh TeamB
  - Khán giả chỉ có chat chung

**Response Event:** `JoinedRoom` (chỉ gửi cho người gọi)

**Response Payload:**

```json
{
  "RoomId": "550e8400-e29b-41d4-a716-446655440000",
  "TeamAssignment": "A",
  "UserId": "123e4567-e89b-12d3-a456-426614174000",
  "UserName": "JohnDoe"
}
```

**Example Invocation:**

```javascript
// Tham gia với vai trò thành viên Đội A
await connection.invoke(
  "JoinRoomGroup",
  "550e8400-e29b-41d4-a716-446655440000",
  "A",
);

// Tham gia với vai trò khán giả
await connection.invoke(
  "JoinRoomGroup",
  "550e8400-e29b-41d4-a716-446655440000",
  null,
);
```

---

### 2. LeaveRoomGroup

Rời khỏi phòng thi đấu và hủy đăng ký tất cả các kênh của phòng.

**Method Name:** `LeaveRoomGroup`

**Parameters:**

| Tên    | Kiểu          | Bắt buộc | Mô tả                                |
| ------ | ------------- | -------- | ------------------------------------ |
| roomId | Guid (string) | Có       | Định danh duy nhất của phòng cần rời |

**What Happens:**

- Xóa khỏi nhóm phòng chính
- Xóa khỏi kênh chat chung
- Xóa khỏi cả hai kênh chat đội (TeamA và TeamB)

**Response Event:** `LeftRoom` (chỉ gửi cho người gọi)

**Response Payload:**

```json
{
  "RoomId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Example Invocation:**

```javascript
await connection.invoke(
  "LeaveRoomGroup",
  "550e8400-e29b-41d4-a716-446655440000",
);
```

**Use Cases:**

- Người dùng rời trang phòng
- Người dùng chuyển sang phòng khác
- Dọn dẹp trước khi ngắt kết nối

---

### 3. SwitchTeamChat

Chuyển đổi giữa các kênh chat đội (cho người dùng đổi đội).

**Method Name:** `SwitchTeamChat`

**Parameters:**

| Tên               | Kiểu          | Bắt buộc | Mô tả                        |
| ----------------- | ------------- | -------- | ---------------------------- |
| roomId            | Guid (string) | Có       | Định danh duy nhất của phòng |
| newTeamAssignment | string        | Có       | Đội mới: "A" hoặc "B"        |

**What Happens:**

- Rời kênh chat TeamA hiện tại
- Rời kênh chat TeamB hiện tại
- Tham gia kênh chat của đội mới dựa trên newTeamAssignment

**Response Event:** `TeamChatSwitched` (chỉ gửi cho người gọi)

**Response Payload:**

```json
{
  "RoomId": "550e8400-e29b-41d4-a716-446655440000",
  "TeamAssignment": "B"
}
```

**Example Invocation:**

```javascript
// Chuyển từ Đội A sang Đội B
await connection.invoke(
  "SwitchTeamChat",
  "550e8400-e29b-41d4-a716-446655440000",
  "B",
);
```

**Notes:**

- Không ảnh hưởng đến đăng ký chat chung (vẫn đăng ký)
- Không ảnh hưởng đến đăng ký nhóm phòng chính
- Phân đội không hợp lệ sẽ bị bỏ qua

---

### 4. SendRoomMessage

Gửi tin nhắn chat đến một kênh phòng cụ thể.

**Method Name:** `SendRoomMessage`

**Parameters:**

| Tên         | Kiểu          | Bắt buộc | Mô tả                                  |
| ----------- | ------------- | -------- | -------------------------------------- |
| roomId      | Guid (string) | Có       | Định danh duy nhất của phòng           |
| channel     | int           | Có       | Loại kênh: 0=General, 1=TeamA, 2=TeamB |
| messageText | string        | Có       | Nội dung tin nhắn                      |

**What Happens:**

- Xác thực người dùng có quyền gửi đến kênh
- Lưu tin nhắn vào database qua lệnh MediatR
- Phát tin nhắn đến tất cả người dùng trong nhóm kênh
- Trả về lỗi nếu xác thực thất bại

**Success Response:** `ReceiveRoomMessage` (phát cho tất cả trong kênh)

**Error Response:** `Error` (chỉ gửi cho người gọi)

**Success Payload:** Xem ReceiveRoomMessage Event

**Error Payload:**

```json
{
  "Message": "You don't have permission to send messages to this channel"
}
```

**Example Invocation:**

```javascript
// Gửi đến chat chung
await connection.invoke("SendRoomMessage", roomId, 0, "Xin chào mọi người!");

// Gửi đến chat Đội A
await connection.invoke("SendRoomMessage", roomId, 1, "Tấn công từ bên trái");

// Gửi đến chat Đội B
await connection.invoke("SendRoomMessage", roomId, 2, "Phòng thủ khung thành!");
```

**Validation Rules:**

- Người dùng phải ở trong phòng (đã gọi JoinRoomGroup)
- Người dùng phải đăng ký kênh đích
- Nội dung tin nhắn không được rỗng
- Kênh đội yêu cầu phân đội phù hợp

---

### 5. GetRoomMessages

Lấy lịch sử tin nhắn phân trang cho một kênh cụ thể.

**Method Name:** `GetRoomMessages`

**Parameters:**

| Tên      | Kiểu          | Bắt buộc | Mặc định | Mô tả                                  |
| -------- | ------------- | -------- | -------- | -------------------------------------- |
| roomId   | Guid (string) | Có       | -        | Định danh duy nhất của phòng           |
| channel  | int           | Có       | -        | Loại kênh: 0=General, 1=TeamA, 2=TeamB |
| page     | int           | Không    | 1        | Số trang (bắt đầu từ 1)                |
| pageSize | int           | Không    | 50       | Số tin nhắn mỗi trang                  |

**What Happens:**

- Lấy lịch sử tin nhắn từ database
- Trả về kết quả phân trang
- Tin nhắn được sắp xếp theo SentAt giảm dần (mới nhất trước)

**Response Event:** `ReceiveRoomMessages` (chỉ gửi cho người gọi)

**Response Payload:**

```json
{
  "Items": [
    {
      "MessageId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "RoomId": "550e8400-e29b-41d4-a716-446655440000",
      "UserId": "123e4567-e89b-12d3-a456-426614174000",
      "UserName": "JohnDoe",
      "UserAvatar": "https://example.com/avatar.jpg",
      "Channel": 0,
      "MessageText": "Xin chào mọi người!",
      "SentAt": "2024-01-15T10:30:00Z",
      "IsEdited": false,
      "EditedAt": null
    }
  ],
  "Page": 1,
  "PageSize": 50,
  "TotalCount": 150,
  "TotalPages": 3,
  "HasPreviousPage": false,
  "HasNextPage": true
}
```

**Example Invocation:**

```javascript
// Lấy trang đầu của chat chung (50 tin nhắn)
await connection.invoke("GetRoomMessages", roomId, 0);

// Lấy trang thứ hai với kích thước trang tùy chỉnh
await connection.invoke("GetRoomMessages", roomId, 0, 2, 20);

// Lấy lịch sử chat Đội A
await connection.invoke("GetRoomMessages", roomId, 1, 1, 100);
```

**Use Cases:**

- Tải tin nhắn ban đầu khi vào phòng
- Tải thêm tin nhắn khi cuộn (infinite scroll)
- Làm mới lịch sử tin nhắn

---

### 6. RoomTyping

Thông báo cho người dùng khác trong kênh rằng người dùng hiện tại đang gõ.

**Method Name:** `RoomTyping`

**Parameters:**

| Tên     | Kiểu          | Bắt buộc | Mô tả                                  |
| ------- | ------------- | -------- | -------------------------------------- |
| roomId  | Guid (string) | Có       | Định danh duy nhất của phòng           |
| channel | int           | Có       | Loại kênh: 0=General, 1=TeamA, 2=TeamB |

**What Happens:**

- Phát chỉ báo đang gõ đến tất cả người dùng KHÁC trong kênh
- Không gửi cho người gọi (không echo)
- Nên được gọi khi người dùng bắt đầu gõ

**Broadcast Event:** `RoomUserTyping` (gửi cho những người khác trong kênh)

**Broadcast Payload:**

```json
{
  "RoomId": "550e8400-e29b-41d4-a716-446655440000",
  "Channel": 0,
  "UserId": "123e4567-e89b-12d3-a456-426614174000",
  "UserName": "JohnDoe"
}
```

**Example Invocation:**

```javascript
// Người dùng bắt đầu gõ trong chat chung
await connection.invoke("RoomTyping", roomId, 0);
```

**Best Practices:**

- Debounce cuộc gọi này (đừng gửi mỗi khi nhấn phím)
- Tự động gọi RoomStopTyping sau 3-5 giây không gõ
- Xóa chỉ báo đang gõ khi tin nhắn được gửi

---

### 7. RoomStopTyping

Thông báo cho người dùng khác rằng người dùng hiện tại đã ngừng gõ.

**Method Name:** `RoomStopTyping`

**Parameters:**

| Tên     | Kiểu          | Bắt buộc | Mô tả                                  |
| ------- | ------------- | -------- | -------------------------------------- |
| roomId  | Guid (string) | Có       | Định danh duy nhất của phòng           |
| channel | int           | Có       | Loại kênh: 0=General, 1=TeamA, 2=TeamB |

**What Happens:**

- Phát chỉ báo ngừng gõ đến tất cả người dùng KHÁC trong kênh
- Không gửi cho người gọi (không echo)
- Nên được gọi khi người dùng ngừng gõ hoặc gửi tin nhắn

**Broadcast Event:** `RoomUserStopTyping` (gửi cho những người khác trong kênh)

**Broadcast Payload:**

```json
{
  "RoomId": "550e8400-e29b-41d4-a716-446655440000",
  "Channel": 0,
  "UserId": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Example Invocation:**

```javascript
// Người dùng ngừng gõ
await connection.invoke("RoomStopTyping", roomId, 0);
```

**Use Cases:**

- Người dùng xóa ô nhập liệu
- Người dùng gửi tin nhắn
- Timeout sau 3-5 giây không hoạt động
- Người dùng rời khỏi chat

---

## Server to Client Events

### ReceiveRoomMessage

Phát cho tất cả người dùng trong kênh khi có tin nhắn mới được gửi.

**Event Name:** `ReceiveRoomMessage`

**Payload:**

```json
{
  "MessageId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "RoomId": "550e8400-e29b-41d4-a716-446655440000",
  "UserId": "123e4567-e89b-12d3-a456-426614174000",
  "UserName": "JohnDoe",
  "UserAvatar": "https://example.com/avatar.jpg",
  "Channel": 0,
  "MessageText": "Xin chào mọi người!",
  "SentAt": "2024-01-15T10:30:00Z",
  "IsEdited": false,
  "EditedAt": null
}
```

**Recipients:** Tất cả người dùng đăng ký nhóm kênh cụ thể

**Triggered By:** Phương thức SendRoomMessage

**Example Listener:**

```javascript
connection.on("ReceiveRoomMessage", (message) => {
  console.log(
    `[${message.Channel}] ${message.UserName}: ${message.MessageText}`,
  );

  // Thêm tin nhắn vào UI
  addMessageToChat(message);

  // Phát âm thanh thông báo nếu không phải từ người dùng hiện tại
  if (message.UserId !== currentUserId) {
    playNotificationSound();
  }
});
```

---

### JoinedRoom

Gửi cho người gọi sau khi tham gia phòng thành công.

**Event Name:** `JoinedRoom`

**Payload:**

```json
{
  "RoomId": "550e8400-e29b-41d4-a716-446655440000",
  "TeamAssignment": "A",
  "UserId": "123e4567-e89b-12d3-a456-426614174000",
  "UserName": "JohnDoe"
}
```

**Recipients:** Chỉ người gọi

**Triggered By:** Phương thức JoinRoomGroup

**Example Listener:**

```javascript
connection.on("JoinedRoom", (data) => {
  console.log(
    `Đã tham gia phòng ${data.RoomId} với vai trò ${data.TeamAssignment || "khán giả"}`,
  );

  // Cập nhật UI để hiển thị phòng đang hoạt động
  updateRoomStatus(data);

  // Tải tin nhắn ban đầu
  connection.invoke("GetRoomMessages", data.RoomId, 0);
});
```

---

### LeftRoom

Gửi cho người gọi sau khi rời phòng thành công.

**Event Name:** `LeftRoom`

**Payload:**

```json
{
  "RoomId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Recipients:** Chỉ người gọi

**Triggered By:** Phương thức LeaveRoomGroup

**Example Listener:**

```javascript
connection.on("LeftRoom", (data) => {
  console.log(`Đã rời phòng ${data.RoomId}`);

  // Xóa UI chat
  clearChatMessages();

  // Cập nhật điều hướng
  navigateToRoomList();
});
```

---

### TeamChatSwitched

Gửi cho người gọi sau khi chuyển kênh chat đội thành công.

**Event Name:** `TeamChatSwitched`

**Payload:**

```json
{
  "RoomId": "550e8400-e29b-41d4-a716-446655440000",
  "TeamAssignment": "B"
}
```

**Recipients:** Chỉ người gọi

**Triggered By:** Phương thức SwitchTeamChat

**Example Listener:**

```javascript
connection.on("TeamChatSwitched", (data) => {
  console.log(`Đã chuyển sang chat Đội ${data.TeamAssignment}`);

  // Cập nhật UI chat đội
  updateTeamChatView(data.TeamAssignment);

  // Tải tin nhắn chat đội
  const teamChannel = data.TeamAssignment === "A" ? 1 : 2;
  connection.invoke("GetRoomMessages", data.RoomId, teamChannel);
});
```

---

### ReceiveRoomMessages

Gửi cho người gọi với lịch sử tin nhắn phân trang.

**Event Name:** `ReceiveRoomMessages`

**Payload:**

```json
{
  "Items": [
    {
      "MessageId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "RoomId": "550e8400-e29b-41d4-a716-446655440000",
      "UserId": "123e4567-e89b-12d3-a456-426614174000",
      "UserName": "JohnDoe",
      "UserAvatar": "https://example.com/avatar.jpg",
      "Channel": 0,
      "MessageText": "Xin chào mọi người!",
      "SentAt": "2024-01-15T10:30:00Z",
      "IsEdited": false,
      "EditedAt": null
    }
  ],
  "Page": 1,
  "PageSize": 50,
  "TotalCount": 150,
  "TotalPages": 3,
  "HasPreviousPage": false,
  "HasNextPage": true
}
```

**Recipients:** Chỉ người gọi

**Triggered By:** Phương thức GetRoomMessages

**Example Listener:**

```javascript
connection.on("ReceiveRoomMessages", (response) => {
  console.log(
    `Đã tải ${response.Items.length} trong ${response.TotalCount} tin nhắn`,
  );

  // Hiển thị tin nhắn
  response.Items.forEach((msg) => addMessageToChat(msg));

  // Cập nhật UI phân trang
  updatePagination({
    currentPage: response.Page,
    totalPages: response.TotalPages,
    hasMore: response.HasNextPage,
  });

  // Kích hoạt nút "Tải thêm" nếu còn trang
  if (response.HasNextPage) {
    enableLoadMoreButton();
  }
});
```

---

### RoomUserTyping

Phát khi một người dùng bắt đầu gõ trong kênh.

**Event Name:** `RoomUserTyping`

**Payload:**

```json
{
  "RoomId": "550e8400-e29b-41d4-a716-446655440000",
  "Channel": 0,
  "UserId": "123e4567-e89b-12d3-a456-426614174000",
  "UserName": "JohnDoe"
}
```

**Recipients:** Tất cả người dùng khác trong kênh (không phải người đang gõ)

**Triggered By:** Phương thức RoomTyping

**Example Listener:**

```javascript
const typingUsers = new Set();

connection.on("RoomUserTyping", (data) => {
  typingUsers.add(data.UserName);
  updateTypingIndicator(typingUsers);

  // Tự động xóa sau 5 giây
  setTimeout(() => {
    typingUsers.delete(data.UserName);
    updateTypingIndicator(typingUsers);
  }, 5000);
});

function updateTypingIndicator(users) {
  if (users.size === 0) {
    hideTypingIndicator();
  } else if (users.size === 1) {
    showTypingIndicator(`${[...users][0]} đang gõ...`);
  } else if (users.size === 2) {
    showTypingIndicator(`${[...users].join(" và ")} đang gõ...`);
  } else {
    showTypingIndicator(`${users.size} người đang gõ...`);
  }
}
```

---

### RoomUserStopTyping

Phát khi một người dùng ngừng gõ trong kênh.

**Event Name:** `RoomUserStopTyping`

**Payload:**

```json
{
  "RoomId": "550e8400-e29b-41d4-a716-446655440000",
  "Channel": 0,
  "UserId": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Recipients:** Tất cả người dùng khác trong kênh (không phải người đã ngừng)

**Triggered By:** Phương thức RoomStopTyping

**Example Listener:**

```javascript
const typingUsers = new Map(); // userId -> userName

connection.on("RoomUserStopTyping", (data) => {
  typingUsers.delete(data.UserId);
  updateTypingIndicator(typingUsers);
});
```

---

### Error

Gửi cho người gọi khi một thao tác thất bại.

**Event Name:** `Error`

**Payload:**

```json
{
  "Message": "You don't have permission to send messages to this channel"
}
```

**Recipients:** Chỉ người gọi (người dùng kích hoạt lỗi)

**Common Error Messages:**

- `"Unauthorized"` - Người dùng chưa xác thực
- `"You don't have permission to send messages to this channel"` - Từ chối truy cập kênh đội
- `"Room not found"` - ID phòng không hợp lệ
- `"Message text cannot be empty"` - Lỗi xác thực
- `"Invalid channel"` - Số kênh ngoài phạm vi

**Example Listener:**

```javascript
connection.on("Error", (error) => {
  console.error("Lỗi Hub:", error.Message);

  // Hiển thị thông báo lỗi cho người dùng
  showErrorNotification(error.Message);

  // Ghi log vào dịch vụ theo dõi lỗi
  logError("SignalR Hub Error", error);
});
```

---

## Data Models

### RoomMessage

```typescript
interface RoomMessage {
  MessageId: string; // GUID
  RoomId: string; // GUID
  UserId: string; // GUID
  UserName: string; // Tên hiển thị
  UserAvatar: string; // URL avatar
  Channel: number; // 0=General, 1=TeamA, 2=TeamB
  MessageText: string; // Nội dung tin nhắn
  SentAt: string; // ISO 8601 datetime
  IsEdited: boolean; // Tin nhắn đã được sửa hay chưa
  EditedAt: string | null; // ISO 8601 datetime hoặc null
}
```

### PagedResult<T>

```typescript
interface PagedResult<T> {
  Items: T[]; // Mảng các mục cho trang hiện tại
  Page: number; // Số trang hiện tại (bắt đầu từ 1)
  PageSize: number; // Số mục mỗi trang
  TotalCount: number; // Tổng số mục
  TotalPages: number; // Tổng số trang
  HasPreviousPage: boolean; // Có trang trước không
  HasNextPage: boolean; // Có trang sau không
}
```

---

## Channel Types

### Enum Definition

```csharp
public enum RoomChatChannel
{
    General = 0,   // Tất cả thành viên phòng đều truy cập được
    TeamA = 1,     // Chỉ thành viên Đội A
    TeamB = 2      // Chỉ thành viên Đội B
}
```

### TypeScript Equivalent

```typescript
enum RoomChatChannel {
  General = 0,
  TeamA = 1,
  TeamB = 2,
}
```

### Channel Access Rules

| Kênh        | Đội A    | Đội B    | Khán giả |
| ----------- | -------- | -------- | -------- |
| General (0) | ✅ Có    | ✅ Có    | ✅ Có    |
| TeamA (1)   | ✅ Có    | ❌ Không | ❌ Không |
| TeamB (2)   | ❌ Không | ✅ Có    | ❌ Không |

---

## Group Naming Convention

### Room Group

**Pattern:** `room_{roomId}`

**Example:** `room_550e8400-e29b-41d4-a716-446655440000`

**Purpose:** Sự kiện và thông báo cấp phòng (hiện không sử dụng nhưng dành riêng cho các tính năng tương lai như cập nhật trạng thái phòng)

### Chat Channel Groups

**Pattern:** `room_{roomId}_chat_{channelName}`

**Examples:**

- General: `room_550e8400-e29b-41d4-a716-446655440000_chat_General`
- Team A: `room_550e8400-e29b-41d4-a716-446655440000_chat_TeamA`
- Team B: `room_550e8400-e29b-41d4-a716-446655440000_chat_TeamB`

**Purpose:** Cô lập tin nhắn chat theo các kênh cụ thể

---

## Complete Usage Examples

### Ví Dụ Đầy Đủ: Tham Gia Phòng và Chat

```javascript
// 1. Thiết lập kết nối
const connection = new signalR.HubConnectionBuilder()
  .withUrl("/hubs/matchroom", {
    accessTokenFactory: () => getAuthToken(),
  })
  .withAutomaticReconnect()
  .build();

// 2. Đăng ký các event listener
connection.on("JoinedRoom", (data) => {
  console.log("Đã tham gia phòng:", data);
  // Tải tin nhắn ban đầu
  connection.invoke("GetRoomMessages", data.RoomId, 0);
});

connection.on("ReceiveRoomMessage", (message) => {
  displayMessage(message);
});

connection.on("RoomUserTyping", (data) => {
  showTypingIndicator(data.UserName);
});

connection.on("Error", (error) => {
  alert("Lỗi: " + error.Message);
});

// 3. Kết nối
await connection.start();

// 4. Tham gia phòng
await connection.invoke("JoinRoomGroup", roomId, "A");

// 5. Gửi tin nhắn
document.getElementById("sendBtn").onclick = async () => {
  const text = document.getElementById("messageInput").value;
  await connection.invoke("SendRoomMessage", roomId, 0, text);
};

// 6. Xử lý typing
let typingTimeout;
document.getElementById("messageInput").oninput = () => {
  connection.invoke("RoomTyping", roomId, 0);

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    connection.invoke("RoomStopTyping", roomId, 0);
  }, 3000);
};

// 7. Rời phòng khi đóng trang
window.onbeforeunload = () => {
  connection.invoke("LeaveRoomGroup", roomId);
};
```

---

## Error Handling

### Các Lỗi Phổ Biến và Cách Xử Lý

```javascript
connection.on("Error", (error) => {
  switch (error.Message) {
    case "Unauthorized":
      // Chuyển hướng đến trang đăng nhập
      window.location.href = "/login";
      break;

    case "You don't have permission to send messages to this channel":
      showError("Bạn không có quyền gửi tin nhắn đến kênh này");
      break;

    case "Room not found":
      showError("Phòng không tồn tại");
      navigateToRoomList();
      break;

    default:
      showError("Đã xảy ra lỗi: " + error.Message);
  }
});

// Xử lý lỗi kết nối
connection.onclose((error) => {
  if (error) {
    console.error("Mất kết nối:", error);
    showReconnectingMessage();
  }
});

// Xử lý reconnecting
connection.onreconnecting((error) => {
  console.log("Đang kết nối lại...");
  showReconnectingIndicator();
});

connection.onreconnected((connectionId) => {
  console.log("Đã kết nối lại:", connectionId);
  hideReconnectingIndicator();
  // Tham gia lại phòng
  connection.invoke("JoinRoomGroup", currentRoomId, currentTeam);
});
```

---

## Security

### Authentication

- Tất cả kết nối yêu cầu JWT Bearer Token hợp lệ
- Token được truyền qua `accessTokenFactory` trong cấu hình connection
- Token được xác thực trên mỗi kết nối và phương thức gọi

### Authorization

- Người dùng chỉ có thể gửi tin nhắn đến các kênh họ có quyền truy cập
- Xác thực phân đội được thực thi trên server
- Tin nhắn kênh đội chỉ hiển thị cho các thành viên được phân đội phù hợp

### Data Validation

- Tất cả đầu vào được xác thực trên server
- Room ID và User ID được xác thực
- Nội dung tin nhắn được kiểm tra (không rỗng, giới hạn độ dài)

---

## Best Practices

### 1. Quản Lý Kết Nối

```javascript
// Sử dụng automatic reconnect
const connection = new signalR.HubConnectionBuilder()
  .withUrl("/hubs/matchroom")
  .withAutomaticReconnect([0, 2000, 10000, 30000]) // Retry intervals
  .build();

// Luôn xử lý lifecycle events
connection.onclose(() => handleDisconnect());
connection.onreconnected(() => rejoinRooms());
```

### 2. Debouncing Typing Indicators

```javascript
let typingTimer;
const TYPING_TIMEOUT = 3000;

function handleTyping() {
  // Gửi typing indicator
  connection.invoke("RoomTyping", roomId, channel);

  // Reset timer
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    connection.invoke("RoomStopTyping", roomId, channel);
  }, TYPING_TIMEOUT);
}
```

### 3. Message Pagination

```javascript
let currentPage = 1;
const pageSize = 50;

async function loadMoreMessages() {
  currentPage++;
  await connection.invoke(
    "GetRoomMessages",
    roomId,
    channel,
    currentPage,
    pageSize,
  );
}

connection.on("ReceiveRoomMessages", (response) => {
  prependMessages(response.Items);

  if (!response.HasNextPage) {
    hideLoadMoreButton();
  }
});
```

### 4. Optimistic UI Updates

```javascript
async function sendMessage(text) {
  // Hiển thị tin nhắn ngay lập tức (optimistic)
  const tempMessage = {
    MessageId: generateTempId(),
    UserName: currentUser.name,
    MessageText: text,
    SentAt: new Date().toISOString(),
    isPending: true,
  };

  displayMessage(tempMessage);

  try {
    // Gửi đến server
    await connection.invoke("SendRoomMessage", roomId, channel, text);
  } catch (error) {
    // Xóa tin nhắn tạm nếu thất bại
    removeMessage(tempMessage.MessageId);
    showError("Không thể gửi tin nhắn");
  }
}
```

### 5. Cleanup

```javascript
// Dọn dẹp khi component unmount hoặc người dùng rời đi
async function cleanup() {
  // Ngừng typing indicators
  await connection.invoke("RoomStopTyping", roomId, channel);

  // Rời phòng
  await connection.invoke("LeaveRoomGroup", roomId);

  // Ngắt kết nối nếu cần
  if (shouldDisconnect) {
    await connection.stop();
  }
}

// React example
useEffect(() => {
  return () => {
    cleanup();
  };
}, []);
```

### 6. Error Recovery

```javascript
async function robustInvoke(method, ...args) {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      return await connection.invoke(method, ...args);
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) {
        throw error;
      }
      // Đợi trước khi thử lại
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
}
```

---

## Ghi Chú Bổ Sung

### Performance Tips

- Sử dụng pagination cho lịch sử tin nhắn dài
- Debounce typing indicators để giảm traffic
- Implement message caching ở client
- Sử dụng virtual scrolling cho danh sách tin nhắn dài

### Accessibility

- Thông báo tin nhắn mới cho screen readers
- Hỗ trợ keyboard navigation
- Cung cấp chỉ báo trạng thái kết nối rõ ràng

### Mobile Considerations

- Xử lý các sự kiện app đi vào background/foreground
- Quản lý kết nối khi chuyển mạng (WiFi ↔ Mobile)
- Optimize cho băng thông thấp

---
