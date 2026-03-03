import { z } from "zod";
import { requiredString } from "@/shared/validation/fields";

export const bankInfoSchema = z.object({
  bankAccountNumber: requiredString("bankAccountNumber"),
  bankName: requiredString("bankName"),
  accountHolderName: requiredString("accountHolderName"),
});

export type BankInfoFormData = z.infer<typeof bankInfoSchema>;

