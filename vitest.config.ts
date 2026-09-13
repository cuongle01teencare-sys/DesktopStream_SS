import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true, // Cho phép dùng describe, it, expect mà không cần import
    environment: "node", // Dùng 'jsdom' hoặc 'happy-dom' nếu test UI/React/Vue
    exclude: [...configDefaults.exclude, "packages/template/*"],
  },
});
