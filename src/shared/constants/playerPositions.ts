export type PlayerPositionCode = "GK" | "DF" | "MF" | "FW";

export interface PlayerPositionMeta {
  id: PlayerPositionCode;
  label: PlayerPositionCode;
  icon: string;
  color: string;
}

export const PLAYER_POSITION_META: Record<PlayerPositionCode, PlayerPositionMeta> =
  {
    GK: {
      id: "GK",
      label: "GK",
      icon: "hand-left",
      color: "#FFB300",
    },
    DF: {
      id: "DF",
      label: "DF",
      icon: "shield",
      color: "#2196F3",
    },
    MF: {
      id: "MF",
      label: "MF",
      icon: "sync",
      color: "#4CAF50",
    },
    FW: {
      id: "FW",
      label: "FW",
      icon: "flash",
      color: "#F44336",
    },
  };

export const getPlayerPositionMeta = (
  role?: string | null,
): PlayerPositionMeta | null => {
  if (!role) return null;
  const normalizedRole = role.trim().toUpperCase() as PlayerPositionCode;
  return PLAYER_POSITION_META[normalizedRole] ?? null;
};
