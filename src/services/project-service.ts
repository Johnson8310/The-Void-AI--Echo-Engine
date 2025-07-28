
'use server';

import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp, Timestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';

const db = getFirestore(app);

export interface ProjectData {
  title: string;
  originalContent: string;
  script: string;
  voiceConfig: Record<string, { voiceName: string }>;
  audioUrl: string | null;
  userId: string;
}

export interface Project extends Omit<ProjectData, 'userId' | 'voiceConfig'> {
    id: string;
    createdAt: Date;
    voiceConfig: Record<string, { voiceName: string }>;
}

export async function saveProject(projectData: ProjectData): Promise<string> {
    try {
        const docRef = await addDoc(collection(db, 'projects'), {
            ...projectData,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error saving project to Firestore: ", error);
        throw new Error("Could not save project.");
    }
}

export async function updateProject(projectId: string, projectData: Omit<ProjectData, 'userId'>): Promise<void> {
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
        
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title,
                originalContent: data.originalContent,
                script: data.script,
                voiceConfig: data.voiceConfig,
                audioUrl: data.audioUrl,
                createdAt: (data.createdAt as Timestamp).toDate(),
            } as Project;
        }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

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
            voiceConfig: projectData.voiceConfig || {},
            createdAt: (projectData.createdAt as Timestamp).toDate(),
        } as (Project & {userId: string});

    } catch (error) {
        console.error("Error fetching project from Firestore: ", error);
        throw new Error("Could not fetch project.");
    }
}
