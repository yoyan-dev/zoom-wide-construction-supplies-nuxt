import type { Category } from "~/types/category";
import { daysAgo } from "./utils";

export const categories: Category[] = [
  {
    id: "cat-concrete",
    name: "Concrete & Cement",
    description: "Ready-mix concrete, cement bags, and aggregates.",
    image_url: null,
    created_at: daysAgo(210),
    updated_at: daysAgo(4),
  },
  {
    id: "cat-steel",
    name: "Steel & Rebar",
    description: "Rebar, structural steel, and reinforcement mesh.",
    image_url: null,
    created_at: daysAgo(190),
    updated_at: daysAgo(6),
  },
  {
    id: "cat-lumber",
    name: "Lumber & Plywood",
    description: "Framing lumber, plywood sheets, and engineered wood.",
    image_url: null,
    created_at: daysAgo(180),
    updated_at: daysAgo(8),
  },
  {
    id: "cat-plumbing",
    name: "Plumbing",
    description: "PVC, valves, fittings, and drainage solutions.",
    image_url: null,
    created_at: daysAgo(165),
    updated_at: daysAgo(2),
  },
  {
    id: "cat-electrical",
    name: "Electrical",
    description: "Conduits, wiring, breakers, and site lighting.",
    image_url: null,
    created_at: daysAgo(150),
    updated_at: daysAgo(5),
  },
  {
    id: "cat-finishes",
    name: "Finishes",
    description: "Drywall, insulation, adhesives, and coatings.",
    image_url: null,
    created_at: daysAgo(140),
    updated_at: daysAgo(3),
  },
];
