
'use server';

import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp, Timestamp } from 'firebase/firestore';
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

export interface Project extends ProjectData {
    id: string;
    createdAt: Date;
}

export async function saveProject(projectData: ProjectData): Promise<void> {
    try {
        await addDoc(collection(db, 'projects'), {
            ...projectData,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error saving project to Firestore: ", error);
        throw new Error("Could not save project.");
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
                ...data,
                createdAt: (data.createdAt as Timestamp).toDate(),
            } as Project;
        }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    } catch (error) {
        console.error("Error fetching projects from Firestore: ", error);
        throw new Error("Could not fetch projects.");
    }
}
