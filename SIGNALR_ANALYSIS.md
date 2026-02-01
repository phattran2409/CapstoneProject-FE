# Phân Tích SignalR trong Dự Án CAPSTONE_PROJECT

## 📋 Tổng Quan

Dự án này sử dụng **SignalR** (Microsoft SignalR) để xử lý giao tiếp real-time cho:
1. **Chat** - Tin nhắn, typing indicator, online status
2. **Match Room** - Thông báo người chơi join/leave, status phòng

SignalR được tích hợp thông qua thư viện `@microsoft/signalr` version 10.0.0.

---

## 🏗️ Kiến Trúc

### 1. **Hub Connections**

| Feature | Hub URL | Hub Name |
|---------|---------|----------|
| Chat | `https://api.kickify.site/hubs/chat` | ChatHub |
| Match Room | `https://api.kickify.site/hubs/matchroom` | MatchRoomHub |

- **Authentication**: Sử dụng JWT Bearer Token từ `getAuthToken()`

### 2. **Cấu Trúc File**

```
src/
├── shared/
│   ├── hooks/
│   │   ├── useChatSignalR.ts              # Hook kết nối Chat Hub
│   │   ├── useChatSignalRHandlers.ts      # Handlers cho Chat events
│   │   ├── useMatchRoomSignalR.ts         # Hook kết nối Match Room Hub
│   │   └── useMatchRoomSignalRHandlers.ts # Handlers cho Match Room events
│   └── api/
│       └── client.ts                       # Quản lý authentication token
├── features/
│   ├── chat/
│   │   └── screens/
│   │       └── ChatScreen.tsx              # Sử dụng Chat SignalR
│   └── rooms/
│       ├── api/
│       │   └── roomsApi.ts                 # REST API cho rooms
│       ├── hooks/
│       │   ├── useJoinMatchRoom.ts         # Hook join room (REST)
│       │   └── useLeaveMatchRoom.ts        # Hook leave room (REST)
│       └── screens/
│           └── RoomInformation.tsx         # Sử dụng Match Room SignalR
```

---

## 🔌 useChatSignalR Hook

### Chức Năng Chính

Hook này (`src/shared/hooks/useChatSignalR.ts`) quản lý:
- ✅ Kết nối đến SignalR Hub
- ✅ Đăng ký các event listeners
- ✅ Gọi các hub methods (invoke)
- ✅ Quản lý trạng thái kết nối

### Cấu Hình Kết Nối

```typescript
const newConnection = new HubConnectionBuilder()
  .withUrl(CHAT_HUB_URL, {
    accessTokenFactory: async () => (await getAuthToken()) ?? "",
  })
  .withAutomaticReconnect()  // Tự động reconnect khi mất kết nối
  .configureLogging(LogLevel.Information)  // Log level
  .build();
```

### Các Event Listeners Được Đăng Ký

1. **UserOnlineStatus** - Trạng thái online/offline của user
2. **UserTyping** - User đang gõ tin nhắn
3. **UserStopTyping** - User dừng gõ
4. **ReceiveConversation** - Nhận dữ liệu conversation
5. **ReceiveMessage** - Nhận tin nhắn mới
6. **MessagesRead** - Tin nhắn đã được đọc
7. **OnlineUsers** - Danh sách users online
8. **Error** - Lỗi từ server

### Các Hub Methods (Client → Server)

1. **SendPrivateMessage** - Gửi tin nhắn riêng
2. **Typing** - Thông báo đang gõ
3. **StopTyping** - Thông báo dừng gõ
4. **MarkAsRead** - Đánh dấu đã đọc
5. **GetConversation** - Lấy conversation
6. **GetOnlineStatus** - Lấy trạng thái online
7. **GetOnlineUsers** - Lấy danh sách users online

### Return Values

