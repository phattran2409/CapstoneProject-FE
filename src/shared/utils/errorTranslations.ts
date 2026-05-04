import { useAppStore } from '@/store/appStore';

export const backendErrorMessages = {
    "Wallet not found": "Không tìm thấy ví",
    "Insufficient balance": "Số dư không đủ",
    "Minimum deposit amount is 10,000 VND": "Số tiền nạp tối thiểu là 10.000 VNĐ",
    "Transaction already processed": "Giao dịch đã được xử lý",
    "Invalid payment data": "Dữ liệu biên lai không hợp lệ",
    "Invalid user role for deposit": "Vai trò người dùng không hợp lệ để nạp tiền",
    "Withdrawal request not found": "Không tìm thấy yêu cầu rút tiền",
    "You already have a pending withdrawal request": "Bạn đã có một yêu cầu rút tiền đang chờ xử lý",
    "Minimum withdrawal amount is 50,000 VND": "Số tiền rút tối thiểu là 50.000 VNĐ",
    "Bank account information is required for withdrawal": "Cần có thông tin tài khoản ngân hàng để rút tiền",
    "Only pending withdrawals can be processed": "Chỉ có thể xử lý các yêu cầu rút tiền đang chờ",
    "Only pending withdrawals can be cancelled": "Chỉ có thể hủy các yêu cầu rút tiền đang chờ",
    "You are not the owner of this withdrawal request": "Bạn không phải là chủ của yêu cầu rút tiền này",
    "The booking with Id = '{0}' was not found": "Không tìm thấy đơn đặt sân",
    "You are not a participant in this match room and cannot review this venue": "Bạn không tham gia trận đấu này nên không thể đánh giá sân",
    "You can only review a venue after the match has ended": "Bạn chỉ có thể đánh giá sân sau khi trận đấu kết thúc",
    "The booking or match room has not been completed yet": "Đơn đặt sân hoặc trận đấu chưa kết thúc",
    "You have already reviewed this venue for this booking": "Bạn đã đánh giá sân này cho trận đấu này rồi",
    "Rating must be between 1 and 5": "Đánh giá phải từ 1 đến 5",
    "The venue photo with Id = '{0}' was not found": "Không tìm thấy ảnh sân",
    "The venue was not found": "Không tìm thấy sân",
    "You are not authorized to perform this action on this venue's photos": "Bạn không có quyền thực hiện hành động này trên ảnh của sân này",
    "At least one photo must be provided": "Phải cung cấp ít nhất một ảnh",
    "Failed to delete venue photo": "Xóa ảnh sân thất bại",
    "Failed to update venue photo": "Cập nhật ảnh sân thất bại",
    "The user with the specified email was not found": "Không tìm thấy người dùng với email đã cho",
    "The provided email already exists.": "Email đã cho đã tồn tại.",
    "The passsword for this account is wrong": "Mật khẩu cho tài khoản này không đúng",
    "Account is not verified": "Tài khoản chưa được xác minh",
    "The user is inactive": "Người dùng không hoạt động",
    "The email format is invalid": "Định dạng email không hợp lệ",
    "The password does not meet the requirements": "Mật khẩu không đáp ứng các yêu cầu",
    "The phone number format is invalid": "Định dạng số điện thoại không hợp lệ",
    "The date of birth is invalid": "Ngày sinh không hợp lệ",
    "The user has already been deleted": "Người dùng đã bị xóa",
    "Cannot delete an active user. Deactivate the user first.": "Không thể xóa một người dùng đang hoạt động. Vui lòng vô hiệu hóa cũ.",
    "Failed to update user information": "Cập nhật thông tin người dùng thất bại",
    "Failed to create user": "Tạo người dùng thất bại",
    "Failed to delete user": "Xóa người dùng thất bại",
    "Invalid refresh token": "Phiên đăng nhập đã hết hạn",
    "Refresh token has expired": "Mã thông báo làm mới đã hết hạn",
    "Token reuse detected. All sessions have been revoked for security reasons.": "Phát hiện tái sử dụng token. Tất cả phiên đã bị log out.",
    "The OTP code not found or expired": "Mã OTP không tìm thấy hoặc đã hết hạn",
    "The OTP code is wrong": "Mã OTP không đúng",
    "The user has already verified": "Người dùng đã được xác minh",
    "Post must have content or at least one media file": "Bài viết phải có nội dung hoặc ít nhất một file đính kèm",
    "Maximum 10 files allowed per post": "Tối đa 10 file cho mỗi bài viết",
    "Failed to create post": "Tạo bài viết thất bại",
    "Failed to update post": "Cập nhật bài viết thất bại",
    "Failed to delete post": "Xóa bài viết thất bại",
    "You are not authorized to perform this action on this post": "Bạn không có quyền thực hiện hành động này trên bài viết này",
    "Invalid post visibility setting": "Cài đặt hiển thị nền bài viết không hợp lệ",
    "Notification preference not found for this user": "Không tìm thấy tùy chọn thông báo cho người dùng này",
    "Room is not open for joining": "Phòng không mở để tham gia",
    "User is already in this room": "Người dùng đã ở trong phòng này",
    "Room is already full": "Phòng đã đầy",
    "User is not a participant of this room": "Người dùng không phải là thành viên của phòng này",
    "Invalid team assignment": "Phân công đội không hợp lệ",
    "Room was modified by another user. Please refresh and try again": "Phòng đã bị sửa đổi bởi người dùng khác. Vui lòng tải lại",
    "Failed to create match room": "Tạo phòng đấu thất bại",
    "Failed to update participant": "Cập nhật thành viên phòng thất bại",
    "Failed to leave room": "Rời phòng thất bại",
    "Only the host can kick players from the room": "Chỉ chủ phòng mới có thể đuổi người chơi",
    "Host cannot kick themselves. Use 'Leave Room' or 'Cancel Room' instead": "Chủ phòng không thể tự đuổi mình. Sử dụng 'Rời phòng' hoặc 'Hủy phòng'",
    "Cannot kick players from a completed or cancelled room": "Không thể đuổi người chơi khi trận đấu đã kết thúc hoặc hủy",
    "Failed to kick player from room": "Đuổi người chơi từ phòng thất bại",
    "Password is required for private rooms": "Phòng riêng yêu cầu mật khẩu",
    "Incorrect password for private room": "Mật khẩu phòng sai",
    "Only the host can update room privacy settings": "Chỉ chủ phòng có thể cập nhật trạng thái khả dụng của phòng",
    "Only the team captain can assign formations": "Chỉ đội trưởng có quyền chỉnh đội hình",
    "Team must be either A or B to set formation": "Phải là Đội A hoặc B",
    "Team name must not exceed 50 characters": "Tên đội không được vượt quá 50 ký tự",
    "Failed to update team name": "Cập nhật tên đội thất bại",
    "You can only update the name of your own team": "Bạn chỉ có thể đổi tên đội của mình",
    "You have already checked in": "Bạn đã điểm danh",
    "Check-in is only allowed for Open or Locked rooms": "Chỉ điểm danh được ở các phòng Mở hoặc Khóa",
    "Check-in is only allowed within 30 minutes before match start time": "Chỉ có thể điểm danh trước trận đấu 30 phút",
    "You cannot invite yourself to the room": "Không thể mời chính mình",
    "You can only invite friends to the room": "Bạn chỉ có thể mời bạn bè",
    "An invitation has already been sent to this user for this room": "Lời mời đã được gửi trước đó",
    "You have already voted for this match result": "Bạn đã bình chọn cho kết quả trận đấu",
    "Voting is only allowed during the reviewing phase": "Bình chọn chỉ làm được khi trận đã kết thúc",
    "Match is not in reviewing phase": "Trận đấu chưa kết thúc",
    "Vote time has ended": "Thời gian bình chọn đã kết thúc",
    "You are not authorized to access this preset": "Bạn không có quyền",
    "Duration must be greater than 0 minutes": "Thời gian trận đấu phải lớn hơn 0 phút",
    "Preset name is required": "Yêu cầu cung cấp tên",
    "Match must be end before giving feedback": "Trận đấu phải kết thúc trước khi đánh giá",
    "You have already reviewed this player for this match": "Bạn đã đánh giá người chơi này rồi",
    "You cannot review yourself": "Bạn không thể đánh giá chính mình",
    "The reviewee was not a participant in this match": "Người chơi không tham gia trận này",
    "You were not a participant in this match": "Bạn chưa từng tham gia trận này",
    "You cannot send a friend request to yourself": "Bạn không thể kết bạn với chính mình",
    "You are already friends with this user": "Bạn đã là bạn bè với người đó",
    "A friend request already exists between you and this user": "Lời mời kết bạn đã được gửi rồi",
    "Friend request not found": "Không tìm thấy lời mời kết bạn",
    "You are not authorized to perform this action": "Bạn không có thẩm quyền",
    "You are not friends with this user": "Bạn chưa kết bạn với người này",
    "You must be friends to chat with this user": "Nhắn tin chỉ dành cho bạn bè",
    "Hourly rate must be greater than zero": "Tỉ giá theo giờ phải lớn hơn 0",
    "This field is currently inactive and cannot be booked": "Sân này đang ngừng hoạt động, không thể đặt",
    "The field is not available for the requested time slot": "Sân đã có người đặt trong thời gian này",
    "You are not authorized to perform this action on this field": "Bạn không có quyền",
    "Comment content is required": "Nội dung bình luận là cần thiết",
    "You have already liked this comment": "Bạn đã thích bình luận này",
    "You have not liked this comment": "Bạn chưa thích bình luận này",
    "You cannot send a message to yourself": "Không thể nhắn tin cho chính mình",
    "Message content is required": "Nội dung tin nhắn không thể bỏ trống",
    "You can only send messages to your team channel": "Bạn chỉ có thể nhắn tin trong kênh đồng đội",
    "You can only access your team channel": "Bạn chỉ có quyền xem kênh đồng đội",
    "User has already paid": "Người chơi đã thanh toán",
    "The selected field is not available for the requested time slot": "Sân đang được đặt",
    "This time slot has just been booked by another room. The field is no longer available": "Có người vừa đặt sân vào thời điểm này",
    "Invalid time slot. End time must be after start time": "Giờ bắt đầu phải trước giờ kết thúc",
    "Cannot create booking for past date/time": "Không thể tạo cho lịch quá khứ",
    "Insufficient funds to complete the booking": "Số dư không đủ",
    "Room must be locked before creating a booking": "Phòng phải khoá trước khi thực hiện mua/đặt sân",
    "All participants must complete payment before booking can be created": "Tất cả mọi người phải thanh toán tiền xong xuôi",
    "Failed to process payment": "Lỗi thanh toán",
    "End time must be greater than start time": "Giờ kết thúc sai lệch",
    "The requested time slot is already booked or blocked": "Thời gian đã được khoá hoạc đặt chỗ",
    "You are not authorized to block slots on this field. Only the venue owner can perform this action": "Bạn không có quyền khoá khung chat",
    "The requested time slot is outside venue operating hours": "Giờ đặt ngoài giờ mở cửa",
    "An achievement with this name already exists": "Thành tích đã đạt được",
    "Failed to upload badge icon": "Tải biểu tượng thành tích thất bại",
    "Invalid criteria type": "Chưa hoàn thành đủ nội dung",
    "Current location is unavailable": "Không thể lấy được vị trí. Vui lòng bật GPS và thử lại.",
};

