export const PAGE_SIZE_OPTIONS = {
  SMALL: 5,
  MEDIUM: 10,
  LARGE: 20,
  EXTRA_LARGE: 50,
  XL: 100,
  ALL: [5, 10, 20, 50, 100],
};

export interface TablePageModel {
  pageSize: number;
  pageNumber: number;
  sortingField: string;
  sortingOrder: "asc" | "desc" | "";
  filterQuery?: string;
  totalItems: number;
}

export interface PageModel<T> {
  total: number;
  data: T[];
}
