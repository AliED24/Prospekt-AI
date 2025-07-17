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

    const features = [
        {
            icon: FileText,
            title: "Intelligente Extraktion",
            description: "KI-gestützte Erkennung und Extraktion von Angebotsdaten aus PDF-Prospekten"
        },
        {
            icon: Zap,
            title: "Schnelle Verarbeitung",
            description: "Automatisierte Analyse in wenigen Minuten statt manueller Stundenarbeit"
        },
        {
            icon: BarChart3,
            title: "Strukturierte Ausgabe",
            description: "Übersichtliche Darstellung aller extrahierten Daten in Tabellenform"
        }
    ];

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
                {/* Loading State */}
                {isUploading && (
                    <LoadingOverlay message="Der Ladevorgang kann einige Minuten dauern. Bitte warten Sie..." />
                )}
            </div>
            
            {/* Features Section */}
            <div className="py-16 bg-background">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            Warum Prospekt-AI?
                        </h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                            Entdecken Sie die Vorteile unserer KI-gestützten Lösung
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {features.map((feature, index) => (
                            <Card key={feature.title} className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-card/50 backdrop-blur-sm">
                                <CardHeader className="text-center">
                                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                                        <feature.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="text-center">
                                    <CardDescription className="text-sm leading-relaxed">
                                        {feature.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}