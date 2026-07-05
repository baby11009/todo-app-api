import { z } from "zod";

// Body khi tạo mới / chỉnh sửa công việc — khớp rule với TodoForm ở frontend
export const todoBodySchema = z.object({
  title: z
    .string({ required_error: "Vui lòng nhập tên công việc" })
    .trim()
    .min(3, "Tên cần ít nhất 3 ký tự")
    .max(100, "Tên tối đa 100 ký tự"),
  description: z
    .string()
    .trim()
    .max(300, "Mô tả tối đa 300 ký tự")
    .optional()
    .or(z.literal("")),
});

// Cho phép sửa từng phần (PATCH) nếu cần, nhưng route update chính vẫn dùng todoBodySchema (PUT)
export const todoUpdateSchema = todoBodySchema.partial().refine(
  (data) => data.title === undefined || data.title.length >= 3,
  { message: "Tên cần ít nhất 3 ký tự", path: ["title"] }
);

export const mongoIdParamSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "id không hợp lệ"),
});

export const todoQuerySchema = z.object({
  status: z.enum(["all", "active", "completed"]).optional(),
  search: z.string().trim().optional(),
  sort: z.enum(["newest", "oldest", "az", "za"]).optional(),
  page: z
    .string()
    .regex(/^\d+$/, "page phải là số")
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/, "limit phải là số")
    .optional(),
});

export type TodoBodyInput = z.infer<typeof todoBodySchema>;
export type TodoUpdateInput = z.infer<typeof todoUpdateSchema>;
export type TodoQueryInput = z.infer<typeof todoQuerySchema>;
