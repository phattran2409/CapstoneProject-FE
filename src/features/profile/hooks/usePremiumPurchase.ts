import { useMutation } from "@tanstack/react-query";
import { purchasePremiumByWallet, purchasePremiumDirect } from "../api/profileApi";

export const usePremiumDirectPurchase = () => {
  return useMutation({
    mutationFn: purchasePremiumDirect,
  });
};

export const usePremiumWalletPurchase = () => {
  return useMutation({
    mutationFn: purchasePremiumByWallet,
  });
};
