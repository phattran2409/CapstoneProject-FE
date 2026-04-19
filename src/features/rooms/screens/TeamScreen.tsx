import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/shared/theme";
import { useTranslation } from "react-i18next";
import {
  ThemedSafeAreaView,
  ThemedScrollView,
} from "@/shared/components/themed";
import { RootStackParamList } from "@/app/navigation/types";
import {
  getFormationNames,
  getFormation,
  type SlotAssignment,
  type PositionLine,
} from "@/shared/components/formation";
import { useAuthStore } from "@/features/auth/store/authStore";
import {
  useMatchRoomDetail,
  type MatchRoomFullInfo,
} from "@/features/rooms";
import { roomsApi } from "@/features/rooms/api/roomsApi";
import { roomsKeys } from "@/features/rooms/api/roomsKeys";
import { getResolvedTeamDisplayName } from "@/features/rooms/utils/teamDisplayName";
import {
  TeamScreenHeader,
  TeamMatchInfoSection,
  TeamLineupSection,
  TeamDepositSection,
  teamScreenStyles as styles,
} from "@/features/rooms/components/teamScreen";
import { useToast } from "@/shared/toast";
import {
  useMatchRoomSignalR,
  useMatchRoomSignalRHandlers,
  type FormationUpdatedPayload,
} from "@/shared/hooks";
import { formatDate } from "@/shared/utils/formatters";
import { getTranslatedError } from "@/shared/utils/errorTranslations";

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

