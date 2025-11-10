import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * Generate unique filename with timestamp
 */
const generateFileName = (file: File): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = file.name.split('.').pop();
  return `images/${timestamp}_${randomString}.${extension}`;
};

export const imageService = {
  /**
   * Upload image to Firebase Storage
   */
  uploadImage: async (file: File): Promise<string> => {
    try {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP, BMP)');
      }

      // Validate file size (32 MB max)
      if (file.size > 32 * 1024 * 1024) {
        throw new Error('Kích thước file không được vượt quá 32 MB');
      }

      // Generate unique filename
      const fileName = generateFileName(file);
      const storageRef = ref(storage, fileName);

      // Upload file to Firebase Storage
      const snapshot = await uploadBytes(storageRef, file);

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      return downloadURL;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      throw new Error(error.message || 'Lỗi khi upload ảnh');
    }
  },

  /**
   * Upload multiple images to Firebase Storage
   */
  uploadImages: async (files: File[]): Promise<string[]> => {
    try {
      const uploadPromises = files.map((file) => imageService.uploadImage(file));
      const urls = await Promise.all(uploadPromises);
      return urls;
    } catch (error: any) {
      console.error('Error uploading images:', error);
      throw new Error(error.message || 'Lỗi khi upload ảnh');
    }
  },
};

