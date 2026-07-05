import type { Request, Response } from "express";

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Không tìm thấy đường dẫn ${req.method} ${req.originalUrl}`,
  });
}