const TeamScreen: React.FC<TeamScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { roomId, team } = route?.params || {
    roomId: "1",
    team: "A" as const,
  };
  const [isCaptain, setIsCaptain] = useState<boolean>(false);
  const [hasPaidDeposit, setHasPaidDeposit] = useState<boolean>(false);
  const [assignments, setAssignments] = useState<SlotAssignment[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const handleShowChat = () => {
    navigation?.navigate("RoomChat", { roomId });
  };
  const { user } = useAuthStore();
  const toast = useToast();

  const { data: room } = useMatchRoomDetail(roomId);
  const [roomData, setRoomData] = useState<MatchRoomFullInfo | null>(null);

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

  const displayRoom = roomData || room;
  const teamKey = selectedTeam === "teamA" ? "A" : "B";
  const defaultTeamLabel = teamKey === "A" ? "Team A" : "Team B";
  const displayTeamName = displayRoom
    ? getResolvedTeamDisplayName(displayRoom, selectedTeam, defaultTeamLabel)
    : defaultTeamLabel;

  useEffect(() => {
    if (!displayRoom) return;
    const resolved = getResolvedTeamDisplayName(
      displayRoom,
      selectedTeam,
      defaultTeamLabel,
    );
    setTeamNameInput(resolved);
  }, [
    displayRoom?.teamNames,
    displayRoom?.formations,
    selectedTeam,
    defaultTeamLabel,
  ]);

  const formatForFormation =
    displayRoom?.matchFormat === "FiveVsFive"
      ? "5vs5"
      : displayRoom?.matchFormat === "SevenVsSeven"
        ? "7vs7"
        : "11vs11";

  const availableFormations = getFormationNames(formatForFormation);

  useEffect(() => {
    const formations = getFormationNames(formatForFormation);
    if (!formations.includes(selectedFormation)) {
      setSelectedFormation(formations[0]);
    }
  }, [formatForFormation, selectedFormation]);

  const savedFormation = displayRoom?.formations?.[selectedTeam];
  useEffect(() => {
    if (
      !savedFormation ||
      !savedFormation.formationName ||
      !savedFormation.assignments ||
      savedFormation.assignments.length === 0
    ) {
      return;
    }

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
          payload.assignments.map((a) => ({
            slotId: a.slotId,
            playerId: a.playerId,
          })),
        );
        toast.info(
          t("teamScreen.formationUpdated"),
          t("teamScreen.formationUpdatedDesc", {
            name: payload.formationName,
          }),
        );
      }
    },
    [teamKey, toast, t],
  );

  const signalRHandlers = useMatchRoomSignalRHandlers({
    roomId,
    currentUserId: user?.userId,
    setRoomData,
    showNotification: () => {},
    onFormationUpdated: handleFormationUpdated,
  });

  useMatchRoomSignalR(signalRHandlers);

  const formationPlayers = React.useMemo(() => {
    if (!roomData) return [];
    const teamParticipants =
      selectedTeam === "teamA"
        ? roomData.participants.teamA
        : roomData.participants.teamB;
    return teamParticipants.map((p) => ({
      id: p.userId,
      name: p.fullName || "Player",
      avatar: p.avatarUrl
        ? { uri: p.avatarUrl }
        : require("@assets/images/icon.png"),
      role: (p.position || "MF") as PositionLine,
      isCaptain: p.userId === roomData.hostId,
    }));
  }, [roomData, selectedTeam]);

  const formationConfig = useMemo(
    () => getFormation(formatForFormation, selectedFormation),
    [formatForFormation, selectedFormation],
  );

  const myAssignment = useMemo(
    () => assignments.find((a) => a.playerId === user?.userId),
    [assignments, user?.userId],
  );
  const myAssignedSlotLabel = useMemo(() => {
    if (!myAssignment || !formationConfig) return null;
    const slot = formationConfig.slots.find((s) => s.id === myAssignment.slotId);
    return slot?.label ?? myAssignment.slotId;
  }, [myAssignment, formationConfig]);

  const handleAssignToSlot = (slotId: string) => {
    if (!selectedPlayerId || !isCaptain) {
      toast.warning(
        t("teamScreen.selectPlayerFirst"),
        t("teamScreen.selectPlayerFirstDesc"),
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
      toast.error(t("teamScreen.captainOnlySave"));
      return;
    }

    if (!formationConfig) {
      toast.error(t("teamScreen.noFormationConfig"));
      return;
    }

    const requiredSlotIds = formationConfig.slots.map((s) => s.id);
    const assignedSlotIds = assignments.map((a) => a.slotId);
    const assignedPlayerIds = assignments.map((a) => a.playerId);

    if (assignments.length !== requiredSlotIds.length) {
      toast.warning(
        t("teamScreen.slotsRequired"),
        t("teamScreen.slotsRequiredDesc", {
          count: requiredSlotIds.length,
          formation: selectedFormation,
        }),
      );
      return;
    }

    const uniqueAssignedSlots = new Set(assignedSlotIds);
    if (uniqueAssignedSlots.size !== assignedSlotIds.length) {
      toast.error(t("teamScreen.duplicateSlot"));
      return;
    }

    const uniquePlayers = new Set(assignedPlayerIds);
    if (uniquePlayers.size !== assignedPlayerIds.length) {
      toast.error(t("teamScreen.duplicatePlayer"));
      return;
    }

    const invalidSlots = assignedSlotIds.filter(
      (slotId) => !requiredSlotIds.includes(slotId),
    );
    if (invalidSlots.length > 0) {
      toast.error(t("teamScreen.invalidSlot"));
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
      queryClient.setQueryData<MatchRoomFullInfo>(
        roomsKeys.detail(roomId),
        (prev) => {
          if (!prev) return prev;
          const teamField = teamKey === "A" ? "teamA" : "teamB";
          const existingSnap = prev.formations?.[teamField];
          return {
            ...prev,
            formations: {
              teamA:
                teamField === "teamA"
                  ? {
                      formationName: selectedFormation,
                      teamName:
                        existingSnap?.teamName ??
                        prev.teamNames?.[teamKey] ??
                        undefined,
                      assignments: payload.assignments,
                    }
                  : (prev.formations?.teamA ?? null),
              teamB:
                teamField === "teamB"
                  ? {
                      formationName: selectedFormation,
                      teamName:
                        existingSnap?.teamName ??
                        prev.teamNames?.[teamKey] ??
                        undefined,
                      assignments: payload.assignments,
                    }
                  : (prev.formations?.teamB ?? null),
            },
          };
        },
      );
      toast.success(t("teamScreen.saveFormationSuccess"));
    } catch (error: unknown) {
      console.error("Failed to save formation:", error);
      toast.error(
        getTranslatedError(
          (error as { message?: string; code?: string })?.message,
          (error as { message?: string; code?: string })?.code
        ) ||
          t("teamScreen.saveFormationError"),
      );
    }
  };

  const handleSaveTeamName = async () => {
    if (!isCaptain) return;
    const name = teamNameInput.trim();
    if (!name) {
      toast.warning(t("teamScreen.teamNameRequired"));
      return;
    }
    try {
      setIsSavingTeamName(true);
      await roomsApi.updateTeamName(roomId, { team: teamKey, name });
      queryClient.setQueryData<MatchRoomFullInfo>(
        roomsKeys.detail(roomId),
        (prev) => {
          if (!prev) return prev;
          const teamField = teamKey === "A" ? "teamA" : "teamB";
          const snap = prev.formations?.[teamField];
          return {
            ...prev,
            teamNames: {
              ...prev.teamNames,
              [teamKey]: name,
            },
            ...(prev.formations && {
              formations: {
                teamA:
                  teamField === "teamA"
                    ? snap
                      ? { ...snap, teamName: name }
                      : null
                    : (prev.formations.teamA ?? null),
                teamB:
                  teamField === "teamB"
                    ? snap
                      ? { ...snap, teamName: name }
                      : null
                    : (prev.formations.teamB ?? null),
              },
            }),
          };
        },
      );
      toast.success(t("teamScreen.teamNameUpdated"));
    } catch (error: unknown) {
      console.error("Failed to save team name:", error);
      toast.error(
        getTranslatedError(
          (error as { message?: string; code?: string })?.message,
          (error as { message?: string; code?: string })?.code
        ) ||
          t("teamScreen.teamNameError"),
      );
    } finally {
      setIsSavingTeamName(false);
    }
  };

  const [isProcessingPayment, setIsProcessingPayment] =
    useState<boolean>(false);

  const handleProcessPayment = async () => {
    if (isProcessingPayment || hasPaidDeposit) return;
    try {
      setIsProcessingPayment(true);
      await roomsApi.processPayment(roomId);
    } catch (error: unknown) {
      console.error("Failed to process payment:", error);
      toast.error(
        getTranslatedError(
          (error as { message?: string; code?: string })?.message,
          (error as { message?: string; code?: string })?.code
        ) ||
          t("teamScreen.processPaymentError"),
      );
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <ThemedSafeAreaView style={styles.safeArea}>
      <TeamScreenHeader
        theme={theme}
        title={t("teamScreen.title")}
        onBack={() => navigation?.goBack()}
        onOpenChat={handleShowChat}
      />

      <ThemedScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
        <TeamMatchInfoSection
          theme={theme}
          t={t}
          formatDate={formatDate}
          displayRoom={displayRoom ?? null}
          formatForFormation={formatForFormation}
          displayTeamName={displayTeamName}
          isCaptain={isCaptain}
          teamNameInput={teamNameInput}
          onTeamNameChange={setTeamNameInput}
          onSaveTeamName={handleSaveTeamName}
          isSavingTeamName={isSavingTeamName}
        />

        <TeamLineupSection
          theme={theme}
          t={t}
          myAssignedSlotLabel={myAssignedSlotLabel}
          formationConfig={formationConfig ?? null}
          formationPlayers={formationPlayers}
          assignments={assignments}
          selectedFormation={selectedFormation}
          formatForFormation={formatForFormation}
          isCaptain={isCaptain}
          availableFormations={availableFormations}
          isLineupDropdownOpen={isLineupDropdownOpen}
          setIsLineupDropdownOpen={setIsLineupDropdownOpen}
          setSelectedFormation={setSelectedFormation}
          handleAssignToSlot={handleAssignToSlot}
          selectedPlayerId={selectedPlayerId}
          setSelectedPlayerId={setSelectedPlayerId}
          onSaveFormation={handleSaveFormation}
        />

        <TeamDepositSection
          theme={theme}
          t={t}
          depositPerPerson={displayRoom?.depositPerPerson ?? 0}
          isProcessingPayment={isProcessingPayment}
          hasPaidDeposit={hasPaidDeposit}
          onProcessPayment={handleProcessPayment}
        />
        </View>
      </ThemedScrollView>
    </ThemedSafeAreaView>
  );
};

export default TeamScreen;
