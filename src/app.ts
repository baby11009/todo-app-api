import express, { type Application, type Request, type Response } from "express";
import cors from "cors";
import todoRoutes from "./routes/todo.routes";
import { notFoundHandler } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/errorHandler";

export function createApp(): Application {
  const app = express();

  const allowedOrigins = (process.env.CLIENT_ORIGIN ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: allowedOrigins.length > 0 ? allowedOrigins : true,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({ success: true, message: "Todo API đang hoạt động" });
  });

  app.use("/api/todos", todoRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
