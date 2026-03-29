export type UserRole = "customer" | "business_owner" | "admin";
export type VerificationStatus = "pending" | "verified" | "rejected";
export type ListingStatus = "draft" | "active" | "suspended";
export type SubscriptionStatus = "none" | "active" | "expired" | "trial";
export type BookingStatus = "pending" | "accepted" | "declined" | "completed" | "cancelled";
export type EnquiryStatus = "new" | "read" | "responded" | "closed";
export type ReviewStatus = "pending" | "approved" | "rejected";
export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";
export type BannerPlacement =
  | "home_top"
  | "home_mid"
  | "category"
  | "town"
  | "search_top"
  | "business_sidebar";
export type RelatedType = "general" | "service" | "product";
export type BillingCycle = "monthly" | "annual";
export type PlanSlug = "free" | "standard" | "premium";
export type AnalyticsTier = "basic" | "growth" | "advanced";
export type LeadChannel = "whatsapp" | "call" | "email" | "form";
export type LeadIntent = "enquiry" | "booking" | "quote" | "order";
export type LeadFlowType = "whatsapp_first" | "hybrid" | "form_first";
export type LeadSource = "organic" | "referral" | "agent" | "sponsored" | "banner";
export type SponsoredStatus = "none" | "eligible" | "requested" | "active" | "paused";
export type SponsoredPlacement = "category_boost" | "search_spotlight" | "town_priority" | "home_feature";
export type BannerCampaignType = "promotion" | "subscription" | "partner" | "sponsored_business";
export type PaymentProviderSlug = "placeholder" | "payfast" | "yoco" | "ozow" | "custom";

export interface NavItem {
  href: string;
  label: string;
  badge?: string;
}

