import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <Card className="text-center border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <Search className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold">Seite nicht gefunden</CardTitle>
            <CardDescription className="text-base">
              Die gesuchte Seite existiert nicht oder wurde verschoben.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Überprüfen Sie die URL oder kehren Sie zur Startseite zurück.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild variant="outline" className="flex-1">
                <Link href="/" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Zurück
                </Link>
              </Button>
              <Button asChild className="flex-1">
                <Link href="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Startseite
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 