// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["@/assets/css/main.css"],
  modules: [
    "@nuxt/ui",
    "@nuxt/image",
    "@nuxt/icon",
    "@pinia/nuxt",
    "nuxt-auth-utils",
  ],
  runtimeConfig: {
    session: {
      maxAge: 60 * 60 * 24 * 30,
      cookie: {
        sameSite: "lax",
      },
    },
  },
});
