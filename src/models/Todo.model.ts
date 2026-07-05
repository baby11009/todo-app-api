import { Schema, model, type InferSchemaType } from "mongoose";

const todoSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Tên công việc là bắt buộc"],
      trim: true,
      minlength: [3, "Tên công việc cần ít nhất 3 ký tự"],
      maxlength: [100, "Tên công việc tối đa 100 ký tự"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, "Mô tả tối đa 300 ký tự"],
      default: undefined,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // tự thêm createdAt, updatedAt
    versionKey: false,
  }
);

// Hỗ trợ tìm kiếm theo title/description ở tầng DB
todoSchema.index({ title: "text", description: "text" });

export type TodoAttrs = InferSchemaType<typeof todoSchema>;

export const Todo = model("Todo", todoSchema);

export type TodoDocument = InstanceType<typeof Todo>;
