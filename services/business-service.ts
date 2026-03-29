"use client";

import type { Business, Product, Service } from "@/types";

import { getCollection, saveCollectionDocument, deleteCollectionDocument } from "@/services/data-service";

export function listBusinesses() {
  return getCollection<Business>("businesses");
}

export function saveBusiness(document: Business) {
  return saveCollectionDocument("businesses", document);
}

export function listServices() {
  return getCollection<Service>("services");
}

export function saveService(document: Service) {
  return saveCollectionDocument("services", document);
}

export function archiveService(id: string) {
  return deleteCollectionDocument("services", id);
}

export function listProducts() {
  return getCollection<Product>("products");
}

export function saveProduct(document: Product) {
  return saveCollectionDocument("products", document);
}

export function archiveProduct(id: string) {
  return deleteCollectionDocument("products", id);
}
