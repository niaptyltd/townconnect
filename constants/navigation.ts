import type { NavItem } from "@/types";

export const publicNavigation: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search" },
  { href: "/pricing", label: "Pricing" },
  { href: "/list-your-business", label: "List Your Business" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
];

export const accountNavigation: NavItem[] = [
  { href: "/account", label: "Overview" },
  { href: "/account/bookings", label: "Bookings" },
  { href: "/account/enquiries", label: "Enquiries" },
  { href: "/account/profile", label: "Profile" }
];

export const ownerNavigation: NavItem[] = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/profile", label: "My Profile" },
  { href: "/dashboard/business", label: "Business" },
  { href: "/dashboard/business/edit", label: "Edit Listing" },
  { href: "/dashboard/services", label: "Services" },
  { href: "/dashboard/products", label: "Products" },
  { href: "/dashboard/bookings", label: "Bookings" },
  { href: "/dashboard/enquiries", label: "Enquiries" },
  { href: "/dashboard/subscription", label: "Subscription" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/settings", label: "Settings" }
];

export const adminNavigation: NavItem[] = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/businesses", label: "Businesses" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/towns", label: "Towns" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/plans", label: "Plans" },
  { href: "/admin/banners", label: "Banners" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/activity", label: "Activity" }
];
