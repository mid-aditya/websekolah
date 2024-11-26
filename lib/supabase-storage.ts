import { supabase } from './supabase';

export const uploadImage = async (file: File) => {
  try {
    if (!file) throw new Error('No file provided');

    // Create unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `public/${fileName}`;

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from('galeri')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('galeri')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (err: any) {
    console.error('Error uploading image:', err.message);
    throw new Error(err.message || 'Error uploading image');
  }
};

export const deleteImage = async (filePath: string) => {
  try {
    if (!filePath) throw new Error('No file path provided');

    // Extract file name from URL
    const fileName = filePath.split('/').pop();
    if (!fileName) throw new Error('Invalid file path');

    const { error: deleteError } = await supabase.storage
      .from('galeri')
      .remove([`public/${fileName}`]);

    if (deleteError) throw deleteError;
  } catch (err: any) {
    console.error('Error deleting image:', err.message);
    throw new Error(err.message || 'Error deleting image');
  }
}; 