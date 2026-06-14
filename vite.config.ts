import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // lắng nghe cả IPv4 (127.0.0.1) lẫn IPv6 để localhost luôn vào được
    port: 5173,
  },
});
