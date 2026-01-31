# Kickify Match Room - Real-time Events Documentation

## Overview

This document describes the SignalR real-time events for the Match Room feature in Kickify. These events enable real-time updates for players joining/leaving rooms, team selection, and host changes.

---

## Connection Setup

### Hub URL
```
/hubs/matchroom
```

### Authentication
- **Required**: JWT Bearer Token
- Pass token via `accessTokenFactory` option in SignalR connection

### JavaScript Connection Example
```javascript
const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://your-api/hubs/matchroom", {
        accessTokenFactory: () => accessToken
    })
    .withAutomaticReconnect()
    .build();

await connection.start();
```

---

## Hub Methods (Client -> Server)

### 1. JoinRoomGroup
Join a SignalR group to receive real-time updates for a specific room.

| Property | Type | Description |
|----------|------|-------------|
| `roomId` | `Guid` | The ID of the room to subscribe to |

**Invoke Example:**
```javascript
await connection.invoke("JoinRoomGroup", "a1b2c3d4-e5f6-7890-abcd-ef1234567890");
```

### 2. LeaveRoomGroup
Leave a SignalR group to stop receiving updates for a specific room.

| Property | Type | Description |
|----------|------|-------------|
| `roomId` | `Guid` | The ID of the room to unsubscribe from |

**Invoke Example:**
```javascript
await connection.invoke("LeaveRoomGroup", "a1b2c3d4-e5f6-7890-abcd-ef1234567890");
```

---

## Events (Server -> Client)

### 1. UserJoinedRoom

Triggered when a new player joins the room.

**Event Name:** `UserJoinedRoom`

