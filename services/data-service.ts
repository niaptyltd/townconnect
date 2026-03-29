"use client";

import { assertDataBackendConfigured, isFirebaseConfigured } from "@/firebase/config";
import {
  listDocuments,
  listDocumentsByField,
  listDocumentsByFieldValues,
  removeDocument,
  upsertDocument
} from "@/firebase/firestore-client";
import {
  readDemoCollection,
  removeDemoDocument,
  type DemoCollectionKey,
  upsertDemoDocument
} from "@/lib/demo-store";
import { getCurrentSession } from "@/services/auth-service";
import {
  assertProductCreationAllowed,
  assertServiceCreationAllowed,
  enforceBusinessSave
} from "@/services/commercial-service";
import type {
  Booking,
  Business,
  Enquiry,
  Plan,
  PlatformSettings,
  Product,
  Service,
  SessionUser,
  UserProfile
} from "@/types";

type StoredDocument = { id: string };

function isAdmin(session: SessionUser | null) {
  return session?.role === "admin";
}

function isBusinessOwner(session: SessionUser | null) {
  return session?.role === "business_owner";
}

function mergeUnique<T extends StoredDocument>(...collections: T[][]) {
  const map = new Map<string, T>();
  collections.flat().forEach((item) => {
    map.set(item.id, item);
  });
  return Array.from(map.values());
}

async function readRawCollection<T>(collectionName: DemoCollectionKey) {
  if (isFirebaseConfigured) {
    return listDocuments<T>(collectionName);
  }

  assertDataBackendConfigured(`Loading ${collectionName}`);
  return readDemoCollection<T>(collectionName);
}

async function readRawByField<T>(
  collectionName: DemoCollectionKey,
  fieldName: string,
  value: string | boolean | number
) {
  if (value === undefined || value === null || value === "") return [];

  if (isFirebaseConfigured) {
    return listDocumentsByField<T>(collectionName, fieldName, value);
  }

  assertDataBackendConfigured(`Loading ${collectionName}`);
  return readDemoCollection<any>(collectionName).filter((item) => item[fieldName] === value) as T[];
}

async function readRawByFieldValues<T>(
  collectionName: DemoCollectionKey,
  fieldName: string,
  values: string[]
) {
  const uniqueValues = Array.from(new Set(values.filter(Boolean)));
  if (uniqueValues.length === 0) return [];

  if (isFirebaseConfigured) {
    return listDocumentsByFieldValues<T>(collectionName, fieldName, uniqueValues);
  }

  assertDataBackendConfigured(`Loading ${collectionName}`);
  return readDemoCollection<any>(collectionName).filter((item) =>
    uniqueValues.includes(item[fieldName])
  ) as T[];
}

async function getExistingDocument<T extends StoredDocument>(
  collectionName: DemoCollectionKey,
  id: string
) {
  if (!id) return null;

  if (isFirebaseConfigured) {
    const matches = await listDocumentsByField<T>(collectionName, "id", id);
    return matches[0] ?? null;
  }

  assertDataBackendConfigured(`Loading ${collectionName}`);
  return readDemoCollection<T>(collectionName).find((item) => item.id === id) ?? null;
}

async function getOwnedBusinesses(session: SessionUser) {
  return readRawByField<Business>("businesses", "ownerId", session.id);
}

async function getPlanContext() {
  const [plans, settings] = await Promise.all([
    readRawCollection<Plan>("plans"),
    readRawCollection<PlatformSettings>("platform_settings")
  ]);

  return {
    plans,
    settings: settings[0]
  };
}

async function canManageBusiness(session: SessionUser | null, businessId: string) {
  if (!session || !isBusinessOwner(session)) return false;
  const business = await getExistingDocument<Business>("businesses", businessId);
  return business?.ownerId === session.id;
}

async function sanitizeUserDocument(
  session: SessionUser | null,
  document: UserProfile,
  existing: UserProfile | null
) {
  if (!session) {
    throw new Error("Please sign in to manage user profiles.");
  }

  if (!isAdmin(session) && session.id !== document.id) {
    throw new Error("You can only update your own profile.");
  }

  if (isAdmin(session)) {
    throw new Error("Admin user management must use the secure server-side admin handlers.");
  }

  return {
    ...document,
    role: existing?.role ?? session.role,
    isActive: existing?.isActive ?? true,
    agentId: existing?.agentId,
    createdAt: existing?.createdAt ?? document.createdAt
  };
}

