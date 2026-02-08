export type SearchFilterType = "all" | "players" | "posts";

export interface SearchResultItem {
  id: string;
  type: SearchFilterType;
  title: string;
  subtitle?: string;
  image?: any;
  avatarUrl?: string | null;
  data: any; // Original data object
}

export interface SearchFilter {
  key: SearchFilterType;
  label: string;
  icon: string;
}
