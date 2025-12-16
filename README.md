# Prospekt-AI

**KI-gestützter Prototyp zur automatisierten Erfassung von Angebotsdaten aus PDF-Prospekten**

---

## Übersicht

Prospekt-AI ist eine intelligente Anwendung, die entwickelt wurde, um automatisch Angebotsdaten aus PDF-Prospekten zu extrahieren und strukturiert in einer Datenbank zu speichern. Das System nutzt moderne KI-Technologien, um Produktinformationen, Preise und weitere relevante Daten aus Prospekten zu identifizieren und zu verarbeiten.

---

## Hauptfunktionen

### Datenverarbeitung
- **Multi-PDF-Upload**: Gleichzeitiges Hochladen mehrerer PDF-Prospekte
- **KI-basierte Analyse**: Automatische Extraktion von Produktdaten mit OpenAI GPT-Modellen
- **Intelligente Strukturierung**: Kategorisierung von Produktnamen, Preisen, Marken und Zeiträumen

### Benutzeroberfläche
- **Dashboard**: Übersichtliche Material Design 3 Oberfläche
- **Erweiterte Tabellen**: Sortierung, Filterung und Gruppierung von Angebotsdaten
- **KW-Filter**: Filterung nach Kalenderwochen für zeitbasierte Analyse
- **TreeView-Navigation**: Hierarchische Darstellung ähnlicher Produkte
- **Upload-Management**: Separate Verwaltung hochgeladener PDF-Dateien

### Datenmanagement
- **Excel-Export**: Export gefilterten Daten für weitere Analysen
- **Dropdown-Gruppierung**: Expandierbare Ansicht für Produktvarianten
- **Batch-Löschung**: Effiziente Verwaltung von PDF-Dateien und zugehörigen Daten
- **Responsive Design**: Optimiert für Desktop und mobile Geräte

---

## Systemarchitektur

### Backend (Spring Boot)

- **Framework**: Spring Boot 3.5.0 mit Java 21
- **KI-Integration**: Spring AI mit OpenAI GPT-Modellen zur intelligenten Datenextraktion
- **PDF-Verarbeitung**: Apache PDFBox 2.0.29 für PDF-zu-Bild-Konvertierung
- **Datenbank**: PostgreSQL mit Spring Data JPA für Datenpersistierung
- **API**: RESTful Web Services mit JSON-Datenformat

### Frontend (Next.js/MUI)

- **Framework**: Next.js 15.3.3 mit React 19
- **UI-Komponenten**: Material-UI (MUI) v6
- **Design System**: Material Design 3 Guidelines
- **Tabellen**: MUI Data Grid für erweiterte Datenvisualisierung
- **Icons**: Material Icons + zusätzliche Icon-Sets

---

## Verwendete Technologien

### Backend

- **Java 21** -
- **Spring Boot 3.5.0**
- **Spring Data JPA**
- **PostgreSQL** 
- **Apache PDFBox 2.0.29**
- **Maven** 

### Frontend

- **TypeScript**
- **Next.js 15.3.3**
- **React 19**
- **Material-UI (MUI) v6**
- **Axios**

---

## Installation & Setup

### 1. Backend starten

```bash
cd backend/demo
./mvnw spring-boot:run
```

### 2. Frontend starten

```bash
cd frontend
npm install
npm run dev
```

### 3. Anwendung öffnen

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

---

## Verwendung

### 1. PDF-Prospekte hochladen

