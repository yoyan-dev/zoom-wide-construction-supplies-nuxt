import type { Category } from "~/types/category";
import { daysAgo } from "./utils";

export const categories: Category[] = [
  {
    id: "cat-concrete",
    name: "Concrete & Cement",
    description: "Ready-mix concrete, cement bags, and aggregates.",
    image_url: "https://placehold.co/640x360?text=Concrete",
    overview:
      "Core structural materials for slabs, foundations, columns, and general site pours.",
    typical_uses: [
      "Structural slabs and footings",
      "Masonry and block work",
      "Repair, patching, and site casting",
    ],
    buying_considerations: [
      "Match compressive strength to structural need",
      "Confirm setting time and delivery window",
      "Check storage conditions for bagged cement",
    ],
    featured_specs: [
      { label: "Strength Focus", value: "20-30 MPa mixes" },
      { label: "Packaging", value: "Ready-mix and 50kg bags" },
      { label: "Storage", value: "Keep dry and covered" },
    ],
    created_at: daysAgo(210),
    updated_at: daysAgo(4),
  },
  {
    id: "cat-steel",
    name: "Steel & Rebar",
    description: "Rebar, structural steel, and reinforcement mesh.",
    image_url: "https://placehold.co/640x360?text=Steel",
    overview:
      "Load-bearing reinforcement and framing materials used in structural builds and fabrication.",
    typical_uses: [
      "Concrete reinforcement",
      "Beam and frame assemblies",
      "Industrial and commercial structures",
    ],
    buying_considerations: [
      "Verify diameter, profile, and grade",
      "Check corrosion protection requirements",
      "Plan for lifting, cutting, and storage space",
    ],
    featured_specs: [
      { label: "Common Forms", value: "Rebar, mesh, beams" },
      { label: "Handling", value: "Forklift or rack storage" },
      { label: "Priority Check", value: "Grade and length" },
    ],
    created_at: daysAgo(190),
    updated_at: daysAgo(6),
  },
  {
    id: "cat-lumber",
    name: "Lumber & Plywood",
    description: "Framing lumber, plywood sheets, and engineered wood.",
    image_url: "https://placehold.co/640x360?text=Lumber",
    overview:
      "Timber-based products used for formwork, framing, hoarding, and interior structural panels.",
    typical_uses: [
      "Wall and roof framing",
      "Temporary formwork",
      "Subfloors and partition systems",
    ],
    buying_considerations: [
      "Check moisture resistance and grade",
      "Match thickness to span/load",
      "Store off-ground and protected from weather",
    ],
    featured_specs: [
      { label: "Panel Sizes", value: "4x8 standard sheets" },
      { label: "Framing Focus", value: "Common stud dimensions" },
      { label: "Storage", value: "Dry, flat stacking" },
    ],
    created_at: daysAgo(180),
    updated_at: daysAgo(8),
  },
  {
    id: "cat-plumbing",
    name: "Plumbing",
    description: "PVC, valves, fittings, and drainage solutions.",
    image_url: "https://placehold.co/640x360?text=Plumbing",
    overview:
      "Flow-control and water distribution products for drainage, supply, and utility infrastructure.",
    typical_uses: [
      "Drainage runs",
      "Water line routing",
      "Valve and maintenance access points",
    ],
    buying_considerations: [
      "Confirm pressure rating and diameter",
      "Match fittings to pipe schedule",
      "Review corrosion and media compatibility",
    ],
    featured_specs: [
      { label: "Pipe Format", value: "Rigid lengths and fittings" },
      { label: "Valve Types", value: "Gate and control valves" },
      { label: "Priority Check", value: "Diameter and pressure class" },
    ],
    created_at: daysAgo(165),
    updated_at: daysAgo(2),
  },
  {
    id: "cat-electrical",
    name: "Electrical",
    description: "Conduits, wiring, breakers, and site lighting.",
    image_url: "https://placehold.co/640x360?text=Electrical",
    overview:
      "Power distribution and cable management products for temporary and permanent electrical systems.",
    typical_uses: [
      "Branch circuit installation",
      "Cable routing in conduit",
      "Lighting and utility tie-ins",
    ],
    buying_considerations: [
      "Match conductor size to load demand",
      "Verify insulation and temperature rating",
      "Choose conduit based on environment and exposure",
    ],
    featured_specs: [
      { label: "Cable Supply", value: "Rolls and spools" },
      { label: "Routing", value: "Rigid conduit runs" },
      { label: "Priority Check", value: "Gauge and insulation class" },
    ],
    created_at: daysAgo(150),
    updated_at: daysAgo(5),
  },
  {
    id: "cat-finishes",
    name: "Finishes",
    description: "Drywall, insulation, adhesives, and coatings.",
    image_url: "https://placehold.co/640x360?text=Finishes",
    overview:
      "Interior completion materials that support enclosure, bonding, and final surface preparation.",
    typical_uses: [
      "Wall and ceiling lining",
      "Insulation and enclosure support",
      "Adhesion and finishing systems",
    ],
    buying_considerations: [
      "Check coverage and cure time",
      "Match board type to room conditions",
      "Review storage temperature and shelf life",
    ],
    featured_specs: [
      { label: "Common Products", value: "Boards, coatings, adhesives" },
      { label: "Storage", value: "Dry, temperature-controlled" },
      { label: "Priority Check", value: "Coverage and cure window" },
    ],
    created_at: daysAgo(140),
    updated_at: daysAgo(3),
  },
];
