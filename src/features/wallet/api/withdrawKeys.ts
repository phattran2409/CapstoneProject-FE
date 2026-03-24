import { WithdrawalQuery } from "../types/wallet.types";

export const withdrawalsKeys = {
  all: ['withdrawals'] as const,
  myList: () => [...withdrawalsKeys.all, 'my', 'list'] as const,
  myListQuery: (query: WithdrawalQuery) => [...withdrawalsKeys.myList(), query] as const,
}