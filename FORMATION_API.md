# Formation API – Cập nhật đội hình (vị trí từng thành viên)

Tài liệu mô tả API payload và nhiệm vụ Backend (BE) cho chức năng **captain gán vị trí** từng thành viên trong team (đội hình theo slot).

---

## 1. Tổng quan

- **Ai gửi:** Chỉ **captain** của đội (host hoặc người được chỉ định captain cho team đó).
- **Khi nào:** Sau khi đã chọn đội hình (vd 3-3, 4-2) và gán từng cầu thủ vào từng ô vị trí (slot).
- **Mục đích:** Lưu đội hình để mọi thành viên trong team xem được **đúng vị trí** captain đã assign (thông qua GET room detail trả về `formationByTeam`).

---

## 2. Endpoint

| Method | URL | Mô tả |
|--------|-----|--------|
| **PUT** | `/match-rooms/:id/formation` | Cập nhật đội hình cho một đội (A hoặc B). `:id` = `roomId`. |

**Headers:** Cần authorization (Bearer token). Chỉ captain mới được gọi thành công.

---

## 3. Request payload

### 3.1. Cấu trúc (body JSON)

| Field | Kiểu | Bắt buộc | Mô tả |
|-------|------|----------|--------|
| `team` | `"A"` \| `"B"` | Có | Đội cần cập nhật đội hình. |
| `formationName` | string | Có | Tên đội hình, ví dụ `"3-3"`, `"4-2"`, `"3-2-1"`. |
| `format` | string | Có | Format trận: `"5vs5"`, `"7vs7"` hoặc `"11vs11"`. |
| `assignments` | array | Có | Danh sách gán: mỗi phần tử = một cặp (slot, cầu thủ). |

**Phần tử của `assignments`:**

| Field | Kiểu | Mô tả |
|-------|------|--------|
| `slotId` | string | Id vị trí trên sân (vd `"GK-0"`, `"DF-1"`, `"MF-0"`, `"FW-2"`). |
| `playerId` | string | `userId` của cầu thủ được gán vào slot đó. |

### 3.2. Giá trị hợp lệ

- **`team`:** `"A"` | `"B"`.
- **`format`:** `"5vs5"` | `"7vs7"` | `"11vs11"`.
- **`formationName`:** phải là một trong các tên đội hình hỗ trợ theo format (xem bảng dưới).
- **`slotId`:** phải thuộc danh sách slot của đội hình `(format, formationName)` tương ứng (xem mục 5).
- **`playerId`:** phải là userId của một participant đang ở đội `team` trong phòng.

---

## 4. Ví dụ payload

**7v7 – Đội hình 3-3 (Team A):**

```json
{
  "team": "A",
  "formationName": "3-3",
  "format": "7vs7",
  "assignments": [
    { "slotId": "GK-0",  "playerId": "user-uuid-1" },
    { "slotId": "DF-0",  "playerId": "user-uuid-2" },
    { "slotId": "DF-1",  "playerId": "user-uuid-3" },
    { "slotId": "DF-2",  "playerId": "user-uuid-4" },
    { "slotId": "FW-0",  "playerId": "user-uuid-5" },
    { "slotId": "FW-1",  "playerId": "user-uuid-6" },
    { "slotId": "FW-2",  "playerId": "user-uuid-7" }
  ]
}
```

**5v5 – Đội hình 2-1-1 (Team B):**

```json
{
  "team": "B",
  "formationName": "2-1-1",
  "format": "5vs5",
  "assignments": [
    { "slotId": "GK-0",  "playerId": "user-a" },
    { "slotId": "DF-0",  "playerId": "user-b" },
    { "slotId": "DF-1",  "playerId": "user-c" },
    { "slotId": "MF-0",  "playerId": "user-d" },
    { "slotId": "FW-0",  "playerId": "user-e" }
  ]
}
```

**11v11 – Đội hình 4-4-2 (Team A):**

```json
{
  "team": "A",
  "formationName": "4-4-2",
  "format": "11vs11",
  "assignments": [
    { "slotId": "GK-0",  "playerId": "user-1" },
    { "slotId": "DF-0",  "playerId": "user-2" },
    { "slotId": "DF-1",  "playerId": "user-3" },
    { "slotId": "DF-2",  "playerId": "user-4" },
    { "slotId": "DF-3",  "playerId": "user-5" },
    { "slotId": "MF-0",  "playerId": "user-6" },
    { "slotId": "MF-1",  "playerId": "user-7" },
    { "slotId": "MF-2",  "playerId": "user-8" },
    { "slotId": "MF-3",  "playerId": "user-9" },
    { "slotId": "FW-0",  "playerId": "user-10" },
    { "slotId": "FW-1",  "playerId": "user-11" }
  ]
}
```

