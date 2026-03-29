"use client";

import type { Booking } from "@/types";

import { getCollection, saveCollectionDocument } from "@/services/data-service";

export function listBookings() {
  return getCollection<Booking>("bookings");
}

export function saveBooking(document: Booking) {
  return saveCollectionDocument("bookings", document);
}
