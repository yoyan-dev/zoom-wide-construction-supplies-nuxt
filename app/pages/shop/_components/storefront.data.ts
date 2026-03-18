export type StorefrontPromoBanner = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  badge: string;
  ctaLabel: string;
  to: string;
};

export type StorefrontTrustPoint = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

export type StorefrontStep = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

export const storefrontQuickTerms = [
  "cement",
  "steel bars",
  "roofing",
  "electrical",
  "plumbing",
];

export const storefrontPromoBanners: StorefrontPromoBanner[] = [
  {
    id: "bulk-build",
    eyebrow: "Bulk Order Savings",
    title: "Builder packs for cement, steel, and boards",
    description:
      "Compare core materials quickly and lock in project-ready quantities without digging through long catalogs.",
    badge: "Save on volume",
    ctaLabel: "Browse featured packs",
    to: "/shop/categories/cat-concrete",
  },
  {
    id: "roofing-week",
    eyebrow: "Roofing Week",
    title: "Sheets, angle bars, and GI pipes in one buying lane",
    description:
      "Scannable pricing and stock visibility for crews sourcing roofing and structural support items together.",
    badge: "Fast-moving",
    ctaLabel: "Explore roofing supplies",
    to: "/shop/categories/cat-steel",
  },
  {
    id: "site-delivery",
    eyebrow: "Project Supply Flow",
    title: "Ready-mix and site materials scheduled with confidence",
    description:
      "Shop stock-backed materials and move from product discovery to supply planning without extra friction.",
    badge: "Contractor ready",
    ctaLabel: "Shop project materials",
    to: "/shop",
  },
];

export const storefrontTrustPoints: StorefrontTrustPoint[] = [
  {
    id: "stock",
    title: "Warehouse-backed stock visibility",
    description:
      "See available quantities early so your team can plan orders with fewer supply surprises.",
    icon: "i-lucide-warehouse",
  },
  {
    id: "sourcing",
    title: "Practical categories for real jobsite buying",
    description:
      "Browse concrete, steel, roofing, electrical, plumbing, and hardware without a cluttered marketplace feel.",
    icon: "i-lucide-layout-grid",
  },
  {
    id: "pricing",
    title: "Clear unit pricing for fast comparison",
    description:
      "Review peso pricing, unit labels, and quick specs in a product-first layout built for buyers.",
    icon: "i-lucide-badge-dollar-sign",
  },
  {
    id: "support",
    title: "Built for inquiry and repeat ordering",
    description:
      "Use the storefront to shortlist supplies now and hand off to sales or procurement later if needed.",
    icon: "i-lucide-phone-call",
  },
];

export const storefrontSteps: StorefrontStep[] = [
  {
    id: "search",
    title: "Search or jump by category",
    description:
      "Start from the homepage search bar or open the categories that match your trade or project stage.",
    icon: "i-lucide-search",
  },
  {
    id: "compare",
    title: "Compare price, stock, and specs",
    description:
      "Review product cards with pricing, unit labels, handbook notes, and stock badges before adding items.",
    icon: "i-lucide-scale",
  },
  {
    id: "cart",
    title: "Build your material list",
    description:
      "Add materials directly from the grid so your buying shortlist stays organized while you continue browsing.",
    icon: "i-lucide-shopping-cart",
  },
  {
    id: "confirm",
    title: "Continue to inquiry or next-step ordering",
    description:
      "Use your cart as a simple frontend shortlist now, then connect it to quotation or checkout flows later.",
    icon: "i-lucide-clipboard-check",
  },
];