---

## 5. Bảng tham chiếu: Format + Formation → SlotIds (BE dùng để validate)

BE nên lưu bảng tương đương (config hoặc DB) để kiểm tra `assignments` hợp lệ.

### 5.1. Format **5vs5**

| formationName | Số slot | SlotIds (danh sách đầy đủ) |
|---------------|---------|----------------------------|
| `3-1` | 5 | `GK-0`, `DF-0`, `DF-1`, `DF-2`, `FW-0` |
| `2-2` | 5 | `GK-0`, `DF-0`, `DF-1`, `FW-0`, `FW-1` |
| `2-1-1` | 5 | `GK-0`, `DF-0`, `DF-1`, `MF-0`, `FW-0` |
| `1-2-1` | 5 | `GK-0`, `DF-0`, `MF-0`, `MF-1`, `FW-0` |
| `1-3` | 5 | `GK-0`, `DF-0`, `FW-0`, `FW-1`, `FW-2` |

### 5.2. Format **7vs7**

| formationName | Số slot | SlotIds (danh sách đầy đủ) |
|---------------|---------|----------------------------|
| `3-3` | 7 | `GK-0`, `DF-0`, `DF-1`, `DF-2`, `FW-0`, `FW-1`, `FW-2` |
| `4-2` | 7 | `GK-0`, `DF-0`, `DF-1`, `DF-2`, `DF-3`, `FW-0`, `FW-1` |
| `3-2-1` | 7 | `GK-0`, `DF-0`, `DF-1`, `DF-2`, `MF-0`, `MF-1`, `FW-0` |
| `3-1-2` | 7 | `GK-0`, `DF-0`, `DF-1`, `DF-2`, `MF-0`, `FW-0`, `FW-1` |
| `2-3-1` | 7 | `GK-0`, `DF-0`, `DF-1`, `MF-0`, `MF-1`, `MF-2`, `FW-0` |
| `4-1-1` | 7 | `GK-0`, `DF-0`, `DF-1`, `DF-2`, `DF-3`, `MF-0`, `FW-0` |

### 5.3. Format **11vs11** (đá 11 người)

| formationName | Số slot | SlotIds (danh sách đầy đủ) |
|---------------|---------|----------------------------|
| `4-4-2` | 11 | `GK-0`, `DF-0`, `DF-1`, `DF-2`, `DF-3`, `MF-0`, `MF-1`, `MF-2`, `MF-3`, `FW-0`, `FW-1` |
| `4-3-3` | 11 | `GK-0`, `DF-0`, `DF-1`, `DF-2`, `DF-3`, `MF-0`, `MF-1`, `MF-2`, `FW-0`, `FW-1`, `FW-2` |
| `3-5-2` | 11 | `GK-0`, `DF-0`, `DF-1`, `DF-2`, `MF-0`, `MF-1`, `MF-2`, `MF-3`, `MF-4`, `FW-0`, `FW-1` |
| `4-2-3-1` | 11 | `GK-0`, `DF-0`, `DF-1`, `DF-2`, `DF-3`, `MF-0`, `MF-1`, `MF-2`, `MF-3`, `MF-4`, `FW-0` |
| `5-3-2` | 11 | `GK-0`, `DF-0`, `DF-1`, `DF-2`, `DF-3`, `DF-4`, `MF-0`, `MF-1`, `MF-2`, `FW-0`, `FW-1` |
| `3-4-3` | 11 | `GK-0`, `DF-0`, `DF-1`, `DF-2`, `MF-0`, `MF-1`, `MF-2`, `MF-3`, `FW-0`, `FW-1`, `FW-2` |
| `4-5-1` | 11 | `GK-0`, `DF-0`, `DF-1`, `DF-2`, `DF-3`, `MF-0`, `MF-1`, `MF-2`, `MF-3`, `MF-4`, `FW-0` |
| `5-4-1` | 11 | `GK-0`, `DF-0`, `DF-1`, `DF-2`, `DF-3`, `DF-4`, `MF-0`, `MF-1`, `MF-2`, `MF-3`, `FW-0` |

**Quy ước slotId:** `{Line}-{index}` với Line = `GK` | `DF` | `MF` | `FW`, index 0-based. Số slot DF/MF/FW tương ứng với tên đội hình (vd 3-3 ⇒ 3 DF, 0 MF, 3 FW; 4-4-2 ⇒ 4 DF, 4 MF, 2 FW).

---

## 6. Backend (BE) cần làm gì

### 6.1. Authorization

