import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { ApiError } from "../utils/ApiError";

type ValidationTarget = "body" | "params" | "query";

export function validate(schema: ZodTypeAny, target: ValidationTarget = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return next(ApiError.badRequest("Dữ liệu không hợp lệ", details));
    }

    // Gán lại dữ liệu đã qua parse (đã trim/convert) để controller dùng
    (req as unknown as Record<ValidationTarget, unknown>)[target] = result.data;
    next();
  };
}
