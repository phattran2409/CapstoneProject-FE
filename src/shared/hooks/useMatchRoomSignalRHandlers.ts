import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { roomsKeys } from "@/features/rooms/api/roomsKeys";
import type {
  MatchRoomFullInfo,
  MatchRoomParticipant,
  MatchRoomStatus,
  TeamAssignment,
  TeamFormationSnapshot,
} from "@/features/rooms/types/room.types";
import type {
  UseMatchRoomSignalROptions,
  UserJoinedPayload,
  UserLeftPayload,
  ParticipantUpdatedPayload,
  RoomStatusPayload,
  PlayerKickedPayload,
  TeamChatSwitchedPayload,
  RoomMessage,
  RoomMessagesPayload,
  RoomTypingPayload,
  RoomStopTypingPayload,
  ParticipantPaidEvent,
  FormationUpdatedPayload,
  HostTransferRequestedPayload,
  HostTransferRejectedPayload,
  HostTransferredPayload,
} from "./useMatchRoomSignalR";

export interface UseMatchRoomSignalRHandlersOptions {
  // Room info
  roomId: string;
  currentUserId?: string;

  // Room data management - setter cho state local
  setRoomData?: React.Dispatch<React.SetStateAction<MatchRoomFullInfo | null>>;

  // Callbacks cho UI
  onPlayerJoined?: (payload: UserJoinedPayload) => void;
  onPlayerLeft?: (payload: UserLeftPayload) => void;
  onParticipantUpdated?: (payload: ParticipantUpdatedPayload) => void;
  onStatusChanged?: (payload: RoomStatusPayload) => void;
  onKicked?: (payload: PlayerKickedPayload) => void;

  // Callback khi room bị xóa - để điều hướng
  onRoomDeleted?: () => void;

  // Callback khi host thay đổi
  onHostChanged?: (newHostId: string) => void;

  // Room chat callbacks
  onTeamChatSwitched?: (payload: TeamChatSwitchedPayload) => void;
  onNewRoomMessage?: (message: RoomMessage) => void;
  onRoomMessagesLoaded?: (payload: RoomMessagesPayload) => void;
  onUserTyping?: (payload: RoomTypingPayload) => void;
  onUserStopTyping?: (payload: RoomStopTypingPayload) => void;

  // Payment callbacks
  onParticipantPaid?: (payload: ParticipantPaidEvent) => void;

  // Formation callbacks
  onFormationUpdated?: (payload: FormationUpdatedPayload) => void;

  // Host transfer callbacks
  onHostTransferRequested?: (payload: HostTransferRequestedPayload) => void;
  onHostTransferRejected?: (payload: HostTransferRejectedPayload) => void;
  onHostTransferred?: (payload: HostTransferredPayload) => void; 
  // Toast/Alert notifications
  showNotification?: (
    message: string,
    type?: "success" | "info" | "warning" | "error",
  ) => void;
}

/**
 * Hook tạo các SignalR handlers cho Match Room
 * Xử lý logic cập nhật UI khi có events từ server
 *
 * Cấu trúc participants:
 * - participants.teamA: MatchRoomParticipant[]
 * - participants.teamB: MatchRoomParticipant[]
 * - participants.unassigned: MatchRoomParticipant[]
 *
 * @example
 * const handlers = useMatchRoomSignalRHandlers({
 *   roomId: '123',
 *   currentUserId: user?.userId,
 *   setRoomData,
 *   showNotification: (msg) => Alert.alert('Info', msg),
 * });
 *
 * const { isConnected } = useMatchRoomSignalR(handlers);
 */
