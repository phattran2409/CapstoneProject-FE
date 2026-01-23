import {
  Alert
} from "@/shared/components";

  const {
    visible,
    alertOptions,
    showConfirm,
    showDanger,
    showInfo,
    showSuccess,
    hideAlert,
  } = useAlert();

   // Alert test handlers
  const handleTestConfirm = () => {
    showConfirm(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa mục này? Hành động này có thể được hoàn tác.",
      () => {
        console.log("Confirmed delete");
        showSuccess("Đã xóa", "Mục đã được xóa thành công!");
      },
      () => {
        console.log("Cancelled delete");
      },
      "Xóa",
      "Hủy"
    );
  };

  const handleTestDanger = () => {
    showDanger(
      "Xóa vĩnh viễn",
      "Bạn có chắc chắn muốn xóa vĩnh viễn? Hành động này không thể hoàn tác!",
      () => {
        console.log("Confirmed permanent delete");
        showSuccess("Đã xóa vĩnh viễn", "Dữ liệu đã được xóa vĩnh viễn.");
      },
      () => {
        console.log("Cancelled permanent delete");
      },
      "Xóa vĩnh viễn",
      "Hủy"
    );
  };

  const handleTestInfo = () => {
    showInfo(
      "Thông báo",
      "Đây là thông báo thông tin. Bạn có thể đọc và đóng nó.",
      () => {
        console.log("Info alert closed");
      },
      false, // Không tự đóng
      3000
    );
  };

  const handleTestSuccess = () => {
    showSuccess(
      "Thành công!",
      "Thao tác của bạn đã được thực hiện thành công.",
      () => {
        console.log("Success alert closed");
      },
      true, // Tự đóng sau 3 giây
      3000
    );
  };

  const handleTestInfoAutoClose = () => {
    showInfo(
      "Thông báo tự đóng",
      "Thông báo này sẽ tự động đóng sau 3 giây.",
      undefined,
      true, // Tự đóng
      3000
    );
  };

   const handleTestSuccessAutoClose = () => {
    showSuccess(
      "Thành công tự đóng",
      "Thông báo này sẽ tự động đóng sau 2 giây.",
      undefined,
      true, // Tự đóng
      2000
    );
  };



       {/* Alert Component */}
      {alertOptions && (
        <Alert visible={visible} {...alertOptions} onClose={hideAlert} />
      )}

      {/* Alert Test Section */}
      <ThemedView
        style={[
          styles.alertTestSection,
          {
            paddingHorizontal: theme.spacing.l,
            paddingVertical: theme.spacing.m,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
          },
        ]}
      >
        <ThemedText
          variant="primary"
          size="l"
          weight="bold"
          style={{ marginBottom: theme.spacing.s }}
        >
          🧪 Test Alert Components
        </ThemedText>
        <View style={styles.alertButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.alertTestButton,
              {
                backgroundColor: theme.colors.info,
                borderRadius: theme.radius.m,
                marginRight: theme.spacing.s,
                marginBottom: theme.spacing.s,
              },
            ]}
            onPress={handleTestConfirm}
          >
            <Text style={{ color: theme.colors.white, fontSize: theme.fontSizes.s, fontWeight: theme.fontWeights.semiBold }}>
              Confirm
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.alertTestButton,
              {
                backgroundColor: theme.colors.error,
                borderRadius: theme.radius.m,
                marginRight: theme.spacing.s,
                marginBottom: theme.spacing.s,
              },
            ]}
            onPress={handleTestDanger}
          >
            <Text style={{ color: theme.colors.white, fontSize: theme.fontSizes.s, fontWeight: theme.fontWeights.semiBold }}>
              Danger
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.alertTestButton,
              {
                backgroundColor: theme.colors.info,
                borderRadius: theme.radius.m,
                marginRight: theme.spacing.s,
                marginBottom: theme.spacing.s,
              },
            ]}
            onPress={handleTestInfo}
          >
            <Text style={{ color: theme.colors.white, fontSize: theme.fontSizes.s, fontWeight: theme.fontWeights.semiBold }}>
              Info
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.alertTestButton,
              {
                backgroundColor: theme.colors.success,
                borderRadius: theme.radius.m,
                marginRight: theme.spacing.s,
                marginBottom: theme.spacing.s,
              },
            ]}
            onPress={handleTestSuccess}
          >
            <Text style={{ color: theme.colors.white, fontSize: theme.fontSizes.s, fontWeight: theme.fontWeights.semiBold }}>
              Success
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.alertTestButton,
              {
                backgroundColor: theme.colors.info + "80",
                borderRadius: theme.radius.m,
                marginRight: theme.spacing.s,
                marginBottom: theme.spacing.s,
              },
            ]}
            onPress={handleTestInfoAutoClose}
          >
            <Text style={{ color: theme.colors.white, fontSize: theme.fontSizes.s, fontWeight: theme.fontWeights.semiBold }}>
              Info (Auto)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.alertTestButton,
              {
                backgroundColor: theme.colors.success + "80",
                borderRadius: theme.radius.m,
                marginBottom: theme.spacing.s,
              },
            ]}
            onPress={handleTestSuccessAutoClose}
          >
            <Text style={{ color: theme.colors.white, fontSize: theme.fontSizes.s, fontWeight: theme.fontWeights.semiBold }}>
              Success (Auto)
            </Text>
          </TouchableOpacity>
        </View>
      </ThemedView>




      //Style cho button nếu cần
        alertTestSection: {
    // Styles applied via inline
  },
  alertButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  alertTestButton: {
    minWidth: 140,
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },