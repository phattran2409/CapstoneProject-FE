# MessageList Component

## Mô tả

`MessageList` là một component có thể tái sử dụng để hiển thị danh sách tin nhắn trong ứng dụng chat. Component này hỗ trợ hiển thị tin nhắn của người dùng và người khác với giao diện khác nhau.

## Tính năng

- ✅ Hiển thị tin nhắn của mình và người khác
- ✅ Avatar cho tin nhắn của người khác
- ✅ Hiển thị tên người gửi
- ✅ Timestamp cho mỗi tin nhắn
- ✅ Trạng thái "đã gửi" với checkmark icons
- ✅ Theme-aware (tương thích với dark/light mode)
- ✅ Có thể tùy chỉnh inverted mode
- ✅ Tùy chỉnh contentContainerStyle

## Props

### MessageListProps

| Prop                    | Type        | Required | Default                                | Mô tả                                               |
| ----------------------- | ----------- | -------- | -------------------------------------- | --------------------------------------------------- |
| `messages`              | `Message[]` | ✅       | -                                      | Mảng các tin nhắn cần hiển thị                      |
| `inverted`              | `boolean`   | ❌       | `false`                                | Đảo ngược thứ tự hiển thị (dùng cho chat real-time) |
| `contentContainerStyle` | `any`       | ❌       | `{ paddingVertical: theme.spacing.m }` | Style cho container của FlatList                    |

### Message Interface

```typescript
interface Message {
  id: string; // ID duy nhất của tin nhắn
  sender: string; // ID của người gửi
  senderName: string; // Tên hiển thị của người gửi
  text: string; // Nội dung tin nhắn
  timestamp: string; // Thời gian gửi (dạng string)
  isOwn: boolean; // true nếu là tin nhắn của mình
  avatar?: any; // (Optional) Avatar của người gửi
}
```

## Cách sử dụng

### Import

```typescript
import { MessageList, Message } from "@/shared/components";
```

### Ví dụ cơ bản

```typescript
import React from "react";
import { View } from "react-native";
import { MessageList, Message } from "@/shared/components";

const ChatExample = () => {
  const messages: Message[] = [
    {
      id: "1",
      sender: "user123",
      senderName: "John Doe",
      text: "Hello, how are you?",
      timestamp: "10:30 AM",
      isOwn: false,
    },
    {
      id: "2",
      sender: "me",
      senderName: "You",
      text: "I'm good, thanks!",
      timestamp: "10:31 AM",
      isOwn: true,
    },
  ];

  return (
    <View style={{ flex: 1 }}>
      <MessageList messages={messages} />
    </View>
  );
};
```

### Ví dụ với inverted mode (cho chat real-time)

```typescript
<MessageList
  messages={messages}
  inverted={true}
/>
```

### Ví dụ với custom style

```typescript
<MessageList
  messages={messages}
  contentContainerStyle={{
    paddingVertical: 20,
    paddingHorizontal: 10,
  }}
/>
```

## Giao diện

### Tin nhắn của người khác (isOwn: false)

- Avatar hiển thị bên trái
- Tên người gửi hiển thị phía trên tin nhắn
- Bubble màu `theme.colors.surface`
- Text màu `theme.colors.text`
- Căn trái

### Tin nhắn của mình (isOwn: true)

- Không có avatar
- Không hiển thị tên
- Bubble màu `theme.colors.neonGreen`
- Text màu `theme.colors.black`
- Hiển thị trạng thái "Sent" với checkmark icons
- Căn phải

## Tích hợp với i18n

Component sử dụng `react-i18next` để hiển thị text "Sent". Đảm bảo bạn đã cấu hình translation key:

```json
{
  "chat": {
    "sent": "Sent"
  }
}
```

## Ví dụ sử dụng trong ChatScreen

Xem file: `src/features/chat/screens/ChatScreen.tsx`

## Lưu ý

- Component này sử dụng `FlatList` nên có hiệu suất tốt với danh sách tin nhắn dài
- Tự động tương thích với theme hiện tại (dark/light mode)
- Có thể tái sử dụng ở nhiều màn hình khác nhau
