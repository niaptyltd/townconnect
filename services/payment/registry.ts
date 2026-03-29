import type { PaymentProviderSlug } from "@/types";

import { placeholderPaymentProvider } from "@/services/payment/placeholder-provider";
import type { PaymentProvider } from "@/services/payment/provider";

const paymentProviderRegistry: Record<PaymentProviderSlug, PaymentProvider> = {
  placeholder: placeholderPaymentProvider,
  payfast: placeholderPaymentProvider,
  yoco: placeholderPaymentProvider,
  ozow: placeholderPaymentProvider,
  custom: placeholderPaymentProvider
};

export function getPaymentProvider(provider: PaymentProviderSlug = "placeholder") {
  return paymentProviderRegistry[provider];
}
