export interface Category {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface FetchCategoryParams {
  q?: string;
  page?: number;
}

export interface CategoryPagination {
  page?: number;
  limit?: number;
  total?: number;
  total_pages?: number;
}
