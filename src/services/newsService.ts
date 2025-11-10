import api from './api';

export interface News {
  id: number;
  title: string;
  excerpt: string;
  content?: string;
  imageUrl?: string;
  category?: string;
  publishedAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateNewsRequest {
  title: string;
  excerpt: string;
  content?: string;
  imageUrl?: string;
  category?: string;
  publishedAt?: string;
  isActive?: boolean;
}

export interface UpdateNewsRequest {
  title: string;
  excerpt: string;
  content?: string;
  imageUrl?: string;
  category?: string;
  publishedAt?: string;
  isActive: boolean;
}

export const newsService = {
  getNews: async (): Promise<News[]> => {
    const response = await api.get<News[]>('/news');
    return response.data;
  },

  getNewsItem: async (id: number): Promise<News> => {
    const response = await api.get<News>(`/news/${id}`);
    return response.data;
  },

  createNews: async (data: CreateNewsRequest): Promise<News> => {
    const response = await api.post<News>('/news', data);
    return response.data;
  },

  updateNews: async (id: number, data: UpdateNewsRequest): Promise<void> => {
    await api.put(`/news/${id}`, data);
  },

  deleteNews: async (id: number): Promise<void> => {
    await api.delete(`/news/${id}`);
  },
};