**Payload:**
```json
{
    "roomId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "userId": "b2c3d4e5-f6a7-8901-bcde-f23456789012",
    "userName": "Player Name",
    "avatarUrl": "https://example.com/avatar.jpg",
    "filledSlots": 5,
    "totalSlots": 10,
    "joinedAt": "2026-01-28T10:30:00Z"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `roomId` | `Guid` | ID of the room |
| `userId` | `Guid` | ID of the player who joined |
| `userName` | `string` | Display name of the player |
| `avatarUrl` | `string?` | URL to player's avatar (nullable) |
| `filledSlots` | `int` | Current number of players in room |
| `totalSlots` | `int` | Maximum capacity of the room |
| `joinedAt` | `DateTime` | UTC timestamp when player joined |

**JavaScript Handler:**
```javascript
connection.on("UserJoinedRoom", (data) => {
    console.log(`${data.userName} joined the room`);
    console.log(`Players: ${data.filledSlots}/${data.totalSlots}`);
});
```

---

### 2. UserLeftRoom

Triggered when a player leaves the room. Also includes information about host reassignment if applicable.

**Event Name:** `UserLeftRoom`

**Payload:**
```json
{
    "roomId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "userId": "b2c3d4e5-f6a7-8901-bcde-f23456789012",
    "userName": "Player Name",
    "filledSlots": 4,
    "totalSlots": 10,
    "isRoomDeleted": false,
    "newHostId": "c3d4e5f6-a7b8-9012-cdef-345678901234",
    "leftAt": "2026-01-28T10:35:00Z"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `roomId` | `Guid` | ID of the room |
| `userId` | `Guid` | ID of the player who left |
| `userName` | `string` | Display name of the player who left |
| `filledSlots` | `int` | Updated number of players in room |
| `totalSlots` | `int` | Maximum capacity of the room |
| `isRoomDeleted` | `bool` | True if room was deleted (host was last player) |
| `newHostId` | `Guid?` | ID of new host if host left and room still exists |
| `leftAt` | `DateTime` | UTC timestamp when player left |

**Host Transfer Logic:**
- If `isRoomDeleted` = `true`: Room was deleted (host was the only player)
- If `newHostId` has value: Host left but room continues with new host
- If `newHostId` is `null` and `isRoomDeleted` = `false`: Regular player left

**JavaScript Handler:**
```javascript
connection.on("UserLeftRoom", (data) => {
    if (data.isRoomDeleted) {
        console.log("Room has been deleted");
        // Navigate away or show message
    } else {
        console.log(`${data.userName} left the room`);
        if (data.newHostId) {
            console.log(`New host: ${data.newHostId}`);
            // Update UI to show new host
        }
    }
});
```

---

### 3. ParticipantUpdated

Triggered when a player changes their team assignment or position.

**Event Name:** `ParticipantUpdated`

**Payload:**
```json
{
    "roomId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "userId": "b2c3d4e5-f6a7-8901-bcde-f23456789012",
    "userName": "Player Name",
    "avatarUrl": "https://example.com/avatar.jpg",
    "teamAssignment": "A",
    "position": "ST",
    "updatedAt": "2026-01-28T10:40:00Z"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `roomId` | `Guid` | ID of the room |
| `userId` | `Guid` | ID of the player who updated |
| `userName` | `string` | Display name of the player |
| `avatarUrl` | `string?` | URL to player's avatar (nullable) |
| `teamAssignment` | `string` | New team: `"Unassigned"`, `"A"`, or `"B"` |
| `position` | `string?` | Player's position (e.g., "GK", "CB", "ST") |
| `updatedAt` | `DateTime` | UTC timestamp of the update |

**Team Assignment Values:**
| Value | Description |
|-------|-------------|
| `Unassigned` | Player has not chosen a team yet |
| `A` | Player is on Team A |
| `B` | Player is on Team B |

**JavaScript Handler:**
```javascript
connection.on("ParticipantUpdated", (data) => {
    console.log(`${data.userName} moved to Team ${data.teamAssignment}`);
    if (data.position) {
        console.log(`Position: ${data.position}`);
    }
    // Move player card to appropriate team column
});
```

---

### 4. RoomStatusChanged

Triggered when the room status changes (e.g., from Open to Full, or Closed).

**Event Name:** `RoomStatusChanged`

**Payload:**
```json
{
    "roomId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "status": "Full",
    "changedAt": "2026-01-28T10:45:00Z"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `roomId` | `Guid` | ID of the room |
| `status` | `string` | New status of the room |
| `changedAt` | `DateTime` | UTC timestamp of status change |

**Room Status Values:**
| Value | Description |
|-------|-------------|
| `Open` | Room is accepting new players |
| `Full` | Room has reached maximum capacity |
| `Closed` | Room is closed for new players |
| `InProgress` | Match is currently in progress |
| `Completed` | Match has been completed |

**JavaScript Handler:**
```javascript
connection.on("RoomStatusChanged", (data) => {
    console.log(`Room status changed to: ${data.status}`);
    // Update status badge in UI
});
```

---

## REST API Endpoints (Trigger Events)

These REST API calls trigger the corresponding SignalR events:

### Join Room
```
POST /api/match-rooms/{roomId}/join
Authorization: Bearer {token}
```
**Triggers:** `UserJoinedRoom` event to all room subscribers

---

### Leave Room
```
POST /api/match-rooms/{roomId}/leave
Authorization: Bearer {token}
```
**Triggers:** `UserLeftRoom` event to all room subscribers

---

### Update Participant (Team/Position)
```
PUT /api/match-rooms/{roomId}/participants/me
Authorization: Bearer {token}
Content-Type: application/json

{
    "teamAssignment": "A",
    "position": "ST"
}
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `teamAssignment` | `string?` | No | `"Unassigned"`, `"A"`, or `"B"` |
| `position` | `string?` | No | Player position (e.g., "GK", "CB", "ST") |

**Triggers:** `ParticipantUpdated` event to all room subscribers

---

## Complete Flow Example

### Scenario: Player joins room, selects Team A, then leaves

```javascript
// 1. Connect to SignalR
const connection = new signalR.HubConnectionBuilder()
    .withUrl("/hubs/matchroom", { accessTokenFactory: () => token })
    .build();

// 2. Set up event handlers
connection.on("UserJoinedRoom", (data) => {
    addPlayerToUI(data.userId, data.userName, "Unassigned");
    updateSlots(data.filledSlots, data.totalSlots);
});

connection.on("UserLeftRoom", (data) => {
    removePlayerFromUI(data.userId);
    updateSlots(data.filledSlots, data.totalSlots);
    if (data.newHostId) {
        updateHostUI(data.newHostId);
    }
});

connection.on("ParticipantUpdated", (data) => {
    movePlayerToTeam(data.userId, data.teamAssignment, data.position);
});

// 3. Start connection
await connection.start();

// 4. Subscribe to room updates
await connection.invoke("JoinRoomGroup", roomId);

// 5. Join the room (REST API)
await fetch(`/api/match-rooms/${roomId}/join`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` }
});
// -> Triggers UserJoinedRoom event

// 6. Select Team A (REST API)
await fetch(`/api/match-rooms/${roomId}/participants/me`, {
    method: "PUT",
    headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    },
    body: JSON.stringify({ teamAssignment: "A", position: "ST" })
});
// -> Triggers ParticipantUpdated event

// 7. Leave room (REST API)
await fetch(`/api/match-rooms/${roomId}/leave`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` }
});
// -> Triggers UserLeftRoom event
```

---

## UI Color Scheme Recommendation

| Element | Color | Hex Code |
|---------|-------|----------|
| Host Player | Red | `#ff6b6b` |
| Current User (You) | Blue Border | `#6fb5ff` |
| Unassigned Column | Green Border | `#7fff6f` |
| Team A Column | Blue Border | `#6fb5ff` |
| Team B Column | Yellow Border | `#ffd700` |

---

## Test Pages

Two HTML test pages are available in the `wwwroot` folder:

1. **matchroom-test.html** - Basic room join/leave testing
2. **matchroom-teams-test.html** - Team selection and position testing

Access them at:
- `https://localhost:7109/matchroom-test.html`
- `https://localhost:7109/matchroom-teams-test.html`

---

## Error Handling

All SignalR operations should include error handling:

```javascript
connection.onclose((error) => {
    console.error("Connection closed:", error);
    // Attempt reconnection or show error message
});

connection.onreconnecting((error) => {
    console.warn("Reconnecting...", error);
});

connection.onreconnected((connectionId) => {
    console.log("Reconnected with ID:", connectionId);
    // Re-subscribe to room group
    if (currentRoomId) {
        connection.invoke("JoinRoomGroup", currentRoomId);
    }
});
```
