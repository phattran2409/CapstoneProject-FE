/** Một bản ghi lịch sử — GET `playerprofiles/me/elo-breakdown` */
export interface EloBreakdownRecord {
  matchId: string;
  eloBefore: number;
  eloAfter: number;
  eloChange: number;
  k1MatchResultComponent: number;
  k2FeedbackSentimentComponent: number;
  k3WinStreakComponent: number;
  k4ContributionComponent: number;
  k5TrustComponent: number;
  calculationDetails: string;
  createdAt: string;
}
