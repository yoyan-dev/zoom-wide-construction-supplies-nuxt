import { createError } from "h3";
import { joinURL } from "ufo";

export default defineEventHandler(async () => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase;

  if (!apiBase) {
    throw createError({
      statusCode: 500,
      statusMessage: "API base URL is not configured",
    });
  }

  const url = joinURL(apiBase, "products");
  return await $fetch(url);
});