- Xác thực user (JWT/session).
- Kiểm tra user là **captain** của đội `team` trong phòng `roomId` (vd so với `hostId` hoặc trường `isCaptain` của participant). Nếu không phải captain → **403 Forbidden**.

### 6.2. Validation request

1. **`team`:** Chỉ chấp nhận `"A"` hoặc `"B"`.
2. **`format`:** Chỉ chấp nhận `"5vs5"`, `"7vs7"` hoặc `"11vs11"`.
3. **`formationName`:** Phải nằm trong danh sách đội hình hỗ trợ cho `format` (theo bảng mục 5). Nếu không → **400 Bad Request** (vd "Invalid formation name for this format").
4. **`assignments`:**
   - Số phần tử phải **bằng đúng** số slot của đội hình `(format, formationName)` (5 với 5v5, 7 với 7v7, 11 với 11v11).
   - Mỗi `slotId` phải nằm trong danh sách slotId hợp lệ của đội hình đó; mỗi slotId xuất hiện **đúng một lần**.
   - Mỗi `playerId` phải là participant hiện tại của phòng và đang ở đội `team`; có thể quyết định mỗi `playerId` chỉ xuất hiện một lần (một người một vị trí).
   - Nếu thiếu slot, thừa slot, slotId lạ hoặc playerId không thuộc team → **400 Bad Request** (message rõ ràng).

### 6.3. Lưu trữ

- Lưu đội hình cho phòng + đội:
  - **RoomId** + **Team (A/B)** → `formationName`, `format`, danh sách `assignments` (slotId, playerId).
- Có thể lưu dạng JSON (vd một bảng `room_formations` với cột payload) hoặc chuẩn hóa bảng assignment. Khi có dữ liệu mới từ PUT, ghi đè đội hình cũ của đội đó.

### 6.4. Đồng bộ position (tùy chọn)

- Nếu model participant có trường `position` (GK/DF/MF/FW):
  - BE có thể cập nhật `position` cho từng participant theo slot đã gán (suy từ `slotId`, vd `DF-1` → `DF`).
  - Giúp các API khác (vd danh sách cầu thủ theo vị trí) nhất quán với đội hình.

### 6.5. Response

- **Thành công (200 OK):** Có thể trả body rỗng hoặc object phản ánh đội hình vừa lưu (vd `{ formationName, format, assignments }`).
- **Lỗi:**
  - **400** – Payload không hợp lệ (formation name, format, assignments không đúng như mục 5 và 6.2).
  - **403** – Không phải captain của đội đó.
  - **404** – Không tìm thấy phòng.

---

## 7. GET Room Detail – Trả về đội hình để FE hiển thị “Vị trí của bạn”

Để **thành viên trong team xem đúng vị trí** captain đã assign, API **GET full room detail** (vd `GET /match-rooms/:id`) nên trả về thêm cấu trúc sau trong response:

```json
{
  "roomId": "...",
  "participants": { "teamA": [...], "teamB": [...], "unassigned": [...] },
  "formationByTeam": {
    "A": {
      "formationName": "3-3",
      "format": "7vs7",
      "assignments": [
        { "slotId": "GK-0", "playerId": "user-uuid-1" },
        { "slotId": "DF-0", "playerId": "user-uuid-2" }
      ]
    },
    "B": null
  }
}
```

- **`formationByTeam`** (optional): object với key `"A"` và/hoặc `"B"`.
- Giá trị mỗi key: **null** nếu chưa có đội hình, hoặc object **TeamFormationSnapshot**:
  - `formationName`: string
  - `format`: string
  - `assignments`: array of `{ slotId, playerId }`

FE sẽ khởi tạo màn Team từ `formationByTeam[team]` và tính “vị trí của bạn” bằng cách tìm assignment có `playerId === currentUserId` → lấy `slotId` (và label tương ứng).

---

## 8. Tóm tắt

| Hạng mục | Nội dung |
|----------|----------|
| **Endpoint** | `PUT /match-rooms/:id/formation` |
| **Payload** | `team`, `formationName`, `format`, `assignments: [{ slotId, playerId }]` |
| **Giá trị** | `team` A/B; `format` 5vs5 / 7vs7 / 11vs11; `formationName` + `slotId` theo bảng mục 5. |
| **BE làm** | Kiểm tra captain → validate format, formationName, assignments (slotIds + playerIds) → lưu đội hình → (tùy chọn) cập nhật participant.position. |
| **GET room** | Trả về `formationByTeam.A` / `formationByTeam.B` để thành viên xem đúng vị trí đã được assign. |

File tham chiếu FE: `src/features/rooms/types/room.types.ts` (UpdateFormationRequest, TeamFormationSnapshot), `src/shared/components/formation/types.ts` (slot config).
