import type { PaymentProvider } from "@/services/payment/provider";
import { createId } from "@/utils/slug";

export const placeholderPaymentProvider: PaymentProvider = {
  async createUpgradeIntent({ planId }) {
    return {
      provider: "placeholder",
      status: "mocked",
      checkoutUrl: `/dashboard/subscription?upgrade=${planId}`,
      reference: createId("payment")
    };
  }
};
