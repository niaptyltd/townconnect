"use client";

import type { Enquiry } from "@/types";

import { getCollection, saveCollectionDocument } from "@/services/data-service";

export function listEnquiries() {
  return getCollection<Enquiry>("enquiries");
}

export function saveEnquiry(document: Enquiry) {
  return saveCollectionDocument("enquiries", document);
}