- Öffnen Sie die Webanwendung (http://localhost:3000)
- Klicken Sie auf "PDF(s) hochladen"
- Wählen Sie eine oder mehrere PDF-Dateien gleichzeitig aus
- Starten Sie den Verarbeitungsprozess

### 2. Datenextraktion

- Das System analysiert automatisch alle hochgeladenen PDFs
- KI-Modelle extrahieren Produktinformationen, Preise, Marken und Angebotszeiträume


### 3. Daten analysieren und filtern

- Extrahierte Daten werden in einer professionellen MUI Data Grid Tabelle angezeigt
- **KW-Filter**: Filterung nach spezifischen Kalenderwochen
- **Textsuche**: Durchsuchen von Produktnamen, Marken und Stores
- **TreeView-Modus**: Gruppierte Darstellung ähnlicher Produkte
- **Sortierung**: Nach allen Spalten sortierbar

### 4. Upload-Management

- Navigieren Sie zu "Uploads" in der Sidebar
- Verwalten Sie alle hochgeladenen PDF-Dateien zentral
- Löschen Sie PDFs und alle zugehörigen Daten mit einem Klick

### 5. Datenexport

- Exportieren Sie gefilterte Daten als Excel-Datei
- Alle angewendeten Filter werden beim Export berücksichtigt

---

## Konfiguration

### Backend

#### Umgebungsvariablen

```bash
# Datenbank-Verbindung
SPRING_DATASOURCE_URL=jdbc:postgresql://your-host:5432/your-database
SPRING_DATASOURCE_USERNAME=your-username
SPRING_DATASOURCE_PASSWORD=your-password

# AI-Service
OPENAI_API_KEY=your-openai-api-key

# Optional: Aktives Profil (für Azure: azure)
SPRING_PROFILES_ACTIVE=default
```

#### Azure Deployment

```bash
# Azure PostgreSQL mit SSL
SPRING_DATASOURCE_URL=jdbc:postgresql://your-server.postgres.database.azure.com:5432/your-database?sslmode=require
SPRING_DATASOURCE_USERNAME=your-username
SPRING_DATASOURCE_PASSWORD=your-password
OPENAI_API_KEY=your-openai-api-key
SPRING_PROFILES_ACTIVE=azure
```

> **Hinweis:**
> - Azure PostgreSQL Firewall-Regeln konfigurieren
> - "Allow access to Azure services" aktivieren
---

### Frontend

#### Umgebungsvariablen

```bash
# Backend API URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

#### Azure Deployment

```bash
# URL des deployed Backend-Services
NEXT_PUBLIC_API_BASE_URL=https://your-backend-app.azurecontainerapps.io
```

---

## Projektstruktur

```
prospekt-ai/
├── backend/
│   ├── demo/
│   │   ├── src/main/java/com/prospektai/demo/
│   │   │   ├── config/          # Konfigurationsklassen
│   │   │   ├── controller/      # Controller Klasse
│   │   │   ├── service/         # Service-Klassen
│   │   │   ├── model/           # JPA Entity
│   │   │   ├── repository/      # Repositories für Datenzugriff
│   │   ├── pom.xml
│   │   └── src/main/resources/
│   └── Containerfile
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js App Router
│   │   ├── components/          # React Komponenten
│   │   └── utils/               # Helper Functions
│   ├── package.json
│   └── Containerfile
└── README.md
```

---

## API-Endpoints

### Upload-Management
- `POST /api/upload` – Mehrere PDF-Dateien gleichzeitig hochladen
  - Parameter: `files`
  - Parameter: `pagesPerChunk`

### Angebotsdaten
- `GET /api/offers` – Alle extrahierten Angebote abrufen
- `DELETE /api/offers/{id}` – Einzelnes Angebot löschen
- `DELETE /api/offers/file` – Alle Angebote einer PDF-Datei löschen
  - Body: `{"filename": "dateiname.pdf"}`

---

## Troubleshooting

### Häufige Probleme

#### Backend-Probleme

1. **OpenAI API Fehler**
   - Prüfen Sie Ihren API-Key in den Umgebungsvariablen
   - Stellen Sie sicher, dass das OpenAI-Konto ausreichend Credits hat
   - Überprüfen Sie die Netzwerkverbindung

2. **PDF-Verarbeitung fehlgeschlagen**
   - Prüfen Sie das PDF-Format
   - Stellen Sie sicher, dass der Text extrahierbar ist
   - Überprüfen Sie die Dateigröße und Seitenzahl

3. **Datenbank-Verbindungsfehler**
   - PostgreSQL-Server läuft und erreichbar
   - Credentials in `application.yml` korrekt
   - Firewall-Regeln für Datenbankzugriff

#### Frontend-Probleme

4. **API-Verbindung fehlgeschlagen**
   - Backend läuft auf Port 8080
   - CORS-Konfiguration korrekt
   - `NEXT_PUBLIC_API_BASE_URL` richtig gesetzt

5. **Upload-Probleme**
   - Nur PDF-Dateien werden unterstützt
   - Maximale Dateigröße beachten
   - Netzwerk-Timeout bei großen Dateien

---
