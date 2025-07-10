# Prospekt-AI

*KI-gestützter Prototyp zur automatisierten Erfassung von Angebotsdaten aus PDF-Prospekten*

## 📋 Übersicht

Prospekt-AI ist eine intelligente Anwendung, die entwickelt wurde, um automatisch Angebotsdaten aus PDF-Prospekten zu extrahieren und strukturiert in einer Datenbank zu speichern. Das System nutzt moderne KI-Technologien, um Produktinformationen, Preise und weitere relevante Daten aus Prospekten zu identifizieren und zu verarbeiten.

## ✨ Hauptfunktionen

- **PDF-Verarbeitung**: Automatische Extraktion von Text und Daten aus PDF-Prospekten
- **KI-basierte Analyse**: Nutzung von OpenAI GPT-Modellen zur intelligenten Datenextraktion
- **Datenstrukturierung**: Automatische Kategorisierung und Strukturierung von Angebotsinformationen
- **Web-Interface**: Benutzerfreundliche Oberfläche zum Hochladen und Verwalten von Prospekten
- **Datenbank-Integration**: Persistente Speicherung aller extrahierten Daten
- **Batch-Verarbeitung**: Effiziente Verarbeitung mehrerer PDFs gleichzeitig

## 🏗️ Systemarchitektur

### Backend (Java/Spring Boot)
- **Framework**: Spring Boot 3.5.0 mit Java 21
- **KI-Integration**: Spring AI mit OpenAI GPT-Modellen
- **PDF-Verarbeitung**: Apache PDFBox 2.0.29
- **Datenbank**: PostgreSQL mit Spring Data JPA
- **Batch-Processing**: Spring Batch für die Verarbeitung großer Datenmengen
- **API**: RESTful Web Services

### Frontend (React/Next.js)
- **Framework**: Next.js 15.3.3 mit React 19
- **UI-Komponenten**: Radix UI mit modernen React-Komponenten
- **Styling**: Tailwind CSS 4.x
- **Tabellen**: TanStack Table für Datenvisualisierung
- **Icons**: Lucide React Icons
- **Themes**: Dark/Light Mode Support

### Verwendete Technologien

**Backend:**
- Java 21
- Spring Boot 3.5.0
- Spring AI 1.0.0
- Spring Data JPA
- Spring Batch
- PostgreSQL
- Apache PDFBox
- OpenAI Java SDK
- Lombok
- Maven

**Frontend:**
- TypeScript
- Next.js 15.3.3
- React 19
- Tailwind CSS 4.x
- Radix UI
- TanStack Table
- Axios
- Date-fns

## 🚀 Installation & Setup

### Voraussetzungen

- Docker & Docker Compose
- Java 21 (für lokale Entwicklung)
- Node.js 20+ (für lokale Entwicklung)
- PostgreSQL-Datenbank
- OpenAI API Key

### Mit Docker Compose (Empfohlen)

1. **Repository klonen:**
```bash
git clone https://github.com/yourusername/prospekt-ai.git
cd prospekt-ai
```

2. **Umgebungsvariablen konfigurieren:**
```bash
# Für lokale Entwicklung: .env Datei erstellen
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/prospekt_ai
SPRING_DATASOURCE_USERNAME=your-db-username
SPRING_DATASOURCE_PASSWORD=your-db-password
OPENAI_API_KEY=your-openai-api-key
```

3. **Anwendung starten:**
```bash
docker-compose up --build
```

4. **Anwendung öffnen:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

### Lokale Entwicklung

#### Backend starten:
```bash
cd backend/demo
./mvnw spring-boot:run
```

#### Frontend starten:
```bash
cd frontend
npm install
npm run dev
```

## 📖 Verwendung

