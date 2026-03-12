import { getQuery } from "h3";
import { categories } from "~~/data/mock/categories";
import { products } from "~~/data/mock/products";
import { suppliers } from "~~/data/mock/suppliers";

export default defineEventHandler((event) => {
  const { only } = getQuery(event);

  if (only === "products") {
    return products;
  }

  return {
    products,
    categories,
    suppliers,
  };
});