async function sanitizeBusinessDocument(
  session: SessionUser | null,
  document: Business,
  existing: Business | null
) {
  if (!session || (!isAdmin(session) && !isBusinessOwner(session))) {
    throw new Error("Only business owners or admins can manage business listings.");
  }

  const { plans, settings } = await getPlanContext();

  if (isAdmin(session)) {
    throw new Error("Admin business moderation must use the secure server-side admin handlers.");
  }

  const ownerId = existing?.ownerId ?? session.id;
  if (ownerId !== session.id) {
    throw new Error("You can only update your own business listing.");
  }

  return enforceBusinessSave(
    {
      ...document,
      ownerId,
      verificationStatus: existing?.verificationStatus ?? "pending",
      listingStatus: existing?.listingStatus ?? "draft",
      featured: existing?.featured ?? false,
      featuredUntil: existing?.featuredUntil ?? "",
      featuredRequestedAt: existing?.featuredRequestedAt,
      featuredApprovedBy: existing?.featuredApprovedBy,
      subscriptionPlanId: existing?.subscriptionPlanId ?? document.subscriptionPlanId ?? "plan-free",
      subscriptionStatus: existing?.subscriptionStatus ?? "none",
      sponsoredStatus: existing?.sponsoredStatus ?? "none",
      sponsoredPlacement: existing?.sponsoredPlacement,
      sponsoredUntil: existing?.sponsoredUntil ?? "",
      sponsoredCampaignId: existing?.sponsoredCampaignId,
      priorityScore: existing?.priorityScore ?? document.priorityScore ?? 0,
      bannerCreditsUsed: existing?.bannerCreditsUsed ?? 0,
      agentId: existing?.agentId,
      referralCode: existing?.referralCode,
      averageRating: existing?.averageRating ?? 0,
      reviewCount: existing?.reviewCount ?? 0,
      viewsCount: existing?.viewsCount ?? 0,
      enquiriesCount: existing?.enquiriesCount ?? 0,
      bookingsCount: existing?.bookingsCount ?? 0,
      createdAt: existing?.createdAt ?? document.createdAt
    },
    plans,
    settings
  );
}

async function sanitizeServiceDocument(
  session: SessionUser | null,
  document: Service,
  existing: Service | null
) {
  if (!session || (!isAdmin(session) && !isBusinessOwner(session))) {
    throw new Error("Only business owners or admins can manage services.");
  }

  const business = await getExistingDocument<Business>("businesses", document.businessId);
  if (!business) {
    throw new Error("The linked business could not be found.");
  }

  if (!isAdmin(session) && business.ownerId !== session.id) {
    throw new Error("You can only manage services for your own business.");
  }

  if (!existing) {
    const [services, context] = await Promise.all([
      readRawCollection<Service>("services"),
      getPlanContext()
    ]);
    assertServiceCreationAllowed(business, services, context.plans, context.settings);
  }

  return {
    ...document,
    createdAt: existing?.createdAt ?? document.createdAt
  };
}

async function sanitizeProductDocument(
  session: SessionUser | null,
  document: Product,
  existing: Product | null
) {
  if (!session || (!isAdmin(session) && !isBusinessOwner(session))) {
    throw new Error("Only business owners or admins can manage products.");
  }

  const business = await getExistingDocument<Business>("businesses", document.businessId);
  if (!business) {
    throw new Error("The linked business could not be found.");
  }

  if (!isAdmin(session) && business.ownerId !== session.id) {
    throw new Error("You can only manage products for your own business.");
  }

  if (!existing) {
    const [products, context] = await Promise.all([
      readRawCollection<Product>("products"),
      getPlanContext()
    ]);
    assertProductCreationAllowed(business, products, context.plans, context.settings);
  }

  return {
    ...document,
    createdAt: existing?.createdAt ?? document.createdAt
  };
}