// Backend error "title/code" map (code-based translation).
// Note: current backend responses may look like:
// { title: "MatchRoom.OutsideOperatingHours", detail: "Requested time ...", status: 409, ... }
const backendErrorCodeMessages: Record<string, string> = {
  "MatchRoom.OutsideOperatingHours": "Thời gian yêu cầu nằm ngoài khung giờ hoạt động của sân.",
  "MatchRoom.SlotAlreadyBooked": "Thời gian đã được đặt chỗ bởi phòng khác",
  "AiSuggestion.ServiceUnavailable" : "Dịch vụ AI tạm thời không phản hồi",
  "MatchRoom.TooFar": "Bạn đang cách sân quá xa",
};

export const getTranslatedError = (errMessage?: string, errCode?: string): string => {
  const language = useAppStore.getState().language;

  // English: prefer showing backend detail/message as-is.
  if (language === 'en') {
    return errMessage ?? '';
  }

  // Code-based translation (title/code).
  if (errCode) {
    // Special-case: keep dynamic times from backend detail.
    if (errCode === "MatchRoom.OutsideOperatingHours" && errMessage) {
      const match = errMessage.match(
        /Requested time \((.+?)\) is outside operating hours \((.+?)\)/i,
      );
      if (match) {
        return `Thời gian yêu cầu (${match[1]}) nằm ngoài khung giờ hoạt động (${match[2]}).`;
      }
    }

    const mapped = backendErrorCodeMessages[errCode];
    if (mapped) return mapped;
  }

  if (!errMessage) return '';

  // Exact Match (message-based translation).
  if (backendErrorMessages[errMessage as keyof typeof backendErrorMessages]) {
    return backendErrorMessages[errMessage as keyof typeof backendErrorMessages];
  }

  // StartWith match for dynamic formatted string like "The post with the Id = 'xxxx' was not found"
  for (const [key, value] of Object.entries(backendErrorMessages)) {
    if (errMessage.includes(key.replace("{0}", "")) || errMessage.startsWith(key)) {
      return value;
    }
  }

  // Some common patterns:
  if (errMessage.startsWith("Failed to upload")) {
    return "Lỗi phản hồi mạng khi tải file: " + errMessage.replace("Failed to upload", "");
  }

  return errMessage;
};
