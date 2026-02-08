# Real-time Payment Events Documentation

## Overview
Hệ thống sử dụng SignalR để gửi real-time notifications khi có thanh toán trong Match Room. Frontend cần kết nối và lắng nghe các events sau để cập nhật UI ngay lập tức.

---

## Connection Setup

### 1. Connect to SignalR Hub
```typescript
import * as signalR from "@microsoft/signalr";

const hubConnection = new signalR.HubConnectionBuilder()
  .withUrl("https://api.kickify.site/hubs/matchroom", {
    accessTokenFactory: () => getAccessToken(), // Token của user
  })
  .withAutomaticReconnect()
  .build();

await hubConnection.start();
```

### 2. Join Room Group
Sau khi connect, phải join vào room group để nhận events:
```typescript
await hubConnection.invoke("JoinRoomGroup", roomId, teamAssignment);
```

---

## Event 1: ParticipantPaid

### Description
Event được gửi khi một participant trong room hoàn tất thanh toán deposit. Dùng để cập nhật UI:
- Đánh dấu user đã thanh toán
- Cập nhật progress bar tổng tiền đã thu
- Hiển thị notification

### Event Name
```
"ParticipantPaid"
```

### Trigger Condition
- Sau khi API `/api/bookings/process-payment` thành công
- Sau khi `SaveChangesAsync()` hoàn tất
- Trước khi tạo Booking (nếu chưa đủ người thanh toán)

### Payload Structure
```typescript
interface ParticipantPaidEvent {
  roomId: string;              // GUID của room
  userId: string;              // GUID của user vừa thanh toán
  userName: string;            // Tên hiển thị của user
  amountPaid: number;          // Số tiền user này vừa thanh toán
  totalDepositCollected: number; // Tổng số tiền đã thu được trong room
  paidAt: string;              // Timestamp (ISO 8601 format)
}
```

### Example Payload
```json
{
  "roomId": "031a65e1-4354-4f51-970b-9bc1c97c6b26",
  "userId": "6f1dcee7-336f-4b48-9e1a-e22bb4bb8b68",
  "userName": "Quach Gia Bao",
  "amountPaid": 60000,
  "totalDepositCollected": 600000,
  "paidAt": "2026-02-06T10:30:45.123Z"
}
```

### Frontend Implementation
```typescript
hubConnection.on("ParticipantPaid", (data: ParticipantPaidEvent) => {
  console.log(`${data.userName} has paid ${data.amountPaid} VND`);
  
  // 1. Update participant list - đánh dấu depositPaid = true
  updateParticipantStatus(data.userId, {
    depositPaid: true,
    checkedIn: true
  });
  
  // 2. Update progress bar
  const progress = (data.totalDepositCollected / totalRequired) * 100;
  setDepositProgress(progress);
  
  // 3. Show toast notification
  toast.success(`${data.userName} đã thanh toán thành công!`);
  
  // 4. Update room state
  setRoom(prev => ({
    ...prev,
    totalDepositCollected: data.totalDepositCollected
  }));
});
```

---

## Event 2: BookingConfirmed

### Description
Event được gửi khi người cuối cùng thanh toán và Booking đã được tạo thành công trong database. Dùng để:
- Hiển thị modal/popup xác nhận booking thành công
- Lock room (không cho join thêm)
- Chuyển status room sang "Confirmed"
- Navigate sang trang booking detail hoặc my-bookings

### Event Name
```
"BookingConfirmed"
```

### Trigger Condition
- Khi tất cả participants đã thanh toán (FilledSlots == TotalSlots && All depositPaid = true)
- Sau khi Booking entity đã được tạo thành công
- Sau khi `SaveChangesAsync()` hoàn tất

### Payload Structure
```typescript
interface BookingConfirmedEvent {
  roomId: string;        // GUID của room
  bookingId: string;     // GUID của booking vừa tạo
  matchDate: string;     // Ngày thi đấu (ISO 8601 format)
  startTime: string;     // Giờ bắt đầu (HH:mm:ss format)
  endTime: string;       // Giờ kết thúc (HH:mm:ss format)
  status: string;        // Luôn là "Confirmed"
  confirmedAt: string;   // Timestamp (ISO 8601 format)
}
```

### Example Payload
```json
{
  "roomId": "031a65e1-4354-4f51-970b-9bc1c97c6b26",
  "bookingId": "8a9c4f3e-1234-5678-9abc-def012345678",
  "matchDate": "2026-02-05T00:00:00Z",
  "startTime": "21:00:00",
  "endTime": "22:00:00",
  "status": "Confirmed",
  "confirmedAt": "2026-02-06T10:35:22.456Z"
}
```

### Frontend Implementation
```typescript
hubConnection.on("BookingConfirmed", (data: BookingConfirmedEvent) => {
  console.log(`Booking confirmed! ID: ${data.bookingId}`);
  
  // 1. Update room status
  setRoom(prev => ({
    ...prev,
    status: "Confirmed",
    bookingId: data.bookingId
  }));
  
  // 2. Show success modal
  showSuccessModal({
    title: "🎉 Đặt sân thành công!",
    message: `Sân đã được xác nhận cho ngày ${formatDate(data.matchDate)}`,
    bookingId: data.bookingId,
    matchDate: data.matchDate,
    startTime: data.startTime,
    endTime: data.endTime
  });
  
  // 3. Disable join/payment buttons
  setIsRoomLocked(true);
  
  // 4. Optional: Navigate to booking detail after 3 seconds
  setTimeout(() => {
    router.push(`/bookings/${data.bookingId}`);
  }, 3000);
});
```

---

## Complete Integration Example

### React/Next.js Example
```typescript
import { useEffect, useState } from 'react';
import * as signalR from "@microsoft/signalr";

export function useMatchRoomRealtime(roomId: string) {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  
  useEffect(() => {
    // Setup connection
    const hubConnection = new signalR.HubConnectionBuilder()
      .withUrl("https://api.kickify.site/hubs/matchroom", {
        accessTokenFactory: () => localStorage.getItem("access_token") || "",
      })
      .withAutomaticReconnect()
      .build();

    // Event 1: ParticipantPaid
    hubConnection.on("ParticipantPaid", (data: ParticipantPaidEvent) => {
      setRoom(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          totalDepositCollected: data.totalDepositCollected,
          participants: prev.participants.map(p => 
            p.userId === data.userId 
              ? { ...p, depositPaid: true, checkedIn: true }
              : p
          )
        };
      });
      
      toast.success(`${data.userName} đã thanh toán!`);
    });

    // Event 2: BookingConfirmed
    hubConnection.on("BookingConfirmed", (data: BookingConfirmedEvent) => {
      setRoom(prev => {
        if (!prev) return prev;
        return { ...prev, status: "Confirmed", bookingId: data.bookingId };
      });
      
      Swal.fire({
        icon: 'success',
        title: 'Đặt sân thành công!',
        text: `Booking ID: ${data.bookingId}`,
        confirmButtonText: 'Xem chi tiết'
      }).then((result) => {
        if (result.isConfirmed) {
          router.push(`/bookings/${data.bookingId}`);
        }
      });
    });

    // Start connection
    hubConnection.start()
      .then(() => {
        console.log("Connected to MatchRoomHub");
        return hubConnection.invoke("JoinRoomGroup", roomId);
      })
      .catch(err => console.error("Connection error:", err));

    setConnection(hubConnection);

    // Cleanup
    return () => {
      if (hubConnection) {
        hubConnection.invoke("LeaveRoomGroup", roomId);
        hubConnection.stop();
      }
    };
  }, [roomId]);

  return { connection, room, setRoom };
}
```

---

## Testing với Postman/API Client

### 1. Process Payment API
```http
POST https://api.kickify.site/api/bookings/process-payment
Authorization: Bearer {your_jwt_token}
Content-Type: application/json

{
  "roomId": "031a65e1-4354-4f51-970b-9bc1c97c6b26"
}
```

### 2. Expected Flow
1. **Thanh toán người thứ 1-9:**
   - API Response: `{ "bookingCreated": false, "message": "Payment recorded. Waiting..." }`
   - SignalR Event: `ParticipantPaid` được gửi