async function sanitizeBookingDocument(
  session: SessionUser | null,
  document: Booking,
  existing: Booking | null
) {
  if (!existing) {
    return {
      ...document,
      customerId: session?.id ?? document.customerId ?? "",
      customerEmail: session?.email ?? document.customerEmail,
      customerWhatsappNumber: document.customerWhatsappNumber ?? document.customerPhone,
      status: "pending",
      leadIntent: "booking"
    };
  }

  const business = await getExistingDocument<Business>("businesses", existing.businessId);
  const ownerCanManage = !!session && isBusinessOwner(session) && business?.ownerId === session.id;
  const customerOwns =
    !!session && (existing.customerId === session.id || existing.customerEmail === session.email);

  if (isAdmin(session)) {
    return document;
  }

  if (ownerCanManage) {
    return {
      ...existing,
      status: document.status,
      updatedAt: document.updatedAt
    };
  }

  if (customerOwns && document.status === "cancelled") {
    return {
      ...existing,
      status: "cancelled",
      updatedAt: document.updatedAt
    };
  }

  throw new Error("You do not have permission to update this booking.");
}

async function sanitizeEnquiryDocument(
  session: SessionUser | null,
  document: Enquiry,
  existing: Enquiry | null
) {
  if (!existing) {
    return {
      ...document,
      customerId: session?.id ?? document.customerId ?? "",
      email: session?.email ?? document.email,
      phone: session?.phone ?? document.phone,
      whatsappNumber: document.whatsappNumber ?? session?.whatsappNumber ?? document.phone,
      status: "new",
      leadIntent: "enquiry"
    };
  }

  const business = await getExistingDocument<Business>("businesses", existing.businessId);
  const ownerCanManage = !!session && isBusinessOwner(session) && business?.ownerId === session.id;

  if (isAdmin(session)) {
    return document;
  }

  if (ownerCanManage) {
    return {
      ...existing,
      status: document.status,
      updatedAt: document.updatedAt
    };
  }

  throw new Error("You do not have permission to update this enquiry.");
}

export async function getCollection<T>(collectionName: DemoCollectionKey) {
  const session = getCurrentSession();

  switch (collectionName) {
    case "users":
      if (!session) return [];
      if (isAdmin(session)) return readRawCollection<T>("users");
      return readRawByField<T>("users", "id", session.id);
    case "businesses":
      if (isAdmin(session)) return readRawCollection<T>("businesses");
      if (session && isBusinessOwner(session)) {
        const [activeBusinesses, ownBusinesses] = await Promise.all([
          readRawByField<T>("businesses", "listingStatus", "active"),
          readRawByField<T>("businesses", "ownerId", session.id)
        ]);
        return mergeUnique(
          activeBusinesses as StoredDocument[],
          ownBusinesses as StoredDocument[]
        ) as T[];
      }
      return readRawByField<T>("businesses", "listingStatus", "active");
    case "services":
      if (isAdmin(session)) return readRawCollection<T>("services");
      if (session && isBusinessOwner(session)) {
        const businessIds = (await getOwnedBusinesses(session)).map((business: Business) => business.id);
        return readRawByFieldValues<T>("services", "businessId", businessIds);
      }
      return readRawByField<T>("services", "isActive", true);
    case "products":
      if (isAdmin(session)) return readRawCollection<T>("products");
      if (session && isBusinessOwner(session)) {
        const businessIds = (await getOwnedBusinesses(session)).map((business: Business) => business.id);
        return readRawByFieldValues<T>("products", "businessId", businessIds);
      }
      return readRawByField<T>("products", "isActive", true);
    case "bookings":
      if (isAdmin(session)) return readRawCollection<T>("bookings");
      if (session && isBusinessOwner(session)) {
        const businessIds = (await getOwnedBusinesses(session)).map((business: Business) => business.id);
        return readRawByFieldValues<T>("bookings", "businessId", businessIds);
      }
      if (session) {
        const [byCustomerId, byCustomerEmail] = await Promise.all([
          readRawByField<T>("bookings", "customerId", session.id),
          readRawByField<T>("bookings", "customerEmail", session.email)
        ]);
        return mergeUnique(
          byCustomerId as StoredDocument[],
          byCustomerEmail as StoredDocument[]
        ) as T[];
      }
      return [];
    case "enquiries":
      if (isAdmin(session)) return readRawCollection<T>("enquiries");
      if (session && isBusinessOwner(session)) {
        const businessIds = (await getOwnedBusinesses(session)).map((business: Business) => business.id);
        return readRawByFieldValues<T>("enquiries", "businessId", businessIds);
      }
      if (session) {
        const [byCustomerId, byCustomerEmail] = await Promise.all([
          readRawByField<T>("enquiries", "customerId", session.id),
          readRawByField<T>("enquiries", "email", session.email)
        ]);
        return mergeUnique(
          byCustomerId as StoredDocument[],
          byCustomerEmail as StoredDocument[]
        ) as T[];
      }
      return [];
    case "subscriptions":
      if (isAdmin(session)) return readRawCollection<T>("subscriptions");
      if (session && isBusinessOwner(session)) {
        const businessIds = (await getOwnedBusinesses(session)).map((business: Business) => business.id);
        return readRawByFieldValues<T>("subscriptions", "businessId", businessIds);
      }
      return [];
    case "activity_logs":
      return isAdmin(session) ? readRawCollection<T>("activity_logs") : [];
    default:
      return readRawCollection<T>(collectionName);
  }
}