```typescript
{
  connection: HubConnection | null,
  isConnected: boolean,
  invokeHubMethod: (methodName: string, ...args: any[]) => Promise<void>,
  sendPrivateMessage: (receiverId: string, messageText: string, messageType?: number) => Promise<void>,
  typing: (toUserId: string) => Promise<void>,
  stopTyping: (toUserId: string) => Promise<void>,
  markAsRead: (fromUserId: string) => Promise<void>,
  getConversation: (otherUserId: string, pageNumber?: number, pageSize?: number) => Promise<void>,
  getOnlineStatus: (userId: string) => Promise<void>,
  getOnlineUsers: () => Promise<void>,
}
```

---

## 🎯 useChatSignalRHandlers Hook

### Chức Năng

Hook này (`src/shared/hooks/useChatSignalRHandlers.ts`) tạo các **event handlers** với logic xử lý phổ biến cho chat:

- ✅ Xử lý tin nhắn mới (`onReceiveMessage`)
- ✅ Quản lý typing indicator (`onUserTyping`, `onUserStopTyping`)
- ✅ Cập nhật trạng thái online (`onUserOnlineStatus`, `onOnlineUsers`)
- ✅ Xử lý đánh dấu đã đọc (`onMessagesRead`)
- ✅ Tự động scroll khi có tin nhắn mới
- ✅ Invalidate React Query cache

### Logic Xử Lý Chi Tiết

#### 1. **onReceiveMessage**
- Kiểm tra tin nhắn có thuộc conversation hiện tại không
- Tạo `ConversationMessage` object từ payload
- Thêm vào state `chatMessages` (tránh duplicate)
- Auto scroll nếu đang ở bottom
- Invalidate conversations query cache

#### 2. **onUserTyping**
- Kiểm tra user đang gõ có phải người đang chat không
- Set `isOtherUserTyping = true`
- Tự động tắt sau 3 giây nếu không có event mới

#### 3. **onUserStopTyping**
- Set `isOtherUserTyping = false`
- Clear timeout nếu có

#### 4. **onUserOnlineStatus**
- Cập nhật `isOtherUserOnline` dựa trên `payload.isOnline`

#### 5. **onOnlineUsers**
- Xử lý payload có thể là array hoặc object
- Kiểm tra `otherUserId` có trong danh sách không

#### 6. **onMessagesRead**
- Cập nhật `isRead = true` cho tất cả tin nhắn của mình trong conversation

---

## 💬 ChatScreen - Cách Sử Dụng

### Tích Hợp SignalR

```typescript
// 1. Tạo handlers với logic xử lý
const signalRHandlers = useChatSignalRHandlers({
  otherUserId,
  currentUserId,
  chatName,
  setChatMessages,
  setIsOtherUserTyping,
  typingTimeoutRef,
  setIsOtherUserOnline,
  isAtBottomRef,
  messageListRef: messageListRef.current || undefined,
});

// 2. Kết nối SignalR với handlers
const { isConnected, typing, stopTyping, getOnlineStatus } = useChatSignalR(signalRHandlers);
```

### Typing Detection

```typescript
const handleTextChange = useCallback((text: string) => {
  setMessage(text);
  
  const now = Date.now();
  // Gửi typing signal mỗi 2 giây một lần (debounce)
  if (now - lastTypingTimeRef.current > 2000) {
    if (isConnected && otherUserId && text.trim().length > 0) {
      typing(otherUserId);
      lastTypingTimeRef.current = now;
    }
  }
  
  // Tự động gửi stopTyping sau 3 giây không gõ
  if (typingTimeoutRef.current) {
    clearTimeout(typingTimeoutRef.current);
  }
  typingTimeoutRef.current = setTimeout(() => {
    if (isConnected && otherUserId) {
      stopTyping(otherUserId);
    }
  }, 3000);
}, [isConnected, otherUserId, typing, stopTyping]);
```

### Lấy Online Status

```typescript
useEffect(() => {
  if (isConnected && otherUserId) {
    getOnlineStatus(otherUserId);
  }
}, [isConnected, otherUserId, getOnlineStatus]);
```

---

## 🔐 Authentication

### Token Management

SignalR sử dụng JWT token từ `getAuthToken()` trong `src/shared/api/client.ts`:

```typescript
accessTokenFactory: async () => (await getAuthToken()) ?? ""
```

