import { StyleSheet } from "react-native";

/** Shared styles for Team screen sections */
export const teamScreenStyles = StyleSheet.create({
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
    flex: 1,
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
