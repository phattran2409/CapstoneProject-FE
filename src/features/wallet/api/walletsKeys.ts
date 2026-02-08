export const walletsKeys = {
  all: ['wallets'] as const,
  balance: () => [...walletsKeys.all, 'balance'] as const,
};
