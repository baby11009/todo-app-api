import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

export async function connectDB(): Promise<void> {
  if (!MONGODB_URI) {
    throw new Error(
      "Thiếu biến môi trường MONGODB_URI. Hãy khai báo connection string MongoDB Atlas trong file .env"
    );
  }

  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`[MongoDB] Đã kết nối tới cluster: ${mongoose.connection.host}`);
  } catch (error) {
    console.error("[MongoDB] Kết nối thất bại:", error);
    process.exit(1);
  }

  mongoose.connection.on("disconnected", () => {
    console.warn("[MongoDB] Mất kết nối");
  });
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