async function writeDocument<T extends StoredDocument>(
  collectionName: DemoCollectionKey,
  document: T
) {
  if (isFirebaseConfigured) {
    return upsertDocument(collectionName, document);
  }

  assertDataBackendConfigured(`Saving ${collectionName}`);
  upsertDemoDocument(collectionName, document);
}

export async function saveCollectionDocument<T extends StoredDocument>(
  collectionName: DemoCollectionKey,
  document: T
) {
  const session = getCurrentSession();
  const existing = await getExistingDocument(collectionName, document.id);

  if (
    (collectionName === "users" && isAdmin(session)) ||
    collectionName === "towns" ||
    collectionName === "categories" ||
    collectionName === "plans" ||
    collectionName === "banners" ||
    collectionName === "platform_settings" ||
    collectionName === "subscriptions" ||
    collectionName === "activity_logs"
  ) {
    throw new Error(
      "This admin-critical mutation must use the secure server-side admin handlers."
    );
  }

  switch (collectionName) {
    case "users":
      return writeDocument(
        "users",
        (await sanitizeUserDocument(
          session,
          document as unknown as UserProfile,
          existing as UserProfile | null
        )) as unknown as T
      );
    case "businesses":
      return writeDocument(
        "businesses",
        (await sanitizeBusinessDocument(
          session,
          document as unknown as Business,
          existing as Business | null
        )) as unknown as T
      );
    case "services":
      return writeDocument(
        "services",
        (await sanitizeServiceDocument(
          session,
          document as unknown as Service,
          existing as Service | null
        )) as unknown as T
      );
    case "products":
      return writeDocument(
        "products",
        (await sanitizeProductDocument(
          session,
          document as unknown as Product,
          existing as Product | null
        )) as unknown as T
      );
    case "bookings":
      return writeDocument(
        "bookings",
        (await sanitizeBookingDocument(
          session,
          document as unknown as Booking,
          existing as Booking | null
        )) as unknown as T
      );
    case "enquiries":
      return writeDocument(
        "enquiries",
        (await sanitizeEnquiryDocument(
          session,
          document as unknown as Enquiry,
          existing as Enquiry | null
        )) as unknown as T
      );
    default:
      return writeDocument(collectionName, document);
  }
}

export async function deleteCollectionDocument(collectionName: DemoCollectionKey, id: string) {
  const session = getCurrentSession();
  const existing = await getExistingDocument<StoredDocument>(collectionName, id);

  switch (collectionName) {
    case "services":
    case "products": {
      const resource = existing as Service | Product | null;
      if (!resource) return;

      if (!isAdmin(session) && !(await canManageBusiness(session, resource.businessId))) {
        throw new Error("You do not have permission to archive this item.");
      }
      break;
    }
    case "towns":
    case "categories":
      throw new Error(
        "This admin-critical delete must use the secure server-side admin handlers."
      );
    case "banners":
    case "plans":
      throw new Error(
        "This admin-critical delete must use the secure server-side admin handlers."
      );
    default:
      throw new Error("Delete is not supported for this collection.");
  }

  if (isFirebaseConfigured) {
    return removeDocument(collectionName, id);
  }

  assertDataBackendConfigured(`Deleting ${collectionName}`);
  removeDemoDocument(collectionName, id);
}
