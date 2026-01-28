import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "@/shared/theme";
import { ThemedText } from "@/shared/components/themed";
import { SearchFilter, SearchFilterType } from "../types/search.types";

interface SearchTabFilterProps {
  filters: SearchFilter[];
  activeFilter: SearchFilterType;
  onFilterChange: (filter: SearchFilterType) => void;
}

export const SearchTabFilter: React.FC<SearchTabFilterProps> = ({
  filters,
  activeFilter,
  onFilterChange,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          paddingHorizontal: theme.spacing.m,
          paddingVertical: theme.spacing.s,
        },
      ]}
    >
      {filters.map((filter) => {
        const isActive = filter.key === activeFilter;
        return (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              {
                backgroundColor: isActive
                  ? theme.colors.primary
                  : theme.colors.surface,
                borderColor: isActive
                  ? theme.colors.primary
                  : theme.colors.border,
              },
            ]}
            onPress={() => onFilterChange(filter.key)}
            activeOpacity={0.7}
          >
            <ThemedText
              size="s"
              weight="semiBold"
              style={{
                color: isActive ? "black" : theme.colors.text,
              }}
            >
              {filter.label}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
