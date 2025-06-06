'use client';
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, ChangeEvent } from "react";
import axios from "axios";


export default function Home() {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type === 'application/pdf') {
            try {
                setIsUploading(true);
                const formData = new FormData();
                formData.append('file', file);

                const response = await axios.post('http://localhost:8080/api/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                if (response.data) {
                    console.log('Upload erfolgreich:', response.data);
                }
            } catch (error) {
                console.error('Upload fehlgeschlagen:', error);
            } finally {
                setIsUploading(false);
            }
        } else {
            alert('Bitte wählen Sie eine PDF-Datei aus.');
        }
    };

    return (
        <div className="flex flex-col items-center">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-center mb-8">Willkommen bei Prospekt-AI</h1>
                <p className="text-lg text-center mb-4">Ein KI-gestützter Assistent zur automatisierten Extraktion von Angebotsdaten aus PDF-Prospekten.</p>
                <p className="text-center mb-6">Bitte laden sie ein Angebotsprospekt im PDF-Format hoch.</p>
                <div className="flex justify-center">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf"
                        className="hidden"
                    />
                    <Button  onClick={handleUploadClick} disabled={isUploading}>
                        <Upload className="mr-1" />
                        <span>{isUploading ? 'Lädt...' : 'Hochladen'}</span>
                    </Button>

                    {isUploading && (
                        <div className="mt-[100px]  flex flex-col items-center absolute ">
                            <svg
                                className="animate-spin h-8 w-8 text-blue-600"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                ></path>
                            </svg>
                            <span className="mt-2 text-blue-700">Bitte warten...</span>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}