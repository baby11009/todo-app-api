import type { TodoDocument } from "../models/Todo.model";
import type { TodoDTO } from "../types/todo.types";

export function toTodoDTO(doc: TodoDocument): TodoDTO {
  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description ?? undefined,
    completed: doc.completed ?? false,
    createdAt: doc.createdAt ? new Date(doc.createdAt).getTime() : Date.now(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).getTime() : Date.now(),
  };
}
