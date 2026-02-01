export interface WalletBalance {
  walletId: string;
  userId: string;
  userRole: string;
  balance: number;
  bankAccountNumber: string | null;
  bankName: string | null;
  accountHolderName: string | null;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  data: T;
}

export interface DepositRequest {
  amount: number;
}

export interface DepositResponse {
  paymentUrl: string;
  txnRef: string;
  amount: number;
  expiredAt: string;
}
