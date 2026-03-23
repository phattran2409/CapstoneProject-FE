import { TransactionQuery } from "../types/wallet.types";

export const walletsKeys = {
  all: ['wallets'] as const,
  balance: () => [...walletsKeys.all, 'balance'] as const,
  transactions: () => [...walletsKeys.all, 'transactions'] as const,
  transactionsQuery: (query: TransactionQuery) => [...walletsKeys.transactions(), query] as const,
};