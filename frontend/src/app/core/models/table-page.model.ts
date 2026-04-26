export interface TablePageModel {
  pageSize: number;
  pageNumber: number;
  sortingField: string;
  sortingOrder: "asc" | "desc" | "";
  filterQuery?: string;
  totalItems: number;
}
