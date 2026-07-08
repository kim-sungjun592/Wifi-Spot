import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, // 원하는 포트 번호로 고정
    strictPort: true, // 해당 포트가 이미 사용 중이면 에러를 내고 다른 포트로 바꾸지 않음
  },
});
