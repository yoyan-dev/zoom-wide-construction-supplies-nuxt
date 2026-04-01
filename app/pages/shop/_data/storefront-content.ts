export const storefrontTrustPoints = [
  {
    title: "Stock visibility first",
    description:
      "Buyers can compare price, unit, and stock levels without opening every product page.",
    icon: "i-lucide-package-search",
    accent: "Ready stock",
  },
  {
    title: "Built for procurement speed",
    description:
      "The layout focuses on fast filtering, clear category pathways, and direct add-to-cart actions.",
    icon: "i-lucide-layout-grid",
    accent: "Shorter sourcing time",
  },
  {
    title: "Project-ready guidance",
    description:
      "Support content helps contractors and office buyers choose the right materials with less friction.",
    icon: "i-lucide-clipboard-list",
    accent: "Less guesswork",
  },
  {
    title: "Conversion-focused minimalism",
    description:
      "Cleaner visual hierarchy keeps attention on products, trust signals, and the next buying step.",
    icon: "i-lucide-sparkles",
    accent: "Easy to use",
  },
] as const;

export const storefrontJourneySteps = [
  {
    step: "01",
    title: "Browse by material type",
    description:
      "Start from categories to narrow the catalog into the exact product family your team needs.",
  },
  {
    step: "02",
    title: "Compare pricing and availability",
    description:
      "Review unit pricing, stock position, supplier context, and specifications before shortlisting.",
  },
  {
    step: "03",
    title: "Move straight into checkout",
    description:
      "Add confirmed items to cart and complete the order flow with contact and delivery details.",
  },
] as const;

export const storefrontSolutionCards = [
  {
    title: "Structural Materials",
    description:
      "For concrete, reinforcement, and core build requirements where reliable stock visibility matters most.",
    href: "/shop/categories",
    ctaLabel: "Browse categories",
  },
  {
    title: "Fast Site Restocking",
    description:
      "Ideal for repeat replenishment when crews need easy reordering without a complicated storefront.",
    href: "/shop",
    ctaLabel: "Open storefront",
  },
  {
    title: "Buyer Support and FAQs",
    description:
      "Clarify delivery, checkout, and ordering expectations before your team places the first order.",
    href: "/shop/help",
    ctaLabel: "View help",
  },
] as const;

export const storefrontFaqItems = [
  {
    question: "Can buyers compare materials quickly before checkout?",
    answer:
      "Yes. The updated storefront emphasizes stock, category, supplier, unit pricing, and a short summary directly inside each card to reduce extra clicks.",
  },
  {
    question: "What is the fastest way to discover the right products?",
    answer:
      "Use the header search for specific material names, then narrow further with category filters or the dedicated categories page.",
  },
  {
    question: "Is the shop suitable for non-technical customers?",
    answer:
      "That is the goal of this refresh. The layout uses simpler navigation, clearer sections, and plain-language guidance so first-time buyers can move confidently.",
  },
  {
    question: "How does the new UI help conversion?",
    answer:
      "The redesign adds trust sections, structured procurement guidance, stronger category discovery, and clearer calls to action around browsing, details, and checkout.",
  },
] as const;

export const storefrontHelpCards = [
  {
    title: "Delivery Planning",
    description:
      "Use checkout notes for receiving hours, gate instructions, or site contact details to keep handoff smooth.",
    icon: "i-lucide-truck",
  },
  {
    title: "Order Visibility",
    description:
      "Customers can continue from cart to checkout and track order progress through the existing orders flow.",
    icon: "i-lucide-clipboard-check",
  },
  {
    title: "Account Setup",
    description:
      "New buyers can create an account first so repeat orders and order history are easier to manage.",
    icon: "i-lucide-user-round-plus",
  },
] as const;
