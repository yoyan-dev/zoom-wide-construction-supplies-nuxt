// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["@/assets/css/main.css"],
  runtimeConfig: {
    public: {
      apiBase: process.env.VITE_API_URL ?? "",
    },
  },
  modules: [
    "@nuxt/ui",
    "@nuxt/image",
    "@nuxt/icon",
    "@vueuse/nuxt",
    "@pinia/nuxt",
  ],
});
