export interface PaginatedResponse<T> {
  data: T;
  hasMore: boolean;
}
