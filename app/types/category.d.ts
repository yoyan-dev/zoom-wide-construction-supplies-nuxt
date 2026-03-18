export interface CategorySpecHighlight {
  label: string;
  value: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image_url: string;
  overview?: string;
  typical_uses?: string[];
  buying_considerations?: string[];
  featured_specs?: CategorySpecHighlight[];
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
