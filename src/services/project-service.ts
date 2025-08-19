
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

export async function saveProject(projectData: ProjectData): Promise<string> {
    try {
        const docRef = await addDoc(collection(db, 'projects'), {
            ...projectData,
            isPublic: projectData.isPublic || false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error saving project to Firestore: ", error);
        throw new Error("Could not save project.");
    }
}

export async function updateProject(projectId: string, projectData: Partial<Omit<ProjectData, 'userId'>>): Promise<void> {
    try {
        const projectRef = doc(db, 'projects', projectId);
        await updateDoc(projectRef, {
            ...projectData,
            updatedAt: serverTimestamp(),
        });
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
            // Handle legacy string scripts
            const script = typeof data.script === 'string' 
                ? data.script.split('\n').map((line: string) => {
                    const parts = line.split(':');
                    const speaker = parts.shift() || 'Unknown';
                    const lineText = parts.join(':').trim();
                    return { speaker, line: lineText };
                }).filter((s: ScriptLine) => s.line)
                : data.script;

            return {
                id: doc.id,
                title: data.title,
                originalContent: data.originalContent,
                script: script || [],
                summary: data.summary,
                voiceConfig: data.voiceConfig,
                audioUrl: data.audioUrl,
                isPublic: data.isPublic || false,
                createdAt: (data.createdAt as Timestamp).toDate(),
                updatedAt: data.updatedAt ? (data.updatedAt as Timestamp).toDate() : undefined,
            } as Project;
        });
        
        // Sort projects by date in the application code
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
        
        // Handle legacy string scripts
        const script = typeof projectData.script === 'string' 
            ? projectData.script.split('\n').map((line: string) => {
                const parts = line.split(':');
                const speaker = parts.shift() || 'Unknown';
                const lineText = parts.join(':').trim();
                return { speaker, line: lineText };
            }).filter((s: ScriptLine) => s.line)
            : projectData.script;


        return {
            id: projectSnap.id,
            ...projectData,
            script: script || [],
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
        const q = query(collection(db, 'projects'), where('isPublic', '==', true), orderBy('updatedAt', 'desc'));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: (data.createdAt as Timestamp).toDate(),
                updatedAt: data.updatedAt ? (data.updatedAt as Timestamp).toDate() : undefined,
            } as Project;
        });
    } catch (error) {
        console.error("Error fetching public projects from Firestore: ", error);
        // It's better to return an empty array for a public feed than to throw an error
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
            createdAt: (projectData.createdAt as Timestamp).toDate(),
            updatedAt: projectData.updatedAt ? (data.updatedAt as Timestamp).toDate() : undefined,
        } as Project;

    } catch (error) {
        console.error("Error fetching public project from Firestore: ", error);
        throw new Error("Could not fetch project.");
    }
}

