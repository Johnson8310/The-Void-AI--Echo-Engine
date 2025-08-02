
"use client"

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Music, UploadCloud, FileAudio, X } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface UploadedFile extends File {
  preview: string;
  progress: number;
}

export default function SoundLibraryPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file),
      progress: 0,
    }));
    setFiles(prev => [...prev, ...newFiles]);

    // Mock upload progress
    newFiles.forEach(file => {
      const timer = setInterval(() => {
        setFiles(prev => prev.map(f => {
          if (f.name === file.name && f.progress < 100) {
            return { ...f, progress: f.progress + 20 };
          }
          return f;
        }));
      }, 500);

      setTimeout(() => {
        clearInterval(timer);
        setFiles(prev => prev.map(f => f.name === file.name ? { ...f, progress: 100 } : f));
      }, 2500);
    });

  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'audio/*': [] }
  });

  const removeFile = (fileName: string) => {
    setFiles(prev => prev.filter(f => f.name !== fileName));
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-headline tracking-tight">Sound Library</h1>
        <p className="text-muted-foreground mt-2">
          Upload and manage your custom music beds and sound effects.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UploadCloud className="text-primary" />
            Upload Audio
          </CardTitle>
          <CardDescription>
            Drag & drop your audio files here or click to select files. (.mp3, .wav, .m4a)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <UploadCloud className="h-12 w-12" />
                {isDragActive ? (
                  <p>Drop the files here ...</p>
                ) : (
                  <p>Drag 'n' drop some files here, or click to select files</p>
                )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {files.length > 0 && (
        <Card>
            <CardHeader>
                <CardTitle>Uploads</CardTitle>
                <CardDescription>The files below are ready to be used in your projects.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {files.map(file => (
                    <div key={file.name} className="flex items-center gap-4 p-3 border rounded-lg">
                        <FileAudio className="h-8 w-8 text-primary" />
                        <div className="flex-1">
                            <p className="font-medium truncate">{file.name}</p>
                            <div className="flex items-center gap-2">
                                <Progress value={file.progress} className="w-full h-2" />
                                <span className="text-sm text-muted-foreground">{file.progress}%</span>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeFile(file.name)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </CardContent>
        </Card>
      )}

      <Card className="mt-4 border-dashed">
        <CardHeader>
          <CardTitle>Feature Not Implemented</CardTitle>
          <CardDescription>
            This is a foundational UI for a feature that is not yet fully implemented.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>While you can add files to the list above, they are not yet being uploaded to a server or available for use in the podcast generation. Full implementation of audio storage and mixing is planned for a future update.</p>
        </CardContent>
      </Card>
    </div>
  );
}