export interface DemoLogin {
  label: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface PlatformStats {
  businesses: string;
  categories: string;
  enquiries: string;
  towns: string;
}

export interface PlanLimits {
  galleryLimit: number;
  featuredEligible: boolean;
  advancedAnalytics: boolean;
  analyticsTier: AnalyticsTier;
  servicesLimit: number;
  productsLimit: number;
  promotionalTools: boolean;
  homepagePlacement: boolean;
  categoryBoost: boolean;
  bookingsEnabledByDefault: boolean;
  sponsoredEligible: boolean;
  bannerCredits: number;
  priorityRankBoost: number;
  whatsappLeadCapture: boolean;
  referralTracking: boolean;
  agentOnboarding: boolean;
  paymentGatewayReady: boolean;
}

export type PlanLimitMap = Record<PlanSlug, PlanLimits>;

export interface BaseDocument {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  linkedin?: string;
}

export interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

export interface OperatingHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface UserProfile extends BaseDocument {
  fullName: string;
  email: string;
  phone: string;
  whatsappNumber: string;
  role: UserRole;
  profileImage: string;
  townId: string;
  province: string;
  isActive: boolean;
  referralCode?: string;
  referredByCode?: string;
  agentId?: string;
  signupSource?: LeadSource;
  onboardingStatus?: "self_signup" | "agent_assisted" | "admin_assisted";
}

export interface Business extends BaseDocument {
  ownerId: string;
  businessName: string;
  slug: string;
  description: string;
  shortDescription: string;
  logoUrl: string;
  coverImageUrl: string;
  galleryUrls: string[];
  categoryId: string;
  subcategory: string;
  tags: string[];
  phone: string;
  whatsappNumber: string;
  email: string;
  website: string;
  socialLinks: SocialLinks;
  addressLine1: string;
  addressLine2: string;
  suburb: string;
  townId: string;
  province: string;
  country: string;
  geo: GeoLocation;
  servicesEnabled: boolean;
  productsEnabled: boolean;
  bookingsEnabled: boolean;
  paymentsEnabled: boolean;
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  operatingHours: OperatingHours;
  priceRange: string;
  verificationStatus: VerificationStatus;
  listingStatus: ListingStatus;
  featured: boolean;
  featuredUntil: string;
  featuredRequestedAt?: string;
  featuredApprovedBy?: string;
  averageRating: number;
  reviewCount: number;
  subscriptionPlanId: string;
  subscriptionStatus: SubscriptionStatus;
  leadFlowType?: LeadFlowType;
  whatsappPrefillTemplate?: string;
  allowInstantWhatsAppLead?: boolean;
  sponsoredStatus?: SponsoredStatus;
  sponsoredPlacement?: SponsoredPlacement;
  sponsoredUntil?: string;
  sponsoredCampaignId?: string;
  priorityScore?: number;
  bannerCreditsUsed?: number;
  agentId?: string;
  referralCode?: string;
  onboardingSource?: LeadSource;
  paymentProviderPreference?: PaymentProviderSlug;
  viewsCount: number;
  enquiriesCount: number;
  bookingsCount: number;
}

export interface Town extends BaseDocument {
  name: string;
  slug: string;
  province: string;
  country: string;
  isActive: boolean;
  heroImageUrl: string;
}

export interface Category extends BaseDocument {
  name: string;
  slug: string;
  icon: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
}

export interface Service extends BaseDocument {
  businessId: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  durationMinutes: number;
  isActive: boolean;
}

export interface Product extends BaseDocument {
  businessId: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string;
  stockStatus: StockStatus;
  sku: string;
  isActive: boolean;
}

export interface Booking extends BaseDocument {
  businessId: string;
  serviceId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerWhatsappNumber?: string;
  requestedDate: string;
  requestedTime: string;
  notes: string;
  leadChannel?: LeadChannel;
  leadIntent?: LeadIntent;
  leadSource?: LeadSource;
  referralCode?: string;
  agentId?: string;
  whatsappThreadUrl?: string;
  status: BookingStatus;
}

export interface Enquiry extends BaseDocument {
  businessId: string;
  customerId?: string;
  name: string;
  email: string;
  phone: string;
  whatsappNumber?: string;
  subject: string;
  message: string;
  relatedType: RelatedType;
  relatedId: string;
  leadChannel?: LeadChannel;
  leadIntent?: LeadIntent;
  leadSource?: LeadSource;
  preferredContactChannel?: LeadChannel;
  referralCode?: string;
  agentId?: string;
  whatsappThreadUrl?: string;
  status: EnquiryStatus;
}

export interface Subscription extends BaseDocument {
  businessId: string;
  planId: string;
  planName: PlanSlug;
  status: "active" | "expired" | "cancelled" | "trial";
  billingCycle: BillingCycle;
  amount: number;
  currency: string;
  startsAt: string;
  endsAt: string;
  paymentProvider: string;
  paymentReference: string;
  providerSlug?: PaymentProviderSlug;
  paymentStatus?: "pending" | "paid" | "failed" | "refunded" | "mocked";
  paymentIntentId?: string;
  agentId?: string;
  referralCode?: string;
}

export interface Plan extends BaseDocument {
  name: string;
  slug: string;
  price: number;
  billingCycle: BillingCycle;
  features: string[];
  description?: string;
  highlightLabel?: string;
  ctaLabel?: string;
  recommended?: boolean;
  config?: PlanLimits;
  isActive: boolean;
  sortOrder: number;
}

export interface PlanDefinition {
  id: string;
  name: string;
  slug: PlanSlug;
  price: number;
  billingCycle: BillingCycle;
  features: string[];
  description?: string;
  highlightLabel?: string;
  ctaLabel?: string;
  recommended?: boolean;
  isActive: boolean;
  sortOrder: number;
  limits: PlanLimits;
}

export interface Review extends BaseDocument {
  businessId: string;
  customerId: string;
  rating: number;
  title: string;
  comment: string;
  status: ReviewStatus;
}

export interface Banner extends BaseDocument {
  title: string;
  imageUrl: string;
  linkUrl: string;
  placement: BannerPlacement;
  description?: string;
  ctaLabel?: string;
  campaignType?: BannerCampaignType;
  sponsorBusinessId?: string;
  townId?: string;
  categoryId?: string;
  priority?: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

export interface PlatformSettings {
  id: string;
  currency: string;
  defaultCountry: string;
  supportedProvinces: string[];
  featuredBusinessLimit: number;
  sponsoredListingLimit?: number;
  allowSelfSignup: boolean;
  allowFreePlan: boolean;
  allowSponsoredListings?: boolean;
  contactEmail: string;
  whatsappSupport: string;
  leadFlowDefault?: LeadFlowType;
  supportedPaymentProviders?: PaymentProviderSlug[];
  featuredEligibilityRequiresVerification?: boolean;
  referralProgramEnabled?: boolean;
  agentCommissionEnabled?: boolean;
  updatedAt: string;
}

export interface ActivityLog extends Pick<BaseDocument, "id" | "createdAt"> {
  actorId: string;
  actorRole: UserRole;
  entityType: string;
  entityId: string;
  action: string;
  metadata: Record<string, string | number | boolean>;
}

export interface SearchFilters {
  keyword?: string;
  townId?: string;
  townSlug?: string;
  categoryId?: string;
  categorySlug?: string;
  featured?: boolean;
  openNow?: boolean;
  delivery?: boolean;
  pickup?: boolean;
  bookingsEnabled?: boolean;
}

export interface SearchResult {
  business: Business;
  category?: Category;
  town?: Town;
  matchedServices: Service[];
  matchedProducts: Product[];
  score: number;
}

export interface SessionUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  townId: string;
  province: string;
  phone: string;
  whatsappNumber: string;
  profileImage: string;
  isActive: boolean;
  referredByCode?: string;
  agentId?: string;
  signupSource?: LeadSource;
  onboardingStatus?: "self_signup" | "agent_assisted" | "admin_assisted";
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  fullName: string;
  phone: string;
  whatsappNumber: string;
  role: Exclude<UserRole, "admin">;
  townId: string;
  province: string;
  createBusinessLater: boolean;
  referredByCode?: string;
}

export interface PaymentIntentResult {
  provider: PaymentProviderSlug;
  status: "pending" | "mocked";
  checkoutUrl: string;
  reference: string;
}

export interface BusinessCommercialState {
  planSlug: PlanSlug;
  planName: string;
  config: PlanLimits;
  canUseBookings: boolean;
  canUseAdvancedAnalytics: boolean;
  canBeFeatured: boolean;
  canBeSponsored: boolean;
  canUsePromotionalTools: boolean;
  maxGalleryImages: number;
  upgradePrompt: string;
}
