import api from './api';

export interface Category {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
}

export interface Brand {
  id: number;
  name: string;
  description?: string;
  logoUrl?: string;
  isActive: boolean;
}

export interface Color {
  id: number;
  name: string;
  hexCode: string;
  isActive: boolean;
}

export interface Size {
  id: number;
  name: string;
  isActive: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface UpdateCategoryRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
}

export interface CreateBrandRequest {
  name: string;
  description?: string;
  logoUrl?: string;
  isActive?: boolean;
}

export interface UpdateBrandRequest {
  name: string;
  description?: string;
  logoUrl?: string;
  isActive: boolean;
}

export interface CreateColorRequest {
  name: string;
  hexCode: string;
  isActive?: boolean;
}

export interface UpdateColorRequest {
  name: string;
  hexCode: string;
  isActive: boolean;
}

export interface CreateSizeRequest {
  name: string;
  isActive?: boolean;
}

export interface UpdateSizeRequest {
  name: string;
  isActive: boolean;
}

export const adminService = {
  // Categories
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  },

  createCategory: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await api.post<Category>('/categories', data);
    return response.data;
  },

  updateCategory: async (id: number, data: UpdateCategoryRequest): Promise<void> => {
    await api.put(`/categories/${id}`, data);
  },

  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },

  // Brands
  getBrands: async (): Promise<Brand[]> => {
    const response = await api.get<Brand[]>('/brands');
    return response.data;
  },

  createBrand: async (data: CreateBrandRequest): Promise<Brand> => {
    const response = await api.post<Brand>('/brands', data);
    return response.data;
  },

  updateBrand: async (id: number, data: UpdateBrandRequest): Promise<void> => {
    await api.put(`/brands/${id}`, data);
  },

  deleteBrand: async (id: number): Promise<void> => {
    await api.delete(`/brands/${id}`);
  },

  // Colors
  getColors: async (): Promise<Color[]> => {
    const response = await api.get<Color[]>('/colors');
    return response.data;
  },

  createColor: async (data: CreateColorRequest): Promise<Color> => {
    const response = await api.post<Color>('/colors', data);
    return response.data;
  },

  updateColor: async (id: number, data: UpdateColorRequest): Promise<void> => {
    await api.put(`/colors/${id}`, data);
  },

  deleteColor: async (id: number): Promise<void> => {
    await api.delete(`/colors/${id}`);
  },

  // Sizes
  getSizes: async (): Promise<Size[]> => {
    const response = await api.get<Size[]>('/sizes');
    return response.data;
  },

  createSize: async (data: CreateSizeRequest): Promise<Size> => {
    const response = await api.post<Size>('/sizes', data);
    return response.data;
  },

  updateSize: async (id: number, data: UpdateSizeRequest): Promise<void> => {
    await api.put(`/sizes/${id}`, data);
  },

  deleteSize: async (id: number): Promise<void> => {
    await api.delete(`/sizes/${id}`);
  },
};