### 1. PDF-Prospekt hochladen
- Öffnen Sie die Webanwendung (http://localhost:3000)
- Klicken Sie auf "PDF hochladen"
- Wählen Sie eine oder mehrere PDF-Dateien aus
- Starten Sie den Verarbeitungsprozess

### 2. Datenextraktion
- Das System analysiert automatisch die hochgeladenen PDFs
- KI-Modelle extrahieren Produktinformationen, Preise und Angebotsdaten
- Fortschritt wird in Echtzeit angezeigt

### 3. Ergebnisse anzeigen
- Extrahierte Daten werden in einer übersichtlichen Tabelle angezeigt
- Filterung und Sortierung nach verschiedenen Kriterien
- Export-Funktionen für weitere Verarbeitung

## 🔧 Konfiguration

### Backend-Konfiguration

**Erforderliche Umgebungsvariablen:**
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

**Azure Deployment:**
```bash
# Azure PostgreSQL mit SSL
SPRING_DATASOURCE_URL=jdbc:postgresql://your-server.postgres.database.azure.com:5432/your-database?sslmode=require
SPRING_DATASOURCE_USERNAME=your-username
SPRING_DATASOURCE_PASSWORD=your-password
OPENAI_API_KEY=your-openai-api-key
SPRING_PROFILES_ACTIVE=azure

# Wichtig: 
# - Azure PostgreSQL Firewall-Regeln konfigurieren
# - "Allow access to Azure services" aktivieren
```

### Frontend-Konfiguration

**Erforderliche Umgebungsvariablen:**
Wichtig: Diese müssen zum Buildzeitpunkt gesetzt sein.

```bash
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

**Azure Deployment:**
```bash
# URL des deployed Backend-Services
NEXT_PUBLIC_BACKEND_URL=https://your-backend-app.azurecontainerapps.io
```

## 📁 Projektstruktur

```
prospekt-ai/
├── backend/
│   ├── demo/
│   │   ├── src/main/java/com/prospektai/demo/
│   │   │   ├── config/          # Konfigurationsklassen
│   │   │   ├── controller/      # REST Controllers
│   │   │   ├── service/         # Business Logic
│   │   │   ├── entity/          # JPA Entities
│   │   │   ├── repository/      # Data Access Layer
│   │   │   └── batch/           # Batch Jobs
│   │   ├── pom.xml
│   │   └── src/main/resources/
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js App Router
│   │   ├── components/          # React Komponenten
│   │   ├── lib/                 # Utility Functions
│   │   └── utils/               # Helper Functions
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## 🔌 API-Endpoints

### Hauptendpunkte

- `POST /api/upload` - PDF-Datei hochladen
- `GET /api/offers` - Alle extrahierten Angebote abrufen
- `GET /api/offers/{id}` - Spezifisches Angebot abrufen
- `GET /api/processing/status` - Verarbeitungsstatus prüfen
- `DELETE /api/offers/{id}` - Angebot löschen

## 🤝 Entwicklung

### Mitwirken

1. Fork das Repository
2. Erstellen Sie einen Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Committen Sie Ihre Änderungen (`git commit -m 'Add some AmazingFeature'`)
4. Push zum Branch (`git push origin feature/AmazingFeature`)
5. Öffnen Sie einen Pull Request

### Code-Stil

- **Backend**: Folgen Sie den Spring Boot Best Practices
- **Frontend**: Verwenden Sie ESLint und Prettier
- **Commits**: Verwenden Sie aussagekräftige Commit-Messages

## 🧪 Testing

### Backend Tests
```bash
cd backend/demo
./mvnw test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📊 Datenbank Schema

### Haupttabellen

- **offers** - Extrahierte Angebotsdaten
- **products** - Produktinformationen
- **processing_jobs** - Batch-Verarbeitungsjobs
- **pdf_documents** - Hochgeladene PDF-Metadaten

## 🚨 Troubleshooting

### Häufige Probleme

1. **OpenAI API Fehler**
   - Prüfen Sie Ihren API-Key
   - Überprüfen Sie die Kontingente

2. **PDF-Verarbeitung fehlgeschlagen**
   - Prüfen Sie das PDF-Format
   - Stellen Sie sicher, dass der Text extrahierbar ist

3. **Docker Build Probleme**
   - Löschen Sie Docker Cache: `docker system prune -a`
   - Prüfen Sie die Dockerfile-Pfade


*Entwickelt für die automatisierte Datenextraktion aus PDF-Prospekten*
