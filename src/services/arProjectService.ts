/**
 * arProjectService.ts
 * - File Storage  : Supabase Storage (free, no credit card)
 * - Metadata DB   : Supabase DB (free)
 */
import { supabase, uploadToSupabase, deleteFromSupabase } from '../config/supabase';

export const COLLECTION = 'ar_projects';

export type ARModelType = 'GLB' | 'GLTF' | 'OBJ';
export type ARCategory = 'alphabet' | 'numbers' | 'shapes' | 'animals' | 'custom';

export interface ARProject {
    id: string;
    title: string;
    description: string;
    category: ARCategory;
    modelUrl: string;           // Supabase public URL
    modelType: ARModelType;
    thumbnailUrl?: string;
    teacherName: string;
    createdAt: string;
    fileSize?: number;
}

// ─── FULL PIPELINE (Upload to Supabase → Save metadata to Supabase DB) ──────────
export async function uploadAndSaveProject(
    params: {
        localFilePath: string;
        fileName: string;
        title: string;
        description: string;
        category: ARCategory;
        modelType: ARModelType;
        teacherName: string;
        fileSize?: number;
    },
    onProgress?: (percent: number) => void,
): Promise<void> {

    // 1. Upload file to Supabase Storage
    const modelUrl = await uploadToSupabase(
        params.localFilePath,
        params.fileName,
        onProgress,
    );

    // 2. Save metadata to Supabase DB
    const { error } = await supabase.from(COLLECTION).insert([{
        title: params.title,
        description: params.description,
        category: params.category,
        modelUrl,
        modelType: params.modelType,
        teacherName: params.teacherName,
        createdAt: new Date().toISOString(),
        fileSize: params.fileSize ?? null,
    }]);

    if (error) {
        console.error('Error saving DB:', error);
        throw error;
    }
}

// ─── DELETE PROJECT ────────────────────────────────────────────────────────────
export async function deleteProject(
    projectId: string,
    modelUrl: string,
): Promise<void> {
    // Delete Supabase document
    await supabase.from(COLLECTION).delete().eq('id', projectId);

    // Delete file from Supabase Storage
    try {
        await deleteFromSupabase(modelUrl);
    } catch {
        // Ignore if file already deleted
    }
}

// ─── REAL-TIME LISTENER (students) ────────────────────────────────────────────
export function subscribeToProjects(
    onUpdate: (projects: ARProject[]) => void,
    category?: ARCategory,
): () => void {

    // Helper to always build a fresh category-filtered query
    const buildQuery = () => {
        let q = supabase.from(COLLECTION).select('*').order('createdAt', { ascending: false });
        if (category) {
            q = q.eq('category', category);
        }
        return q;
    };

    // Initial fetch
    buildQuery().then(({ data }) => {
        if (data) { onUpdate(data as ARProject[]); }
    });

    // Subscribe to realtime changes — rebuild query on each event so filter stays applied
    const channel = supabase
        .channel('public:ar_projects')
        .on('postgres_changes', { event: '*', schema: 'public', table: COLLECTION }, () => {
            buildQuery().then(({ data }) => {
                if (data) { onUpdate(data as ARProject[]); }
            });
        })
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}

// ─── FETCH ONCE (teacher management) ──────────────────────────────────────────
export async function fetchProjects(category?: ARCategory): Promise<ARProject[]> {
    let query = supabase.from(COLLECTION).select('*').order('createdAt', { ascending: false });

    if (category) {
        query = query.eq('category', category);
    }

    const { data } = await query;
    return (data || []) as ARProject[];
}