export const useMatchRoomSignalRHandlers = (
  options: UseMatchRoomSignalRHandlersOptions,
): UseMatchRoomSignalROptions => {
  const {
    roomId,
    currentUserId,
    setRoomData,
    onPlayerJoined,
    onPlayerLeft,
    onParticipantUpdated: onParticipantUpdatedCallback,
    onStatusChanged,
    onKicked,
    onRoomDeleted,
    onHostChanged,
    onTeamChatSwitched: onTeamChatSwitchedCallback,
    onNewRoomMessage,
    onRoomMessagesLoaded,
    onUserTyping,
    onUserStopTyping,
    showNotification,
    onParticipantPaid: onParticipantPaidCallback,
    onFormationUpdated: onFormationUpdatedCallback,
    onHostTransferRequested: onHostTransferRequestedCallback,
    onHostTransferRejected: onHostTransferRejectedCallback,
    onHostTransferred: onHostTransferredCallback,
  } = options;

  const queryClient = useQueryClient();

  /**
   * Helper: Map team assignment string to team key
   */
  const getTeamKey = (
    teamAssignment: TeamAssignment | string,
  ): "teamA" | "teamB" | "unassigned" => {
    switch (teamAssignment) {
      case "A":
        return "teamA";
      case "B":
        return "teamB";
      default:
        return "unassigned";
    }
  };

  /**
   * Handler khi có người chơi mới tham gia room
   */
  const onUserJoinedRoom = useCallback(
    (payload: UserJoinedPayload) => {
      console.log("🏟️ Handler - UserJoinedRoom:", payload);

      // Bỏ qua nếu không phải room hiện tại
      if (payload.roomId !== roomId) return;

      // Tạo participant object mới từ payload (dùng avatarUrl hoặc fallback userAvatar)
      const newParticipant: MatchRoomParticipant = {
        participantId: payload.participantId || `temp-${Date.now()}`,
        isCaptain: false,
        userId: payload.userId,
        fullName: payload.userName,
        avatarUrl: payload.avatarUrl || payload.userAvatar || null,
        teamAssignment:
          (payload.teamAssignment as TeamAssignment) || "Unassigned",
        position: payload.position || "",
        depositPaid: false,
        joinDate: payload.joinedAt,
      };

      // Xác định team key
      const teamKey = getTeamKey(newParticipant.teamAssignment);

      // Cập nhật room data
      if (setRoomData) {
        setRoomData((prev) => {
          if (!prev) return prev;

          // Kiểm tra participant đã tồn tại chưa
          const allParticipants = [
            ...prev.participants.teamA,
            ...prev.participants.teamB,
            ...prev.participants.unassigned,
          ];
          const participantExists = allParticipants.some(
            (p) => p.userId === payload.userId,
          );
          if (participantExists) return prev;

          return {
            ...prev,
            filledSlots: payload.filledSlots ?? prev.filledSlots + 1,
            totalSlots: payload.totalSlots ?? prev.totalSlots,
            participants: {
              ...prev.participants,
              [teamKey]: [...prev.participants[teamKey], newParticipant],
            },
          };
        });
      }

      // Invalidate queries để đồng bộ với server
      queryClient.invalidateQueries({
        queryKey: roomsKeys.detail(roomId),
      });

      // Hiển thị notification nếu không phải current user
      if (payload.userId !== currentUserId && showNotification) {
        const teamName =
          payload.teamAssignment === "A"
            ? "Team A"
            : payload.teamAssignment === "B"
              ? "Team B"
              : "phòng";
        showNotification(`${payload.userName} đã tham gia ${teamName}`, "info");
      }

      // Custom callback
      onPlayerJoined?.(payload);
    },
    [
      roomId,
      currentUserId,
      setRoomData,
      queryClient,
      showNotification,
      onPlayerJoined,
    ],
  );

  /**
   * Handler khi có người chơi rời khỏi room
   * Bao gồm logic xử lý:
   * - isRoomDeleted: Room bị xóa (host là người cuối cùng)
   * - newHostId: Host mới được chỉ định khi host cũ rời đi
   */
  const onUserLeftRoom = useCallback(
    (payload: UserLeftPayload) => {
      console.log("🚪 Handler - UserLeftRoom:", payload);

      if (payload.roomId !== roomId) return;

      // Case 1: Room đã bị xóa
      if (payload.isRoomDeleted) {
        console.log("🗑️ Room has been deleted");

        if (showNotification) {
          showNotification("Phòng đã bị xóa", "warning");
        }

        // Trigger callback để điều hướng
        onRoomDeleted?.();
        return;
      }

      // Cập nhật room data - xóa participant khỏi tất cả teams
      if (setRoomData) {
        setRoomData((prev) => {
          if (!prev) return prev;

          const updatedRoom: MatchRoomFullInfo = {
            ...prev,
            filledSlots:
              payload.filledSlots ?? Math.max(0, prev.filledSlots - 1),
            totalSlots: payload.totalSlots ?? prev.totalSlots,
            participants: {
              teamA: prev.participants.teamA.filter(
                (p) => p.userId !== payload.userId,
              ),
              teamB: prev.participants.teamB.filter(
                (p) => p.userId !== payload.userId,
              ),
              unassigned: prev.participants.unassigned.filter(
                (p) => p.userId !== payload.userId,
              ),
            },
          };

          // Case 2: Host mới được chỉ định
          if (payload.newHostId) {
            updatedRoom.hostId = payload.newHostId;
            // Tìm host mới trong participants để cập nhật host info
            const allParticipants = [
              ...updatedRoom.participants.teamA,
              ...updatedRoom.participants.teamB,
              ...updatedRoom.participants.unassigned,
            ];
            const newHostParticipant = allParticipants.find(
              (p) => p.userId === payload.newHostId,
            );
            if (newHostParticipant) {
              updatedRoom.host = {
                userId: newHostParticipant.userId,
                fullName: newHostParticipant.fullName,
                avatarUrl: newHostParticipant.avatarUrl,
              };
            }
          }

          return updatedRoom;
        });
      }

      // Case 2: Thông báo về host mới
      if (payload.newHostId) {
        console.log("👑 New host assigned:", payload.newHostId);

        if (showNotification) {
          if (payload.newHostId === currentUserId) {
            showNotification("Bạn đã trở thành host của phòng!", "success");
          } else {
            showNotification(
              `${payload.userName} đã rời đi. Host mới đã được chỉ định.`,
              "info",
            );
          }
        }

        // Trigger callback cho host change
        onHostChanged?.(payload.newHostId);
      } else {
        // Case 3: Người chơi thường rời đi
        if (payload.userId !== currentUserId && showNotification) {
          showNotification(`${payload.userName} đã rời khỏi phòng`, "info");
        }
      }

      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: roomsKeys.detail(roomId),
      });

      // Custom callback
      onPlayerLeft?.(payload);
    },
    [
      roomId,
      currentUserId,
      setRoomData,
      queryClient,
      showNotification,
      onPlayerLeft,
      onRoomDeleted,
      onHostChanged,
    ],
  );

  /**
   * Handler khi người chơi thay đổi team/position
   * Di chuyển participant từ team cũ sang team mới
   */
  const onParticipantUpdated = useCallback(
    (payload: ParticipantUpdatedPayload) => {
      console.log("🔄 Handler - ParticipantUpdated:", payload);

      if (payload.roomId !== roomId) return;

      // Xác định team key mới
      const newTeamKey = getTeamKey(payload.teamAssignment);

      // Cập nhật room data - di chuyển participant sang team mới
      if (setRoomData) {
        setRoomData((prev) => {
          if (!prev) return prev;

          // Tìm participant trong tất cả teams
          let foundParticipant: MatchRoomParticipant | undefined;
          let oldTeamKey: "teamA" | "teamB" | "unassigned" | undefined;

          // Tìm trong teamA
          const inTeamA = prev.participants.teamA.find(
            (p) => p.userId === payload.userId,
          );
          if (inTeamA) {
            foundParticipant = inTeamA;
            oldTeamKey = "teamA";
          }

          // Tìm trong teamB
          if (!foundParticipant) {
            const inTeamB = prev.participants.teamB.find(
              (p) => p.userId === payload.userId,
            );
            if (inTeamB) {
              foundParticipant = inTeamB;
              oldTeamKey = "teamB";
            }
          }

          // Tìm trong unassigned
          if (!foundParticipant) {
            const inUnassigned = prev.participants.unassigned.find(
              (p) => p.userId === payload.userId,
            );
            if (inUnassigned) {
              foundParticipant = inUnassigned;
              oldTeamKey = "unassigned";
            }
          }

          // Nếu không tìm thấy participant, không làm gì
          if (!foundParticipant || !oldTeamKey) {
            console.warn("⚠️ Participant not found:", payload.userId);
            return prev;
          }

          // Cập nhật participant info
          const updatedParticipant: MatchRoomParticipant = {
            ...foundParticipant,
            teamAssignment: payload.teamAssignment,
            position: payload.position || foundParticipant.position,
            avatarUrl: payload.avatarUrl ?? foundParticipant.avatarUrl,
            fullName: payload.userName || foundParticipant.fullName,
          };

          // Nếu team không thay đổi, chỉ cập nhật info
          if (oldTeamKey === newTeamKey) {
            return {
              ...prev,
              participants: {
                ...prev.participants,
                [oldTeamKey]: prev.participants[oldTeamKey].map((p) =>
                  p.userId === payload.userId ? updatedParticipant : p,
                ),
              },
            };
          }

          // Di chuyển participant sang team mới
          return {
            ...prev,
            participants: {
              ...prev.participants,
              // Xóa khỏi team cũ
              [oldTeamKey]: prev.participants[oldTeamKey].filter(
                (p) => p.userId !== payload.userId,
              ),
              // Thêm vào team mới
              [newTeamKey]: [
                ...prev.participants[newTeamKey],
                updatedParticipant,
              ],
            },
          };
        });
      }

      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: roomsKeys.detail(roomId),
      });

      // Hiển thị notification nếu không phải current user
      if (payload.userId !== currentUserId && showNotification) {
        const teamName =
          payload.teamAssignment === "A"
            ? "Team A"
            : payload.teamAssignment === "B"
              ? "Team B"
              : "chưa phân đội";
        showNotification(
          `${payload.userName} đã chuyển sang ${teamName}${payload.position ? ` (${payload.position})` : ""}`,
          "info",
        );
      }

      // Custom callback
      onParticipantUpdatedCallback?.(payload);
    },
    [
      roomId,
      currentUserId,
      setRoomData,
      queryClient,
      showNotification,
      onParticipantUpdatedCallback,
    ],
  );

  /**
   * Handler khi trạng thái room thay đổi
   */
  const onRoomStatusChanged = useCallback(
    (payload: RoomStatusPayload) => {
      console.log("📊 Handler - RoomStatusChanged:", payload);

      if (payload.roomId !== roomId) return;

      // Cập nhật room data
      if (setRoomData) {
        setRoomData((prev) => {
          if (!prev) return prev;
          const nextStatus: MatchRoomStatus = payload.status as MatchRoomStatus;
          return {
            ...prev,
            status: nextStatus,
            filledSlots:
              payload.filledSlots ?? payload.currentPlayers ?? prev.filledSlots,
            totalSlots:
              payload.totalSlots ?? payload.totalPlayers ?? prev.totalSlots,
          };
        });
      }

      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: roomsKeys.detail(roomId),
      });

      // Hiển thị notification dựa trên status mới
      if (showNotification) {
        switch (payload.status) {
          case "Full":
            showNotification("Phòng đã đầy!", "warning");
            break;
          case "Closed":
            showNotification("Phòng đã đóng", "info");
            break;
          case "InProgress":
            showNotification("Trận đấu đang diễn ra", "info");
            break;
          case "Completed":
            showNotification("Trận đấu đã kết thúc", "success");
            break;
          case "Cancelled":
            showNotification("Phòng đã bị hủy", "error");
            break;
        }
      }

      // Custom callback
      onStatusChanged?.(payload);
    },
    [roomId, setRoomData, queryClient, showNotification, onStatusChanged],
  );

  /**
   * Handler khi một người chơi bị kick
   */
  const onPlayerKicked = useCallback(
    (payload: PlayerKickedPayload) => {
      console.log("⛔ Handler - PlayerKicked:", payload);

      if (payload.roomId !== roomId) return;

      // Cập nhật room data - xóa participant bị kick
      if (setRoomData) {
        setRoomData((prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            filledSlots: Math.max(0, prev.filledSlots - 1),
            participants: {
              teamA: prev.participants.teamA.filter(
                (p) => p.userId !== payload.kickedUserId,
              ),
              teamB: prev.participants.teamB.filter(
                (p) => p.userId !== payload.kickedUserId,
              ),
              unassigned: prev.participants.unassigned.filter(
                (p) => p.userId !== payload.kickedUserId,
              ),
            },
          };
        });
      }

      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: roomsKeys.detail(roomId),
      });

      // Hiển thị notification
      if (showNotification) {
        if (payload.kickedUserId === currentUserId) {
          showNotification(
            `Bạn đã bị kick khỏi phòng${payload.reason ? `: ${payload.reason}` : ""}`,
            "error",
          );
        } else {
          showNotification(
            `${payload.kickedUserName} đã bị kick khỏi phòng`,
            "warning",
          );
        }
      }

      // Custom callback
      onKicked?.(payload);
    },
    [
      roomId,
      currentUserId,
      setRoomData,
      queryClient,
      showNotification,
      onKicked,
    ],
  );

  /**
   * Handler cho errors từ server
   */
  const onError = useCallback(
    (payload: any) => {
      console.error("❌ Handler - SignalR Error:", payload);

      if (showNotification) {
        showNotification(payload.message || "Đã có lỗi xảy ra", "error");
      }
    },
    [showNotification],
  );

  // ==================== Room Chat Handlers ====================

  /**
   * Handler khi user switch team chat channel
   */
  const onTeamChatSwitched = useCallback(
    (payload: TeamChatSwitchedPayload) => {
      console.log("💬 Handler - TeamChatSwitched:", payload);

      if (payload.roomId !== roomId) return;

      // Hiển thị notification
      if (showNotification) {
        const teamName =
          payload.teamAssignment === "A"
            ? "Team A"
            : payload.teamAssignment === "B"
              ? "Team B"
              : "All";
        showNotification(`Đã chuyển sang chat ${teamName}`, "success");
      }

      // Custom callback
      onTeamChatSwitchedCallback?.(payload);
    },
    [roomId, showNotification, onTeamChatSwitchedCallback],
  );

  /**
   * Handler khi nhận được message mới
   */
  const onReceiveRoomMessage = useCallback(
    (message: RoomMessage) => {
      console.log("📨 Handler - ReceiveRoomMessage:", message);

      if (message.roomId !== roomId) return;

      // Custom callback để thêm message vào UI
      onNewRoomMessage?.(message);
    },
    [roomId, onNewRoomMessage],
  );

  /**
   * Handler khi nhận danh sách messages (pagination)
   */
  const onReceiveRoomMessages = useCallback(
    (payload: RoomMessagesPayload) => {
      console.log("📨 Handler - ReceiveRoomMessages:", payload);

      // Custom callback để load messages vào UI
      onRoomMessagesLoaded?.(payload);
    },
    [onRoomMessagesLoaded],
  );

  /**
   * Handler khi user đang typing
   */
  const onRoomUserTyping = useCallback(
    (payload: RoomTypingPayload) => {
      console.log("⌨️ Handler - RoomUserTyping:", payload);

      if (payload.roomId !== roomId) return;

      // Bỏ qua nếu là current user
      if (payload.userId === currentUserId) return;

      // Custom callback để hiển thị typing indicator
      onUserTyping?.(payload);
    },
    [roomId, currentUserId, onUserTyping],
  );

  /**
   * Handler khi user stop typing
   */
  const onRoomUserStopTyping = useCallback(
    (payload: RoomStopTypingPayload) => {
      console.log("⌨️ Handler - RoomUserStopTyping:", payload);

      if (payload.roomId !== roomId) return;

      // Bỏ qua nếu là current user
      if (payload.userId === currentUserId) return;

      // Custom callback để ẩn typing indicator
      onUserStopTyping?.(payload);
    },
    [roomId, currentUserId, onUserStopTyping],
  );

  /**
   * Handler khi một participant thanh toán thành công (ParticipantPaid)
   */
  const onParticipantPaid = useCallback(
    (payload: ParticipantPaidEvent) => {
      console.log("💵 Handler - ParticipantPaid:", payload);

      if (payload.roomId !== roomId) return;

      if (setRoomData) {
        setRoomData((prev) => {
          if (!prev) return prev;

          // Cập nhật tổng tiền đã thu
          const updated: MatchRoomFullInfo = {
            ...prev,
            totalDepositCollected: payload.totalDepositCollected,
          };

          // Đánh dấu participant đã thanh toán
          const updateParticipantList = (
            list: MatchRoomParticipant[],
          ): MatchRoomParticipant[] =>
            list.map((p) =>
              p.userId === payload.userId
                ? {
                    ...p,
                    depositPaid: true,
                  }
                : p,
            );

          updated.participants = {
            teamA: updateParticipantList(prev.participants.teamA),
            teamB: updateParticipantList(prev.participants.teamB),
            unassigned: updateParticipantList(prev.participants.unassigned),
          };

          return updated;
        });
      }

      // Invalidate queries để đồng bộ với server
      queryClient.invalidateQueries({
        queryKey: roomsKeys.detail(roomId),
      });

      // Thông báo UI
      if (showNotification) {
        const isCurrentUser = payload.userId === currentUserId;
        const amount = payload.amountPaid.toLocaleString("vi-VN");
        const total = payload.totalDepositCollected.toLocaleString("vi-VN");
        showNotification(
          isCurrentUser
            ? `Bạn đã thanh toán ${amount}đ (tổng đã thu: ${total}đ)`
            : `${payload.userName} đã thanh toán ${amount}đ (tổng đã thu: ${total}đ)`,
          "success",
        );
      }

      // Custom callback
      onParticipantPaidCallback?.(payload);
    },
    [
      roomId,
      currentUserId,
      setRoomData,
      queryClient,
      showNotification,
      onParticipantPaidCallback,
    ],
  );

  /**
   * Handler khi captain cập nhật đội hình thành công
   */
  const onFormationUpdated = useCallback(
    (payload: FormationUpdatedPayload) => {
      console.log("⚽ Handler - FormationUpdated:", payload);

      if (payload.roomId !== roomId) return;

      // Cập nhật room data - ghi đè formation của team được update
      if (setRoomData) {
        setRoomData((prev) => {
          if (!prev) return prev;

          // Map payload sang TeamFormationSnapshot format
          const updatedFormation: TeamFormationSnapshot = {
            formationName: payload.formationName, 
            assignments: payload.assignments.map((a) => ({
              slotId: a.slotId,
              playerId: a.playerId,
              position: a.position,
            })),
          };

          const nextFormations = {
            teamA: (payload.team === 'A' ? updatedFormation : prev.formations?.teamA ?? null) as TeamFormationSnapshot | null,
            teamB: (payload.team === 'B' ? updatedFormation : prev.formations?.teamB ?? null) as TeamFormationSnapshot | null,
          };

          return {
            ...prev,
            formations: nextFormations,
          };
        });
      }

      // Invalidate queries để đồng bộ với server
      queryClient.invalidateQueries({
        queryKey: roomsKeys.detail(roomId),
      });

      // Hiển thị notification
      if (showNotification) {
        showNotification(
          `Team ${payload.team} đã đổi đội hình thành ${payload.formationName}`,
          "info",
        );
      }

      // Custom callback
      onFormationUpdatedCallback?.(payload);
    },
    [
      roomId,
      setRoomData,
      queryClient,
      showNotification,
      onFormationUpdatedCallback,
    ],
  );

  /**
   * Handler khi nhận yêu cầu chuyển quyền host
   * Chỉ xử lý nếu targetUserId trùng với currentUserId
   */
  const onHostTransferRequested = useCallback(
    (payload: HostTransferRequestedPayload) => {
      console.log("👑 Handler - HostTransferRequested:", payload);
      if (payload.roomId !== roomId) return;

      if (payload.targetUserId === currentUserId) {
        onHostTransferRequestedCallback?.(payload);
      }
    },
    [roomId, currentUserId, onHostTransferRequestedCallback],
  );

  /**
   * Handler khi nhận yêu cầu chuyển host qua SignalR
   */
  const onHostTransferRejected = useCallback(
    (payload: HostTransferRejectedPayload) => {
      console.log("👑 Handler - HostTransferRejected:", payload);
      if (payload.roomId !== roomId) return;
      onHostTransferRejectedCallback?.(payload);
    },
    [roomId, currentUserId, onHostTransferRejectedCallback],
  );
  /**
   * Handler khi host chuyển quyền host thành công
   */
  const onHostTransferred = useCallback(
    (payload: HostTransferredPayload) => {
      console.log("👑 Handler - HostTransferred:", payload);
      if (payload.roomId !== roomId ) return;
      onHostTransferredCallback?.(payload);
    },
    [roomId, currentUserId, onHostTransferredCallback],
  );
  return {
    roomId,
    onUserJoinedRoom,
    onUserLeftRoom,
    onParticipantUpdated,
    onRoomStatusChanged,
    onPlayerKicked,
    onTeamChatSwitched,
    onReceiveRoomMessage,
    onReceiveRoomMessages,
    onRoomUserTyping,
    onRoomUserStopTyping,
    onError,
    onParticipantPaid,
    onFormationUpdated,
    onHostTransferRequested, 
    onHostTransferRejected,
    onHostTransferred,
  };
};