Token được lấy từ:
1. Memory cache (`authToken`)
2. AsyncStorage (`auth_token`)

### Token Refresh

- Token được tự động refresh khi hết hạn (qua axios interceptor)
- SignalR connection sẽ tự động sử dụng token mới khi reconnect

---

## 🔄 Luồng Hoạt Động

### 1. **Khởi Tạo Kết Nối**

```
Component Mount
    ↓
useChatSignalR được gọi
    ↓
useEffect chạy → startConnection()
    ↓
HubConnectionBuilder tạo connection
    ↓
Đăng ký event listeners
    ↓
connection.start()
    ↓
isConnected = true
```

### 2. **Nhận Tin Nhắn Mới**

```
Server gửi "ReceiveMessage" event
    ↓
onReceiveMessage handler được gọi
    ↓
Kiểm tra senderId/receiverId === otherUserId
    ↓
Tạo ConversationMessage object
    ↓
Cập nhật chatMessages state
    ↓
Auto scroll (nếu ở bottom)
    ↓
Invalidate React Query cache
```

### 3. **Gửi Tin Nhắn**

```
User nhấn Send
    ↓
handleSend() được gọi
    ↓
stopTyping() được gọi (nếu connected)
    ↓
sendChatMessage() (REST API)
    ↓
Server xử lý và broadcast qua SignalR
    ↓
onReceiveMessage nhận tin nhắn mới
```

### 4. **Typing Indicator**

```
User gõ text
    ↓
handleTextChange() được gọi
    ↓
Debounce 2 giây → typing(toUserId)
    ↓
Server broadcast "UserTyping"
    ↓
onUserTyping handler → setIsOtherUserTyping(true)
    ↓
Sau 3 giây không gõ → stopTyping()
    ↓
Server broadcast "UserStopTyping"
    ↓
onUserStopTyping handler → setIsOtherUserTyping(false)
```

### 5. **Reconnection**

```
Mất kết nối
    ↓
withAutomaticReconnect() tự động reconnect
    ↓
Token được refresh (nếu cần)
    ↓
Kết nối lại thành công
    ↓
isConnected = true
```

---

## 🎨 UI Features

### 1. **Online Status Indicator**
- Hiển thị dot xanh khi user online
- Text "Online" / "Offline"

### 2. **Typing Indicator**
- Component `<TypingIndicator />` hiển thị khi `isOtherUserTyping = true`
- Tự động ẩn sau 3 giây

### 3. **Real-time Message Updates**
- Tin nhắn mới xuất hiện ngay lập tức
- Auto scroll đến tin nhắn mới nhất
- Cập nhật trạng thái "đã đọc"

---

## 🔧 Best Practices Được Áp Dụng

1. ✅ **Separation of Concerns**
   - `useChatSignalR`: Quản lý connection
   - `useChatSignalRHandlers`: Xử lý business logic

2. ✅ **Reusability**
   - Handlers có thể tái sử dụng ở nhiều màn hình
   - Custom callbacks để override/extend

3. ✅ **Error Handling**
   - Try-catch cho connection errors
   - Error event listener từ server

4. ✅ **Performance**
   - Debounce cho typing detection (2 giây)
   - Auto timeout cho typing indicator (3 giây)
   - Check duplicate messages trước khi add

5. ✅ **Memory Management**
   - Cleanup connection khi unmount
   - Clear timeouts khi component unmount

6. ✅ **State Management**
   - React Query cho REST API data
   - Local state cho real-time updates
   - Invalidate cache khi cần

---

## 📊 Dependencies

```json
{
  "@microsoft/signalr": "^10.0.0"
}
```

---

## 🏟️ Match Room SignalR

### Hub URL
`https://api.kickify.site/hubs/matchroom`

### Events từ Server

| Event | Payload | Mô tả |
|-------|---------|-------|
| `UserJoinedRoom` | `{ roomId, userId, userName, userAvatar, teamId, teamName, joinedAt }` | Có người chơi mới tham gia |
| `UserLeftRoom` | `{ roomId, userId, userName, leftAt }` | Có người chơi rời phòng |
| `RoomStatusChanged` | `{ roomId, status, currentPlayers, totalPlayers }` | Trạng thái phòng thay đổi |
| `PlayerKicked` | `{ roomId, kickedUserId, kickedUserName, kickedBy, reason }` | Có người bị kick |
| `Error` | `any` | Lỗi từ server |

