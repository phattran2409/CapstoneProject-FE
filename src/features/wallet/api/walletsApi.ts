import { apiClient } from "@/shared/api/client";
import { API_CONFIG } from "@/shared/constants/api";
import type {
  WalletBalance,
  ApiResponse,
  DepositRequest,
  DepositResponse,
  BankInfoRequest,
  TransactionsResponse,
  TransactionQuery,
} from "../types/wallet.types";

export const walletsApi = {
  getBalance: async (): Promise<WalletBalance> => {
    const response = (await apiClient.get(
      API_CONFIG.ENDPOINTS.WALLETS.BALANCE,
    )) as ApiResponse<WalletBalance>;
    if (!response?.isSuccess || !response.data) {
      throw new Error("Failed to get wallet balance");
    }
    return response.data;
  },
  
  getTransactions: async (query: TransactionQuery): Promise<TransactionsResponse> => {
    const response = (await apiClient.get(
      API_CONFIG.ENDPOINTS.WALLETS.TRANSACTIONS,
      { params: query },
    )) as ApiResponse<TransactionsResponse>;
    if (!response?.isSuccess || !response.data) {
      throw new Error("Failed to get wallet transactions");
    }
    return response.data;
  },

  deposit: async (body: DepositRequest): Promise<DepositResponse> => {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.WALLETS.DEPOSIT,
      body,
    );

    // Debug logging
    console.log(
      "🔍 Deposit API Full Response:",
      JSON.stringify(response, null, 2),
    );

    // Check if response is wrapped in ApiResponse structure
    if (response && typeof response === "object") {
      // If response has isSuccess and data fields (wrapped response)
      if ("isSuccess" in response && "data" in response) {
        const apiResponse = response as ApiResponse<DepositResponse>;
        console.log("🔍 Response isSuccess:", apiResponse.isSuccess);
        console.log("🔍 Response data:", apiResponse.data);

        if (!apiResponse.isSuccess || !apiResponse.data) {
          console.error(
            "❌ Deposit failed - isSuccess:",
            apiResponse.isSuccess,
            "data:",
            apiResponse.data,
          );
          throw new Error("Failed to create deposit");
        }
        return apiResponse.data;
      }

      // If response is direct DepositResponse (not wrapped)
      if ("paymentUrl" in response && "txnRef" in response) {
        const depositResponse = response as unknown as DepositResponse;
        console.log("✅ Direct DepositResponse received");

        if (!depositResponse.paymentUrl) {
          console.error("❌ Deposit failed - no paymentUrl in response");
          throw new Error("Failed to create deposit - no payment URL");
        }
        return depositResponse;
      }
    }

    console.error("❌ Unexpected response structure:", response);
    throw new Error("Failed to create deposit - unexpected response format");
  },

  updateBankInfo: async (body: BankInfoRequest): Promise<WalletBalance> => {
    const response = (await apiClient.put(
      API_CONFIG.ENDPOINTS.WALLETS.BANK_INFO,
      body,
    )) as ApiResponse<WalletBalance>;

    if (!response?.isSuccess || !response.data) {
      throw new Error("Failed to update bank information");
    }

    return response.data;
  },
};
