import { planDefinitions } from "@/constants/plans";
import type { Business, Plan, PlatformSettings, Product, Service } from "@/types";
import {
  getCommercialStateForBusiness,
  getPlanDefinition,
  getPlanLockReason,
  sanitizeBusinessForPlan
} from "@/utils/plan";

export function getCommercialPlanCatalog(plans?: Plan[]) {
  return planDefinitions.map((definition) => getPlanDefinition(definition.slug, plans));
}

export function enforceBusinessSave(
  business: Business,
  plans?: Plan[],
  settings?: PlatformSettings
) {
  return sanitizeBusinessForPlan(business, plans, settings);
}

export function assertServiceCreationAllowed(
  business: Business,
  currentServices: Service[],
  plans?: Plan[],
  settings?: PlatformSettings
) {
  const state = getCommercialStateForBusiness(business, plans, settings);
  const serviceCount = currentServices.filter((service) => service.businessId === business.id).length;

  if (serviceCount >= state.config.servicesLimit) {
    throw new Error(getPlanLockReason("services", state));
  }
}

export function assertProductCreationAllowed(
  business: Business,
  currentProducts: Product[],
  plans?: Plan[],
  settings?: PlatformSettings
) {
  const state = getCommercialStateForBusiness(business, plans, settings);
  const productCount = currentProducts.filter((product) => product.businessId === business.id).length;

  if (productCount >= state.config.productsLimit) {
    throw new Error(getPlanLockReason("products", state));
  }
}

export function canAdminFeatureBusiness(
  business: Business,
  plans?: Plan[],
  settings?: PlatformSettings
) {
  const state = getCommercialStateForBusiness(business, plans, settings);
  return state.canBeFeatured;
}

export function canAdminSponsorBusiness(
  business: Business,
  plans?: Plan[],
  settings?: PlatformSettings
) {
  const state = getCommercialStateForBusiness(business, plans, settings);
  return state.canBeSponsored;
}
