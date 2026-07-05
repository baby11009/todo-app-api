import { Router } from "express";
import {
  createTodo,
  deleteTodo,
  getTodoById,
  getTodoStats,
  getTodos,
  toggleTodo,
  updateTodo,
} from "../controllers/todo.controller";
import { validate } from "../middlewares/validate";
import {
  mongoIdParamSchema,
  todoBodySchema,
  todoQuerySchema,
  todoUpdateSchema,
} from "../utils/todo.validators";

const router = Router();

router.get("/stats", getTodoStats);

router.get("/", validate(todoQuerySchema, "query"), getTodos);

router.post("/", validate(todoBodySchema, "body"), createTodo);

router.get("/:id", validate(mongoIdParamSchema, "params"), getTodoById);

router.put(
  "/:id",
  validate(mongoIdParamSchema, "params"),
  validate(todoUpdateSchema, "body"),
  updateTodo
);

router.patch("/:id/toggle", validate(mongoIdParamSchema, "params"), toggleTodo);

router.delete("/:id", validate(mongoIdParamSchema, "params"), deleteTodo);

export default router;
