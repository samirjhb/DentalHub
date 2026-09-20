import { PaginatedResult } from '../dto/paginated-result.interface';

interface PaginationLike {
  page?: number;
  limit?: number;
}

// El disparador de "modo paginado": si el llamador no manda ni page ni
// limit, se asume que quiere el listado completo (selectores, contadores).
export function isPaginationRequested(q?: PaginationLike): boolean {
  return q?.page !== undefined || q?.limit !== undefined;
}

export function resolvePagination(q?: PaginationLike, defaultLimit = 10) {
  const page = q?.page ?? 1;
  const limit = q?.limit ?? defaultLimit;
  return { page, limit, skip: (page - 1) * limit };
}

export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return {
    data,
    total,
    page,
    limit,
    totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
  };
}
