
'use server';

import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp, Timestamp, doc, getDoc, updateDoc, orderBy } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import type { ScriptLine } from '@/ai/flows/generate-podcast-script';

const db = getFirestore(app);

export interface ProjectData {
  title: string;
  originalContent: string;
  script: ScriptLine[];
  summary: string;
  voiceConfig: Record<string, { voiceName: string }>;
  audioUrl: string | null;
  userId: string;
  isPublic?: boolean;
}

export interface Project extends Omit<ProjectData, 'userId' | 'voiceConfig'> {
    id: string;
    createdAt: Date;
    updatedAt?: Date;
    voiceConfig: Record<string, { voiceName: string }>;
    isPublic: boolean;
}

const parseScript = (script: any): ScriptLine[] => {
    if (!script) return [];
    if (Array.isArray(script)) {
        return script; // Already in correct format
    }
    if (typeof script === 'string') {
        try {
            const parsed = JSON.parse(script);
            // Ensure it's an array of objects with the correct shape
            if (Array.isArray(parsed) && parsed.every(item => typeof item === 'object' && 'speaker' in item && 'line' in item)) {
                return parsed;
            }
        } catch (e) {
            console.error("Error parsing JSON script:", e);
            return [];
        }
    }
    return [];
};


export async function saveProject(projectData: ProjectData): Promise<string> {
    try {
        const dataToSave = {
            ...projectData,
            script: JSON.stringify(projectData.script || []), // Serialize script to JSON string
            summary: projectData.summary || '',
            audioUrl: projectData.audioUrl || null,
            isPublic: projectData.isPublic || false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };
        const docRef = await addDoc(collection(db, 'projects'), dataToSave);
        return docRef.id;
    } catch (error) {
        console.error("Error saving project to Firestore: ", error);
        throw new Error("Could not save project.");
    }
}

export async function updateProject(projectId: string, projectData: Partial<Omit<ProjectData, 'userId'>>): Promise<void> {
    try {
        const dataToUpdate: Record<string, any> = { ...projectData };
        if (projectData.script) {
            dataToUpdate.script = JSON.stringify(projectData.script); // Serialize script to JSON string
        }
        dataToUpdate.updatedAt = serverTimestamp();

        const projectRef = doc(db, 'projects', projectId);
        await updateDoc(projectRef, dataToUpdate);
    } catch (error) {
        console.error("Error updating project in Firestore: ", error);
        throw new Error("Could not update project.");
    }
}


export async function getProjects(userId: string): Promise<Project[]> {
    try {
        const q = query(collection(db, 'projects'), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        
        const projects = querySnapshot.docs.map(doc => {
            const data = doc.data();

            return {
                id: doc.id,
                title: data.title,
                originalContent: data.originalContent,
                script: parseScript(data.script),
                summary: data.summary,
                voiceConfig: data.voiceConfig,
                audioUrl: data.audioUrl,
                isPublic: data.isPublic || false,
                createdAt: (data.createdAt as Timestamp).toDate(),
                updatedAt: data.updatedAt ? (data.updatedAt as Timestamp).toDate() : undefined,
            } as Project;
        });
        
        // Sort in the application code
        return projects.sort((a, b) => (b.updatedAt || b.createdAt).getTime() - (a.updatedAt || a.createdAt).getTime());

    } catch (error) {
        console.error("Error fetching projects from Firestore: ", error);
        throw new Error("Could not fetch projects.");
    }
}

export async function getProject(id: string, userId: string): Promise<(Project & {userId: string}) | null> {
    try {
        const projectRef = doc(db, 'projects', id);
        const projectSnap = await getDoc(projectRef);

        if (!projectSnap.exists()) {
            return null;
        }

        const projectData = projectSnap.data();

        if (projectData.userId !== userId) {
            console.error('User does not have access to this project');
            return null;
        }
        
        return {
            id: projectSnap.id,
            ...projectData,
            script: parseScript(projectData.script),
            voiceConfig: projectData.voiceConfig || {},
            isPublic: projectData.isPublic || false,
            createdAt: (projectData.createdAt as Timestamp).toDate(),
            updatedAt: projectData.updatedAt ? (projectData.updatedAt as Timestamp).toDate() : undefined,
        } as (Project & {userId: string});

    } catch (error) {
        console.error("Error fetching project from Firestore: ", error);
        throw new Error("Could not fetch project.");
    }
}


export async function getPublicProjects(): Promise<Project[]> {
    try {
        const q = query(collection(db, 'projects'), where('isPublic', '==', true));
        const querySnapshot = await getDocs(q);

        const projects = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                script: parseScript(data.script),
                createdAt: (data.createdAt as Timestamp).toDate(),
                updatedAt: data.updatedAt ? (data.updatedAt as Timestamp).toDate() : undefined,
            } as Project;
        });
        
        return projects.sort((a, b) => (b.updatedAt || b.createdAt).getTime() - (a.updatedAt || a.createdAt).getTime());

    } catch (error) {
        console.error("Error fetching public projects from Firestore: ", error);
        return [];
    }
}


export async function getPublicProject(id: string): Promise<Project | null> {
    try {
        const projectRef = doc(db, 'projects', id);
        const projectSnap = await getDoc(projectRef);

        if (!projectSnap.exists()) {
            return null;
        }
        const projectData = projectSnap.data();

        if (!projectData.isPublic) {
            console.error('This project is not public.');
            return null;
        }

        return {
            id: projectSnap.id,
            ...projectData,
            script: parseScript(projectData.script),
            createdAt: (projectData.createdAt as Timestamp).toDate(),
            updatedAt: projectData.updatedAt ? (projectData.updatedAt as Timestamp).toDate() : undefined,
        } as Project;

    } catch (error) {
        console.error("Error fetching public project from Firestore: ", error);
        throw new Error("Could not fetch project.");
    }
}
