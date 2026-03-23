import { useQuery } from "@tanstack/react-query";
import { walletsApi } from "../api/walletsApi";
import { walletsKeys } from "../api/walletsKeys";

export const useGetBankInfo = () => {
  return useQuery({
    queryKey: walletsKeys.bankInfo(),
    queryFn: walletsApi.getBankInfo,
  });
};
