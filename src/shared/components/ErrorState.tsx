import { ThemedText } from "./themed";
import { ThemedView } from "./themed";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { useTheme } from "@/shared/theme";

interface ErrorStateProps {
    error: string;
    onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
    const { theme } = useTheme();
    return (
        <ThemedView style={{ paddingVertical: theme.spacing.xxl, alignItems: 'center' }}>
            <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
            <ThemedText variant="secondary" size="m" style={{ marginTop: theme.spacing.m }}>
                Có lỗi xảy ra
            </ThemedText>
            <ThemedText variant="secondary" size="m" style={{ marginTop: theme.spacing.s }}>
                {error}
            </ThemedText>
            <TouchableOpacity
                onPress={onRetry}
                style={{
                    marginTop: theme.spacing.m,
                    paddingVertical: theme.spacing.m,
                    paddingHorizontal: theme.spacing.l,
                    borderRadius: theme.radius.m,
                    backgroundColor: theme.colors.primary,
                }}
            >
                <ThemedText style={{ color: theme.colors.black }} size="m" weight="semiBold">
                    Thử lại
                </ThemedText>
            </TouchableOpacity>
        </ThemedView>
    );
};

export default ErrorState;