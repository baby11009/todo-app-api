import dotenv from "dotenv";
dotenv.config();

import { createApp } from "./app";
import { connectDB } from "./config/db";

const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

async function startApp(): Promise<void> {
  await connectDB();

  const app = createApp();

  const server = app.listen(PORT, () => {
    console.log(`[Server] Todo API đang chạy tại http://localhost:${PORT}`);
  });

  const shutdown = (signal: string) => {
    console.log(`\n[Server] Nhận tín hiệu ${signal}, đang tắt server...`);
    server.close(() => process.exit(0));
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

startApp().catch((error) => {
  console.error("[Server] Không thể khởi động:", error);
  process.exit(1);
});
