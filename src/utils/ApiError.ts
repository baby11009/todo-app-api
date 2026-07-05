export class ApiError extends Error {
  public statusCode: number;
  public details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(message: string, details?: unknown) {
    return new ApiError(400, message, details);
  }

  static notFound(message = "Không tìm thấy dữ liệu") {
    return new ApiError(404, message);
  }

  static internal(message = "Lỗi hệ thống") {
    return new ApiError(500, message);
  }
}
