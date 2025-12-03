'use client';
import { Upload, FileText, Zap, Shield, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingOverlay } from "@/components/ui/loading";
import { useRef, ChangeEvent } from "react";
import { useUpload } from "@/app/context/uploadContext";
import { envApi } from "@/utils/api";
import { useRouter } from 'next/navigation';

export default function Home() {
    const { isUploading, setIsUploading } = useUpload();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type === 'application/pdf') {
            try {
                setIsUploading(true);
                console.log("ist am uploaden", isUploading);
                const formData = new FormData();
                formData.append('file', file);

                const response = await envApi.post('/api/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                if (response.data) {
                    router.push('/results');
                    console.log('Upload erfolgreich:', response.data);
                }
            } catch (error) {
                console.error('Upload fehlgeschlagen:', error);
                alert("Der Upload ist fehlgeschlagen. Bitte versuchen Sie es erneut.");
            } finally {
                setIsUploading(false);
            }
        } else {
            alert('Bitte wählen Sie eine PDF-Datei aus.');
        }
    };

    return (
        <>
            <div className="w-full mt-5">
                <div className="relative z-20 text-center">
                    <div className="mb-8">
                        <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary ring-1 ring-inset ring-primary/20 mb-6">
                            <Zap className="mr-2 h-4 w-4" />
                            KI-gestützte PDF-Analyse
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl mb-6">
                            Willkommen bei{" "}
                            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                Prospekt-AI
                            </span>
                        </h1>
                        <p className="text-lg leading-8 text-muted-foreground max-w-2xl mx-auto mb-12">
                            Ein intelligenter Assistent zur automatisierten Extraktion von Angebotsdaten aus PDF-Prospekten. 

                        </p>

                        {/* Upload Section */}
                        <Card className="max-w-md mx-auto hover:bg-card/60 transition-colors duration-300 bg-card/50 backdrop-blur-sm">
                            <CardHeader className="text-center pb-4">
                                <CardTitle className="text-xl">PDF hochladen</CardTitle>
                                <CardDescription>
                                    Wählen Sie eine PDF-Datei aus, um die Analyse zu starten
                                </CardDescription>
                            </CardHeader>
                            <CardContent className=" flex text-center pb-6 justify-center">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept=".pdf"
                                    className="hidden"
                                />
                                <Button
                                    onClick={handleUploadClick}
                                    disabled={isUploading}
                                    size="lg"
                                    className="aspect-square w-30 h-30 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 transform hover:scale-105 flex flex-col items-center justify-center gap-2"
                                >
                                    <Upload className="h-8 w-8" />
                                    <span className="text-center text-sm">{isUploading ? 'Verarbeite...' : 'PDF auswählen'}</span>
                                </Button>

                            </CardContent>
                        </Card>
                    </div>
                </div>
                {isUploading && (
                    <LoadingOverlay message="Der Ladevorgang kann einige Minuten dauern. Bitte warten Sie..." />
                )}
            </div>
        </>
    );
}