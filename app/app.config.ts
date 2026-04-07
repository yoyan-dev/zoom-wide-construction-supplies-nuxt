export default defineAppConfig({
  ui: {
    colors: {
      primary: "brand",
      secondary: "accent",
      info: "brand",
      warning: "accent",
      neutral: "graphite",
    },
    card: {
      slots: {
        root: "rounded-sm overflow-hidden",
      },
      variants: {
        variant: {
          outline: {
            root: "bg-white dark:bg-gray-900 ring ring-default divide-y divide-default",
          },
        },
      },
    },
  },
});
