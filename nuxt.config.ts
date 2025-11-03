// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "@nuxt/ui-pro",
    "@vueuse/nuxt",
    "@pinia/nuxt",
    "shadcn-nuxt",
  ],
  css: ["~/assets/css/main.css"],
  ui: {
    fonts: false,
  },
  nitro: {
    preset: "bun",
    node: true,
    noExternals: true, 
    inlineDynamicImports: true,
    serveStatic: "inline",
    esbuild: {
      options: {
        target: "esnext",
      },
    },
    experimental: {
      websocket: true
    },
  },
});