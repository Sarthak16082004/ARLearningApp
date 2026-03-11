/**
 * arProjectService.ts
 * - File Storage  : Supabase Storage (free, no credit card)
 * - Metadata DB   : Firebase Firestore (free)
 */
import firestore from '@react-native-firebase/firestore';
import { uploadToSupabase, deleteFromSupabase } from '../config/supabase';

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

// ─── FULL PIPELINE (Upload to Supabase → Save metadata to Firestore) ──────────
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

    // 1. Upload file to Supabase Storage (free, no card)
    const modelUrl = await uploadToSupabase(
        params.localFilePath,
        params.fileName,
        onProgress,
    );

    // 2. Save metadata to Firestore
    await firestore().collection(COLLECTION).add({
        title: params.title,
        description: params.description,
        category: params.category,
        modelUrl,                   // Supabase public URL
        modelType: params.modelType,
        teacherName: params.teacherName,
        createdAt: new Date().toISOString(),
        fileSize: params.fileSize ?? null,
    });
}

// ─── DELETE PROJECT ────────────────────────────────────────────────────────────
export async function deleteProject(
    projectId: string,
    modelUrl: string,
): Promise<void> {
    // Delete Firestore document
    await firestore().collection(COLLECTION).doc(projectId).delete();

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
    let query: any = firestore()
        .collection(COLLECTION)
        .orderBy('createdAt', 'desc');

    if (category) {
        query = query.where('category', '==', category);
    }

    return query.onSnapshot((snapshot: any) => {
        const projects = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data(),
        })) as ARProject[];
        onUpdate(projects);
    });
}

// ─── FETCH ONCE (teacher management) ──────────────────────────────────────────
export async function fetchProjects(category?: ARCategory): Promise<ARProject[]> {
    let query: any = firestore()
        .collection(COLLECTION)
        .orderBy('createdAt', 'desc');

    if (category) {
        query = query.where('category', '==', category);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
    })) as ARProject[];
}