### Methods từ Client

| Method | Parameters | Mô tả |
|--------|------------|-------|
| `JoinRoomGroup` | `roomId: string` | Join vào group để nhận events của room |
| `LeaveRoomGroup` | `roomId: string` | Rời khỏi group |
| `NotifyPresence` | `roomId: string` | (Optional) Thông báo presence |

### Luồng Hoạt Động

```
1. Component mount (RoomInformation)
    ↓
2. useMatchRoomSignalR kết nối đến Hub
    ↓
3. Gọi JoinRoomGroup(roomId) để join group
    ↓
4. Đăng ký event listeners
    ↓
5. Khi có người join/leave:
   - REST API xử lý logic
   - Server broadcast event qua SignalR
   - Client nhận event và update UI real-time
    ↓
6. Component unmount:
   - Gọi LeaveRoomGroup(roomId)
   - Disconnect connection
```

### Tích Hợp REST API + SignalR

```
┌─────────────┐     POST /join      ┌─────────────┐
│   Client A  │ ──────────────────► │   Server    │
│  (Join room)│                     │             │
└─────────────┘                     │  1. Save DB │
                                    │  2. Broadcast│
                                    └──────┬──────┘
                                           │
                    SignalR "UserJoinedRoom" event
                                           │
      ┌────────────────────────────────────┼────────────────────────────────────┐
      ▼                                    ▼                                    ▼
┌─────────────┐                     ┌─────────────┐                     ┌─────────────┐
│  Client A   │                     │  Client B   │                     │  Client C   │
│ (self join) │                     │ (in room)   │                     │ (in room)   │
│ Update UI   │                     │ Update UI   │                     │ Update UI   │
└─────────────┘                     └─────────────┘                     └─────────────┘
```

### Code Example

```typescript
// 1. Tạo handlers
const signalRHandlers = useMatchRoomSignalRHandlers({
  roomId,
  currentUserId: user?.userId,
  setRoomData,
  showNotification,
  onKicked: handleKickedFromRoom,
});

// 2. Kết nối SignalR
const { isConnected, connectionState } = useMatchRoomSignalR(signalRHandlers);

// 3. Join room qua REST API
const { mutate: joinMatchRoom } = useJoinMatchRoom();
joinMatchRoom({ roomId, teamId }, {
  onSuccess: () => {
    // SignalR sẽ tự động broadcast và update UI
  },
});
```

---

## 🐛 Potential Issues & Improvements

### Issues Hiện Tại

1. **Missing Dependency Array**
   - `useEffect` trong `useChatSignalR` có dependency array rỗng `[]`
   - Có thể gây stale closure với `options`

2. **No Connection Retry Logic**
   - Chỉ có `withAutomaticReconnect()` nhưng không có custom retry logic

3. **No Connection State Management**
   - Không có UI feedback khi đang reconnect

### Suggested Improvements

1. **Add Connection State UI**
   ```typescript
   const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'reconnecting' | 'disconnected'>('connecting');
   ```

2. **Better Error Handling**
   - Show toast/alert khi connection failed
   - Retry button cho user

3. **Optimize Re-renders**
   - Memoize handlers với `useCallback`
   - Use `useMemo` cho expensive computations

4. **Add Typing Debounce Config**
   - Make debounce time configurable

---

## 📝 Kết Luận

SignalR trong dự án này được triển khai tốt với:
- ✅ Kiến trúc rõ ràng, tách biệt concerns
- ✅ Xử lý real-time events đầy đủ
- ✅ Authentication tích hợp tốt
- ✅ Auto reconnect và error handling
- ✅ Performance optimizations

Dự án sử dụng SignalR chủ yếu cho **chat real-time** với các tính năng:
- Gửi/nhận tin nhắn
- Typing indicator
- Online status
- Read receipts
- Conversation sync
