"use client";

import { useState, useEffect } from "react";
import { OfferData } from "@/components/offerDataTableStructure/types/OfferData";
import { columns } from "@/components/offerDataTableStructure/columns";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { envApi } from "@/utils/api";
import { BarChart3, FileText, TrendingUp, Clock } from "lucide-react";

export default function Page() {
    const [offers, setOffers] = useState<OfferData[]>([]);
    const [isLoading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                setLoading(true);
                const response = await envApi.get<OfferData[]>("/api/offers");
                setOffers(response.data);
                console.log("Der Response:", response.data[0]);
            } catch (err: any) {
                console.error("Fehler beim Laden der Angebote:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOffers();
    }, []);

    const stats = [
        {
            title: "Gesamtangebote",
            value: offers.length,
            icon: FileText,
            description: "Erfasste Angebote"
        },
        {
            title: "Letzte Aktualisierung",
            value: new Date().toLocaleDateString('de-DE'),
            icon: Clock,
            description: "Heute"
        }
    ];

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <BarChart3 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                Angebotsübersicht
                            </h1>
                            <p className="text-muted-foreground">
                                Übersicht aller verarbeiteten PDF-Angebote
                            </p>
                        </div>
                    </div>
                    
                    {offers.length > 0 && (
                        <Badge variant="secondary" className="text-sm">
                            {offers.length} Angebot{offers.length !== 1 ? 'e' : ''} gefunden
                        </Badge>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <Card key={stat.title} className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-card/50 backdrop-blur-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </CardTitle>
                                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors duration-300">
                                    <stat.icon className="h-4 w-4 text-primary" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Data Table Section */}
                <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Verarbeitete Angebote
                        </CardTitle>
                        <CardDescription>
                            Detaillierte Übersicht aller extrahierten Angebotsdaten
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Loading message="Lade Angebote..." />
                        ) : offers.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Keine Angebote gefunden</h3>
                                <p className="text-muted-foreground">
                                    Laden Sie eine PDF-Datei hoch, um Angebote zu verarbeiten.
                                </p>
                            </div>
                        ) : (
                            <DataTable 
                                columns={columns} 
                                data={offers} 
                                isLoading={isLoading}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
