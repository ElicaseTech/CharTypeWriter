// start.js
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { createServer } from "http";

// 获取 server.mjs 的绝对路径
const __dirname = dirname(fileURLToPath(import.meta.url));
const serverModule = await import(resolve(__dirname, "./.output/server/index.mjs"));

// Nitro 入口导出 createApp
const app = await serverModule.default();

// 启动 HTTP 服务器
createServer(app.nodeHandler).listen(3000, () => {
  console.log("✅ Nuxt server running at http://localhost:3000");
});
