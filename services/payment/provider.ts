import type { PaymentIntentResult } from "@/types";

export interface PaymentProvider {
  createUpgradeIntent(input: {
    businessId: string;
    planId: string;
    amount: number;
    currency: string;
  }): Promise<PaymentIntentResult>;
}
