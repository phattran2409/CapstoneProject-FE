import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "@/shared/theme";
import { useTranslation } from "react-i18next";
import {
  ThemedSafeAreaView,
  ThemedView,
  ThemedText,
  ThemedScrollView,
  ThemedIcon,
} from "@/shared/components/themed";
import { RootStackParamList } from "@/app/navigation/types";
import { Button } from "@/shared/components";
import {
  FormationField,
  FormationPlayer,
  getFormationNames,
  getFormation,
  type SlotAssignment,
  type PositionLine,
  type FormationData,
} from "@/shared/components/formation";
import { CaptainBadge } from "../components";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useMatchRoomDetail, type MatchRoomFullInfo } from "@/features/rooms";
import { roomsApi } from "@/features/rooms/api/roomsApi";
import { useToast } from "@/shared/toast";
import { useMatchRoomSignalR, useMatchRoomSignalRHandlers, type FormationUpdatedPayload } from "@/shared/hooks";
import { formatDate } from "@/shared/utils/formatters";
type TeamScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Team"
>;

interface TeamScreenProps {
  navigation?: TeamScreenNavigationProp;
  route?: {
    params: {
      roomId: string;
      team: "A" | "B";
    };
  };
}

type SelectedTeam = "teamA" | "teamB";

const TeamScreen: React.FC<TeamScreenProps> = ({
  navigation,
  route,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { roomId, team } = route?.params || {
    roomId: "1",
    team: "A" as const,
  };
  const [isCaptain, setIsCaptain] = useState<boolean>(false);
  const [hasPaidDeposit, setHasPaidDeposit] = useState<boolean>(false);
  const [assignments, setAssignments] = useState<SlotAssignment[]>([]);
  /** Captain chọn 1 cầu thủ từ list, sau đó bấm vào ô vị trí để gán */
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const handleShowChat = () => {
    navigation?.navigate('RoomChat', { roomId });
  };
  const { user } = useAuthStore();
  const toast = useToast();

  // Fetch room data from API
  const { data: room, isLoading: isLoadingRoom } = useMatchRoomDetail(roomId);
  
  // Local room data state for real-time updates (nếu cần SignalR updates)
  const [roomData, setRoomData] = useState<MatchRoomFullInfo | null>(null);

  // Sync room data from React Query
  useEffect(() => {
    if (room) {
      setRoomData(room);
    }
  }, [room]);

  const [selectedTeam, setSelectedTeam] = useState<SelectedTeam>(
    team === "B" ? "teamB" : "teamA",
  );

  const [selectedFormation, setSelectedFormation] = useState<string>("3-3");
  const [isLineupDropdownOpen, setIsLineupDropdownOpen] = useState(false);
  const [teamNameInput, setTeamNameInput] = useState<string>("");
  const [isSavingTeamName, setIsSavingTeamName] = useState(false);
  const [formationName , setFormationName] = useState<string>("3-3");


  // Use real room data if available, otherwise use mock data for display
  const displayRoom = roomData || room;
  const teamKey = selectedTeam === "teamA" ? "A" : "B";
  const defaultTeamLabel = teamKey === "A" ? "Team A" : "Team B";
  const displayTeamName = displayRoom?.teamNames?.[teamKey]?.trim() || defaultTeamLabel;

  useEffect(() => {
    const fromApi = displayRoom?.teamNames?.[teamKey]?.trim();
    setTeamNameInput(fromApi || defaultTeamLabel);
  }, [displayRoom?.teamNames, teamKey, defaultTeamLabel]);

  const formatForFormation =
    displayRoom?.matchFormat === "FiveVsFive"
      ? "5vs5"
      : displayRoom?.matchFormat === "SevenVsSeven"
        ? "7vs7"
        : "11vs11";

  // Get available formations based on format
  const availableFormations = getFormationNames(formatForFormation);

  // Update selected formation when format changes
  useEffect(() => {
    const formations = getFormationNames(formatForFormation);
    if (!formations.includes(selectedFormation)) {
      setSelectedFormation(formations[0]);
    }
  }, [formatForFormation, selectedFormation]);

  // Khởi tạo đội hình + assignments từ API khi có – chỉ thành viên trong team mới có dữ liệu và xem đúng vị trí captain assign
  const savedFormation = displayRoom?.formations?.[selectedTeam];
  useEffect(() => {
    // Nếu không có dữ liệu đội hình từ API thì không ghi đè state local
    if (
      !savedFormation ||
      !savedFormation.formationName ||
      !savedFormation.assignments ||
      savedFormation.assignments.length === 0
    ) {
      return;
    }

    // Chỉ khi formation từ API thay đổi thì mới sync lại state local
    setSelectedFormation(savedFormation.formationName);
    setAssignments(
      savedFormation.assignments.map((a) => ({
        slotId: a.slotId,
        playerId: a.playerId,
      })),
    );
  }, [
    savedFormation?.formationName,
    JSON.stringify(savedFormation?.assignments ?? []),
  ]);

  useEffect(() => {
    if (!displayRoom) return;
    const currentUserParticipant = [
      ...(displayRoom.participants.teamA || []),
      ...(displayRoom.participants.teamB || []),
      ...(displayRoom.participants.unassigned || []),
    ].find((p) => p.userId === user?.userId);
    setIsCaptain(currentUserParticipant?.isCaptain === true);
    setHasPaidDeposit(currentUserParticipant?.depositPaid === true);
  }, [displayRoom, user?.userId]);

  const handleFormationUpdated = useCallback(
    (payload: FormationUpdatedPayload) => {
      if (payload.team === teamKey) {
        setSelectedFormation(payload.formationName);
        setAssignments(
          payload.assignments.map((a) => ({ slotId: a.slotId, playerId: a.playerId })),
        );
        toast.info(
          "Đội hình đã được cập nhật",
          `Captain đã đổi đội hình thành ${payload.formationName}`,
        );
      }
    },
    [teamKey, toast],
  );

  // Tạo SignalR handlers
  const signalRHandlers = useMatchRoomSignalRHandlers({
    roomId,
    currentUserId: user?.userId,
    setRoomData,
    showNotification: (message, type) => {
      // Chỉ show notification cho các event khác (không phải FormationUpdated)
      // vì FormationUpdated đã có toast riêng trong handleFormationUpdated
    },
    onFormationUpdated: handleFormationUpdated,
  });

  // Kết nối SignalR
  useMatchRoomSignalR(signalRHandlers);

  // Convert team players to FormationPlayer type (chỉ từ room data thật)
  const formationPlayers: FormationPlayer[] = React.useMemo(() => {
    if (!roomData) return [];
    const teamParticipants =
      selectedTeam === "teamA"
        ? roomData.participants.teamA
        : roomData.participants.teamB;
    return teamParticipants.map<FormationPlayer>((p) => ({
      id: p.userId,
      name: p.fullName || "Player",
      avatar: p.avatarUrl
        ? { uri: p.avatarUrl }
        : require("@assets/images/icon.png"),
      role: (p.position || "MF") as FormationPlayer["role"],
      isCaptain: p.userId === roomData.hostId,
    }));
  }, [roomData, selectedTeam]);

  const formationConfig = useMemo(
    () => getFormation(formatForFormation, selectedFormation),
    [formatForFormation, selectedFormation],
  );

  // Vị trí được captain assign cho user hiện tại – chỉ có khi user nằm trong team và có slotId
  const myAssignment = useMemo(() => assignments.find((a) => a.playerId === user?.userId), [assignments, user?.userId]);
  const myAssignedSlotLabel = useMemo(() => {
    if (!myAssignment || !formationConfig) return null;
    const slot = formationConfig.slots.find((s) => s.id === myAssignment.slotId);
    return slot?.label ?? myAssignment.slotId;
  }, [myAssignment, formationConfig]);

  /** Gán cầu thủ đang chọn vào slot (captain đã chọn player trước đó) */
  const handleAssignToSlot = (slotId: string) => {
    if (!selectedPlayerId || !isCaptain) {
      toast.warning("Vui lòng chọn cầu thủ ở bên dưới",
        "rồi bấm vào ô vị trí ở trên để gán", 
      );
      return;
    }
    setAssignments((prev) => {
      const withoutPlayer = prev.filter((a) => a.playerId !== selectedPlayerId);
      const withoutSlot = withoutPlayer.filter((a) => a.slotId !== slotId);
      return [...withoutSlot, { slotId, playerId: selectedPlayerId || "" }];
    });
    setSelectedPlayerId(null);
  };

  const handleSaveFormation = async () => {
    if (!isCaptain) {
      toast.error("Chỉ captain mới được phép lưu đội hình");
      return;
    }

    if (!formationConfig) {
      toast.error("Không tìm thấy cấu hình đội hình hợp lệ");
      return;
    }

    // Validate assignments theo Formation API docs:
    // - Đúng số slot
    // - Không trùng slot / player
    const requiredSlotIds = formationConfig.slots.map((s) => s.id);
    const assignedSlotIds = assignments.map((a) => a.slotId);
    const assignedPlayerIds = assignments.map((a) => a.playerId);

    // Đủ số lượng slot
    if (assignments.length !== requiredSlotIds.length) {
      toast.warning(
        "Chưa gán đủ vị trí",
        `Cần gán đủ ${requiredSlotIds.length} vị trí cho đội hình ${selectedFormation}`,
      );
      return;
    }

    // Không trùng slot
    const uniqueAssignedSlots = new Set(assignedSlotIds);
    if (uniqueAssignedSlots.size !== assignedSlotIds.length) {
      toast.error("Một vị trí trên sân đang được gán cho nhiều cầu thủ");
      return;
    }

    // Không trùng player
    const uniquePlayers = new Set(assignedPlayerIds);
    if (uniquePlayers.size !== assignedPlayerIds.length) {
      toast.error("Một cầu thủ đang được gán vào nhiều vị trí");
      return;
    }

    // Tất cả slotId đều hợp lệ với formation hiện tại
    const invalidSlots = assignedSlotIds.filter(
      (slotId) => !requiredSlotIds.includes(slotId),
    );
    if (invalidSlots.length > 0) {
      toast.error("Có slotId không hợp lệ cho đội hình hiện tại");
      return;
    }

    const payload = {
      team: teamKey as "A" | "B",
      formationName: selectedFormation,
      assignments: assignments.map((a) => {
        const slot = formationConfig?.slots.find((s) => s.id === a.slotId);
        return {
          slotId: a.slotId,
          playerId: a.playerId,
          position: slot?.line || "",
        };
      }),
    };
    try {
      await roomsApi.updateFormation(roomId, payload);
      toast.success(
        "Lưu đội hình thành công",
      );
    } catch (error) {
      console.error("Failed to save formation:", error);
      toast.error(
        "Lưu đội hình thất bại",
        "Vui lòng thử lại hoặc kiểm tra lại kết nối",
      );
    }
  };

  const handleSaveTeamName = async () => {
    if (!isCaptain) return;
    const name = teamNameInput.trim();
    if (!name) {
      toast.warning("Tên đội không được để trống");
      return;
    }
    try {
      setIsSavingTeamName(true);
      await roomsApi.updateTeamName(roomId, { team: teamKey, name });
      setRoomData((prev) =>
        prev
          ? {
              ...prev,
              teamNames: {
                ...prev.teamNames,
                [teamKey]: name,
              },
            }
          : prev,
      );
      toast.success("Đã cập nhật tên đội");
    } catch (error) {
      console.error("Failed to save team name:", error);
      toast.error("Không thể cập nhật tên đội", "Vui lòng thử lại");
    } finally {
      setIsSavingTeamName(false);
    }
  };

  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);

  const handleProcessPayment = async () => {
    if (isProcessingPayment || hasPaidDeposit) return;
    try {
      setIsProcessingPayment(true);
      await roomsApi.processPayment(roomId);
    } catch (error) {
      console.error("Failed to process payment:", error);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  
  return (
    <ThemedSafeAreaView style={styles.safeArea}>
      {/* Header */}
      <ThemedView
        style={[styles.header, { borderBottomColor: theme.colors.border }]}
      >
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigation?.goBack()}
            style={styles.backButton}
          >
            <ThemedIcon name="arrow-back" size={24} variant="secondary" />
          </TouchableOpacity>
          <ThemedText size="xl" weight="bold">
            {t("roomDetail.title")}
          </ThemedText>
        </View>
        <TouchableOpacity onPress={handleShowChat} style={styles.chatButton}>
          <ThemedIcon
            name="chatbubbles"
            size={24}
            variant="secondary"
          />
          <View
            style={[
              styles.chatBadge,
              {
                backgroundColor: theme.colors.neonGreen,
                borderColor: theme.colors.background,
              },
            ]}
          >
            <ThemedText size="xs" weight="bold" style={styles.chatBadgeText}>
              5
            </ThemedText>
          </View>
        </TouchableOpacity>
      </ThemedView>

      <ThemedScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          {/* Match Info */}
          <View style={styles.matchInfoSection}>
            <ThemedView
              style={[
                styles.matchInfoCard,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <View>
                <ThemedText
                  variant="secondary"
                  size="xs"
                  style={styles.matchInfoLabel}
                >
                  {t("roomDetail.venue")}
                </ThemedText>
                <ThemedText variant="primary" size="m" weight="medium">
                  {displayRoom?.field?.venue?.venueName ?? "—"}
                </ThemedText>
              </View>
            </ThemedView>
            {/* Team Name */}
            <ThemedView style={[styles.matchInfoCard, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.teamNameContainer}>
                <ThemedText variant="secondary" size="xs" style={styles.matchInfoLabel}>
                  {t("roomDetail.teamName")}
                </ThemedText>
                <View style={styles.teamNameBlock}>
                  {isCaptain ? (
                    <>
                      <TextInput
                        style={[
                          styles.teamNameInput,
                          {
                            color: theme.colors.textPrimary,
                            borderColor: theme.colors.border,
                            backgroundColor: theme.colors.surface,
                          },
                        ]}
                        placeholder="Nhập tên đội"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={teamNameInput}
                        onChangeText={setTeamNameInput}
                        maxLength={50}
                        editable={!isSavingTeamName}
                      />
                      <TouchableOpacity
                        style={[
                          styles.teamNameSaveBtn,
                          {
                            backgroundColor: theme.colors.neonGreen,
                            opacity: isSavingTeamName ? 0.6 : 1,
                          },
                        ]}
                        onPress={handleSaveTeamName}
                        disabled={isSavingTeamName}
                      >
                        <ThemedText size="s" weight="bold" style={{ color: "#000" }}>
                          {isSavingTeamName ? "Đang lưu..." : "Lưu tên đội"}
                        </ThemedText>
                      </TouchableOpacity>
                    </>
                  ) : <ThemedText variant="primary" size="m" weight="semiBold">
                      {displayTeamName}
                    </ThemedText>}
                </View>
              </View>
            </ThemedView>
            <ThemedView
              style={[
                styles.matchInfoCard,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <View>
                <ThemedText
                  variant="secondary"
                  size="xs"
                  style={styles.matchInfoLabel}
                >
                  {t("roomDetail.datetime")}
                </ThemedText>
                <ThemedText variant="primary" size="l" weight="semiBold">
                  {formatDate(displayRoom?.matchDate || "")} 
                </ThemedText>
              </View>
              <View>
                <ThemedText
                  variant="secondary"
                  size="xs"
                  style={styles.matchInfoLabel}
                >
                  {t("roomDetail.status")}
                </ThemedText>
                <ThemedText
                  variant="accent"
                  size="m"
                  weight="bold"
                  style={{ color: theme.colors.neonGreen }}
                >
                  {displayRoom?.status === "Open" ? "Sắp diễn ra" : "" }
                </ThemedText>
              </View>
            </ThemedView>
          </View>

          {/* Format & Team Info */}
          <ThemedView
            style={[
              styles.formatTeamCard,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            {/* Format */}
            <View>
              <ThemedText
                variant="secondary"
                size="s"
                style={styles.formatLabel}
              >
                {t("roomDetail.format")}
              </ThemedText>
              <View style={styles.formatContainer}>
                <View
                  style={[
                    styles.formatBadge,
                    { backgroundColor: theme.colors.neonGreen + "20" },
                  ]}
                >
                  <ThemedText
                    variant="accent"
                    size="m"
                    weight="bold"
                    style={{ color: theme.colors.neonGreen }}
                  >
                    {formatForFormation}
                  </ThemedText>
                </View>
              </View>
            </View>
            {/* Team Info */}
            <View>
              <ThemedText variant="tertiary" size="s" style={styles.matchInfoLabel}>
                {t("roomDetail.teamCountLabel")}
              </ThemedText>
              <View
                style={[
                  styles.teamCountBadge,
                  { backgroundColor: theme.colors.neonGreen + "15" },
                ]}
              >
                <ThemedText
                  variant="secondary"
                  size="s"
                  style={{ color: theme.colors.neonGreen }}
                >
                  {displayRoom
                    ? `${displayRoom.filledSlots}/${displayRoom.totalSlots}`
                    : "0/0"}
                </ThemedText>
              </View> 
            </View>
          </ThemedView>

          {/* Chỉ thành viên trong team mới thấy đúng vị trí captain đã assign (khi có slotId từ API) */}
          {myAssignedSlotLabel && (
            <ThemedView
              style={[
                styles.myPositionCard,
                {
                  backgroundColor: theme.colors.neonGreen + "18",
                  borderColor: theme.colors.neonGreen + "40",
                },
              ]}
            >
              <ThemedText
                variant="secondary"
                size="s"
                style={styles.myPositionLabel}
              >
                Vị trí của bạn
              </ThemedText>
              <ThemedText
                variant="primary"
                size="l"
                weight="bold"
                style={{ color: theme.colors.neonGreen }}
              >
                {myAssignedSlotLabel}
              </ThemedText>
            </ThemedView>
          )}

          {/* Sơ đồ đội hình để toàn đội theo dõi (chỉ hiển thị, không bench) */}
          {formationConfig && (
            <View style={{ marginBottom: 20 }}>
              <FormationField
                players={formationPlayers}
                format={formatForFormation as "5vs5" | "7vs7"}
                formationName={selectedFormation}
                initialAssignments={assignments}
                editable={false}
                showBench={false}
              />
            </View>
          )}

          {/* Formation Selector Dropdown */}
          {isCaptain && (
            <View style={styles.lineupSelectorContainer}>
              <ThemedText
                variant="secondary"
                size="s"
                style={styles.lineupLabel}
              >
                Chọn đội hình:
              </ThemedText>
              <View style={styles.dropdownWrapper}>
                <TouchableOpacity
                  style={[
                    styles.dropdownButton,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => setIsLineupDropdownOpen(!isLineupDropdownOpen)}
                >
                  <ThemedText variant="primary" size="m" weight="semiBold">
                    {selectedFormation}
                  </ThemedText>
                  <ThemedIcon
                    name={isLineupDropdownOpen ? "chevron-up" : "chevron-down"}
                    size={20}
                    variant="secondary"
                  />
                </TouchableOpacity>

                {/* Dropdown Menu */}
                {isLineupDropdownOpen && (
                  <View
                    style={[
                      styles.dropdownMenu,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.border,
                      },
                    ]}
                  >
                    {availableFormations.map((formation) => (
                      <TouchableOpacity
                        key={formation}
                        style={[
                          styles.dropdownItem,
                          {
                            backgroundColor:
                              selectedFormation === formation
                                ? theme.colors.neonGreen + "20"
                                : "transparent",
                            borderBottomWidth:
                              formation !==
                              availableFormations[
                                availableFormations.length - 1
                              ]
                                ? 1
                                : 0,
                            borderBottomColor: theme.colors.border,
                          },
                        ]}
                        onPress={() => {
                          setSelectedFormation(formation);
                          setIsLineupDropdownOpen(false);
                        }}
                      >
                        <ThemedText
                          variant="primary"
                          size="m"
                          weight={
                            selectedFormation === formation ? "bold" : "medium"
                          }
                          style={{
                            color:
                              selectedFormation === formation
                                ? theme.colors.neonGreen
                                : theme.colors.textPrimary,
                          }}
                        >
                          {formation}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Role position cards – captain chọn cầu thủ bên dưới rồi bấm vào ô để gán */}
          {isCaptain && formationConfig && (
            <View style={styles.roleCardsSection}>
              <ThemedText
                variant="secondary"
                size="s"
                style={styles.sectionLabel}
              >
                Vị trí trên sân – chọn cầu thủ bên dưới rồi bấm vào ô
              </ThemedText>
              {(["GK", "DF", "MF", "FW"] as PositionLine[]).map((line) => {
                const slots = formationConfig.slots.filter((s) => s.line === line);
                if (slots.length === 0) return null;
                return (
                  <ThemedView
                    key={line}
                    style={[
                      styles.roleCard,
                      { backgroundColor: theme.colors.surface },
                    ]}
                  >
                    <View style={styles.roleCardHeader}>
                      <ThemedText size="m" weight="bold">
                        {line}
                      </ThemedText>
                      <View
                        style={[
                          styles.roleBadge,
                          { backgroundColor: theme.colors.neonGreen + "25" },
                        ]}
                      >
                        <ThemedText
                          size="xs"
                          weight="bold"
                          style={{ color: theme.colors.neonGreen }}
                        >
                          {line}
                        </ThemedText>
                      </View>
                    </View>
                    {slots.map((slot) => {
                      const current = assignments.find(
                        (a) => a.slotId === slot.id,
                      );
                      const currentPlayer = formationPlayers.find(
                        (p) => p.id === current?.playerId,
                      );
                      return (
                        <TouchableOpacity
                          key={slot.id}
                          style={[
                            styles.roleSlotRow,
                            {
                              borderBottomColor: theme.colors.border,
                              backgroundColor: currentPlayer
                                ? theme.colors.neonGreen + "12"
                                : "transparent",
                            },
                          ]}
                          onPress={() =>
                            isCaptain && handleAssignToSlot(slot.id)
                          }
                          activeOpacity={0.7}
                        >
                          <ThemedText size="s" variant="secondary">
                            {slot.label}
                          </ThemedText>
                          <ThemedText
                            size="s"
                            weight={currentPlayer ? "semiBold" : "medium"}
                            variant={currentPlayer ? "primary" : "secondary"}
                          >
                            {currentPlayer ? currentPlayer.name : "Bấm để gán"}
                          </ThemedText>
                        </TouchableOpacity>
                      );
                    })}
                  </ThemedView>
                );
              })}
            </View>
          )}

          {/* Danh sách cầu thủ – captain bấm chọn rồi bấm ô vị trí ở trên */}
          {isCaptain && (
            <View style={styles.playerListSection}>
              <ThemedText
                variant="secondary"
                size="s"
                style={styles.sectionLabel}
              >
                Danh sách cầu thủ – bấm để chọn, sau đó bấm ô vị trí
              </ThemedText>
              {selectedPlayerId && (
                <ThemedText size="xs" variant="secondary" style={styles.hint}>
                  Đã chọn 1 cầu thủ. Bấm vào ô vị trí ở trên để gán.
                </ThemedText>
              )}
              <ScrollView
                style={styles.playerListScroll}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
              >
                {formationPlayers.map((player, index) => {
                  const assigned = assignments.find(
                    (a) => a.playerId === player.id,
                  );
                  const slot = assigned
                    ? formationConfig?.slots.find((s) => s.id === assigned.slotId)
                    : null;
                  const isSelected = selectedPlayerId === player.id;
                  return (
                    <TouchableOpacity
                      key={`${player.id}-${index}`}
                      style={[
                        styles.playerRow,
                        {
                          borderColor: theme.colors.border,
                          backgroundColor: isSelected
                            ? theme.colors.neonGreen + "20"
                            : theme.colors.surface,
                          borderLeftWidth: isSelected ? 4 : 0,
                          borderLeftColor: theme.colors.neonGreen,
                        },
                      ]}
                      onPress={() => {
                        if (!isCaptain) return;
                        setSelectedPlayerId((prev) =>
                          prev === player.id ? null : player.id,
                        );
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.playerRowLeft}>
                        {player.avatar ? (
                          <Image
                            source={player.avatar}
                            style={styles.playerAvatar}
                          />
                        ) : (
                          <View
                            style={[
                              styles.playerAvatarPlaceholder,
                              { backgroundColor: theme.colors.border },
                            ]}
                          >
                            <ThemedText size="s" weight="bold">
                              {player.name?.charAt(0) || "?"}
                            </ThemedText>
                          </View>
                        )}
                        <View>
                          <View style={styles.playerNameRow}>
                            <ThemedText
                              size="m"
                              weight={isSelected ? "bold" : "medium"}
                            >
                              {player.name}
                            </ThemedText>
                            {player.isCaptain && <CaptainBadge compact />}
                          </View>
                          {player.role && (
                            <ThemedText size="xs" variant="secondary">
                              {player.role}
                              {slot ? ` → ${slot.label}` : ""}
                            </ThemedText>
                          )}
                        </View>
                      </View>
                      {isSelected && (
                        <ThemedIcon
                          name="checkmark-circle"
                          size={22}
                          color={theme.colors.neonGreen}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {isCaptain && (
            <View style={styles.saveButtonContainer}>
              <Button title="Lưu đội hình" onPress={handleSaveFormation} />
            </View>
          )}

          {/* Check-in & Payment */}
          <View style={styles.paymentSection}>
            <ThemedView
              style={[
                styles.paymentCard,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <ThemedText
                variant="primary"
                size="l"
                weight="bold"
                style={styles.paymentTitle}
              >
                Check-in & Thanh  toán
              </ThemedText>
              <View style={styles.paymentRow}>
                <ThemedText variant="secondary" size="s">
                  Tiền sân mỗi người:
                </ThemedText>
                <ThemedText variant="primary" size="l" weight="bold">
                  {(
                    displayRoom?.depositPerPerson ?? 0
                  ).toLocaleString("vi-VN")}
                  đ
                </ThemedText>
              </View>

              <View style={styles.paymentButtons}>
                {/* <TouchableOpacity
                  style={[
                    styles.paymentButton,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.neonGreen,
                    },
                  ]}
                >
                  <ThemedIcon name="qr-code" size={20} variant="accent" />
                  <ThemedText
                    size="m"
                    weight="bold"
                    style={[
                      styles.paymentButtonText,
                      { color: theme.colors.neonGreen },
                    ]}
                  >
                    Check-in Ngay
                  </ThemedText>
                </TouchableOpacity> */}

                <TouchableOpacity
                  style={[
                    styles.paymentButton,
                    {
                      backgroundColor: theme.colors.neonGreen,
                      opacity: isProcessingPayment || hasPaidDeposit ? 0.6 : 1,
                    },
                  ]}
                  onPress={handleProcessPayment}
                  disabled={isProcessingPayment || hasPaidDeposit}
                >
                  <ThemedIcon name="card" size={20} color="#000" />
                  <ThemedText
                    size="m"
                    weight="bold"
                    style={[styles.paymentButtonText, { color: "#000" }]}
                  >
                    {isProcessingPayment
                      ? "Đang thanh toán..."
                      : hasPaidDeposit
                        ? "Đã thanh toán"
                        : "Thanh toán"}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </ThemedView>
          </View>
        </View>
      </ThemedScrollView>
    </ThemedSafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    paddingVertical: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  chatButton: {
    position: "relative",
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  chatBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  chatBadgeText: {
    color: "#000",
    fontSize: 10,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  matchInfoSection: {
    marginBottom: 24,
  },
  matchInfoCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  matchInfoLabel: {
    marginBottom: 4,
  },
  formatTeamCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 16,
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  myPositionCard: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  myPositionLabel: {
    marginBottom: 4,
  },
  formatLabel: {
    marginBottom: 8,
  },
  formatContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  formatBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  teamInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  teamNameContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  teamNameBlock: {
    flex: 1,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  teamNameInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  teamNameSaveBtn: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  teamCountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  lineupSelectorContainer: {
    marginBottom: 16,
  },
  lineupLabel: {
    marginBottom: 8,
  },
  dropdownWrapper: {
    position: "relative",
    zIndex: 1000,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  dropdownMenu: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: 4,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  saveButtonContainer: {
    marginTop: 16,
  },
  roleCardsSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    marginBottom: 10,
  },
  hint: {
    marginBottom: 8,
  },
  roleCard: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  roleCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  roleSlotRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  playerListSection: {
    marginBottom: 16,
  },
  playerListScroll: {
    maxHeight: 280,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  playerRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  playerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  playerAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  paymentSection: {
    marginTop: 24,
    marginBottom: 16,
  },
  paymentCard: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  paymentTitle: {
    marginBottom: 8,
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  paymentButtons: {
    flex:1,
    marginTop: 16,
    gap: 12,
  },
  paymentButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  paymentButtonText: {
    marginLeft: 8,
  },
});

export default TeamScreen;
