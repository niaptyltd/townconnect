import type {
  Booking,
  Business,
  Enquiry,
  LeadChannel,
  LeadIntent,
  LeadSource,
  Service
} from "@/types";

function encode(text: string) {
  return encodeURIComponent(text);
}

function applyTemplate(
  template: string,
  values: Record<string, string | undefined>
) {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_match, key: string) => values[key] ?? "");
}

export function buildLeadAttribution(business: Business, source: LeadSource = "organic") {
  return {
    referralCode: business.referralCode ?? "",
    agentId: business.agentId ?? "",
    leadSource: source
  };
}

export function buildWhatsAppLeadMessage(input: {
  business: Business;
  intent: LeadIntent;
  customerName?: string;
  service?: Service;
  subject?: string;
  notes?: string;
}) {
  const { business, intent, customerName, service, subject, notes } = input;

  if (business.whatsappPrefillTemplate) {
    return applyTemplate(business.whatsappPrefillTemplate, {
      customerName,
      intent,
      serviceTitle: service?.title,
      subject: subject || business.businessName,
      notes,
      referralCode: business.referralCode,
      agentId: business.agentId,
      businessName: business.businessName
    })
      .trim()
      .replace(/\s+/g, " ");
  }

  const opener = customerName ? `Hi, I'm ${customerName}.` : "Hi.";
  const intentLine =
    intent === "booking"
      ? `I'd like to request a booking${service ? ` for ${service.title}` : ""}.`
      : `I'd like to enquire about ${subject || business.businessName}.`;
  const attribution = [
    business.referralCode ? `ref ${business.referralCode}` : "",
    business.agentId ? `agent ${business.agentId}` : ""
  ]
    .filter(Boolean)
    .join(" | ");

  return [
    opener,
    "I found you on TownConnect.",
    intentLine,
    notes ? `Details: ${notes}` : "",
    attribution ? `Attribution: ${attribution}` : ""
  ]
    .filter(Boolean)
    .join(" ");
}

export function buildWhatsAppUrl(input: {
  business: Business;
  intent: LeadIntent;
  customerName?: string;
  service?: Service;
  subject?: string;
  notes?: string;
}) {
  const message = buildWhatsAppLeadMessage(input);
  return `https://wa.me/${input.business.whatsappNumber.replace(/\D/g, "")}?text=${encode(message)}`;
}

export function buildLeadChannelLabel(channel: LeadChannel) {
  const labels = {
    whatsapp: "WhatsApp",
    call: "Call",
    email: "Email",
    form: "Form"
  };

  return labels[channel];
}

export function buildEnquiryFromLead(
  base: Enquiry,
  business: Business,
  leadChannel: LeadChannel,
  leadSource: LeadSource = "organic"
) {
  return {
    ...base,
    ...buildLeadAttribution(business, leadSource),
    leadChannel,
    leadIntent: "enquiry" as LeadIntent,
    preferredContactChannel: leadChannel === "form" ? "whatsapp" : leadChannel
  };
}

export function buildBookingFromLead(
  base: Booking,
  business: Business,
  leadChannel: LeadChannel,
  leadSource: LeadSource = "organic"
) {
  return {
    ...base,
    ...buildLeadAttribution(business, leadSource),
    leadChannel,
    leadIntent: "booking" as LeadIntent
  };
}
