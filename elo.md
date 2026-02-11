Công thức
1. Nguyên tắc chọn quy ước điểm
Khi dùng Elo (Result − ExpectedScore), quy ước điểm phải:
Nằm trong khoảng [0, 1] → để hiệu số ổn định


Không quá nhiều trạng thái → tránh rối logic


Áp dụng được cho cả đội & cá nhân


Không trùng vai trò với các hệ số khác (feedback, trust, …)


👉 Vì vậy, KHÔNG nên dùng −1 / +1 cho Result.

2. Quy ước Result (bắt buộc nên dùng)
✅ Quy ước chuẩn & an toàn nhất
Kết quả
Result
Thắng
1.0
Hòa (nếu có)
0.5
Thua
0.0

👉 Lý do:
Đây là quy ước Elo chuẩn


Tương thích trực tiếp với ExpectedScore


Không cần scale thêm


📌 Nếu hệ thống không có hòa:
Chỉ dùng {1.0, 0.0} là đủ



3. Expected Score – để nguyên dạng xác suất
ExpectedScore KHÔNG quy ước, mà tính ra:

Ví dụ:
0.24 → bạn bị đánh giá yếu hơn


0.76 → bạn bị đánh giá mạnh hơn


👉 Giữ dạng float là tốt nhất.

4. Giá trị của (Result − ExpectedScore)
Sau khi trừ:

Tình huống
Giá trị
Thắng đội rất mạnh
~ +0.7 đến +0.9
Thắng đội ngang
~ +0.5
Thắng đội yếu
~ +0.1
Thua đội mạnh
~ −0.1
Thua đội ngang
~ −0.5
Thua đội yếu
~ −0.7 đến −0.9

→ Biên độ rất đẹp, dễ kiểm soát.

5. Quy ước cho các yếu tố khác (để không phá Elo)
5.1 Feedback / Sentiment
Chuẩn hóa về [-1, +1]
Ví dụ:
5★ rất tích cực → +1


3★ trung bình → 0


1★ rất tiêu cực → −1


Sentiment AI:
Positive → +1


Neutral → 0


Negative → −1


👉 Sau đó trung bình hoặc weighted sum.

5.2 Win Rate
Chuẩn hóa về [-1, +1]
Ví dụ:
80% win rate → +0.6


50% → 0


20% → −0.6


📌 Nên tính trên N trận gần nhất (10–20).

5.3 Contribution Score
Rất nên để [0, 1] hoặc [0, 0.5]
Ví dụ:
Hoàn thành feedback → +0.2


Đúng hạn, đầy đủ → +0.3


👉 Chỉ cộng, không trừ → tránh toxic incentive.

5.4 Trust
Chuẩn hóa về [-1, +1]
Fair Play → +0.2


AFK → −0.5


Bị report xác nhận → −1



6. Gợi ý giá trị K để dễ kiểm soát
Hệ số
Gợi ý
K1 (Result − Expected)
20 – 30
K2 (Feedback/Sentiment)
5 – 10
K3 (Win Rate)
3 – 8
K4 (Contribution)
2 – 5
K5 (Trust)
5 – 10

👉 Kết quả:
Trận đấu vẫn quyết định chính


Hành vi ảnh hưởng nhưng không lấn át
Ví dụ cụ thể
Bối cảnh trận đấu
Trận 5v5


Không có hòa


Mỗi người có Elo cá nhân


Elo đội = trung bình Elo các cầu thủ



1️⃣ Trước trận
Team A (bạn đang xét 1 người trong team này)
Player
Elo
A1 (YOU)
1200
A2
1180
A3
1220
A4
1210
A5
1190

👉 Elo Team A

Team B
Player
Elo
B1
1350
B2
1380
B3
1400
B4
1370
B5
1360

👉 Elo Team B
=1372
➡️ Team B mạnh hơn rõ rệt

2️⃣ Tính Expected Score cho Team A
Công thức Elo chuẩn:

👉 Nghĩa là:
Team A chỉ có ~27% khả năng thắng


Thua là… bình thường


Thắng là bất ngờ lớn



3️⃣ Kết quả trận đấu
👉 Team A THẮNG 🎉
Quy ước Result:
Thắng = 1.0


Thua = 0.0



4️⃣ Chọn hệ số K (trọng số)
Giả sử app bạn quy định:
Yếu tố
K
K1 (Result − Expected)
25
K2 (Feedback/Sentiment)
6
K3 (Win Rate)
5
K4 (Contribution)
3
K5 (Trust)
6


5️⃣ Các yếu tố cá nhân của bạn (A1)
5.1 Feedback + Sentiment
Đồng đội vote: 5★


Comment tích cực


👉 Chuẩn hóa:
Feedback = +1


Sentiment = +1
 → Trung bình = +1.0



5.2 Win Rate (10 trận gần nhất)
Thắng 6 / 10 → 60%


Chuẩn hóa:
50% → 0


60% → +0.2



5.3 Contribution Score
Bạn đánh giá đầy đủ đồng đội sau trận


👉 Contribution = +0.5

5.4 Trust
Không AFK


Không bị report


Có Fair Play


👉 Trust = +0.5

6️⃣ Tính ΔElo cho bạn
Core Elo

Behavioral adjustments

Tổng cộng

7️⃣ Elo mới của bạn

👉 Làm tròn: 1230

Hệ thống rank
Elo bắt đầu: 1000
🟤 Amateur (Nghiệp dư) – Onboarding
Elo: 0 – 1199
Dành cho người mới


Elo biến động nhanh


Không phạt nặng


Không hiển thị rank badge quá “áp lực”


🎯 Mục tiêu: làm quen, không bỏ app

🔵 Semi-Pro (Bán chuyên) – Stabilizing
Elo: 1200 – 1399
Người chơi đã ổn định


Biết vị trí, phối hợp cơ bản


Bắt đầu so kè rank


🎯 Mục tiêu: giữ người chơi ở lại

🟢 Pro (Chuyên nghiệp) – Core community
Elo: 1400 – 1599
Đa số người chơi tốt


Match bắt đầu “cân não”


Elo tăng/giảm chậm hơn


🎯 Mục tiêu: xây cộng đồng nòng cốt

🟣 Master (Cao thủ) – Skill expression
Elo: 1600 – 1799
Chơi rất chắc


Thái độ & teamwork quan trọng


Bắt đầu có prestige


🎯 Mục tiêu: tạo aspirational rank

🟠 Elite (Tinh hoa) – Top tier
Elo: 1800 – 1999
Nhóm rất giỏi


Matchmaking khắt khe


Elo rất khó tăng


🎯 Mục tiêu: giữ giá trị top

🔴 Legend (Huyền thoại) – Apex
Elo: ≥ 2000
Top X% (ví dụ top 1% hoặc top 50 người chơi)


Không chỉ Elo cao mà:


Trust cao


Feedback tốt


Ít report


Có thể reset mỗi season


🎯 Mục tiêu: tạo đỉnh cao để phấn đấu





