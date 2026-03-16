import { storage } from '../firebaseStorage';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Storage Service
 * Handles Firebase Storage operations for file uploads
 */

/**
 * Upload a file to Firebase Storage
 * @param {File} file - The file to upload
 * @param {string} path - Storage path (e.g., 'events', 'receipts', 'posters')
 * @param {string} customName - Optional custom filename
 * @returns {Promise<string>} Download URL
 */
export const uploadFile = async (file, path, customName = null) => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const filename = customName || `${timestamp}_${randomString}_${file.name}`;
    
    // Create storage reference
    const storageRef = ref(storage, `${path}/${filename}`);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};

/**
 * Upload an image specifically (with validation)
 * @param {File} file - The image file
 * @param {string} path - Storage path
 * @returns {Promise<string>} Download URL
 */
export const uploadImage = async (file, path) => {
  try {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload an image (JPEG, PNG, WebP, or GIF)');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 5MB');
    }

    return await uploadFile(file, path);
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Delete a file from Firebase Storage
 * @param {string} fileURL - The file's download URL
 */
export const deleteFile = async (fileURL) => {
  try {
    if (!fileURL) return;

    // Extract path from URL
    const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/';
    if (!fileURL.startsWith(baseUrl)) {
      console.warn('Invalid Firebase Storage URL');
      return;
    }

    // Parse the URL to get the file path
    const urlParts = fileURL.split('/o/');
    if (urlParts.length < 2) return;
    
    const encodedPath = urlParts[1].split('?')[0];
    const filePath = decodeURIComponent(encodedPath);
    
    // Delete the file
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
    
    console.log('File deleted successfully');
  } catch (error) {
    // Don't throw error if file doesn't exist or already deleted
    if (error.code === 'storage/object-not-found') {
      console.log('File already deleted or does not exist');
    } else {
      console.error('Error deleting file:', error);
    }
  }
};

/**
 * Convert base64 to File object
 * @param {string} base64String - Base64 encoded string
 * @param {string} filename - Desired filename
 * @returns {File} File object
 */
export const base64ToFile = (base64String, filename) => {
  try {
    // Extract mime type and base64 data
    const matches = base64String.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 string');
    }
    
    const mimeType = matches[1];
    const base64Data = matches[2];
    
    // Convert base64 to binary
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Create File object
    return new File([bytes], filename, { type: mimeType });
  } catch (error) {
    console.error('Error converting base64 to file:', error);
    throw new Error(`Failed to convert base64: ${error.message}`);
  }
};

/**
 * Validate image dimensions (optional)
 * @param {File} file - Image file
 * @param {Object} constraints - { maxWidth, maxHeight, minWidth, minHeight }
 * @returns {Promise<boolean>}
 */
export const validateImageDimensions = (file, constraints = {}) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      const { width, height } = img;
      URL.revokeObjectURL(url);
      
      if (constraints.maxWidth && width > constraints.maxWidth) {
        reject(new Error(`Image width exceeds maximum of ${constraints.maxWidth}px`));
        return;
      }
      
      if (constraints.maxHeight && height > constraints.maxHeight) {
        reject(new Error(`Image height exceeds maximum of ${constraints.maxHeight}px`));
        return;
      }
      
      if (constraints.minWidth && width < constraints.minWidth) {
        reject(new Error(`Image width below minimum of ${constraints.minWidth}px`));
        return;
      }
      
      if (constraints.minHeight && height < constraints.minHeight) {
        reject(new Error(`Image height below minimum of ${constraints.minHeight}px`));
        return;
      }
      
      resolve(true);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
};
