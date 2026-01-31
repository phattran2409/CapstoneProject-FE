import { apiClient } from '@/shared/api/client';
import { API_CONFIG } from '@/shared/constants/api';
import type {
  WalletBalance,
  ApiResponse,
  DepositRequest,
  DepositResponse,
} from '../types/wallet.types';

export const walletsApi = {
  getBalance: async (): Promise<WalletBalance> => {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.WALLETS.BALANCE
    ) as ApiResponse<WalletBalance>;
    if (!response?.isSuccess || !response.data) {
      throw new Error('Failed to get wallet balance');
    }
    return response.data;
  },

  deposit: async (body: DepositRequest): Promise<DepositResponse> => {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.WALLETS.DEPOSIT,
      body
    ) as ApiResponse<DepositResponse>;
    if (!response?.isSuccess || !response.data) {
      throw new Error('Failed to create deposit');
    }
    return response.data;
  },
};
