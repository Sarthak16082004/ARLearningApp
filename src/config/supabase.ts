import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gulzdtknokhzlvxsxqul.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1bHpkdGtub2toemx2eHN4cXVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNDU5NzAsImV4cCI6MjA4ODgyMTk3MH0.OmlS-RKzVNy1TflDiF9YqCs0mMyD6nBFxuZscd9DjL4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const STORAGE_BUCKET = 'models';

/**
 * Uploads a file to Supabase Storage and returns the public URL.
 * @param fileUri     - local content:// or file:// URI (from document picker)
 * @param fileName    - the file name including extension
 * @param onProgress  - optional callback for upload progress (0–100)
 */
export async function uploadToSupabase(
    fileUri: string,
    fileName: string,
    onProgress?: (pct: number) => void,
): Promise<string> {

    // In React Native, fetch(content://...) usually fails.
    // Instead, we construct an object that the Supabase client handles natively for React Native!
    onProgress?.(10);
    
    // React Native's specific file object structure
    const fileForSupabase = {
        uri: fileUri,
        name: fileName,
        type: fileName.endsWith('.glb') ? 'model/gltf-binary' : 
              fileName.endsWith('.gltf') ? 'model/gltf+json' : 
              fileName.endsWith('.jpg') ? 'image/jpeg' : 'application/octet-stream',
    };
    
    // 2. Build a unique storage path
    const storagePath = `${Date.now()}_${fileName.replace(/\s+/g, '_')}`;

    onProgress?.(40);

    // 3. Upload to Supabase Storage
    const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, fileForSupabase as any);

    onProgress?.(85);

    if (error) {
        throw new Error(`Supabase upload failed: ${error.message}`);
    }

    // 4. Get the permanent public URL
    const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(data.path);

    onProgress?.(100);

    return urlData.publicUrl;
}

/**
 * Deletes a file from Supabase Storage given its public URL.
 */
export async function deleteFromSupabase(publicUrl: string): Promise<void> {
    // Extract the file path from the public URL
    const path = publicUrl.split(`/${STORAGE_BUCKET}/`)[1];
    if (!path) return;

    await supabase.storage.from(STORAGE_BUCKET).remove([path]);
}
