import api from './api';

export interface Slider {
  id: number;
  imageUrl: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateSliderRequest {
  imageUrl: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateSliderRequest {
  imageUrl: string;
  displayOrder: number;
  isActive: boolean;
}

export const sliderService = {
  getSliders: async (): Promise<Slider[]> => {
    const response = await api.get<Slider[]>('/sliders');
    return response.data;
  },

  getSlider: async (id: number): Promise<Slider> => {
    const response = await api.get<Slider>(`/sliders/${id}`);
    return response.data;
  },

  createSlider: async (data: CreateSliderRequest): Promise<Slider> => {
    const response = await api.post<Slider>('/sliders', data);
    return response.data;
  },

  updateSlider: async (id: number, data: UpdateSliderRequest): Promise<void> => {
    await api.put(`/sliders/${id}`, data);
  },

  deleteSlider: async (id: number): Promise<void> => {
    await api.delete(`/sliders/${id}`);
  },
};

