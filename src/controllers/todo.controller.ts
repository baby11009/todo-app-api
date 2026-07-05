import type { Request, Response } from "express";
import type { FilterQuery, SortOrder } from "mongoose";
import { Todo, type TodoAttrs } from "../models/Todo.model";
import { toTodoDTO } from "../utils/toTodoDTO";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import type { TodoBodyInput, TodoQueryInput, TodoUpdateInput } from "../utils/todo.validators";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 50;

function buildSort(sort?: string): Record<string, SortOrder> {
  switch (sort) {
    case "oldest":
      return { createdAt: 1 };
    case "az":
      return { title: 1 };
    case "za":
      return { title: -1 };
    case "newest":
    default:
      return { createdAt: -1 };
  }
}

/**
 * GET /api/todos
 * Query: status=all|active|completed, search=, sort=newest|oldest|az|za, page=, limit=
 */
export const getTodos = asyncHandler(async (req: Request, res: Response) => {
  const { status, search, sort, page, limit } = req.query as unknown as TodoQueryInput;

  const filter: FilterQuery<TodoAttrs> = {};

  if (status === "active") filter.completed = false;
  if (status === "completed") filter.completed = true;

  if (search && search.trim().length > 0) {
    const regex = new RegExp(escapeRegex(search.trim()), "i");
    filter.$or = [{ title: regex }, { description: regex }];
  }

  const pageNum = Math.max(1, Number(page) || DEFAULT_PAGE);
  const limitNum = Math.min(MAX_LIMIT, Math.max(1, Number(limit) || DEFAULT_LIMIT));

  const [items, totalItems, totalCount, activeCount] = await Promise.all([
    Todo.find(filter)
      .sort(buildSort(sort))
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Todo.countDocuments(filter),
    Todo.countDocuments({}),
    Todo.countDocuments({ completed: false }),
  ]);

  res.status(200).json({
    success: true,
    data: items.map(toTodoDTO),
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / limitNum)),
    },
    stats: {
      total: totalCount,
      active: activeCount,
      completed: totalCount - activeCount,
    },
  });
});

/** GET /api/todos/:id */
export const getTodoById = asyncHandler(async (req: Request, res: Response) => {
  const todo = await Todo.findById(req.params.id);
  if (!todo) throw ApiError.notFound("Không tìm thấy công việc");

  res.status(200).json({ success: true, data: toTodoDTO(todo) });
});

/** POST /api/todos */
export const createTodo = asyncHandler(async (req: Request, res: Response) => {
  const { title, description } = req.body as TodoBodyInput;

  const todo = await Todo.create({
    title,
    description: description && description.length > 0 ? description : undefined,
  });

  res.status(201).json({ success: true, data: toTodoDTO(todo) });
});

/** PUT /api/todos/:id — cập nhật tên/mô tả */
export const updateTodo = asyncHandler(async (req: Request, res: Response) => {
  const { title, description } = req.body as TodoUpdateInput;

  const todo = await Todo.findById(req.params.id);
  if (!todo) throw ApiError.notFound("Không tìm thấy công việc");

  if (title !== undefined) todo.title = title;
  if (description !== undefined) {
    todo.description = description.length > 0 ? description : undefined;
  }

  await todo.save();

  res.status(200).json({ success: true, data: toTodoDTO(todo) });
});

/** PATCH /api/todos/:id/toggle — đổi trạng thái hoàn thành */
export const toggleTodo = asyncHandler(async (req: Request, res: Response) => {
  const todo = await Todo.findById(req.params.id);
  if (!todo) throw ApiError.notFound("Không tìm thấy công việc");

  todo.completed = !todo.completed;
  await todo.save();

  res.status(200).json({ success: true, data: toTodoDTO(todo) });
});

/** DELETE /api/todos/:id */
export const deleteTodo = asyncHandler(async (req: Request, res: Response) => {
  const todo = await Todo.findByIdAndDelete(req.params.id);
  if (!todo) throw ApiError.notFound("Không tìm thấy công việc");

  res.status(200).json({ success: true, data: { id: req.params.id } });
});

/** GET /api/todos/stats — tổng số / chưa xong / đã xong */
export const getTodoStats = asyncHandler(async (_req: Request, res: Response) => {
  const [total, active] = await Promise.all([
    Todo.countDocuments({}),
    Todo.countDocuments({ completed: false }),
  ]);

  res.status(200).json({
    success: true,
    data: { total, active, completed: total - active },
  });
});

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
