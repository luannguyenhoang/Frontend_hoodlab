import api from './api';

export interface ProductVariantSize {
  idSize: number;
  nameSize: string;
  stock: number;
}

export interface ProductVariant {
  id: number;
  colorId: number;
  colorName: string;
  colorHexCode: string;
  sizeIds?: ProductVariantSize[];
  stock: number;
  imageUrl?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  salePrice?: number;
  categoryId: number;
  categoryName: string;
  brandId: number;
  brandName: string;
  stock: number;
  imageUrl?: string;
  imageUrls?: string[];
  variants?: ProductVariant[];
}

export interface GetProductsParams {
  search?: string;
  categoryId?: number;
  brandId?: number;
  minPrice?: number;
  maxPrice?: number;
}

export interface CreateProductVariantSizeRequest {
  idSize: number;
  stock: number;
}

export interface CreateProductVariantRequest {
  colorId: number;
  sizeIds: CreateProductVariantSizeRequest[];
  imageUrl?: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  salePrice?: number;
  categoryId: number;
  brandId: number;
  stock: number;
  imageUrl?: string;
  imageUrls?: string[];
  isActive: boolean;
  variants?: CreateProductVariantRequest[];
}

export interface UpdateProductVariantSizeRequest {
  id?: number;
  idSize: number;
  stock: number;
}

export interface UpdateProductVariantRequest {
  id?: number;
  colorId: number;
  sizeIds: UpdateProductVariantSizeRequest[];
  imageUrl?: string;
}

export interface UpdateProductRequest {
  name: string;
  description?: string;
  price: number;
  salePrice?: number;
  categoryId: number;
  brandId: number;
  stock: number;
  imageUrl?: string;
  imageUrls?: string[];
  isActive: boolean;
  variants?: UpdateProductVariantRequest[];
}

export const productService = {
  getProducts: async (params?: GetProductsParams): Promise<Product[]> => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId.toString());
    if (params?.brandId) queryParams.append('brandId', params.brandId.toString());
    if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString());
    if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());

    const response = await api.get<Product[]>(`/products?${queryParams.toString()}`);
    return response.data;
  },

  getProduct: async (id: number): Promise<Product> => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  createProduct: async (request: CreateProductRequest): Promise<Product> => {
    const response = await api.post<Product>('/products', request);
    return response.data;
  },

  updateProduct: async (id: number, request: UpdateProductRequest): Promise<Product> => {
    const response = await api.put<Product>(`/products/${id}`, request);
    return response.data;
  },

  deleteProduct: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};

