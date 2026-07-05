export type FilterStatus = "all" | "active" | "completed";

export type SortOption = "newest" | "oldest" | "az" | "za";

export interface TodoDTO {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface TodoQuery {
  status?: FilterStatus;
  search?: string;
  sort?: SortOption;
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface TodoStats {
  total: number;
  active: number;
  completed: number;
}
