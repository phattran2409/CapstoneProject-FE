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

export interface BankInfoRequest {
  bankAccountNumber: string;
  bankName: string;
  accountHolderName: string;
}

export interface BankInfo {
  walletId: string;
  bankAccountNumber: string;
  bankName: string;
  accountHolderName: string;
  hasBankInfo: boolean;
}

export interface WithdrawalRequest {
  amount: number;
}

export interface WithdrawalResponse {
  message?: string;
}

export interface Transaction {
  transactionId: string;
  transactionType: TransactionType;
  amount: number;
  balanceAfter: number;
  transactionCode : string;
  referenceId : string;
  description : string;
  createdAt : string;
} 
export type TransactionType = "BookingPayment" | "BookingIncome" | "Deposit" | "CheckinFee" | "Withdrawal" | "Refund" | "Other" | "All";
export interface TransactionQuery {
  page : number;
  pageSize : number;
  transactionType? : TransactionType;
}

export interface TransactionsResponse {
    walletId: string;
    walletType: string;
    transactions: Transaction[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}