2. **Thanh toán người thứ 10 (cuối cùng):**
   - API Response: `{ "bookingCreated": true, "bookingId": "...", "message": "Payment processed successfully. Booking created." }`
   - SignalR Events: 
     - `ParticipantPaid` được gửi trước
     - `BookingConfirmed` được gửi sau

---

## Error Handling

### Connection Errors
```typescript
hubConnection.onclose((error) => {
  console.error("Connection closed:", error);
  toast.error("Mất kết nối real-time. Đang kết nối lại...");
});

hubConnection.onreconnecting((error) => {
  console.log("Reconnecting...", error);
  toast.info("Đang kết nối lại...");
});

hubConnection.onreconnected((connectionId) => {
  console.log("Reconnected:", connectionId);
  // Rejoin room group
  hubConnection.invoke("JoinRoomGroup", roomId);
  toast.success("Đã kết nối lại!");
});
```

### Race Condition Handling
Nếu 2 người thanh toán cùng lúc và field đã bị book bởi room khác:
```typescript
// API sẽ trả về error 409 Conflict
{
  "type": "https://datatracker.ietf.org/doc/html/rfc7231#section-6.5.8",
  "title": "Conflict",
  "status": 409,
  "detail": "This time slot has just been booked by another room. The field is no longer available"
}

// Xử lý ở frontend
catch (error) {
  if (error.status === 409) {
    Swal.fire({
      icon: 'error',
      title: 'Sân đã hết chỗ!',
      text: 'Khung giờ này vừa được đặt bởi phòng khác. Vui lòng chọn khung giờ khác.',
      confirmButtonText: 'Đóng'
    });
    // Refetch room để cập nhật status
    refetchRoom();
  }
}
```

---

## Important Notes

1. **Authentication Required:** 
   - API endpoint có `[Authorize]` attribute
   - SignalR connection cần JWT token
   - UserId được lấy từ token, KHÔNG truyền qua request body

2. **Transaction Atomic:**
   - Trừ tiền Player → Update Room → Cộng tiền VenueOwner → Tạo Booking
   - Tất cả trong một transaction
   - Nếu fail ở bất kỳ bước nào → rollback toàn bộ

3. **Race Condition Protected:**
   - PostgreSQL exclusion constraint ngăn double booking
   - Nếu phát hiện conflict → trả về error 409
   - Frontend cần xử lý error này

4. **Optimistic UI Updates:**
   - Cập nhật UI ngay khi nhận event
   - Không cần gọi lại API GET room detail
   - Giảm delay cho user experience

---

## API Reference

### Process Payment
- **Endpoint:** `POST /api/bookings/process-payment`
- **Auth:** Required (Bearer Token)
- **Request Body:**
  ```json
  {
    "roomId": "guid"
  }
  ```
- **Response 200 (Partial Payment):**
  ```json
  {
    "bookingCreated": false,
    "message": "Payment recorded. Waiting for other participants to pay.",
    "bookingId": null,
    "bookingDate": null,
    "startTime": null,
    "endTime": null
  }
  ```
- **Response 200 (Full Payment):**
  ```json
  {
    "bookingCreated": true,
    "message": "Payment processed successfully. Booking created.",
    "bookingId": "guid",
    "bookingDate": "2026-02-05T00:00:00Z",
    "startTime": "21:00:00",
    "endTime": "22:00:00"
  }
  ```

---

## Troubleshooting

### Event không được nhận
1. Check connection state: `connection.state === "Connected"`
2. Verify đã join room group: `await connection.invoke("JoinRoomGroup", roomId)`
3. Check console logs xem có error không
4. Verify JWT token chưa expired

### UI không update sau khi nhận event
1. Check state management (Redux/Zustand/Context)
2. Verify event handler đang update đúng state
3. Check React re-render logic
4. Use React DevTools để debug state changes

### Duplicate events
1. Cleanup old listeners trong useEffect
2. Dùng `connection.off("EventName")` trước khi register new handler
3. Ensure chỉ có 1 connection instance active

---

## Contact & Support
- Backend API: https://api.kickify.site
- Documentation: https://api.kickify.site/swagger
- SignalR Hub: https://api.kickify.site/hubs/matchroom
