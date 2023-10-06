// vite.config.ts
import react from "file:///app/node_modules/@vitejs/plugin-react/dist/index.mjs";
import ssr from "file:///app/node_modules/vite-plugin-ssr/dist/cjs/node/plugin/index.js";
var config = {
  plugins: [
    react(),
    ssr({
      prerender: true
    })
  ],
  resolve: {
    alias: {
      "#lib": "/lib",
      "#components": "/components",
      "#server": "/server"
    }
  },
  build: {
    emptyOutDir: false
    // clearing will delete embed build in assets
  }
};
var vite_config_default = config;
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvYXBwXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvYXBwL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9hcHAvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXG5pbXBvcnQgc3NyIGZyb20gJ3ZpdGUtcGx1Z2luLXNzci9wbHVnaW4nXG5pbXBvcnQgeyBVc2VyQ29uZmlnIH0gZnJvbSAndml0ZSdcblxuY29uc3QgY29uZmlnOiBVc2VyQ29uZmlnID0ge1xuICBwbHVnaW5zOiBbXG4gICAgICAgIHJlYWN0KCksXG4gICAgICAgIHNzcih7XG4gICAgICAgICAgICBwcmVyZW5kZXI6IHRydWUsXG4gICAgICAgIH0pLFxuICAgIF0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgICBhbGlhczoge1xuICAgICAgICAgICAgJyNsaWInOiAnL2xpYicsXG4gICAgICAgICAgICAnI2NvbXBvbmVudHMnOiAnL2NvbXBvbmVudHMnLFxuICAgICAgICAgICAgJyNzZXJ2ZXInOiAnL3NlcnZlcicsXG4gICAgICAgIH1cbiAgICB9LFxuICAgIGJ1aWxkOiB7XG4gICAgICAgIGVtcHR5T3V0RGlyOiBmYWxzZSwgLy8gY2xlYXJpbmcgd2lsbCBkZWxldGUgZW1iZWQgYnVpbGQgaW4gYXNzZXRzXG4gICAgfSxcbn1cblxuZXhwb3J0IGRlZmF1bHQgY29uZmlnXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQThMLE9BQU8sV0FBVztBQUNoTixPQUFPLFNBQVM7QUFHaEIsSUFBTSxTQUFxQjtBQUFBLEVBQ3pCLFNBQVM7QUFBQSxJQUNILE1BQU07QUFBQSxJQUNOLElBQUk7QUFBQSxNQUNBLFdBQVc7QUFBQSxJQUNmLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDTCxPQUFPO0FBQUEsTUFDSCxRQUFRO0FBQUEsTUFDUixlQUFlO0FBQUEsTUFDZixXQUFXO0FBQUEsSUFDZjtBQUFBLEVBQ0o7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNILGFBQWE7QUFBQTtBQUFBLEVBQ2pCO0FBQ0o7QUFFQSxJQUFPLHNCQUFROyIsCiAgIm5hbWVzIjogW10KfQo=
