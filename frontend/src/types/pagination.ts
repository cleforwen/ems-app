export interface PagedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  size?: number;
}
